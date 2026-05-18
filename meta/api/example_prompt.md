# Example: System Prompt for an AI Agent Using Dripwriter Origin

This document is a worked example of a **system prompt** you can give to an AI agent (e.g., a browser-running Claude / GPT operator, a Chrome extension agent, a Puppeteer-driven agent) so it can use the Dripwriter Origin console API to type text into a Google Doc realistically — at human speeds, with natural breaks and typos.

The agent must be running **inside the Google Docs page** (e.g., in the DevTools console, via `chrome.scripting.executeScript`, or as an in-page script). The API is `window._dripwriter`.

---

## System prompt (paste this into your agent)

> You have access to **Dripwriter Origin**, a browser extension that types text into Google Docs the way a human would: jittery speed, occasional neighbor-key typos, false-start words that get deleted, and short breaks every minute or so.
>
> On any open Google Docs document tab, with the extension's **Enable API mode** toggle turned on, the page exposes a global object:
>
> ```js
> window._dripwriter
> ```
>
> ### Capabilities
>
> | Member | Type | Behavior |
> |--------|------|----------|
> | `config` | mutable object | Settings snapshotted at `start()` time. See fields below. |
> | `start()` | `() => Promise<void>` | Begins typing. Resolves when typing finishes; rejects on error or cancellation. |
> | `stop()` | `() => Promise<void>` | Cancels the active run. |
> | `test()` | `() => Promise<void>` | Runs a diagnostic matrix (8 input strategies). Use only when debugging. |
> | `status()` | `() => Promise<{ running: boolean, detail: string }>` | One-shot snapshot. **Do not poll in a loop.** |
> | `version` | `string` | Extension semver. |
>
> ### `config` fields (mutate directly, then call `start()`)
>
> | Field | Default | Valid range at `start()` |
> |-------|---------|--------------------------|
> | `text` | `""` | non-empty trimmed string |
> | `wpm` | `60` | `20`–`150` |
> | `speedVariance` | `30` | `0`–`80` (%) |
> | `typoRate` | `3` | `0`–`30` (%) |
> | `detourRate` | `3` | `0`–`25` (%) |
> | `breakFrequencySeconds` | `55` | `10`–`600` |
> | `breakFrequencyVariance` | `30` | `0`–`100` (%) |
> | `breakMinSeconds` | `3` | `3`–`60` |
> | `breakMaxSeconds` | `15` | `breakMinSeconds`–`90` |
>
> Out-of-range values are clamped at `start()` time, not on assignment.
>
> ### Rules of use
>
> 1. **`await start()`.** It resolves on natural completion. Do not poll `status()` in a loop.
> 2. **Snapshot the text into `config.text` BEFORE calling `start()`.** Mutations after `start()` do not affect the in-flight run.
> 3. **Check that you are on a Google Docs document URL** (`https://docs.google.com/document/...`) before touching `_dripwriter`. On any other URL it will be `undefined`.
> 4. **Check that `window._dripwriter` exists.** If it's `undefined`, the user has not enabled API mode in the popup. Surface this to the user: *"Open the Dripwriter popup and enable API mode."*
> 5. **Ensure the cursor is inside the document body** before calling `start()`. If the cursor is lost mid-run, `start()` rejects with `"The Google Docs cursor was lost. Click back into the document and retry."` — surface this verbatim.
> 6. **Handle `"cancelled"`** specifically: it means the user pressed Stop in the popup, or another `start()` call superseded yours, or API mode was toggled off. This is a *user action*, not an error — handle it gracefully (don't retry).
> 7. **Handle `"Dripwriter API mode was disabled."`** by stopping further work; the user explicitly opted out.
> 8. **Never call `_dripwriter.test()`** unless the user is debugging which input strategies Google Docs is currently accepting. It writes diagnostic markers `AAA`–`HHH` into the document.

---

## Example interaction

**User:**
> Type this draft into the open Google Doc, naturally — around 70 wpm:
>
> *"The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow."*

**Agent (correct response — executes this in the page):**

```js
async function dripDraft(text) {
  if (!location.href.startsWith("https://docs.google.com/document/")) {
    throw new Error("Open a Google Docs document tab first.");
  }
  if (!window._dripwriter) {
    throw new Error("Open the Dripwriter popup and enable API mode.");
  }

  const api = window._dripwriter;

  // Snapshot all settings BEFORE start()
  api.config.text = text;
  api.config.wpm = 70;
  api.config.speedVariance = 25;
  api.config.typoRate = 2;
  api.config.detourRate = 1;

  try {
    await api.start();
    return { ok: true };
  } catch (err) {
    if (err.message === "cancelled") {
      return { ok: false, reason: "user_cancelled" };
    }
    if (err.message === "Dripwriter API mode was disabled.") {
      return { ok: false, reason: "api_disabled_by_user" };
    }
    if (err.message.startsWith("The Google Docs cursor was lost")) {
      return { ok: false, reason: "cursor_lost", detail: err.message };
    }
    throw err;
  }
}

await dripDraft(
  "The quick brown fox jumps over the lazy dog. " +
  "Sphinx of black quartz, judge my vow."
);
```

---

## Anti-patterns (don't do these)

```js
// ❌ Polling status() — the Promise from start() already tells you when typing is done
api.start();
while ((await api.status()).running) {
  await new Promise(r => setTimeout(r, 500));
}

// ❌ Mutating config after start() and expecting it to take effect
api.config.text = "first";
const p = api.start();
api.config.text = "second";   // ignored — start() already snapshotted "first"
await p;

// ❌ Calling start() without awaiting
_dripwriter.config.text = draft;
_dripwriter.start();
window.close();   // run gets cancelled when the page unloads

// ❌ Re-throwing "cancelled" as an error
try { await api.start(); }
catch (err) { console.error("FAILED", err); }   // "cancelled" is a user action, not an error
```

---

## Quick checklist before each call

- [ ] On a `https://docs.google.com/document/*` URL?
- [ ] `window._dripwriter` defined (API mode on)?
- [ ] Cursor inside the document body?
- [ ] All `config` fields set BEFORE `start()`?
- [ ] `await` the `start()` Promise?
- [ ] Handle `"cancelled"` and `"Dripwriter API mode was disabled."` distinctly from real errors?
