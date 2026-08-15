import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["https://docs.google.com/document/*"],
  run_at: "document_idle"
};

import {
  API_MODE_STORAGE_KEY,
  BRIDGE_CONTROL_SOURCE,
  BRIDGE_REQUEST_SOURCE,
  BRIDGE_RESPONSE_SOURCE,
  type BridgeControl,
  type BridgeRequest,
  type BridgeResponse,
  type DripwriterMessage,
  type DripwriterResponse,
  DEFAULT_SETTINGS,
  type DripwriterSettings,
  type TypingStatus
} from "./types";
import { VERSION } from "~/lib/version";
import {
  buildCaretSignature,
  buildWhitespacePairSuffix,
  cascadeUntilVerified,
  DELETE_REJECTED_MESSAGE,
  DOCS_REJECTED_MESSAGE,
  DOCS_STOPPED_MESSAGE,
  type MutationMethod,
  waitForChange
} from "~/lib/insertion";

interface DocsTarget {
  doc: Document;
  element: HTMLElement;
}

interface RunState {
  cancelled: boolean;
  activeTypingMs: number;
  nextBreakThresholdMs?: number;
  onSettled?: (result: { ok: boolean; error?: string }) => void;
  /**
   * Insertion method that Docs has been observed to accept in THIS session.
   * Docs serves different editor builds per user, and each build accepts a
   * different subset of synthetic events — so the working method is discovered
   * at runtime on the first character rather than assumed.
   */
  textMethod?: DocsMethod;
  /** Whitespace is accepted by a different set of methods than printable chars. */
  spaceMethod?: DocsMethod;
  /** Deletion is accepted by a different set of methods again. */
  deleteMethod?: DocsMethod;
  /** False until we have proven, via the DOM, that a character actually landed. */
  provenWriteable?: boolean;
  /**
   * Set once this build rejected lone whitespace via every single-character
   * method (it ignores beforeinput and paste drops whitespace-only content).
   * From then on whitespace is pasted together with the following character.
   */
  whitespaceNeedsPairing?: boolean;
}

type DocsMethod = MutationMethod<DocsTarget>;

interface DiagnosticMethod {
  label: string;
  description: string;
  run: () => boolean;
}

const keyboardRows = [
  { keys: "1234567890", offset: 0 },
  { keys: "qwertyuiop", offset: 0.3 },
  { keys: "asdfghjkl", offset: 0.8 },
  { keys: "zxcvbnm", offset: 1.3 },
  { keys: ",./", offset: 1.8 }
];

const neighborMap = buildNeighborMap();

let activeRun: RunState | null = null;
let releaseLock: (() => void) | null = null;
let currentStatus: TypingStatus = {
  running: false,
  detail: "Idle. Click where you want the text to start, then press Start."
};

const DIAGNOSTIC_METHODS: DiagnosticMethod[] = [
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

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  void handleMessage(message as DripwriterMessage).then(sendResponse);
  return true;
});

async function handleMessage(message: DripwriterMessage): Promise<DripwriterResponse> {
  if (message.type === "GET_STATUS") {
    return { ok: true, status: getStatus() };
  }

  if (message.type === "STOP_DRIP") {
    const result = stopDrip();
    return { ok: result.ok, status: result.status };
  }

  if (message.type === "RUN_DIAGNOSTICS") {
    const result = runDiagnostics();
    return { ok: result.ok, status: result.status };
  }

  // START_DRIP
  const result = startDrip(message.payload);
  return { ok: result.ok, status: result.status, error: result.error };
}

function startDrip(
  settings: DripwriterSettings,
  onSettled?: (result: { ok: boolean; error?: string }) => void
): { ok: boolean; status: TypingStatus; error?: string } {
  if (!settings.text.trim()) {
    setStatus(false, "Add some text first.");
    onSettled?.({ ok: false, error: currentStatus.detail });
    return { ok: false, status: currentStatus, error: currentStatus.detail };
  }

  stopRun("Restarting...");

  const run: RunState = {
    cancelled: false,
    activeTypingMs: 0,
    onSettled
  };

  activeRun = run;
  acquireWakeLock();
  setStatus(true, "Starting to type in 3...");

  void runDripwriter(run, normalizeSettings(settings));

  return { ok: true, status: currentStatus };
}

