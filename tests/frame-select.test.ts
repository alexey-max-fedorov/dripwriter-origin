import assert from "node:assert/strict";
import { test } from "node:test";

import { selectTargetFrame } from "../lib/frame-select.ts";

test("selectTargetFrame returns the most recently focused frame", () => {
  assert.equal(
    selectTargetFrame([
      { frameId: 0, ts: 10 },
      { frameId: 7, ts: 42 },
      { frameId: 3, ts: 30 }
    ]),
    7
  );
});

test("selectTargetFrame returns null when no frame focused an editable", () => {
  assert.equal(selectTargetFrame([]), null);
});

test("selectTargetFrame includes the top frame (frameId 0) as a valid target", () => {
  assert.equal(selectTargetFrame([{ frameId: 0, ts: 5 }]), 0);
});
