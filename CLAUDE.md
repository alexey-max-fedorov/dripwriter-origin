# Dripwriter Origin

Two targets: a Plasmo browser extension and a Next.js marketing website.

## Version Bump
`./bump-version.sh <version>` — syncs version across all 4 version files at once.

## Extension Source (`src/`)
- `src/popup.tsx` — popup UI wrapper (Firefox); imports `PopupView`
- `src/sidepanel.tsx` — Chrome Side Panel wrapper; imports `PopupView`
- `src/PopupView.tsx` — shared popup/sidepanel UI component
- `src/content.ts` — content script; handles all typing simulation
- `src/background.ts` — service worker; frame targeting + side panel behavior
- `src/types.ts` — shared types and `DEFAULT_SETTINGS`

Dev: `pnpm dev` | Build: `pnpm build` | Firefox: `pnpm build:firefox` | Package (zip): `pnpm package`
→ See `.claude/extension.md`

## Website Routes (Next.js App Router — `website/`)
- `/` → `src/app/page.tsx`
- `/get` → `src/app/get/page.tsx`
- `/privacy` → `src/app/privacy/page.tsx`
- `/license` → `src/app/license/page.tsx`

Dev: `cd website && pnpm dev`
→ See `.claude/website.md`
