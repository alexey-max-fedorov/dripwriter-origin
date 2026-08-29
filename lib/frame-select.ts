/**
 * Pure frame-selection logic for the background service worker.
 *
 * With `all_frames` injection there are many content-script instances per tab
 * (top document + every iframe, including cross-origin ones like Packback). The
 * SW records the timestamp each frame last focused an editable; when the popup
 * asks where to type, the most recently focused frame wins.
 */

export interface FrameFocus {
  frameId: number;
  ts: number;
}

export function selectTargetFrame(focuses: FrameFocus[]): number | null {
  if (!focuses.length) {
    return null;
  }
  return focuses.reduce((best, focus) => (focus.ts > best.ts ? focus : best)).frameId;
}
