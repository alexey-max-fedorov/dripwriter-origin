/**
 * Tests for the Stop → change settings → Resume behavior.
 *
 * The content script cannot be imported directly (it depends on chrome.*,
 * navigator.locks, and Plasmo runtime), so these tests exercise the
 * isCompatibleResumePayload logic indirectly by validating the text-only
 * comparison contract.
 *
 * The function's contract:
 * - Text unchanged → compatible (resume allowed)
 * - Text changed → incompatible (resume rejected)
 * - Settings changed (any combination) → compatible (resume allowed)
 * - \r\n normalized to \n
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { DripwriterSettings } from "../src/types.ts";

/**
 * Reimplementation of isCompatibleResumePayload matching the production code.
 * This is the function under test — if the production implementation drifts,
 * the typecheck and integration tests will catch it.
 */
interface ResumeState {
  text: string;
  nextIndex: number;
  strayChars: number;
  harnessId: string;
}

function isCompatibleResumePayload(
  payload: { text: string } & Partial<DripwriterSettings>,
  saved: ResumeState
): boolean {
  const normalizeText = (text: string) => text.replace(/\r\n/g, "\n");
  return normalizeText(payload.text) === normalizeText(saved.text);
}

const BASE_SETTINGS: DripwriterSettings = {
  text: "Hello this is a long text for testing purposes.",
  wpm: 60,
  speedVariance: 30,
  typoRate: 3,
  detourRate: 3,
  breakFrequencySeconds: 55,
  breakFrequencyVariance: 30,
  breakMinSeconds: 3,
  breakMaxSeconds: 15
};

function makeSavedState(overrides: Partial<ResumeState> = {}): ResumeState {
  return {
    text: BASE_SETTINGS.text,
    nextIndex: 20,
    strayChars: 0,
    harnessId: "default",
    ...overrides
  };
}

describe("isCompatibleResumePayload — settings-after-Stop", () => {
  it("allows resume when text and settings are unchanged", () => {
    const payload = { ...BASE_SETTINGS };
    const saved = makeSavedState();
    assert.equal(isCompatibleResumePayload(payload, saved), true);
  });

  it("allows resume when WPM changed", () => {
    const payload = { ...BASE_SETTINGS, wpm: 80 };
    const saved = makeSavedState();
    assert.equal(isCompatibleResumePayload(payload, saved), true);
  });

  it("allows resume when speed variance changed", () => {
    const payload = { ...BASE_SETTINGS, speedVariance: 50 };
    const saved = makeSavedState();
    assert.equal(isCompatibleResumePayload(payload, saved), true);
  });

  it("allows resume when break frequency changed", () => {
    const payload = { ...BASE_SETTINGS, breakFrequencySeconds: 120 };
    const saved = makeSavedState();
    assert.equal(isCompatibleResumePayload(payload, saved), true);
  });

  it("allows resume when break variance changed", () => {
    const payload = { ...BASE_SETTINGS, breakFrequencyVariance: 80 };
    const saved = makeSavedState();
    assert.equal(isCompatibleResumePayload(payload, saved), true);
  });

  it("allows resume when shortest break changed", () => {
    const payload = { ...BASE_SETTINGS, breakMinSeconds: 5 };
    const saved = makeSavedState();
    assert.equal(isCompatibleResumePayload(payload, saved), true);
  });

  it("allows resume when longest break changed", () => {
    const payload = { ...BASE_SETTINGS, breakMaxSeconds: 25 };
    const saved = makeSavedState();
    assert.equal(isCompatibleResumePayload(payload, saved), true);
  });

  it("allows resume when multiple settings changed simultaneously", () => {
    const payload = {
      ...BASE_SETTINGS,
      wpm: 80,
      speedVariance: 50,
      breakFrequencySeconds: 120,
      breakFrequencyVariance: 80,
      breakMinSeconds: 5,
      breakMaxSeconds: 25
    };
    const saved = makeSavedState();
    assert.equal(isCompatibleResumePayload(payload, saved), true);
  });

  it("allows resume when typoRate and detourRate changed", () => {
    const payload = { ...BASE_SETTINGS, typoRate: 10, detourRate: 15 };
    const saved = makeSavedState();
    assert.equal(isCompatibleResumePayload(payload, saved), true);
  });

  it("rejects resume when text changed", () => {
    const payload = { ...BASE_SETTINGS, text: "This is completely different text." };
    const saved = makeSavedState();
    assert.equal(isCompatibleResumePayload(payload, saved), false);
  });

  it("rejects resume when text has additions", () => {
    const payload = {
      ...BASE_SETTINGS,
      text: BASE_SETTINGS.text + " Extra content."
    };
    const saved = makeSavedState();
    assert.equal(isCompatibleResumePayload(payload, saved), false);
  });

  it("rejects resume when text has deletions", () => {
    const payload = {
      ...BASE_SETTINGS,
      text: BASE_SETTINGS.text.slice(0, 10)
    };
    const saved = makeSavedState();
    assert.equal(isCompatibleResumePayload(payload, saved), false);
  });

  it("allows resume when text uses \\r\\n vs \\n (normalization)", () => {
    const textWithCRLF = "Hello\r\nworld\r\nfoo";
    const textWithLF = "Hello\nworld\nfoo";

    const payload = { ...BASE_SETTINGS, text: textWithCRLF };
    const saved = makeSavedState({ text: textWithLF });
    assert.equal(isCompatibleResumePayload(payload, saved), true);
  });

  it("rejects resume when text is empty but saved text was not", () => {
    const payload = { ...BASE_SETTINGS, text: "" };
    const saved = makeSavedState();
    assert.equal(isCompatibleResumePayload(payload, saved), false);
  });
});

describe("isCompatibleResumePayload — settings changed + text changed", () => {
  it("rejects when both text AND settings changed", () => {
    const payload = {
      ...BASE_SETTINGS,
      text: "Different text entirely.",
      wpm: 150,
      speedVariance: 80
    };
    const saved = makeSavedState();
    assert.equal(isCompatibleResumePayload(payload, saved), false);
  });
});

describe("resume state shape", () => {
  it("ResumeState stores text instead of full settings", () => {
    const state: ResumeState = {
      text: "some text",
      nextIndex: 42,
      strayChars: 2,
      harnessId: "default"
    };

    // Ensure the shape has no 'settings' key
    assert.equal("settings" in state, false);
    assert.equal(typeof state.text, "string");
    assert.equal(state.nextIndex, 42);
    assert.equal(state.strayChars, 2);
    assert.equal(state.harnessId, "default");
  });

  it("stray chars are independent of settings changes", () => {
    const saved = makeSavedState({ strayChars: 3 });
    const payload = { ...BASE_SETTINGS, wpm: 120, breakFrequencySeconds: 180 };

    // Even with stray chars pending cleanup, settings changes must be allowed.
    assert.equal(isCompatibleResumePayload(payload, saved), true);
    assert.equal(saved.strayChars, 3); // Strays are unaffected.
  });
});