function stopDrip(): { ok: boolean; status: TypingStatus } {
  stopRun("Stopped.");
  return { ok: true, status: currentStatus };
}

function runDiagnostics(
  onSettled?: (result: { ok: boolean; error?: string }) => void
): { ok: boolean; status: TypingStatus } {
  stopRun("Restarting diagnostics...");

  const run: RunState = {
    cancelled: false,
    activeTypingMs: 0,
    onSettled
  };

  activeRun = run;
  acquireWakeLock();
  setStatus(true, "Running typing diagnostics in 3...");

  void runTypingDiagnostics(run);

  return { ok: true, status: currentStatus };
}

function getStatus(): TypingStatus {
  return currentStatus;
}

function setStatus(running: boolean, detail: string, failed = false) {
  currentStatus = { running, detail, failed };
}

function acquireWakeLock() {
  void navigator.locks.request("dripwriter-active", () =>
    new Promise<void>(resolve => { releaseLock = resolve; })
  );
}

function releaseWakeLock() {
  releaseLock?.();
  releaseLock = null;
}

function stopRun(detail: string) {
  if (activeRun) {
    activeRun.cancelled = true;
    activeRun = null;
    releaseWakeLock();
  }

  setStatus(false, detail);
}

async function runDripwriter(run: RunState, settings: DripwriterSettings) {
  try {
    await runCountdown(run);

    if (run.cancelled || activeRun !== run) {
      run.onSettled?.({ ok: false, error: "cancelled" });
      return;
    }

    // Stays "Checking..." until a character is PROVEN to have landed, so a
    // document that rejects our input never shows a fake progress percentage.
    setStatus(true, "Checking Google Docs...");

    const text = settings.text.replace(/\r\n/g, "\n");

    for (let index = 0; index < text.length; index += 1) {
      if (run.cancelled || activeRun !== run) {
        run.onSettled?.({ ok: false, error: "cancelled" });
        return;
      }

      const char = text[index];

      if (shouldTakeBreak(run, settings, text, index)) {
        await takeBreak(run, settings);
      }

      if (isWordStart(text, index) && Math.random() < settings.detourRate / 100) {
        const detourWord = pickDetourWord(text, index);

        if (detourWord) {
          setStatus(true, `Typing... then deleting "${detourWord}"`);
          await typeLiteral(run, detourWord, settings, false);
          await wait(run, randomBetween(180, 320), true);
          await deleteBackward(run, detourWord.length);
          await wait(run, randomBetween(80, 160), true);
          setStatus(true, "Typing...");
        }
      }

      if (shouldMistype(char, settings) && !run.cancelled) {
        const typo = getNearbyTypo(char);

        if (typo) {
          await insertText(run, typo);
          await wait(run, charDelay(typo, settings) * 0.8, true);
          await deleteBackward(run, 1);
          await wait(run, charDelay(char, settings) * 0.45, true);
        }
      }

      const consumed = await insertText(run, char, text.slice(index + 1));
      await wait(run, charDelay(char, settings), true);

      // On builds that reject lone whitespace it was pasted together with the
      // following character(s), which already landed — skip them.
      index += consumed;

      if (index > 0 && index % 30 === 0) {
        const progress = Math.round((index / text.length) * 100);
        setStatus(true, `Typing... ${progress}%`);
      }
    }

    if (!run.cancelled && activeRun === run) {
      activeRun = null;
      releaseWakeLock();
      setStatus(false, "Finished typing.");
      run.onSettled?.({ ok: true });
    }
  } catch (error) {
    if (activeRun === run) {
      activeRun = null;
      releaseWakeLock();
    }

    const detail = error instanceof Error ? error.message : "Typing failed.";
    setStatus(false, detail, true);
    run.onSettled?.({ ok: false, error: detail });
  }
}

async function runTypingDiagnostics(run: RunState) {
  try {
    await runCountdownWithPrefix(run, "Running typing diagnostics");

    for (const method of DIAGNOSTIC_METHODS) {
      if (run.cancelled || activeRun !== run) {
        run.onSettled?.({ ok: false, error: "cancelled" });
        return;
      }

      setStatus(true, `Testing ${method.label}: ${method.description}`);

      try {
        method.run();
      } catch {
        // Ignore per-method failures so the rest of the matrix still runs.
      }

      await wait(run, 900, false);
    }

    if (!run.cancelled && activeRun === run) {
      activeRun = null;
      releaseWakeLock();
      setStatus(false, "Diagnostics finished. Check which markers appeared in the doc.");
      run.onSettled?.({ ok: true });
    }
  } catch (error) {
    if (activeRun === run) {
      activeRun = null;
      releaseWakeLock();
    }

    const detail = error instanceof Error ? error.message : "Diagnostics failed.";
    setStatus(false, detail);
    run.onSettled?.({ ok: false, error: detail });
  }
}

