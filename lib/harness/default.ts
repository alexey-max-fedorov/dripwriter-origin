/**
 * Default harness — types into any standard editable surface: <textarea>,
 * <input>, or [contenteditable] (rich editors like TinyMCE, Quill, ProseMirror,
 * and the cross-origin Packback editor when this content script is injected
 * inside its frame).
 *
 * Unlike Google Docs, standard editables reflect edits in the DOM, so
 * verification is a plain content read — no caret-signature acrobatics. The same
 * verified-cascade primitives from lib/insertion.ts are reused with a DOM read
 * in place of the caret read.
 */

import {
  cascadeUntilVerified,
  type MutationMethod,
  waitForChange
} from "../insertion.ts";
import type { EditableTarget, Harness, HarnessDeps } from "./types.ts";

type DefaultMethod = MutationMethod<EditableTarget>;

/** The one seam worth unit-testing: value for form fields, text for the rest. */
export function readEditableContent(el: HTMLElement): string {
  if ("value" in el && typeof (el as HTMLInputElement).value === "string") {
    return (el as HTMLInputElement).value;
  }
  return el.textContent ?? "";
}

/** Insertion methods, most- to least-likely to be honoured; each is verified. */
const INSERT_METHODS: DefaultMethod[] = [
  { label: "beforeinput", apply: (t, text) => void dispatchInsert(t.element, text) },
  { label: "paste", apply: (t, text) => void dispatchPaste(t.element, text) },
  { label: "setRangeText", apply: (t, text) => void insertViaValue(t.element, text) },
  { label: "execCommand", apply: (t, text) => void tryExec(t.doc, "insertText", text) }
];

const DELETE_METHODS: DefaultMethod[] = [
  { label: "backspace", apply: (t) => void dispatchBackspace(t.element) },
  { label: "execCommand-delete", apply: (t) => void tryExec(t.doc, "delete") }
];

export class DefaultHarness implements Harness {
  readonly id = "default";
  private textMethod?: DefaultMethod;
  private deleteMethod?: DefaultMethod;
  private wrote = false;
  private deps: HarnessDeps;

  constructor(deps: HarnessDeps = {}) {
    this.deps = deps;
  }

  hasTarget(): boolean {
    return findEditable() !== null;
  }

  ensureTarget(): EditableTarget {
    const el = findEditable();
    if (!el) {
      throw new Error("Click into a text box first, then press Start.");
    }
    el.focus({ preventScroll: true });
    return { doc: el.ownerDocument, element: el };
  }

  async insert(text: string): Promise<number> {
    const target = this.ensureTarget();

    const winner = await cascadeUntilVerified({
      methods: INSERT_METHODS,
      locked: this.textMethod,
      target,
      text,
      attempt: attemptMutation
    });

    if (!winner) {
      throw new Error(
        this.wrote
          ? "This text box stopped accepting text mid-run. Click back into it and press Start again."
          : "Dripwriter Origin can't type into this text box — it rejected every input method."
      );
    }

    this.textMethod = winner;

    if (!this.wrote) {
      this.wrote = true;
      this.deps.onFirstWrite?.();
    }

    // Standard fields accept lone whitespace, so nothing rides along.
    return 0;
  }

  async delete(count: number): Promise<void> {
    for (let index = 0; index < count; index += 1) {
      if (this.deps.isCancelled?.()) {
        return;
      }

      const target = this.ensureTarget();

      const winner = await cascadeUntilVerified({
        methods: DELETE_METHODS,
        locked: this.deleteMethod,
        target,
        text: "",
        attempt: attemptMutation
      });

      if (!winner) {
        throw new Error("This text box stopped accepting edits while correcting a typo.");
      }

      this.deleteMethod = winner;
      await this.deps.betweenDeletes?.();
    }
  }
}

/** Applies a method, then resolves true only if the element's content changed. */
async function attemptMutation(
  method: DefaultMethod,
  target: EditableTarget,
  text: string
): Promise<boolean> {
  const before = readEditableContent(target.element);

  try {
    method.apply(target, text);
  } catch {
    return false;
  }

  return waitForChange({
    read: () => readEditableContent(target.element),
    before,
    timeoutMs: 250,
    now: () => performance.now(),
    sleep: (ms) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))
  });
}

/** Last editable focused in THIS frame, else the active element if it's editable. */
let lastEditable: HTMLElement | null = null;

if (typeof document !== "undefined") {
  document.addEventListener(
    "focusin",
    (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && isEditable(target)) {
        lastEditable = target;
      }
    },
    true
  );
}

function findEditable(): HTMLElement | null {
  const active = document.activeElement;
  if (active instanceof HTMLElement && isEditable(active)) {
    return active;
  }
  return lastEditable && lastEditable.isConnected ? lastEditable : null;
}

const TEXT_INPUT_TYPES = ["text", "search", "url", "email", "tel", "password", ""];

function isEditable(el: HTMLElement): boolean {
  if (el.tagName === "TEXTAREA") {
    return true;
  }
  if (el.tagName === "INPUT") {
    return TEXT_INPUT_TYPES.includes((el as HTMLInputElement).type);
  }
  return el.isContentEditable;
}

function dispatchInsert(el: HTMLElement, text: string) {
  el.focus({ preventScroll: true });
  el.dispatchEvent(
    new InputEvent("beforeinput", { bubbles: true, cancelable: true, data: text, inputType: "insertText" })
  );
  el.dispatchEvent(new InputEvent("input", { bubbles: true, data: text, inputType: "insertText" }));
}

function dispatchPaste(el: HTMLElement, text: string) {
  el.focus({ preventScroll: true });
  const data = new DataTransfer();
  data.setData("text/plain", text);
  el.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: data }));
}

function insertViaValue(el: HTMLElement, text: string) {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    el.setRangeText(text, start, end, "end");
    el.dispatchEvent(new InputEvent("input", { bubbles: true, data: text, inputType: "insertText" }));
  }
}

function dispatchBackspace(el: HTMLElement) {
  el.focus({ preventScroll: true });
  el.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Backspace", code: "Backspace", keyCode: 8, which: 8, bubbles: true })
  );
  el.dispatchEvent(
    new InputEvent("beforeinput", { bubbles: true, cancelable: true, inputType: "deleteContentBackward" })
  );
  el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward" }));

  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const end = el.selectionStart ?? el.value.length;
    if (end > 0) {
      el.setRangeText("", end - 1, end, "end");
      el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward" }));
    }
  }

  el.dispatchEvent(
    new KeyboardEvent("keyup", { key: "Backspace", code: "Backspace", keyCode: 8, which: 8, bubbles: true })
  );
}

function tryExec(doc: Document, command: string, value?: string): boolean {
  try {
    return doc.execCommand(command, false, value);
  } catch {
    return false;
  }
}
