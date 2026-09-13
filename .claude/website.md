# Website Architecture

Next.js App Router (`website/`). Deployed to Vercel.

## Routes

| URL | File | Purpose |
|-----|------|---------|
| `/` | `src/app/page.tsx` | Marketing home page |
| `/get` | `src/app/links/page.tsx` | Install/download links |
| `/ai` | `src/app/ai/page.tsx` | AI integration guide (Claude + Dripwriter) |
| `/api` | `src/app/api/page.tsx` | Console API reference (`window._dripwriter`) |
| `/v3` | `src/app/v3/page.tsx` | v3 launch page |
| `/mogged` | `src/app/mogged/page.tsx` | Cease-and-desist response + comparison |
| `/privacy` | `src/app/privacy/page.tsx` | Privacy policy |
| `/license` | `src/app/license/page.tsx` | License text |

## Layout (`src/app/layout.tsx`)

Root layout wraps all pages with:
- Vercel `<Analytics />` and `<SpeedInsights />`
- Global CSS (`globals.css`)
- Version string from `@/lib/version.ts`

## Components

### `src/components/sections/`
| Component | Description |
|-----------|-------------|
| `Hero` | Above-fold hero with headline and CTA |
| `FeatureGrid` | Grid of product features |
| `InstallSteps` | Numbered install steps |
| `CTASection` | Bottom call-to-action |
| `FAQ` | Frequently asked questions |
| `AiGuide` | Full AI setup guide page (contains the Claude skill prompt) |
| `V3Launch` | v3 launch page content |
| `Mogged` | Cease-and-desist response page |
| `BrandClarification` | Brand distinction section |

### `src/components/ui/`
| Component | Description |
|-----------|-------------|
| `Button` | Styled CTA button |
| `InstallButton` | Extension install CTA with browser detection |
| `AnimatedText` | Text with entrance animation |
| `BrowserIcon` | Browser logo SVG |
| `MockGoogleDoc` | Decorative Google Docs mockup |
| `MockCrossPlatform` | Cross-platform browser mockup |
| `SectionHeading` | Consistent section title |

### `src/components/layout/`
| Component | Description |
|-----------|-------------|
| `Navbar` | Top navigation bar |
| `Footer` | Site footer |

## Key Dependencies

- `framer-motion` — scroll animations
- `@vercel/analytics` + `@vercel/speed-insights` — Vercel observability
- `clsx` — conditional class names

## Key Files

- `public/llms.txt` — LLM-readable site description (update on feature changes)
- `src/lib/version.ts` — version constant (kept in sync by `bump-version.sh`)
