# Dripwriter Origin

Two targets: a Plasmo browser extension and a Next.js marketing website.

## Version Bump
`./bump-version.sh <version>` — syncs version across all 4 version files at once.

## Extension Entry Points
- `popup.tsx` — popup UI (React + CSS)
- `content.ts` — content script injected into active tabs; handles all typing simulation
- `types.ts` — shared types and `DEFAULT_SETTINGS`

Dev: `pnpm dev` | Build: `pnpm build` | Firefox: append `--target=firefox-mv3` | Package (zip): append `--zip`
→ See `.claude/extension.md`

## Website Routes (Next.js App Router — `website/`)
- `/` → `src/app/page.tsx`
- `/get` → `src/app/get/page.tsx`
- `/privacy` → `src/app/privacy/page.tsx`
- `/license` → `src/app/license/page.tsx`

Dev: `cd website && pnpm dev`
→ See `.claude/website.md`
