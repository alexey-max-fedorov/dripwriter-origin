import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isResumeTextCompatible,
  normalizeResumeText,
  settingsForResume
} from "../src/lib/resume.ts";
import { DEFAULT_SETTINGS, type DripwriterSettings } from "../src/types.ts";

const SAVED: DripwriterSettings = {
  ...DEFAULT_SETTINGS,
  text: "Hello this is a long text for testing purposes.",
  wpm: 60
};

describe("isResumeTextCompatible", () => {
  it("allows resume when the text is unchanged", () => {
    assert.equal(isResumeTextCompatible(SAVED.text, SAVED.text), true);
  });

  it("allows resume when only line endings differ", () => {
    assert.equal(
      isResumeTextCompatible("Hello\r\nworld\r\nfoo", "Hello\nworld\nfoo"),
      true
    );
  });

  it("rejects a different text, including additions, deletions, and empty text", () => {
    assert.equal(isResumeTextCompatible("Different text entirely.", SAVED.text), false);
    assert.equal(isResumeTextCompatible(SAVED.text + " Extra.", SAVED.text), false);
    assert.equal(isResumeTextCompatible(SAVED.text.slice(0, 10), SAVED.text), false);
    assert.equal(isResumeTextCompatible("", SAVED.text), false);
  });

  it("ignores typing knobs — they are not part of the comparison", () => {
    const payload = { ...SAVED, wpm: 150, typoRate: 20, breakMaxSeconds: 25 };
    assert.equal(isResumeTextCompatible(payload.text, SAVED.text), true);
  });
});

describe("settingsForResume", () => {
  it("keeps the saved text and applies the popup's current knobs", () => {
    const live = settingsForResume(SAVED, { ...SAVED, wpm: 90, speedVariance: 50 });
    assert.equal(live.text, SAVED.text);
    assert.equal(live.wpm, 90);
    assert.equal(live.speedVariance, 50);
    assert.equal(live.typoRate, SAVED.typoRate);
  });

  it("normalizes saved newlines even when the payload still has CRLF", () => {
    const saved = { ...SAVED, text: "Hello\r\nworld" };
    const live = settingsForResume(saved, { ...saved, wpm: 80 });
    assert.equal(live.text, "Hello\nworld");
    assert.equal(live.wpm, 80);
    assert.equal(normalizeResumeText(saved.text), live.text);
  });

  it("falls back to the saved knobs when no payload is sent", () => {
    const live = settingsForResume(SAVED, undefined);
    assert.deepEqual(live, { ...SAVED, text: normalizeResumeText(SAVED.text) });
  });

  it("does not let a payload text override the saved text", () => {
    const live = settingsForResume(SAVED, { ...SAVED, text: "nope", wpm: 40 });
    assert.equal(live.text, SAVED.text);
    assert.equal(live.wpm, 40);
  });
});
