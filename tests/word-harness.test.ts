import assert from "node:assert/strict";
import { test } from "node:test";

import { readWordContent } from "../src/lib/harness/word.ts";

test("readWordContent returns textContent of the element", () => {
  const el = { textContent: "hello world" } as unknown as HTMLElement;
  assert.equal(readWordContent(el), "hello world");
});

test("readWordContent treats null textContent as empty string", () => {
  const el = { textContent: null } as unknown as HTMLElement;
  assert.equal(readWordContent(el), "");
});

test("readWordContent returns empty string for empty element", () => {
  const el = { textContent: "" } as unknown as HTMLElement;
  assert.equal(readWordContent(el), "");
});

test("readWordContent preserves whitespace", () => {
  const el = { textContent: "  hello\n  world  " } as unknown as HTMLElement;
  assert.equal(readWordContent(el), "  hello\n  world  ");
});
