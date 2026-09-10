import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
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
  type FrameMessage,
  type TypingStatus
} from "./types";
import { VERSION } from "~/lib/version";
import { selectHarness } from "~/lib/harness/registry";
import { readEditableContent } from "~/lib/harness/default";
import { DIAGNOSTIC_METHODS } from "~/lib/harness/docs";
import type { Harness } from "~/lib/harness/types";

interface RunState {
  cancelled: boolean;
  activeTypingMs: number;
  nextBreakThresholdMs?: number;
  onSettled?: (result: { ok: boolean; error?: string }) => void;
  /**
   * True only when a newer run took over (Start/Resume/diagnostics), as opposed
   * to a plain Stop: a superseded run winding down must not resurrect stale
   * state or overwrite its successor's status.
   */
  superseded?: boolean;
  /**
   * Resolved when the run's async body fully exits, so stopDrip can await the
   * unwind — in-flight verified insertion included — before reporting status.
   */
  haltPromise: Promise<void>;
  /**
   * Temporary characters this run inserted but has not deleted yet: a typo
   * awaiting correction or a false-start word mid-detour. They sit AFTER the
   * committed prefix, so Stop must save them for Resume to delete first.
   */
  strayChars: number;
}

/**
 * Everything needed to continue a stopped run at its last verified position.
 * Lives only in the content script's memory: a resume point belongs to one page
 * and one caret, so navigation or extension reload invalidates it by dropping
 * this module entirely — no storage persistence.
 */
interface ResumeState {
  /** Exact settings the stopped run used; Resume continues the original run. */
  settings: DripwriterSettings;
  /**
   * Number of verified characters committed before the stop: every loop index
   * below this provably landed (insertion is verified before the index moves).
   */
  nextIndex: number;
  /** Temporary typo/detour characters a cancelled correction left behind. */
  strayChars: number;
  /** Harness id at capture time; Resume refuses to continue under another. */
  harnessId: string;
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
let resumeState: ResumeState | null = null;
let releaseLock: (() => void) | null = null;
let currentStatus: TypingStatus = {
  running: false,
  detail: "Idle. Click where you want the text to start, then press Start."
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  void handleMessage(message as DripwriterMessage).then(sendResponse);
  return true;
});

// ---- Frame targeting: tell the SW when this frame owns an editable ----
// With all_frames injection there are many content scripts per tab; the popup
// asks the SW which frame to type into, so each frame must report its target.

function reportEditableFocus() {
  void chrome.runtime.sendMessage({ type: "EDITABLE_FOCUSED" } satisfies FrameMessage).catch(() => {});
}

document.addEventListener(
  "focusin",
  () => {
    if (selectHarness().hasTarget()) reportEditableFocus();
  },
  true
);

// Docs paints to <canvas>; a click into the doc establishes the target without a
// focusin on a normal editable, so report on click too.
document.addEventListener(
  "click",
  () => {
    if (selectHarness().hasTarget()) reportEditableFocus();
  },
  true
);

