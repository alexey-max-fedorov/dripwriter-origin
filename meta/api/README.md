# Dripwriter Console API

When **API mode** is enabled in the extension popup, the Dripwriter extension exposes a global object on every open Google Docs tab:

```js
window._dripwriter
```

This is the same typing engine that powers the popup's Start / Run Test / Stop buttons, scriptable directly from the page's DevTools console (or by AI agents running in the page).

## Enabling

1. Open the Dripwriter popup.
2. Toggle **Enable API mode** at the bottom of the popup.
3. The API is now active on every currently-open Google Docs tab. No reload required.

Toggling off removes `window._dripwriter` from every Docs tab immediately. Any in-flight `start()` Promises reject with `"Dripwriter API mode was disabled."`.

## Minimum example

```js
_dripwriter.config.text = "Hello from the console.";
await _dripwriter.start();
```

After `await _dripwriter.start()` resolves, typing is complete and the cursor is positioned at the end of the inserted text.

## Configuring before you start

Every field in `DripwriterSettings` is mutable on `_dripwriter.config`:

```js
_dripwriter.config.text = "Paste your draft here.";
_dripwriter.config.wpm = 90;                  // 20–150
_dripwriter.config.speedVariance = 25;        // 0–80 (%)
_dripwriter.config.typoRate = 4;              // 0–30 (%)
_dripwriter.config.detourRate = 2;            // 0–25 (%)
_dripwriter.config.breakFrequencySeconds = 60; // 10–600
_dripwriter.config.breakFrequencyVariance = 30; // 0–100 (%)
_dripwriter.config.breakMinSeconds = 3;        // 3–60
_dripwriter.config.breakMaxSeconds = 12;       // breakMinSeconds–90
```

Values outside their valid range are clamped at `start()` time, never on assignment. See `reference.md` for the exact clamp ranges.

## Methods at a glance

| Method | Returns | Behavior |
|--------|---------|----------|
| `_dripwriter.start()` | `Promise<void>` | Begins typing; resolves when typing finishes; rejects on error or cancellation |
| `_dripwriter.stop()` | `Promise<void>` | Cancels the active run; resolves once the cancellation is acknowledged |
| `_dripwriter.test()` | `Promise<void>` | Runs the input-event diagnostic matrix; resolves when all methods have been tried |
| `_dripwriter.status()` | `Promise<{ running: boolean, detail: string }>` | Fetches the current run status |
| `_dripwriter.version` | `string` | Extension semver (e.g. `"2.0.0"`) |

For full per-method behavior and edge cases see [reference.md](./reference.md).

## Lifecycle

- The API is **only** available on tabs matching `https://docs.google.com/document/*`.
- Calling `start()` while another run is in progress stops the previous run before starting the new one — this matches the popup's Start button behavior.
- Calling `start()` from one place (popup or API) and then `stop()` from the other works correctly. A popup-driven stop will reject any pending API-driven `start()` Promise with `"cancelled"`.

## For AI agents

If you're an agent driving Dripwriter from the page:

1. Always `await` `start()`. The Promise resolves on natural completion — don't poll `status()` in a loop.
2. Snapshot the text into `config.text` before calling `start()`. The settings object is read at start time, so mutating it mid-run has no effect on the current run.
3. If the user has the Docs page open and the cursor isn't in the editable area, typing will fail with `"The Google Docs cursor was lost. Click back into the document and retry."` — surface this to the user.
