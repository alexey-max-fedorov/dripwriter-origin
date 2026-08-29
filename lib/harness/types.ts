/**
 * A harness connects the humanized typing algorithm to one kind of editable
 * surface. The algorithm (WPM, typos, false starts, breaks) lives in the typing
 * loop and never touches the DOM — it drives a harness through this interface.
 *
 * Two implementations exist:
 *   - DocsHarness    (lib/harness/docs.ts)    — Google Docs' canvas editor,
 *     verified against the caret because inserted text never enters the DOM.
 *   - DefaultHarness (lib/harness/default.ts) — any <textarea>/<input>/
 *     [contenteditable], verified by reading the element's content.
 */

export interface EditableTarget {
  doc: Document;
  element: HTMLElement;
}

/**
 * Hooks the typing loop hands a harness so per-run state stays in the loop:
 *   - onFirstWrite: flip the status to "Typing..." the moment a character is
 *     provably in the document (not before — a rejected document must never
 *     show fake progress).
 *   - isCancelled: true once the run was stopped or superseded; deletion loops
 *     bail on it mid-word.
 *   - betweenDeletes: the human-paced pause between successive backspaces,
 *     owned by the loop so it counts toward the typing budget that drives breaks.
 */
export interface HarnessDeps {
  onFirstWrite?: () => void;
  isCancelled?: () => boolean;
  betweenDeletes?: () => Promise<void>;
}

export interface Harness {
  readonly id: string;
  /** Focus and return the editable target; throws a user-facing Error if lost. */
  ensureTarget(): EditableTarget;
  /** True when an editable target currently exists in this frame. */
  hasTarget(): boolean;
  /**
   * Insert `text` (a single character, or whitespace plus a suffix on builds
   * that reject lone whitespace), verified. Returns the number of FOLLOWING
   * characters consumed along with the insert (they already landed), so the
   * caller can skip them; 0 when only `text` was inserted.
   */
  insert(text: string, remainingAfter?: string): Promise<number>;
  /** Delete `count` characters backward, verified. */
  delete(count: number): Promise<void>;
}
