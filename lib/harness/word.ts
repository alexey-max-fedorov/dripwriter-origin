/**
 * Word Online harness.
 *
 * Word Online's editing surface is a single contenteditable element identified
 * by a stable ID (`WACViewPanel_EditingElement`), and — unlike Google Docs —
 * `execCommand("insertText"/"delete")` reliably mutates its DOM content, so
 * verification is a plain textContent read rather than caret-signature
 * acrobatics. The single execCommand method is still run through the same
 * verified-cascade primitives as the other harnesses for consistency and to
 * leave room for additional methods if a future Word Online build regresses.
 */

import {
  cascadeUntilVerified,
  type MutationMethod,
  waitForChange
} from "../insertion.ts";
import type { EditableTarget, Harness, HarnessDeps } from "./types.ts";

type WordMethod = MutationMethod<EditableTarget>;

const EDITING_ELEMENT_ID = "WACViewPanel_EditingElement";

export function readWordContent(el: HTMLElement): string {
  return el.textContent ?? "";
}

export function isWordOnlineDocument(): boolean {
  return location.hostname === "word-edit.officeapps.live.com";
}

const INSERT_METHODS: WordMethod[] = [
  {
    label: "execCommand",
    apply: (t, text) => void tryExec(t.doc, "insertText", text)
  }
];

const DELETE_METHODS: WordMethod[] = [
  {
    label: "execCommand-delete",
    apply: (t) => void tryExec(t.doc, "delete")
  }
];

export class WordHarness implements Harness {
  readonly id = "word-online";
  private textMethod?: WordMethod;
  private deleteMethod?: WordMethod;
  private wrote = false;
  private deps: HarnessDeps;

  constructor(deps: HarnessDeps = {}) {
    this.deps = deps;
  }

  hasTarget(): boolean {
    return findWordTarget() !== null;
  }

  ensureTarget(): EditableTarget {
    const target = findWordTarget();
    if (!target) {
      throw new Error(
        "The Word Online editor could not be found. Click into the document and retry."
      );
    }
    target.element.focus({ preventScroll: true });
    return target;
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
          ? "Word Online stopped accepting text mid-run. Click back into the document and press Start again."
          : "Dripwriter Origin can't type into this document — Word Online rejected every input method."
      );
    }

    this.textMethod = winner;

    if (!this.wrote) {
      this.wrote = true;
      this.deps.onFirstWrite?.();
    }

    return 0;
  }

  async delete(count: number): Promise<number> {
    let deleted = 0;

    for (let index = 0; index < count; index += 1) {
      if (this.deps.isCancelled?.()) {
        return deleted;
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
        throw new Error(
          "Word Online stopped accepting edits while correcting a typo."
        );
      }

      this.deleteMethod = winner;
      deleted += 1;
      await this.deps.betweenDeletes?.();
    }

    return deleted;
  }
}

async function attemptMutation(
  method: WordMethod,
  target: EditableTarget,
  text: string
): Promise<boolean> {
  const before = readWordContent(target.element);

  try {
    method.apply(target, text);
  } catch {
    return false;
  }

  return waitForChange({
    read: () => readWordContent(target.element),
    before,
    timeoutMs: 250,
    now: () => performance.now(),
    sleep: (ms) =>
      new Promise<void>((resolve) => window.setTimeout(resolve, ms))
  });
}

function findWordTarget(): EditableTarget | null {
  const el = document.getElementById(EDITING_ELEMENT_ID);
  if (!el) return null;
  return { doc: el.ownerDocument, element: el };
}

function tryExec(doc: Document, command: string, value?: string): boolean {
  try {
    return doc.execCommand(command, false, value);
  } catch {
    return false;
  }
}
