// Happy-path and mid-run-failure coverage against a real Google Doc.
//
// NOTE: these tests type into whichever Google Doc tab is open. Use a scratch
// document — they append text and do not clean up after themselves.

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import {
  awaitSettled,
  caretSignature,
  connect,
  countSwallowed,
  FAST_SETTINGS,
  ensureRealms,
  findTargets,
  getStatus,
  installBlocker,
  installKeyboardOnlyBlocker,
  installPasteOnlyBlocker,
  removeBlocker,
  startTyping,
  wait,
  waitForEditor
} from "./_cdp.mjs";

describe("typing against a live Google Doc", { concurrency: 1 }, () => {
  let page;
  let worker;
  let realms = [];
  let unavailable = null;

  before(async () => {
    const targets = await findTargets();
    if (!targets) {
      unavailable = "no debuggable browser with a Google Doc tab + Dripwriter loaded";
      return;
    }

    page = connect(targets.page.webSocketDebuggerUrl);
    worker = connect(targets.worker.webSocketDebuggerUrl);
    await Promise.all([page.ready, worker.ready]);
    await page.send("Runtime.enable");
    await worker.send("Runtime.enable");

    if (!(await waitForEditor(page))) unavailable = "Docs editor never became ready";
    realms = await ensureRealms(page, worker);
  });

  after(async () => {
    // The mid-run test leaves dispatchEvent patched; restore it.
    if (page && realms.length) await removeBlocker(page, realms);
    page?.close();
    worker?.close();
  });

  it("types text and reports success only after a character provably lands", async (t) => {
    if (unavailable) return t.skip(unavailable);

    const caretBefore = await caretSignature(page);
    await startTyping(worker, { ...FAST_SETTINGS, text: "\nintegration check." });
    const status = JSON.parse(await awaitSettled(worker));
    const caretAfter = await caretSignature(page);

    assert.equal(status.detail, "Finished typing.");
    assert.equal(status.failed, false);
    assert.notEqual(caretAfter, caretBefore, "caret never moved — nothing was written");
  });

  it("corrects injected typos, leaving the intended text intact", async (t) => {
    if (unavailable) return t.skip(unavailable);

    // Typos and detours are inserted then deleted; if deletion silently no-ops
    // the run must fail rather than leave corrupted text behind.
    await startTyping(worker, {
      ...FAST_SETTINGS,
      wpm: 120,
      text: "\ntypo check pack my box.",
      typoRate: 30,
      detourRate: 15
    });
    const status = JSON.parse(await awaitSettled(worker, 40));

    assert.equal(status.failed, false);
    assert.equal(status.detail, "Finished typing.");
  });

  it("aborts honestly when Docs stops accepting text mid-run", async (t) => {
    if (unavailable) return t.skip(unavailable);
    if (!realms.some((realm) => realm.href === "about:blank")) {
      return t.skip("the about:blank texteventtarget realm was not found");
    }

    // Slow enough that the run is still going when the rug is pulled.
    await startTyping(worker, {
      ...FAST_SETTINGS,
      wpm: 40,
      text: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    });

    await wait(5500); // 3s countdown, then several characters land
    const midway = JSON.parse(await getStatus(worker));
    assert.match(midway.detail, /Typing/i, "run should be underway before blocking");

    await installBlocker(page, realms);

    const status = JSON.parse(await awaitSettled(worker));
    assert.equal(status.failed, true);
    assert.match(status.detail, /stopped accepting/i);
    assert.doesNotMatch(status.detail, /Finished typing/i);
  });

  it("types across word boundaries on a build that only accepts paste", async (t) => {
    if (unavailable) return t.skip(unavailable);
    if (!realms.some((realm) => realm.href === "about:blank")) {
      return t.skip("the about:blank texteventtarget realm was not found");
    }

    // Swallow beforeinput/input/keyboard so only paste reaches Docs — the build
    // where lone spaces are dropped and the run used to die at the first space.
    await installPasteOnlyBlocker(page, realms);
    const baseline = await countSwallowed(page, realms);

    await startTyping(worker, {
      ...FAST_SETTINGS,
      wpm: 120,
      text: "\none two three four five."
    });
    const status = JSON.parse(await awaitSettled(worker, 40));

    const swallowed = (await countSwallowed(page, realms)) - baseline;
    assert.ok(swallowed > 0, "paste-only blocker did not hold");

    // Letters land via paste; every space must be paired with the next character
    // instead of aborting the run at the first word boundary.
    assert.equal(status.failed, false);
    assert.equal(status.detail, "Finished typing.");
  });

  it("types spaces via the keyCode-based keydown channel", async (t) => {
    if (unavailable) return t.skip(unavailable);
    if (!realms.some((realm) => realm.href === "about:blank")) {
      return t.skip("the about:blank texteventtarget realm was not found");
    }

    // Swallow beforeinput/input/paste so only keydown/keypress/keyup reach Docs:
    // the build where pasted whitespace is dropped and lone spaces must come
    // through the same keyCode pipeline that already handles Backspace.
    await installKeyboardOnlyBlocker(page, realms);
    const baseline = await countSwallowed(page, realms);

    await startTyping(worker, {
      ...FAST_SETTINGS,
      wpm: 120,
      text: "\nkey one two three."
    });
    const status = JSON.parse(await awaitSettled(worker, 40));

    const swallowed = (await countSwallowed(page, realms)) - baseline;
    assert.ok(swallowed > 0, "keyboard-only blocker did not hold");

    assert.equal(status.failed, false);
    assert.equal(status.detail, "Finished typing.");
  });
});
