/**
 * Google Docs harness.
 *
 * Docs serves different editor builds per user, each accepting a different
 * subset of synthetic events, and nothing it returns can be trusted as proof of
 * a write (execCommand returns false, dispatchEvent reports "dispatched" not
 * "landed", the document is painted to <canvas>). So every mutation is applied
 * speculatively and verified against the one DOM signal that moves when Docs
 * applies an edit: the local caret.
 *
 * This file is the former Docs-specific half of content.ts, moved behind the
 * Harness interface unchanged.
 */

import {
  buildCaretSignature,
  buildWhitespacePairSuffix,
  cascadeUntilVerified,
  DELETE_REJECTED_MESSAGE,
  DOCS_REJECTED_MESSAGE,
  DOCS_STOPPED_MESSAGE,
  type MutationMethod,
  waitForChange
} from "../insertion.ts";
import type { EditableTarget, Harness, HarnessDeps } from "./types.ts";

type DocsMethod = MutationMethod<EditableTarget>;

export interface DiagnosticMethod {
  label: string;
  description: string;
  run: () => boolean;
}

/**
 * Insertion methods, ordered most- to least-likely to be honoured. None can be
 * trusted to report success, so every attempt is verified by `attemptMutation`.
 */
const INSERT_METHODS: DocsMethod[] = [
  {
    label: "beforeinput",
    apply: (target, text) => void dispatchInsertEvents(target.element, text, "insertText")
  },
  {
    label: "paste",
    apply: (target, text) => void dispatchDocsPaste(target.element, text)
  },
  {
    label: "paste-bubbling",
    apply: (target, text) =>
      void dispatchDocsPaste(target.element, text, { bubbles: true, cancelable: true })
  },
  {
    label: "keyboard",
    apply: (target, text) => void dispatchKeyboardTyping(target.element, text)
  },
  {
    label: "execCommand",
    apply: (target, text) => void tryExecInsert(target.doc, text)
  }
];

/**
 * Deletion is a separate capability from insertion: Docs honours a synthetic
 * keydown Backspace but ignores a bare beforeinput deleteContentBackward.
 */
const DELETE_METHODS: DocsMethod[] = [
  {
    label: "backspace-key",
    apply: (target) => void dispatchBackspace(target.element)
  },
  {
    label: "execCommand-delete",
    apply: (target) => void tryExecDelete(target.doc)
  }
];

/**
 * Only the local caret blinks, which distinguishes it from collaborator carets
 * in a shared document.
 */
const LOCAL_CARET_CLASS = "docs-text-ui-cursor-blink";

export const DIAGNOSTIC_METHODS: DiagnosticMethod[] = [
  {
    label: "AAA",
    description: "Paste event on iframe contenteditable",
    run: () => dispatchDocsPaste(getDocsContentEditableTarget(), "AAA ")
  },
  {
    label: "BBB",
    description: "Paste event on iframe activeElement",
    run: () => dispatchDocsPaste(getDocsActiveElementTarget(), "BBB ")
  },
  {
    label: "CCC",
    description: "Bubbling paste event on iframe contenteditable",
    run: () => dispatchDocsPaste(getDocsContentEditableTarget(), "CCC ", { bubbles: true, cancelable: true })
  },
  {
    label: "DDD",
    description: "iframe execCommand insertText",
    run: () => {
      const doc = getDocsIframeDocument();
      return doc ? tryExecInsert(doc, "DDD ") : false;
    }
  },
  {
    label: "EEE",
    description: "window execCommand insertText",
    run: () => tryExecInsert(document, "EEE ")
  },
  {
    label: "FFF",
    description: "beforeinput/input insertText on iframe contenteditable",
    run: () => dispatchInsertEvents(getDocsContentEditableTarget(), "FFF ", "insertText")
  },
  {
    label: "GGG",
    description: "keydown/keypress/input/keyup on iframe contenteditable",
    run: () => dispatchKeyboardTyping(getDocsContentEditableTarget(), "GGG ")
  },
  {
    label: "HHH",
    description: "beforeinput/input insertFromPaste on iframe contenteditable",
    run: () => dispatchInsertEvents(getDocsContentEditableTarget(), "HHH ", "insertFromPaste")
  }
];

