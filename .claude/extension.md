# Extension Architecture

Plasmo framework, Manifest V3, dual Chrome + Firefox builds.

## Entry Points

| File | Role |
|------|------|
| `src/popup.tsx` | Popup entry point (Firefox); thin wrapper around `PopupView` |
| `src/sidepanel.tsx` | Side Panel entry point (Chrome); thin wrapper around `PopupView` |
| `src/PopupView.tsx` | Shared React UI component for popup and side panel |
| `src/content.ts` | Content script injected into every tab; owns all typing simulation logic |
| `src/background.ts` | Service worker; frame targeting + side panel behavior |
| `src/contents/bridge.ts` | MAIN-world content script; exposes `window._dripwriter` API when API mode is enabled |
| `src/types.ts` | Shared types, message protocol, and `DEFAULT_SETTINGS` |
| `src/popup.css` | All popup/panel styles (Google Fonts, mixer layout, range sliders, themes) |
| `src/lib/version.ts` | `VERSION_TAG` constant shown in popup footer |

## Message Protocol

Popup → content script via `chrome.tabs.sendMessage`:

```ts
type DripwriterMessage =
  | { type: "START_DRIP"; payload: DripwriterSettings }
  | { type: "RESUME_DRIP"; payload: { text: string } & Partial<DripwriterSettings> }
  | { type: "STOP_DRIP" }
  | { type: "RUN_DIAGNOSTICS" }
  | { type: "GET_STATUS" }
```

Response is always `DripwriterResponse { ok, status, error? }`.

### Stop / Resume

`TypingStatus.resumable` is set when a stopped run kept enough state to continue.
Stop preserves the verified commit position plus any temporary typo/detour
characters still in the editor; `RESUME_DRIP` deletes those strays, re-verifies
the committed prefix against the editor, and continues the run with its ORIGINAL
settings. Start always means a fresh run and discards saved progress. Resume is
popup-only — the console bridge contract stays start/stop/test/status.

**Limitation:** Resume prefix verification only works on `default` and `word-online`
harnesses (they read `textContent`). Google Docs uses a canvas renderer so the
prefix cannot be verified — Resume assumes the document was not manually edited.

## Settings

`DripwriterSettings` fields (all in `types.ts`):

| Field | Default | Description |
|-------|---------|-------------|
| `wpm` | 60 | Base typing speed |
| `speedVariance` | 30% | WPM jitter |
| `typoRate` | 3% | Chance of mistype per char |
| `detourRate` | 3% | Chance of false-start word |
| `breakFrequencySeconds` | 55 | Avg seconds between breaks |
| `breakFrequencyVariance` | 30% | Break frequency jitter |
| `breakMinSeconds` | 3 | Minimum break duration |
| `breakMaxSeconds` | 15 | Maximum break duration |

## Popup UI Components

- `MixRow` — labeled slider row with live `--pct` CSS fill
- `PopupView` — main component; manages settings state, theme toggle, animated title, start/stop

## Content Script Key Functions

- `handleMessage` — dispatcher for all incoming messages
- `runDripwriter` — main typing loop
- `typeLiteral` — types a string char-by-char with jitter, typos, detours
- `shouldTakeBreak` / `takeBreak` — pause logic
- `findDocsTarget` — detects Google Docs iframe vs. contenteditable vs. input

## Console API (`window._dripwriter`)

When the popup's **Enable API mode** toggle is on, `contents/bridge.ts` (MAIN-world content script) exposes `window._dripwriter` on every open Google Docs tab. `content.ts` (isolated) drives it via `window.postMessage` and gates it via `chrome.storage.local["dripwriterApiMode"]`.

| File | Role |
|------|------|
| `src/contents/bridge.ts` | MAIN-world content script. Defines `window._dripwriter` with `config`, `start()`, `stop()`, `test()`, `status()`, `version`. |
| `src/content.ts` | Isolated content script. Listens for bridge requests via the `message` event; listens for `chrome.storage.onChanged` to enable/disable the bridge. |

API docs: `meta/api/README.md`, `meta/api/reference.md`.

## Build Outputs

```
build/chrome-mv3-prod/
build/firefox-mv3-prod/
```

Packaged ZIPs (for store submission): `pnpm package`
