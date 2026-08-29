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
import { selectHarness } from "~/lib/harness/registry";
import { DIAGNOSTIC_METHODS } from "~/lib/harness/docs";
import type { Harness } from "~/lib/harness/types";

interface RunState {
  cancelled: boolean;
  activeTypingMs: number;
  nextBreakThresholdMs?: number;
  onSettled?: (result: { ok: boolean; error?: string }) => void;
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

    const harness = selectHarness({
      onFirstWrite: () => setStatus(true, "Typing..."),
      isCancelled: () => run.cancelled || activeRun !== run,
      betweenDeletes: () => wait(run, randomBetween(35, 85), true)
    });

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
          await typeLiteral(run, harness, detourWord, settings, false);
          await wait(run, randomBetween(180, 320), true);
          await harness.delete(detourWord.length);
          await wait(run, randomBetween(80, 160), true);
          setStatus(true, "Typing...");
        }
      }

      if (shouldMistype(char, settings) && !run.cancelled) {
        const typo = getNearbyTypo(char);

        if (typo) {
          await harness.insert(typo);
          await wait(run, charDelay(typo, settings) * 0.8, true);
          await harness.delete(1);
          await wait(run, charDelay(char, settings) * 0.45, true);
        }
      }

      const consumed = await harness.insert(char, text.slice(index + 1));
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
        await wait(run, charDelay(typo, settings) * 0.8, true);
        await harness.delete(1);
      }
    }

    await harness.insert(char);
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
