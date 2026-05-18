# Dripwriter Console API Reference

This document covers every property and method on `window._dripwriter` in full detail. For an introduction, see [README.md](./README.md).

## `_dripwriter.version: string`

Read-only. The current extension version (e.g. `"2.0.0"`). Matches the value displayed in the popup footer. The value is provided by the isolated content script at the moment API mode is enabled.

## `_dripwriter.config: DripwriterSettings`

A plain, mutable object. Mutate fields directly:

```js
_dripwriter.config.wpm = 90;
```

The object is **not** a Proxy — out-of-range values are accepted at assignment time and clamped only when `start()` is called.

### Fields

| Field | Type | Default | Valid range at `start()` | Notes |
|-------|------|---------|--------------------------|-------|
| `text` | `string` | `""` | non-empty (trimmed) | Required for `start()`. `\r\n` is normalized to `\n`. |
| `wpm` | `number` | `60` | `20`–`150` | Base typing speed (words per minute, 5 chars/word). |
| `speedVariance` | `number` | `30` | `0`–`80` | Per-character speed jitter, percent. |
| `typoRate` | `number` | `3` | `0`–`30` | Probability of injecting a neighbor-key typo on each letter/punctuation char, percent. |
| `detourRate` | `number` | `3` | `0`–`25` | Probability of typing a "false start" word at the start of a word, then deleting it. |
| `breakFrequencySeconds` | `number` | `55` | `10`–`600` | Average active-typing seconds between idle breaks. |
| `breakFrequencyVariance` | `number` | `30` | `0`–`100` | Percent jitter applied to `breakFrequencySeconds`. |
| `breakMinSeconds` | `number` | `3` | `3`–`60` | Minimum idle-break duration. |
| `breakMaxSeconds` | `number` | `15` | `breakMinSeconds`–`90` | Maximum idle-break duration. If set lower than `breakMinSeconds`, it's raised to match. |

## `_dripwriter.start(): Promise<void>`

Begins a typing run using a **snapshot** of `_dripwriter.config` as it is at the moment of the call. Mutating `_dripwriter.config` after `start()` has been called does not affect the in-flight run.

**Resolves when:** the entire `config.text` has been typed and the cursor reaches the end of the inserted text.

**Rejects with `Error` when:**
- `config.text` is empty or whitespace-only — `"Add some text first."`
- The Google Docs cursor is lost mid-run — `"The Google Docs cursor was lost..."`
- The run is cancelled (by `stop()`, by another `start()` call, by API mode being disabled, or by the popup's Stop button) — `"cancelled"`
- API mode is disabled while the run is pending — `"Dripwriter API mode was disabled."`

**Behavior:**
- If a previous run is in progress, it is stopped before this one starts. The previous run's Promise rejects with `"cancelled"`.
- The first 3 seconds of every run are a countdown (`"Starting to type in 3...", "...in 2..."`, `"...in 1..."`). This is identical to the popup behavior.

## `_dripwriter.stop(): Promise<void>`

Cancels the currently active run, if any.

**Resolves with `undefined`** once the cancellation has been acknowledged by the content script. Calling `stop()` when no run is active still resolves successfully — the status is set to `"Stopped."`.

**Side effect:** any pending `start()` or `test()` Promise rejects with `"cancelled"`.

## `_dripwriter.test(): Promise<void>`

Runs the diagnostic matrix (the same flow as the popup's "Run Test" button). It dispatches 8 different input-event strategies into the document at ~900ms intervals, marked by three-letter labels (`AAA`, `BBB`, ..., `HHH`). Use it to identify which event types Google Docs is currently accepting.

**Resolves when:** all 8 methods have been tried (about 10 seconds).

**Rejects with `Error` when:** the run is cancelled or otherwise fails.

## `_dripwriter.status(): Promise<{ running: boolean, detail: string }>`

Returns the current run state. `detail` is the human-readable status string also shown in the popup status bar (e.g., `"Typing... 47%"`, `"Taking a 4.3s break..."`, `"Idle. ..."`).

This is a snapshot — it is **not** a subscription. For agents that want to wait for completion, `await _dripwriter.start()` is the right primitive; don't poll `status()` in a loop.

## Error handling pattern

```js
try {
  _dripwriter.config.text = draft;
  await _dripwriter.start();
  console.log("Typed successfully.");
} catch (err) {
  if (err.message === "cancelled") {
    console.log("User stopped the run.");
  } else {
    console.error("Typing failed:", err.message);
  }
}
```

## Internal message contract

For maintainers: the bridge IPC types are defined in [`types.ts`](../../types.ts) — search for `BRIDGE_REQUEST_SOURCE`. Every request from `bridge.ts` (MAIN world) carries a UUID `id`; the response in `content.ts` (ISOLATED world) echoes that `id`. The MAIN-world bridge holds the pending Promise in a `Map<id, {resolve, reject}>`.