function normalizeSettings(settings: DripwriterSettings): DripwriterSettings {
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  const breakMinSeconds = clamp(Math.round(merged.breakMinSeconds), 3, 60);
  const breakMaxSeconds = clamp(Math.round(merged.breakMaxSeconds), breakMinSeconds, 90);

  return {
    text: merged.text,
    wpm: clamp(Math.round(merged.wpm), 20, 150),
    speedVariance: clamp(Math.round(merged.speedVariance), 0, 80),
    typoRate: clamp(Math.round(merged.typoRate), 0, 30),
    detourRate: clamp(Math.round(merged.detourRate), 0, 25),
    breakFrequencySeconds: clamp(Math.round(merged.breakFrequencySeconds), 10, 600),
    breakFrequencyVariance: clamp(Math.round(merged.breakFrequencyVariance), 0, 100),
    breakMinSeconds,
    breakMaxSeconds
  };
}

function buildNeighborMap() {
  const positions = new Map<string, { row: number; column: number }>();

  keyboardRows.forEach((row, rowIndex) => {
    [...row.keys].forEach((key, columnIndex) => {
      positions.set(key, { row: rowIndex, column: row.offset + columnIndex });
    });
  });

  const map = new Map<string, string[]>();

  positions.forEach((position, key) => {
    const neighbors: string[] = [];

    positions.forEach((otherPosition, otherKey) => {
      if (key === otherKey) {
        return;
      }

      const rowDistance = Math.abs(position.row - otherPosition.row);
      const columnDistance = Math.abs(position.column - otherPosition.column);

      if (rowDistance <= 1 && columnDistance <= 1.2) {
        neighbors.push(otherKey);
      }
    });

    map.set(key, neighbors);
  });

  return map;
}

function shouldMistype(char: string, settings: DripwriterSettings) {
  return /[a-zA-Z,./]/.test(char) && Math.random() < settings.typoRate / 100;
}

function getNearbyTypo(char: string) {
  const lowercase = char.toLowerCase();
  const neighbors = neighborMap.get(lowercase);

  if (!neighbors?.length) {
    return null;
  }

  const typo = neighbors[Math.floor(Math.random() * neighbors.length)];
  return char === lowercase ? typo : typo.toUpperCase();
}

function shouldTakeBreak(
  run: RunState,
  settings: DripwriterSettings,
  text: string,
  index: number
) {
  if (run.nextBreakThresholdMs === undefined) {
    run.nextBreakThresholdMs = computeBreakThreshold(settings);
  }

  if (run.activeTypingMs < run.nextBreakThresholdMs) {
    return false;
  }

  const previousChar = text[index - 1] ?? "";
  return /\s|[.,!?;:]/.test(previousChar);
}

function computeBreakThreshold(settings: DripwriterSettings) {
  const variance = settings.breakFrequencyVariance / 100;
  const multiplier = 1 + (Math.random() * 2 - 1) * variance;
  return Math.max(1000, settings.breakFrequencySeconds * 1000 * multiplier);
}

async function takeBreak(run: RunState, settings: DripwriterSettings) {
  const durationSeconds = randomBetween(settings.breakMinSeconds, settings.breakMaxSeconds);
  run.activeTypingMs = 0;
  run.nextBreakThresholdMs = computeBreakThreshold(settings);
  setStatus(true, `Taking a ${durationSeconds.toFixed(1)}s break...`);
  await wait(run, durationSeconds * 1000, false);
  setStatus(true, "Typing...");
}

function isWordStart(text: string, index: number) {
  const current = text[index];
  const previous = text[index - 1] ?? " ";
  return /[A-Za-z]/.test(current) && !/[A-Za-z]/.test(previous);
}

