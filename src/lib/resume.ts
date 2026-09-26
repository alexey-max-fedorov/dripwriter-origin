import type { DripwriterSettings } from "../types";

/** Resume positions are counted against LF-normalized text. */
export function normalizeResumeText(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

/**
 * The saved cursor is valid only while the text is the same text.
 * Typing knobs (WPM, breaks, typos, …) are not part of that identity.
 */
export function isResumeTextCompatible(payloadText: string, savedText: string): boolean {
  return normalizeResumeText(payloadText) === normalizeResumeText(savedText);
}

export type ResumePayload = { text: string } & Partial<DripwriterSettings>;

/**
 * Knobs come from the popup when it sends them, so a settings change after
 * Stop takes effect on Resume. The saved text always wins — a newline
 * difference must not shift the resume index. With no payload, the saved
 * run's own settings continue unchanged.
 */
export function settingsForResume(
  saved: DripwriterSettings,
  payload: ResumePayload | undefined
): DripwriterSettings {
  return {
    ...saved,
    ...(payload ?? {}),
    text: normalizeResumeText(saved.text)
  };
}