async function handleMessage(message: DripwriterMessage): Promise<DripwriterResponse> {
  if (message.type === "GET_STATUS") {
    return { ok: true, status: getStatus() };
  }

  if (message.type === "STOP_DRIP") {
    // Awaited so the run's unwind (which captures the resumable state after any
    // in-flight insert settles) has finished and the status is final.
    const result = await stopDrip();
    return { ok: result.ok, status: result.status };
  }

  if (message.type === "RESUME_DRIP") {
    const result = resumeDrip(message.payload);
    return { ok: result.ok, status: result.status, error: result.error };
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

  // A deliberate Start discards any resumable progress from before.
  resumeState = null;
  stopRun("Restarting...", true);

  const { run, resolveHalt } = createRun(onSettled);

  activeRun = run;
  acquireWakeLock();
  setStatus(true, "Starting to type in 3...");

  void runDripwriter(run, normalizeSettings(settings))
    .finally(() => resolveHalt())
    .catch(() => {});

  return { ok: true, status: currentStatus };
}

/**
 * Continues a stopped run from its saved position. Deliberately popup-only: the
 * console bridge's public contract (start/stop/test/status) is unchanged, and
 * an API consumer that wants the rest typed can simply call start() again.
 */
function resumeDrip(
  payload: { text: string } & Partial<DripwriterSettings> | undefined
): { ok: boolean; status: TypingStatus; error?: string } {
  if (activeRun) {
    setStatus(true, "Dripwriter is already typing.");
    return { ok: false, status: currentStatus, error: currentStatus.detail };
  }

  const saved = resumeState;
  if (!saved) {
    const detail = "Nothing to resume. Press Start to begin a new run.";
    setStatus(false, detail);
    return { ok: false, status: currentStatus, error: detail };
  }

  // The popup still owns the live sliders, so it echoes them along; anything
  // the user touched since the Stop means this is no longer the same run.
  if (payload && !isCompatibleResumePayload(payload, saved.settings)) {
    resumeState = null;
    const detail = "The text or settings changed since the run was stopped. Press Start to retype it.";
    setStatus(false, detail);
    return { ok: false, status: currentStatus, error: detail };
  }

  const { run, resolveHalt } = createRun(() => {});

  activeRun = run;
  acquireWakeLock();
  setStatus(true, "Starting to type in 3...");

  void runDripwriter(run, saved.settings, saved)
    .finally(() => resolveHalt())
    .catch(() => {});

  return { ok: true, status: currentStatus };
}

function createRun(
  onSettled: (result: { ok: boolean; error?: string }) => void
): { run: RunState; resolveHalt: () => void } {
  let resolveHalt!: () => void;
  const haltPromise = new Promise<void>((resolve) => {
    resolveHalt = resolve;
  });

  return {
    run: { cancelled: false, activeTypingMs: 0, strayChars: 0, haltPromise, onSettled },
    resolveHalt
  };
}

/** Resume continues the saved run: text must match, and knobs must too. */
function isCompatibleResumePayload(
  payload: { text: string } & Partial<DripwriterSettings>,
  saved: DripwriterSettings
): boolean {
  const normalizeText = (text: string) => text.replace(/\r\n/g, "\n");

  if (normalizeText(payload.text) !== normalizeText(saved.text)) {
    return false;
  }

  const keys: Array<keyof DripwriterSettings> = [
    "wpm",
    "speedVariance",
    "typoRate",
    "detourRate",
    "breakFrequencySeconds",
    "breakFrequencyVariance",
    "breakMinSeconds",
    "breakMaxSeconds"
  ];

  return keys.every((key) => {
    const value = payload[key];
    return value === undefined || value === saved[key];
  });
}

async function stopDrip(): Promise<{ ok: boolean; status: TypingStatus }> {
  const run = activeRun;

  // Nothing to stop: report the live status as-is instead of clobbering a
  // resumable/completed status with a bare "Stopped." (double-Stop race).
  if (!run) {
    return { ok: true, status: currentStatus };
  }

  stopRun("Stopped.");

  // The run may still be finishing a verified insert right now; wait for it to
  // unwind so the reported status (and any saved resume state) is final.
  await run.haltPromise;

  return { ok: true, status: currentStatus };
}

function runDiagnostics(
  onSettled?: (result: { ok: boolean; error?: string }) => void
): { ok: boolean; status: TypingStatus } {
  // Diagnostics move the caret and (on Docs) leave marker text behind, which
  // would corrupt a saved position — so they invalidate it.
  resumeState = null;
  stopRun("Restarting diagnostics...", true);

  const { run, resolveHalt } = createRun(onSettled);

  activeRun = run;
  acquireWakeLock();
  setStatus(true, "Running typing diagnostics in 3...");

  void runTypingDiagnostics(run)
    .finally(() => resolveHalt())
    .catch(() => {});

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

function stopRun(detail?: string, supersede = false) {
  if (activeRun) {
    activeRun.cancelled = true;
    activeRun.superseded = supersede;
    activeRun = null;
    releaseWakeLock();
  }

  if (detail) {
    setStatus(false, detail);
  }
}

async function runDripwriter(
  run: RunState,
  settings: DripwriterSettings,
  resume: ResumeState | null = null
) {
  // First position NOT yet provably committed. Everything the loop verifies
  // moves it forward, so every exit path — including a failure thrown out of an
  // in-flight mutation — can snapshot a consistent resume point.
  let haltPoint = resume ? resume.nextIndex : 0;
  let harnessId = resume ? resume.harnessId : "default";

  // A resumed run inherits the saved run's un-corrected strays: they are still
  // sitting in the editor until prepareResume deletes them, so a Stop that
  // lands before or during cleanup must carry them into the new saved state.
  if (resume) {
    run.strayChars = resume.strayChars;
  }

  try {
    await runCountdown(run);

    if (run.cancelled || activeRun !== run) {
      // Routed through finalize so a resumed run stopped during the countdown
      // keeps its saved point (and strays) alive instead of losing them.
      await finalizeHaltedRun(run, settings, resume, harnessId, haltPoint);
      return;
    }

    const harness = selectHarness({
      onFirstWrite: () => setStatus(true, "Typing..."),
      isCancelled: () => run.cancelled || activeRun !== run,
      betweenDeletes: () => wait(run, randomBetween(35, 85), true)
    });
    harnessId = harness.id;

    // Stays "Checking..." until a character is PROVEN to have landed, so a
    // document that rejects our input never shows a fake progress percentage.
    setStatus(true, harness.id === "docs" ? "Checking Google Docs..." : "Checking editor...");

    const text = settings.text.replace(/\r\n/g, "\n");

    if (resume) {
      await prepareResume(run, harness, text, resume);
      if (run.cancelled || activeRun !== run) {
        await finalizeHaltedRun(run, settings, resume, harnessId, haltPoint);
        return;
      }
    }

    let stopIndex: number | null = null;

    for (let index = resume ? resume.nextIndex : 0; index < text.length; index += 1) {
      if (run.cancelled || activeRun !== run) {
        stopIndex = index;
        break;
      }

      const char = text[index];

      if (shouldTakeBreak(run, settings, text, index)) {
        await takeBreak(run, settings);
      }

      if (isWordStart(text, index) && Math.random() < settings.detourRate / 100) {
        const detourWord = pickDetourWord(text, index);

        if (detourWord) {
          setStatus(true, `Typing... then deleting "${detourWord}"`);
          // typeLiteral accounts for every temporary char it inserts.
          await typeLiteral(run, harness, detourWord, settings, false);
          await wait(run, randomBetween(180, 320), true);
          const deleted = await harness.delete(detourWord.length);
          run.strayChars = Math.max(0, run.strayChars - deleted);
          await wait(run, randomBetween(80, 160), true);
          setStatus(true, "Typing...");
        }
      }

      if (run.cancelled || activeRun !== run) {
        stopIndex = index;
        break;
      }

      if (shouldMistype(char, settings) && !run.cancelled) {
        const typo = getNearbyTypo(char);

        if (typo) {
          await harness.insert(typo);
          run.strayChars += 1;
          await wait(run, charDelay(typo, settings) * 0.8, true);
          const deleted = await harness.delete(1);
          run.strayChars = Math.max(0, run.strayChars - deleted);
          await wait(run, charDelay(char, settings) * 0.45, true);
        }
      }

      if (run.cancelled || activeRun !== run) {
        stopIndex = index;
        break;
      }

      const consumed = await harness.insert(char, text.slice(index + 1));
      await wait(run, charDelay(char, settings), true);

      // On builds that reject lone whitespace it was pasted together with the
      // following character(s), which already landed — skip them.
      index += consumed;

      // The insert (plus any paired followers) is verified, so everything
      // through `index` is committed and the resume point moves past it.
      haltPoint = index + 1;

      if (index > 0 && index % 30 === 0) {
        const progress = Math.round((index / text.length) * 100);
        setStatus(true, `Typing... ${progress}%`);
      }
    }

    if (stopIndex !== null) {
      await finalizeHaltedRun(run, settings, resume, harnessId, stopIndex);
      return;
    }

    if (!run.cancelled && activeRun === run) {
      activeRun = null;
      releaseWakeLock();
      // Completion means nothing is left to continue — drop any stale point.
      resumeState = null;
      setStatus(false, "Finished typing.");
      run.onSettled?.({ ok: true });
    }
  } catch (error) {
    const cancelled = run.cancelled || activeRun !== run;

    if (cancelled) {
      // Stop or supersession raced a failing mutation; the loop index above is
      // still authoritative for what had verified before it.
      await finalizeHaltedRun(run, settings, resume, harnessId, haltPoint);
      return;
    }

    if (activeRun === run) {
      activeRun = null;
      releaseWakeLock();
    }

    // A failed run leaves the editor in an unverified state relative to any
    // saved point, so that point can no longer be trusted.
    resumeState = null;

    const detail = error instanceof Error ? error.message : "Typing failed.";
    setStatus(false, detail, true);
    run.onSettled?.({ ok: false, error: detail });
  }
}

/**
 * Finalizes a run that ended early: Stop, supersession, or a stop observed
 * while a correction was mid-flight.
 *
 * The snapshot is taken HERE — after the loop's in-flight verified insert has
 * resolved — never synchronously inside stopRun. An insertion that was already
 * running when Stop was pressed lands before its await returns, and the loop
 * index advances past it, so the saved position can never assume a write that
 * had not happened yet (and never misses one that did).
 */
async function finalizeHaltedRun(
  run: RunState,
  settings: DripwriterSettings,
  resume: ResumeState | null,
  harnessId: string,
  nextIndex: number
): Promise<void> {
  // A superseded run (a newer Start/Resume/diagnostics took over) owns nothing:
  // its successor is live and already set the status it wants.
  if (run.superseded || (activeRun !== null && activeRun !== run)) {
    run.onSettled?.({ ok: false, error: "cancelled" });
    return;
  }

  activeRun = null;
  releaseWakeLock();

  if (nextIndex > 0) {
    resumeState = {
      settings,
      nextIndex,
      strayChars: run.strayChars,
      harnessId
    };
    currentStatus = {
      running: false,
      detail: joinResumeDetail(nextIndex, run.strayChars),
      resumable: true
    };
  } else if (resume) {
    // A resumed run that gained nothing keeps the original stop point alive.
    currentStatus = { running: false, detail: "Stopped.", resumable: true };
  } else {
    setStatus(false, "Stopped.");
  }

  run.onSettled?.({ ok: false, error: "cancelled" });
}

function joinResumeDetail(nextIndex: number, strayChars: number): string {
  const typed =
    nextIndex === 1
      ? "1 character was typed"
      : `${nextIndex} characters were typed`;

  return strayChars > 0
    ? `Stopped. ${typed} — press Resume to continue (pending corrections will be cleaned up first).`
    : `Stopped. ${typed} — press Resume to continue.`;
}

/**
 * Re-establishes the world a stopped run left behind: deletes stray characters
 * a cancelled correction left behind, refuses when the text changed under us,
 * and verifies the saved position still matches the document before typing on.
 */
async function prepareResume(
  run: RunState,
  harness: Harness,
  text: string,
  resume: ResumeState
): Promise<void> {
  if (resume.harnessId !== harness.id) {
    throw new Error("The editor changed since the run was stopped. Press Start to retype it.");
  }

  if (resume.strayChars > 0) {
    setStatus(true, "Cleaning up after the stopped run...");
    const deleted = await harness.delete(resume.strayChars);
    // run.strayChars was seeded from the saved state, so after cleanup it holds
    // exactly the strays still present — finalize saves it if this cleanup
    // itself gets interrupted.
    run.strayChars = Math.max(0, run.strayChars - deleted);
  }

  if (resume.nextIndex > 0 && harness.id === "default") {
    const target = harness.ensureTarget();
    const current = readEditableContent(target.element);
    const expected = text.slice(0, resume.nextIndex);

    if (!current.endsWith(expected)) {
      throw new Error("The text changed since the run was stopped. Press Start to retype it.");
    }
  }

  // Resume verifies its first insert before counting any progress, so a stale
  // point against a modified editor fails here instead of corrupting the text.
  setStatus(true, `Resuming from character ${resume.nextIndex}...`);
}

async function runTypingDiagnostics(run: RunState) {
  const harness = selectHarness({ isCancelled: () => run.cancelled || activeRun !== run });

  // Off Google Docs there is no editor-build matrix to probe — a standard
  // editable either accepts our verified insert or it doesn't. Test it once.
  if (harness.id !== "docs") {
    await runGenericDiagnostics(run, harness);
    return;
  }

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

async function runGenericDiagnostics(run: RunState, harness: Harness) {
  try {
    await runCountdownWithPrefix(run, "Testing this text box");

    if (run.cancelled || activeRun !== run) {
      run.onSettled?.({ ok: false, error: "cancelled" });
      return;
    }

    const marker = "Dripwriter test";

    for (const char of marker) {
      if (run.cancelled || activeRun !== run) {
        run.onSettled?.({ ok: false, error: "cancelled" });
        return;
      }
      await harness.insert(char);
      await wait(run, 55, false);
    }

    // Clean up the marker so the probe leaves the field as it found it.
    await harness.delete(marker.length);

    if (!run.cancelled && activeRun === run) {
      activeRun = null;
      releaseWakeLock();
      setStatus(false, "Test passed — this text box accepts Dripwriter input.");
      run.onSettled?.({ ok: true });
    }
  } catch (error) {
    if (activeRun === run) {
      activeRun = null;
      releaseWakeLock();
    }

    const detail = error instanceof Error ? error.message : "Test failed.";
    setStatus(false, detail, true);
    run.onSettled?.({ ok: false, error: detail });
  }
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
  harness: Harness,
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
        await harness.insert(typo);
        run.strayChars += 1;
        await wait(run, charDelay(typo, settings) * 0.8, true);
        const deleted = await harness.delete(1);
        run.strayChars = Math.max(0, run.strayChars - deleted);
      }
    }

    await harness.insert(char);
    run.strayChars += 1;
    await wait(run, charDelay(char, settings), true);
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
        // Awaited so the run's unwind (which captures the resumable state after
        // any in-flight insert settles) has finished before responding.
        const result = await stopDrip();
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
    void stopDrip();
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
