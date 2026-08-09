import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildCaretSignature,
  cascadeUntilVerified,
  type MutationMethod,
  waitForChange
} from "../lib/insertion.ts";

describe("buildCaretSignature", () => {
  it("reports no-caret when the document has none", () => {
    assert.equal(buildCaretSignature([]), "no-caret");
  });

  it("tracks only the local caret when one is present", () => {
    const signature = buildCaretSignature([
      { isLocal: false, transform: "matrix(1, 0, 0, 1, 999, 0)" },
      { isLocal: true, transform: "matrix(1, 0, 0, 1, 100, 0)" }
    ]);

    assert.equal(signature, "matrix(1, 0, 0, 1, 100, 0)");
  });

  it("ignores collaborator movement so it cannot be mistaken for our own write", () => {
    const local = { isLocal: true, transform: "matrix(1, 0, 0, 1, 100, 0)" };

    const before = buildCaretSignature([
      local,
      { isLocal: false, transform: "matrix(1, 0, 0, 1, 200, 0)" }
    ]);
    const afterCollaboratorMoved = buildCaretSignature([
      local,
      { isLocal: false, transform: "matrix(1, 0, 0, 1, 640, 0)" }
    ]);

    assert.equal(before, afterCollaboratorMoved);
  });

  it("falls back to every caret when none is marked local", () => {
    const signature = buildCaretSignature([
      { isLocal: false, transform: "a" },
      { isLocal: false, transform: "b" }
    ]);

    assert.equal(signature, "a|b");
  });

  it("changes when the local caret advances", () => {
    const before = buildCaretSignature([{ isLocal: true, transform: "matrix(1, 0, 0, 1, 591, 112)" }]);
    const after = buildCaretSignature([{ isLocal: true, transform: "matrix(1, 0, 0, 1, 659, 112)" }]);

    assert.notEqual(before, after);
  });
});

describe("waitForChange", () => {
  /** Fake clock: sleeping is the only thing that advances time. */
  function fakeClock() {
    let current = 0;
    const sleeps: number[] = [];
    return {
      now: () => current,
      sleep: async (ms: number) => {
        sleeps.push(ms);
        current += ms;
      },
      sleeps
    };
  }

  it("resolves synchronously when the caret already moved, without sleeping", async () => {
    const clock = fakeClock();

    const changed = await waitForChange({
      read: () => "after",
      before: "before",
      timeoutMs: 400,
      now: clock.now,
      sleep: clock.sleep
    });

    assert.equal(changed, true);
    // beforeinput applies synchronously; the common path must never touch the clock.
    assert.deepEqual(clock.sleeps, []);
  });

  it("polls until an asynchronously applied edit shows up", async () => {
    const clock = fakeClock();
    let reads = 0;

    const changed = await waitForChange({
      read: () => (++reads > 3 ? "after" : "before"),
      before: "before",
      timeoutMs: 400,
      now: clock.now,
      sleep: clock.sleep
    });

    assert.equal(changed, true);
    assert.ok(clock.sleeps.length > 0, "should have polled at least once");
  });

  it("returns false when the caret never moves", async () => {
    const clock = fakeClock();

    const changed = await waitForChange({
      read: () => "before",
      before: "before",
      timeoutMs: 100,
      now: clock.now,
      sleep: clock.sleep
    });

    assert.equal(changed, false);
  });

  it("stops polling once the timeout is reached", async () => {
    const clock = fakeClock();

    await waitForChange({
      read: () => "before",
      before: "before",
      timeoutMs: 100,
      now: clock.now,
      sleep: clock.sleep,
      pollMs: 10
    });

    assert.equal(clock.now(), 100);
    assert.equal(clock.sleeps.length, 10);
  });
});

describe("cascadeUntilVerified", () => {
  interface Target {
    name: string;
  }

  const method = (label: string): MutationMethod<Target> => ({ label, apply: () => {} });

  const only =
    (...working: string[]) =>
    async (m: MutationMethod<Target>) =>
      working.includes(m.label);

  const alpha = method("alpha");
  const bravo = method("bravo");
  const charlie = method("charlie");
  const methods = [alpha, bravo, charlie];
  const target: Target = { name: "doc" };

  it("returns the first method that is verified to have changed the document", async () => {
    const winner = await cascadeUntilVerified({
      methods,
      target,
      text: "x",
      attempt: only("bravo", "charlie")
    });

    assert.equal(winner, bravo);
  });

  it("uses the locked method first and does not try any others", async () => {
    const tried: string[] = [];

    const winner = await cascadeUntilVerified({
      methods,
      locked: charlie,
      target,
      text: "x",
      attempt: async (m) => {
        tried.push(m.label);
        return true;
      }
    });

    assert.equal(winner, charlie);
    assert.deepEqual(tried, ["charlie"]);
  });

  it("re-cascades when the locked method stops working, without retrying it", async () => {
    const tried: string[] = [];

    const winner = await cascadeUntilVerified({
      methods,
      locked: alpha,
      target,
      text: "x",
      attempt: async (m) => {
        tried.push(m.label);
        return m.label === "charlie";
      }
    });

    assert.equal(winner, charlie);
    // alpha is tried once as the locked fast path, then skipped in the sweep.
    assert.deepEqual(tried, ["alpha", "bravo", "charlie"]);
  });

  it("returns null when Google Docs rejects every method", async () => {
    const winner = await cascadeUntilVerified({
      methods,
      target,
      text: "x",
      attempt: only()
    });

    assert.equal(winner, null);
  });

  it("never reports success on a dispatch that changed nothing", async () => {
    // The exact phantom-run shape: every method "succeeds" at dispatching but
    // the document never changes, so verification must still fail.
    let dispatched = 0;

    const winner = await cascadeUntilVerified({
      methods,
      target,
      text: "x",
      attempt: async (m) => {
        m.apply(target, "x");
        dispatched += 1;
        return false;
      }
    });

    assert.equal(winner, null);
    assert.equal(dispatched, methods.length);
  });

  it("passes the target and text through to each attempt", async () => {
    const seen: Array<[string, string]> = [];

    await cascadeUntilVerified({
      methods: [alpha],
      target,
      text: "Z",
      attempt: async (_m, t, text) => {
        seen.push([t.name, text]);
        return true;
      }
    });

    assert.deepEqual(seen, [["doc", "Z"]]);
  });
});
