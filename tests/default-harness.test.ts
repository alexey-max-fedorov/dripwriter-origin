import assert from "node:assert/strict";
import { test } from "node:test";

import { readEditableContent } from "../lib/harness/default.ts";

test("readEditableContent returns value for inputs and textContent for contenteditable", () => {
  const input = { tagName: "TEXTAREA", value: "hello" } as unknown as HTMLElement;
  assert.equal(readEditableContent(input), "hello");

  const contentEditable = {
    tagName: "DIV",
    textContent: "world",
    isContentEditable: true
  } as unknown as HTMLElement;
  assert.equal(readEditableContent(contentEditable), "world");
});

test("readEditableContent treats a missing textContent as empty", () => {
  const empty = { tagName: "DIV", textContent: null } as unknown as HTMLElement;
  assert.equal(readEditableContent(empty), "");
});