export class DocsHarness implements Harness {
  readonly id = "docs";

  /** Insertion method Docs has been observed to accept for text THIS session. */
  private textMethod?: DocsMethod;
  /** Whitespace is accepted by a different set of methods than printable chars. */
  private spaceMethod?: DocsMethod;
  /** Deletion is a different set again. */
  private deleteMethod?: DocsMethod;
  /** Set once this build rejects lone whitespace via every single-char method. */
  private whitespaceNeedsPairing = false;
  /** False until a character has provably landed in the document. */
  private wrote = false;

  constructor(private deps: HarnessDeps = {}) {}

  hasTarget(): boolean {
    return findDocsTarget() !== null;
  }

  ensureTarget(): EditableTarget {
    return this.requireTarget("The Google Docs editor could not be found.");
  }

  async insert(text: string, remainingAfter?: string): Promise<number> {
    const target = this.requireTarget(
      "The Google Docs cursor was lost. Click back into the document and retry."
    );

    const isWhitespace = /^\s+$/.test(text);
    const locked = isWhitespace ? this.spaceMethod : this.textMethod;

    let winner: DocsMethod | null = null;
    let consumed = 0;

    if (!(isWhitespace && this.whitespaceNeedsPairing)) {
      winner = await cascadeUntilVerified({
        methods: INSERT_METHODS,
        locked,
        target,
        text,
        attempt: attemptMutation
      });
    }

    if (!winner && isWhitespace && remainingAfter !== undefined) {
      this.whitespaceNeedsPairing = true;

      const suffix = buildWhitespacePairSuffix(remainingAfter);

      if (suffix !== null) {
        winner = await cascadeUntilVerified({
          methods: INSERT_METHODS,
          locked: this.textMethod,
          target,
          text: text + suffix,
          attempt: attemptMutation
        });

        if (winner) {
          consumed = suffix.length;
        }
      }
    }

    if (!winner) {
      if (isWhitespace && this.wrote) {
        return consumed;
      }

      throw new Error(this.wrote ? DOCS_STOPPED_MESSAGE : DOCS_REJECTED_MESSAGE);
    }

    if (isWhitespace && consumed === 0) {
      this.spaceMethod = winner;
    } else if (!isWhitespace) {
      this.textMethod = winner;
    }

    if (!this.wrote) {
      this.wrote = true;
      this.deps.onFirstWrite?.();
    }

    return consumed;
  }

  async delete(count: number): Promise<void> {
    for (let index = 0; index < count; index += 1) {
      if (this.deps.isCancelled?.()) {
        return;
      }

      const target = this.requireTarget("The Google Docs cursor was lost while deleting.");

      const winner = await cascadeUntilVerified({
        methods: DELETE_METHODS,
        locked: this.deleteMethod,
        target,
        text: "",
        attempt: attemptMutation
      });

      if (!winner) {
        throw new Error(DELETE_REJECTED_MESSAGE);
      }

      this.deleteMethod = winner;
      await this.deps.betweenDeletes?.();
    }
  }

  private requireTarget(lostMessage: string): EditableTarget {
    const target = findDocsTarget();

    if (!target) {
      throw new Error(lostMessage);
    }

    target.element.focus({ preventScroll: true });
    return target;
  }
}

function getCaretSignature(): string {
  return buildCaretSignature(
    Array.from(document.querySelectorAll<HTMLElement>(".kix-cursor")).map((caret) => ({
      isLocal: caret.classList.contains(LOCAL_CARET_CLASS),
      transform: window.getComputedStyle(caret).transform
    }))
  );
}

/**
 * Resolves true as soon as the caret moves, false if it never does. Deliberately
 * timer-based, not rAF-based: rAF does not fire in a backgrounded tab, and this
 * extension holds a wake lock precisely so it can keep typing while backgrounded.
 */
async function didCaretAdvance(before: string, timeoutMs = 400): Promise<boolean> {
  return waitForChange({
    read: getCaretSignature,
    before,
    timeoutMs,
    now: () => performance.now(),
    sleep: (ms) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
      })
  });
}

