// Regression guard for the "phantom run": the extension reporting
// "Typing... 100%" / "Finished typing." over a document it never wrote to.
//
// Reported by a user on Windows/Chrome whose Google Docs build ignores every
// synthetic event the extension sends. Reproduced here on any machine by
// swallowing those events inside the extension's own isolated realms.

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
  installBlocker,
  removeBlocker,
  startTyping,
  waitForEditor
} from "./_cdp.mjs";

describe("phantom run", { concurrency: 1 }, () => {
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

    if (!(await waitForEditor(page))) {
      unavailable = "Docs editor never became ready";
      return;
    }

    realms = await ensureRealms(page, worker);
    if (!realms.some((realm) => realm.href === "about:blank")) {
      // Without the texteventtarget iframe's realm the blocker cannot hold, and
      // the test would pass for the wrong reason.
      unavailable = "the about:blank texteventtarget realm was not found";
    }
  });

  after(async () => {
    // Leaving dispatchEvent patched would break every later test (and the
    // user's browser session).
    if (page && realms.length) await removeBlocker(page, realms);
    page?.close();
    worker?.close();
  });

  it("fails loudly instead of reporting success when Docs rejects every method", async (t) => {
    if (unavailable) return t.skip(unavailable);

    await installBlocker(page, realms);

    const caretBefore = await caretSignature(page);
    await startTyping(worker, { ...FAST_SETTINGS, text: "PHANTOMTEST" });
    const status = JSON.parse(await awaitSettled(worker));
    const caretAfter = await caretSignature(page);

    const swallowed = await countSwallowed(page, realms);
    assert.ok(swallowed > 0, "blocker did not hold — no events were swallowed");

    // Ground truth: the caret is the only DOM signal that moves when Docs
    // applies an edit, and it must not have moved.
    assert.equal(caretAfter, caretBefore, "text unexpectedly landed; blocker leaked");

    assert.doesNotMatch(
      status.detail,
      /Finished typing/i,
      "PHANTOM RUN: extension claimed success while writing nothing"
    );
    assert.match(status.detail, /rejecting every input method/i);
    assert.equal(status.failed, true);
    assert.equal(status.running, false);
  });

  it("aborts on the first character rather than faking progress for the rest", async (t) => {
    if (unavailable) return t.skip(unavailable);

    await installBlocker(page, realms);
    const baseline = await countSwallowed(page, realms);

    await startTyping(worker, { ...FAST_SETTINGS, text: "aaaaaaaaaaaaaaaaaaaa" });
    const status = JSON.parse(await awaitSettled(worker));
    const swallowed = (await countSwallowed(page, realms)) - baseline;

    assert.equal(status.failed, true);
    // One character's worth of cascade is 9 events (beforeinput 2, paste 1,
    // paste-bubbling 1, keyboard 5). 20 characters would be far more.
    assert.ok(
      swallowed <= 12,
      `expected to give up on character 1, but dispatched ${swallowed} events`
    );
    assert.doesNotMatch(status.detail, /%/, "must not report a progress percentage");
  });
});
