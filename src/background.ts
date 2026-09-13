import { selectTargetFrame, type FrameFocus } from "~/lib/frame-select";
import type { FrameMessage, TargetFrameResponse } from "~/types";

/**
 * Frame-target registry.
 *
 * Every frame's content script reports when it focuses an editable. The popup
 * then asks which frame in the active tab should receive typing commands — the
 * most recently focused one — so a command reaches the exact editor the user
 * clicked into, even when it lives in a cross-origin iframe.
 */

// tabId -> (frameId -> last editable-focus timestamp)
const focusByTab = new Map<number, Map<number, number>>();

chrome.runtime.onMessage.addListener((message: FrameMessage, sender, sendResponse) => {
  if (message.type === "EDITABLE_FOCUSED") {
    const tabId = sender.tab?.id;
    if (tabId == null || sender.frameId == null) {
      return;
    }
    const frames = focusByTab.get(tabId) ?? new Map<number, number>();
    frames.set(sender.frameId, Date.now());
    focusByTab.set(tabId, frames);
    return;
  }

  if (message.type === "GET_TARGET_FRAME") {
    const frames = focusByTab.get(message.tabId);
    const focuses: FrameFocus[] = frames
      ? [...frames].map(([frameId, ts]) => ({ frameId, ts }))
      : [];
    const response: TargetFrameResponse = { frameId: selectTargetFrame(focuses) };
    sendResponse(response);
    return;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  focusByTab.delete(tabId);
});

// A same-tab navigation destroys every frame we had recorded, so drop the tab's
// stale frame targets the moment it starts loading a new page. Without this, the
// popup could route a command to a frameId that no longer exists until the user
// happens to focus a fresh editable. `changeInfo.status` needs no `tabs`
// permission (only url/title/favIconUrl do), so this stays permission-free.
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    focusByTab.delete(tabId);
  }
});
