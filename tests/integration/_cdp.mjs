// Shared Chrome DevTools Protocol helpers for the integration tests.
//
// These drive the REAL extension in a REAL browser against a REAL Google Doc,
// because the bug they guard against only exists at that seam: Docs' acceptance
// of synthetic events cannot be reproduced with a mocked DOM.
//
// See tests/integration/README.md for setup.

export const CDP_URL = process.env.DRIPWRITER_CDP_URL ?? "http://localhost:9224";
export const EXT_NAME = "Dripwriter Origin";

export async function getTargets() {
  const response = await fetch(`${CDP_URL}/json/list`, { signal: AbortSignal.timeout(3000) });
  return response.json();
}

/** Resolves null when no debuggable browser / doc tab / extension is available. */
export async function findTargets() {
  let targets;
  try {
    targets = await getTargets();
  } catch {
    return null;
  }

  const page = targets.find((t) => t.type === "page" && t.url.includes("/document/d/"));
  const worker = targets.find(
    (t) => t.type === "service_worker" && t.url.includes("/static/background/index.js")
  );

  return page && worker ? { page, worker } : null;
}

export function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  const pending = new Map();
  const contexts = [];
  let id = 0;

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Runtime.executionContextCreated") {
      contexts.push(message.params.context);
    }
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result);
    }
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const messageId = ++id;
      pending.set(messageId, { resolve, reject });
      ws.send(JSON.stringify({ id: messageId, method, params }));
    });

  return {
    ws,
    send,
    contexts,
    ready: new Promise((resolve) => ws.addEventListener("open", resolve)),
    close: () => ws.close()
  };
}