/** Applies a method, then resolves true only if the caret actually moved. */
async function attemptMutation(method: DocsMethod, target: EditableTarget, text: string) {
  const before = getCaretSignature();

  try {
    method.apply(target, text);
  } catch {
    return false;
  }

  return didCaretAdvance(before);
}

function findDocsTarget(): EditableTarget | null {
  const doc = getDocsIframeDocument();
  const element = getDocsContentEditableTarget();

  if (doc && element) {
    return { doc, element };
  }

  return null;
}

function tryExecDelete(doc: Document) {
  try {
    return doc.execCommand("delete");
  } catch {
    return false;
  }
}

function tryExecInsert(doc: Document, text: string) {
  try {
    return doc.execCommand("insertText", false, text);
  } catch {
    return false;
  }
}

function dispatchBackspace(element: HTMLElement | null) {
  if (!element) {
    return false;
  }

  try {
    element.focus({ preventScroll: true });

    element.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Backspace",
        code: "Backspace",
        keyCode: 8,
        which: 8,
        bubbles: true
      })
    );
    element.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        inputType: "deleteContentBackward"
      })
    );
    element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "deleteContentBackward"
      })
    );
    element.dispatchEvent(
      new KeyboardEvent("keyup", {
        key: "Backspace",
        code: "Backspace",
        keyCode: 8,
        which: 8,
        bubbles: true
      })
    );

    return true;
  } catch {
    return false;
  }
}

function getDocsIframeDocument() {
  const iframe = document.querySelector<HTMLIFrameElement>("iframe.docs-texteventtarget-iframe");
  return iframe?.contentDocument ?? null;
}

function getDocsContentEditableTarget() {
  return getDocsIframeDocument()?.querySelector<HTMLElement>("[contenteditable=true]") ?? null;
}

function getDocsActiveElementTarget() {
  const activeElement = getDocsIframeDocument()?.activeElement;
  return activeElement instanceof HTMLElement ? activeElement : null;
}

function dispatchDocsPaste(
  element: HTMLElement | null,
  text: string,
  options: Pick<ClipboardEventInit, "bubbles" | "cancelable"> = {}
) {
  try {
    if (!element) {
      return false;
    }

    const data = new DataTransfer();
    data.setData("text/plain", text);

    const pasteEvent = new ClipboardEvent("paste", { ...options, clipboardData: data });
    pasteEvent.clipboardData?.setData("text/plain", text);

    element.dispatchEvent(pasteEvent);
    return true;
  } catch {
    return false;
  }
}

function dispatchInsertEvents(
  element: HTMLElement | null,
  text: string,
  inputType: "insertText" | "insertFromPaste"
) {
  if (!element) {
    return false;
  }

  try {
    element.focus({ preventScroll: true });
    element.dispatchEvent(
      new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        data: text,
        inputType
      })
    );
    element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: text,
        inputType
      })
    );
    return true;
  } catch {
    return false;
  }
}

function dispatchKeyboardTyping(element: HTMLElement | null, text: string) {
  if (!element) {
    return false;
  }

  try {
    element.focus({ preventScroll: true });

    for (const char of text) {
      const code = /^[A-Z]$/.test(char) ? `Key${char}` : char === " " ? "Space" : "";
      const keyCode = char.length === 1 ? char.charCodeAt(0) : 0;

      element.dispatchEvent(
        new KeyboardEvent("keydown", { key: char, code, keyCode, which: keyCode, bubbles: true })
      );
      element.dispatchEvent(
        new KeyboardEvent("keypress", {
          key: char,
          code,
          keyCode,
          which: keyCode,
          charCode: keyCode,
          bubbles: true
        })
      );
      element.dispatchEvent(
        new InputEvent("beforeinput", {
          bubbles: true,
          cancelable: true,
          data: char,
          inputType: "insertText"
        })
      );
      element.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          data: char,
          inputType: "insertText"
        })
      );
      element.dispatchEvent(
        new KeyboardEvent("keyup", { key: char, code, keyCode, which: keyCode, bubbles: true })
      );
    }

    return true;
  } catch {
    return false;
  }
}