function pickDetourWord(text: string, index: number) {
  const future = Array.from(text.slice(index).matchAll(/\b[A-Za-z][A-Za-z'-]{2,10}\b/g))
    .map((match) => match[0])
    .slice(1, 8)
    .filter((word) => word.length >= 3 && word.length <= 10);

  if (!future.length) {
    return null;
  }

  return future[Math.floor(Math.random() * future.length)];
}

async function typeLiteral(
  run: RunState,
  text: string,
  settings: DripwriterSettings,
  allowMistakes: boolean
) {
  for (const char of text) {
    if (run.cancelled || activeRun !== run) {
      return;
    }

    if (allowMistakes && shouldMistype(char, settings)) {
      const typo = getNearbyTypo(char);

      if (typo) {
        await insertText(run, typo);
        await wait(run, charDelay(typo, settings) * 0.8, true);
        await deleteBackward(run, 1);
      }
    }

    await insertText(run, char);
    await wait(run, charDelay(char, settings), true);
  }
}

/**
 * Insertion methods, ordered most- to least-likely to be honoured.
 *
 * None of these can be trusted to report success: `execCommand` returns false on
 * Docs' editing host, and dispatchEvent returns true for "an event was
 * dispatched", not "text was inserted". Every attempt is therefore verified
 * against the DOM by `didCaretAdvance`.
 */
const INSERT_METHODS: DocsMethod[] = [
  // Measured: Docs applies this synchronously (caret moves before the call
  // returns) and it is the only method that handles lone whitespace, so it is
  // tried first — when it works, verification costs nothing.
  {
    label: "beforeinput",
    apply: (target, text) => void dispatchInsertEvents(target.element, text, "insertText")
  },
  // Measured: applied asynchronously (~30ms) and silently no-ops on a lone
  // space, but works on Docs builds that ignore beforeinput entirely.
  {
    label: "paste",
    apply: (target, text) => void dispatchDocsPaste(target.element, text)
  },
  {
    label: "paste-bubbling",
    apply: (target, text) =>
      void dispatchDocsPaste(target.element, text, { bubbles: true, cancelable: true })
  },
  // The builds that ignore beforeinput run a legacy keyCode-based keydown
  // pipeline (the same channel that honors Backspace). Synthetic keydowns with a
  // real keyCode handle lone whitespace there, where paste drops it. Falls back
  // to the paired-whitespace path when even this is ignored.
  {
    label: "keyboard",
    apply: (target, text) => void dispatchKeyboardTyping(target.element, text)
  },
  // Returns false on Docs' editing host in current Chrome; kept as a backstop
  // for older builds only.
  {
    label: "execCommand",
    apply: (target, text) => void tryExecInsert(target.doc, text)
  }
];

/**
 * Deletion is a separate capability from insertion: Docs honours a synthetic
 * keydown Backspace but ignores a bare `beforeinput` with deleteContentBackward,
 * so a build can accept our text and still refuse our corrections.
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
 * The document text is painted to a <canvas>, so inserted characters never appear
 * in the DOM and cannot be counted there. The caret, however, IS a DOM element —
 * and it advances only when Docs actually applies an edit. That makes it the one
 * reliable proof-of-insertion signal in canvas-rendered Docs.
 *
 * Only the local caret blinks, which is what distinguishes it from collaborator
 * carets in a shared document.
 */
const LOCAL_CARET_CLASS = "docs-text-ui-cursor-blink";

function getCaretSignature(): string {
  return buildCaretSignature(
    Array.from(document.querySelectorAll<HTMLElement>(".kix-cursor")).map((caret) => ({
      isLocal: caret.classList.contains(LOCAL_CARET_CLASS),
      transform: window.getComputedStyle(caret).transform
    }))
  );
}

/**
 * Resolves true as soon as the caret moves, false if it never does.
 *
 * Deliberately NOT requestAnimationFrame-based: rAF does not fire in a
 * backgrounded tab, and this extension holds a wake lock precisely so it can
 * keep typing while the tab is in the background.
 *
 * The synchronous first check matters — `beforeinput` moves the caret before
 * dispatch returns, so the common path never waits on a timer at all.
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
async function attemptMutation(method: DocsMethod, target: DocsTarget, text: string) {
  const before = getCaretSignature();

  try {
    method.apply(target, text);
  } catch {
    return false;
  }

  return didCaretAdvance(before);
}

/**
 * Inserts a single character (or, for whitespace, possibly whitespace plus the
 * next character) and verifies it landed.
 *
 * @returns the number of FOLLOWING characters that were consumed along with the
 *   whitespace (they already landed in the document), so the caller can skip
 *   them; 0 when only `text` was inserted.
 */
async function insertText(run: RunState, text: string, remainingAfter?: string): Promise<number> {
  const target = ensureEditorTarget(run);

  if (!target) {
    throw new Error("The Google Docs cursor was lost. Click back into the document and retry.");
  }

  const isWhitespace = /^\s+$/.test(text);
  const locked = isWhitespace ? run.spaceMethod : run.textMethod;

  // Once this build has proven it only accepts whitespace paired with text, the
  // single-character cascade is a known dead end — skip it to avoid 2s of failed
  // verification per space.
  let winner: DocsMethod | null = null;
  let consumed = 0;

  if (!(isWhitespace && run.whitespaceNeedsPairing)) {
    winner = await cascadeUntilVerified({
      methods: INSERT_METHODS,
      locked,
      target,
      text,
      attempt: attemptMutation
    });
  }

  // Lone whitespace is rejected on builds that ignore beforeinput: paste drops
  // whitespace-only content and nothing else applies. Paste it together with the
  // following text instead — non-whitespace content is applied — and let the
  // caller skip the characters that landed with it. The pair is text-shaped
  // content, so the method already proven for text on this build is tried first.
  if (!winner && isWhitespace && remainingAfter !== undefined) {
    // The direct cascade above just failed for whitespace, independent of
    // whether pairing succeeds below — no need to keep re-attempting it (and
    // eating its ~2s of failed verification) for the rest of this run.
    run.whitespaceNeedsPairing = true;

    const suffix = buildWhitespacePairSuffix(remainingAfter);

    if (suffix !== null) {
      winner = await cascadeUntilVerified({
        methods: INSERT_METHODS,
        locked: run.textMethod,
        target,
        text: text + suffix,
        attempt: attemptMutation
      });

      if (winner) {
        consumed = suffix.length;
      }
    }
  }

  // Nothing works. If this is a lone whitespace character that simply had no
  // non-whitespace character to pair with — trailing whitespace, or a
  // whitespace run longer than buildWhitespacePairSuffix's maxLength — on a
  // build that's already proven it accepts our writes, skip it instead of
  // aborting the run: Docs is fine, this one character just isn't
  // representable on this build.
  if (!winner) {
    if (isWhitespace && run.provenWriteable) {
      return consumed;
    }

    throw new Error(run.provenWriteable ? DOCS_STOPPED_MESSAGE : DOCS_REJECTED_MESSAGE);
  }

  // A paired paste is a text-shaped insert (contains a printable character) and
  // says nothing about how this build handles a LONE space, so it must not be
  // cached as spaceMethod.
  if (isWhitespace && consumed === 0) {
    run.spaceMethod = winner;
  } else if (!isWhitespace) {
    run.textMethod = winner;
  }

  // Only now is it honest to show typing progress: a character has provably landed.
  if (!run.provenWriteable) {
    run.provenWriteable = true;
    setStatus(true, "Typing...");
  }

  return consumed;
}

async function deleteBackward(run: RunState, count: number) {
  for (let index = 0; index < count; index += 1) {
    if (run.cancelled || activeRun !== run) {
      return;
    }

    const target = ensureEditorTarget(run);

    if (!target) {
      throw new Error("The Google Docs cursor was lost while deleting.");
    }

    // Same trap as insertion: dispatchBackspace returns true for "an event was
    // dispatched". An unverified delete leaves injected typos in the document.
    const winner = await cascadeUntilVerified({
      methods: DELETE_METHODS,
      locked: run.deleteMethod,
      target,
      text: "",
      attempt: attemptMutation
    });

    if (!winner) {
      throw new Error(DELETE_REJECTED_MESSAGE);
    }

    run.deleteMethod = winner;
    await wait(run, randomBetween(35, 85), true);
  }
}

function ensureEditorTarget(run: RunState): DocsTarget | null {
  const target = findDocsTarget();

  if (target) {
    target.element.focus({ preventScroll: true });
    return target;
  }

  return null;
}

async function runCountdown(run: RunState) {
  await runCountdownWithPrefix(run, "Starting to type");
}

async function runCountdownWithPrefix(run: RunState, prefix: string) {
  for (const step of [3, 2, 1]) {
    if (run.cancelled || activeRun !== run) {
      return;
    }

    setStatus(true, `${prefix} in ${step}...`);
    await wait(run, 1000, false);
  }
}

function findDocsTarget(): DocsTarget | null {
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
      // Docs' keydown pipeline is legacy (keyCode-based) on the builds that
      // ignore beforeinput: a synthetic event whose keyCode reads 0 is dropped.
      // The same channel is already proven to work for Backspace (keyCode 8,
      // see dispatchBackspace), so insertion keys carry their keyCode too.
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

function charDelay(char: string, settings: DripwriterSettings) {
  const baseDelay = 60000 / (settings.wpm * 5);
  const variance = settings.speedVariance / 100;
  const minMultiplier = Math.max(0.12, 1 - variance);
  const maxMultiplier = 1 + variance;
  let delay = baseDelay * randomBetween(minMultiplier, maxMultiplier);

  if (char === " ") {
    delay *= 0.55;
  } else if (char === "\n") {
    delay *= 3.8;
  } else if (/[.,!?;:]/.test(char)) {
    delay *= 2.7;
  } else if (/[A-Z]/.test(char)) {
    delay *= 1.15;
  }

  return delay;
}

async function wait(run: RunState, ms: number, countsTowardTyping: boolean) {
  if (countsTowardTyping) {
    run.activeTypingMs += ms;
  }

  if (run.cancelled || activeRun !== run) {
    return;
  }

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// ---- Bridge IPC (window._dripwriter) ----

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.origin !== window.location.origin) return;

  const data = event.data;
  if (!data || typeof data !== "object" || data.source !== BRIDGE_REQUEST_SOURCE) {
    return;
  }

  void dispatchBridgeRequest(data as BridgeRequest);
});

async function dispatchBridgeRequest(request: BridgeRequest) {
  try {
    switch (request.method) {
      case "start": {
        const onSettled = (result: { ok: boolean; error?: string }) => {
          respondToBridge({
            source: BRIDGE_RESPONSE_SOURCE,
            id: request.id,
            ok: result.ok,
            error: result.error,
            status: currentStatus
          });
        };

        // startDrip invokes onSettled exactly once — synchronously on kickoff failure,
        // or asynchronously when runDripwriter exits. Nothing more to do here.
        startDrip(request.settings, onSettled);
        return;
      }
      case "stop": {
        const result = stopDrip();
        respondToBridge({
          source: BRIDGE_RESPONSE_SOURCE,
          id: request.id,
          ok: result.ok,
          status: result.status
        });
        return;
      }
      case "test": {
        const onSettled = (result: { ok: boolean; error?: string }) => {
          respondToBridge({
            source: BRIDGE_RESPONSE_SOURCE,
            id: request.id,
            ok: result.ok,
            error: result.error,
            status: currentStatus
          });
        };
        runDiagnostics(onSettled);
        return;
      }
      case "status": {
        respondToBridge({
          source: BRIDGE_RESPONSE_SOURCE,
          id: request.id,
          ok: true,
          status: getStatus()
        });
        return;
      }
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Bridge request failed.";
    respondToBridge({
      source: BRIDGE_RESPONSE_SOURCE,
      id: request.id,
      ok: false,
      error: detail
    });
  }
}

function respondToBridge(response: BridgeResponse) {
  window.postMessage(response, window.location.origin);
}

// ---- API mode (enable/disable bridge from storage) ----

function postBridgeControl(control: BridgeControl) {
  window.postMessage(control, window.location.origin);
}

function applyApiMode(enabled: boolean) {
  if (enabled) {
    postBridgeControl({
      source: BRIDGE_CONTROL_SOURCE,
      action: "enable",
      version: VERSION
    });
    return;
  }

  // Disable: stop API-induced runs only (popup-induced runs have no onSettled).
  if (activeRun?.onSettled) {
    stopDrip();
  }
  postBridgeControl({ source: BRIDGE_CONTROL_SOURCE, action: "disable" });
}

void chrome.storage.local
  .get({ [API_MODE_STORAGE_KEY]: false })
  .then((result) => {
    applyApiMode(Boolean(result[API_MODE_STORAGE_KEY]));
  });

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  const change = changes[API_MODE_STORAGE_KEY];
  if (!change) return;
  applyApiMode(Boolean(change.newValue));
});
