/**
 * Verified-mutation core for Google Docs.
 *
 * Google Docs serves different editor builds to different users, and each build
 * accepts a different subset of synthetic events. Nothing Docs gives back can be
 * trusted as proof of a write:
 *
 *   - `execCommand("insertText")` returns false on Docs' editing host.
 *   - `dispatchEvent` returns true for "an event was dispatched", not "text landed".
 *   - The `docs-texteventtarget-iframe` contenteditable is a 1px offscreen keystroke
 *     buffer holding zero-width spaces; it never reflects document content.
 *   - The document itself is painted to <canvas>, so inserted text is not in the DOM.
 *
 * So every mutation is applied speculatively and then verified against the one
 * DOM signal that does move when Docs applies an edit: the caret.
 *
 * This module is deliberately free of DOM and Chrome APIs so it can be unit tested.
 */

export interface MutationMethod<TTarget> {
  label: string;
  apply: (target: TTarget, text: string) => void;
}

export const DOCS_REJECTED_MESSAGE =
  "Dripwriter can't type into this document. Google Docs is rejecting every input method. " +
  "Reload the page, click directly into the document, then press Start.";

export const DOCS_STOPPED_MESSAGE =
  "Google Docs stopped accepting text mid-run. Nothing further was typed — " +
  "click back into the document and press Start again.";

export const DELETE_REJECTED_MESSAGE =
  "Google Docs stopped accepting edits while correcting a typo. Nothing further was typed — " +
  "click back into the document and press Start again.";

/**
 * Builds the text to pair with a lone whitespace character that Docs rejected.
 *
 * Some Docs builds ignore `beforeinput` entirely and only apply synthetic paste
 * events — and a paste whose content is whitespace-only is silently dropped
 * (nothing is inserted, the caret does not move). The one thing such a build
 * reliably applies is paste of non-whitespace content, so the whitespace must
 * ride along with the next printable character: `" "` + `"world"` → `" w"`.
 *
 * Returns the suffix to append to the whitespace (whitespace run + first
 * non-whitespace character), or null when there is no non-whitespace character
 * ahead (trailing whitespace) or the whitespace run is impractically long.
 */
export function buildWhitespacePairSuffix(remaining: string, maxLength = 8): string | null {
  const match = /^(\s*\S)/.exec(remaining);
  if (!match) {
    return null;
  }

  const suffix = match[1];
  return suffix.length <= maxLength ? suffix : null;
}

/**
 * Builds a comparable snapshot of caret position.
 *
 * Only the local caret blinks; collaborator carets in a shared document do not.
 * Tracking only the local caret keeps a collaborator's cursor movement from being
 * mistaken for proof that our own write landed.
 */
export function buildCaretSignature(
  carets: ReadonlyArray<{ isLocal: boolean; transform: string }>
): string {
  const local = carets.filter((caret) => caret.isLocal);
  const tracked = local.length ? local : carets;

  if (!tracked.length) {
    return "no-caret";
  }

  return tracked.map((caret) => caret.transform).join("|");
}

export interface WaitForChangeOptions {
  read: () => string;
  before: string;
  timeoutMs: number;
  now: () => number;
  sleep: (ms: number) => Promise<void>;
  pollMs?: number;
}

/**
 * Resolves true as soon as `read()` differs from `before`.
 *
 * The synchronous first check matters twice over: `beforeinput` moves the caret
 * before dispatch returns, so the common path never touches the clock — and the
 * polling fallback uses an injected `sleep` rather than requestAnimationFrame,
 * which does not fire in a backgrounded tab (this extension holds a wake lock
 * precisely so it can keep typing while backgrounded).
 */
export async function waitForChange({
  read,
  before,
  timeoutMs,
  now,
  sleep,
  pollMs = 8
}: WaitForChangeOptions): Promise<boolean> {
  if (read() !== before) {
    return true;
  }

  const deadline = now() + timeoutMs;

  while (now() < deadline) {
    await sleep(pollMs);

    if (read() !== before) {
      return true;
    }
  }

  return false;
}

export interface CascadeOptions<TTarget> {
  methods: ReadonlyArray<MutationMethod<TTarget>>;
  /** Method already proven to work this session; tried first, skipped in the retry sweep. */
  locked?: MutationMethod<TTarget>;
  target: TTarget;
  text: string;
  /** Applies a method and resolves true ONLY if the document provably changed. */
  attempt: (
    method: MutationMethod<TTarget>,
    target: TTarget,
    text: string
  ) => Promise<boolean>;
}

/**
 * Tries the locked method, then every other method in order, until one is
 * verified to have changed the document.
 *
 * @returns the method that provably worked, or null if none did.
 */
export async function cascadeUntilVerified<TTarget>({
  methods,
  locked,
  target,
  text,
  attempt
}: CascadeOptions<TTarget>): Promise<MutationMethod<TTarget> | null> {
  if (locked && (await attempt(locked, target, text))) {
    return locked;
  }

  for (const method of methods) {
    if (method === locked) {
      continue;
    }

    if (await attempt(method, target, text)) {
      return method;
    }
  }

  return null;
}
