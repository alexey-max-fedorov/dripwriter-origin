# Extension Architecture

Plasmo framework, Manifest V3, dual Chrome + Firefox builds.

## Entry Points

| File | Role |
|------|------|
| `popup.tsx` | React popup UI; sends messages to the active tab's content script |
| `content.ts` | Content script injected into every tab; owns all typing simulation logic |
| `types.ts` | Shared types, message protocol, and `DEFAULT_SETTINGS` |
| `popup.css` | All popup styles (Google Fonts, mixer layout, range sliders, themes) |
| `lib/version.ts` | `VERSION_TAG` constant shown in popup footer |

## Message Protocol

Popup → content script via `chrome.tabs.sendMessage`:

```ts
type DripwriterMessage =
  | { type: "START_DRIP"; payload: DripwriterSettings }
  | { type: "STOP_DRIP" }
  | { type: "RUN_DIAGNOSTICS" }
  | { type: "GET_STATUS" }
```

Response is always `DripwriterResponse { ok, status, error? }`.

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

## Build Outputs

```
build/chrome-mv3-prod/
build/firefox-mv3-prod/
```

Packaged ZIPs (for store submission): `pnpm package`