export async function evaluate(client, expression, contextId) {
  const params = { expression, returnByValue: true, awaitPromise: true };
  if (contextId) params.contextId = contextId;
  const result = await client.send("Runtime.evaluate", params);
  if (result.exceptionDetails) {
    return { __error: result.exceptionDetails.exception?.description ?? "eval failed" };
  }
  return result.result?.value;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Waits for the Docs editor to be fully interactive. */
export async function waitForEditor(page) {
  for (let i = 0; i < 40; i += 1) {
    const ready = await evaluate(
      page,
      `!!document.querySelector('iframe.docs-texteventtarget-iframe') && !!document.querySelector('.kix-cursor')`
    );
    if (ready === true) return true;
    await sleep(250);
  }
  return false;
}

/**
 * Finds every live Dripwriter isolated world.
 *
 * Isolated worlds are per-FRAME, so the about:blank `docs-texteventtarget-iframe`
 * has its own realm with its own EventTarget.prototype. That realm owns the element
 * the extension dispatches to — miss it and a blocker silently fails to hold.
 */
export async function findExtensionRealms(page) {
  await sleep(2000); // let late content-script realms register
  const realms = [];
  for (const context of page.contexts.filter((c) => c.name === EXT_NAME)) {
    const href = await evaluate(page, "location.href", context.id);
    if (typeof href === "string") realms.push({ id: context.id, href });
  }
  return realms;
}

const BLOCKER = `(() => {
  if (window.__dwBlock) return "already";
  const original = EventTarget.prototype.dispatchEvent;
  window.__dwBlock = { swallowed: 0, original };
  EventTarget.prototype.dispatchEvent = function (event) {
    if (['beforeinput','input','paste','keydown','keypress','keyup'].includes(event.type)) {
      window.__dwBlock.swallowed++;
      return true;   // "dispatched fine" — but Docs never sees it
    }
    return original.call(this, event);
  };
  return "blocking";
})()`;

const UNBLOCKER = `(() => {
  if (!window.__dwBlock) return "clean";
  EventTarget.prototype.dispatchEvent = window.__dwBlock.original;
  delete window.__dwBlock;
  return "restored";
})()`;

/**
 * Simulates a Docs build that ignores every key/input path and only applies
 * synthetic paste events — the build where typing used to stop after the first
 * word, because a lone-space paste is dropped while letter pastes land.
 * Replaces any prior blocker so tests can switch modes mid-suite.
 */
const PASTE_ONLY_BLOCKER = `(() => {
  if (window.__dwBlock) {
    EventTarget.prototype.dispatchEvent = window.__dwBlock.original;
    delete window.__dwBlock;
  }
  const original = EventTarget.prototype.dispatchEvent;
  window.__dwBlock = { swallowed: 0, original };
  EventTarget.prototype.dispatchEvent = function (event) {
    if (['beforeinput','input','keydown','keypress','keyup'].includes(event.type)) {
      window.__dwBlock.swallowed++;
      return true;   // "dispatched fine" — but only paste events reach Docs
    }
    return original.call(this, event);
  };
  return "blocking";
})()`;

/**
 * Like installBlocker, but lets paste events through so only pasted content
 * lands — see PASTE_ONLY_BLOCKER.
 */
export async function installPasteOnlyBlocker(page, realms) {
  for (const realm of realms) {
    await evaluate(page, PASTE_ONLY_BLOCKER, realm.id);
  }
}

/**
 * Simulates the Docs build that served the "spaces vanish" report: beforeinput,
 * input and paste are swallowed, so the only channel left is the legacy
 * keyCode-based keydown pipeline (the same one that honors Backspace).
 */
const KEYBOARD_ONLY_BLOCKER = `(() => {
  if (window.__dwBlock) {
    EventTarget.prototype.dispatchEvent = window.__dwBlock.original;
    delete window.__dwBlock;
  }
  const original = EventTarget.prototype.dispatchEvent;
  window.__dwBlock = { swallowed: 0, original };
  EventTarget.prototype.dispatchEvent = function (event) {
    if (['beforeinput','input','paste'].includes(event.type)) {
      window.__dwBlock.swallowed++;
      return true;   // "dispatched fine" — but only key events reach Docs
    }
    return original.call(this, event);
  };
  return "blocking";
})()`;

/**
 * Like installBlocker, but lets keydown/keypress/keyup through so only the
 * keyboard channel lands — see KEYBOARD_ONLY_BLOCKER.
 */
export async function installKeyboardOnlyBlocker(page, realms) {
  for (const realm of realms) {
    await evaluate(page, KEYBOARD_ONLY_BLOCKER, realm.id);
  }
}

/**
 * Simulates a Google Docs build that rejects every insertion method, by swallowing
 * editing events inside the extension's own realms. `execCommand("insertText")`
 * already returns false on Docs' editing host, so no patch is needed for it.
 */
export async function installBlocker(page, realms) {
  for (const realm of realms) {
    await evaluate(page, BLOCKER, realm.id);
  }
}

/**
 * Returns the extension realms, guaranteeing the about:blank one exists.
 *
 * That realm belongs to the `docs-texteventtarget-iframe` and is created lazily —
 * only the first time the extension's isolated world touches that frame. On a
 * freshly loaded tab it does not exist yet, so a single character is typed to
 * force it into being. Without it, event blocking cannot hold.
 */
export async function ensureRealms(page, worker) {
  const realms = await findExtensionRealms(page);
  if (realms.some((realm) => realm.href === "about:blank")) return realms;

  await startTyping(worker, { ...FAST_SETTINGS, text: "." });
  await awaitSettled(worker, 15);
  return findExtensionRealms(page);
}

/** Restores real event dispatch. Must run before any other test types for real. */
export async function removeBlocker(page, realms) {
  for (const realm of realms) {
    await evaluate(page, UNBLOCKER, realm.id);
  }
}

export async function countSwallowed(page, realms) {
  let total = 0;
  for (const realm of realms) {
    const n = await evaluate(page, `window.__dwBlock ? window.__dwBlock.swallowed : 0`, realm.id);
    if (typeof n === "number") total += n;
  }
  return total;
}

export function caretSignature(page) {
  return evaluate(
    page,
    `(() => {
      const carets = [...document.querySelectorAll('.kix-cursor')]
        .filter(c => c.classList.contains('docs-text-ui-cursor-blink'));
      const tracked = carets.length ? carets : [...document.querySelectorAll('.kix-cursor')];
      return tracked.length ? tracked.map(c => getComputedStyle(c).transform).join('|') : 'no-caret';
    })()`
  );
}

export const FAST_SETTINGS = {
  wpm: 150,
  speedVariance: 0,
  typoRate: 0,
  detourRate: 0,
  breakFrequencySeconds: 600,
  breakFrequencyVariance: 0,
  breakMinSeconds: 3,
  breakMaxSeconds: 3
};

export function startTyping(worker, settings) {
  return evaluate(
    worker,
    `(async () => {
      const tabs = await chrome.tabs.query({ url: "https://docs.google.com/document/*" });
      const response = await chrome.tabs.sendMessage(tabs[0].id, {
        type: "START_DRIP", payload: ${JSON.stringify(settings)}
      });
      return JSON.stringify(response.status);
    })()`
  );
}

/** Polls extension status until the run settles, or gives up. */
export function awaitSettled(worker, maxSeconds = 25) {
  return evaluate(
    worker,
    `(async () => {
      const tabs = await chrome.tabs.query({ url: "https://docs.google.com/document/*" });
      for (let i = 0; i < ${maxSeconds}; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const response = await chrome.tabs.sendMessage(tabs[0].id, { type: "GET_STATUS" });
        if (!response.status.running) return JSON.stringify(response.status);
      }
      return JSON.stringify({ detail: "STILL RUNNING", running: true });
    })()`
  );
}

export function getStatus(worker) {
  return evaluate(
    worker,
    `(async () => {
      const tabs = await chrome.tabs.query({ url: "https://docs.google.com/document/*" });
      const response = await chrome.tabs.sendMessage(tabs[0].id, { type: "GET_STATUS" });
      return JSON.stringify(response.status);
    })()`
  );
}

export const wait = sleep;
