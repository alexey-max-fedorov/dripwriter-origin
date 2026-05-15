# Website Architecture

Next.js App Router (`website/`). Deployed to Vercel.

## Routes

| URL | File | Purpose |
|-----|------|---------|
| `/` | `src/app/page.tsx` | Marketing home page |
| `/get` | `src/app/get/page.tsx` | Install/download instructions |
| `/privacy` | `src/app/privacy/page.tsx` | Privacy policy |
| `/license` | `src/app/license/page.tsx` | License text |

## Layout (`src/app/layout.tsx`)

Root layout wraps all pages with:
- Vercel `<Analytics />` and `<SpeedInsights />`
- Global CSS (`globals.css`)
- Version string from `@/lib/version.ts`

## Page Structure — Home (`/`)

```
Navbar
Hero
FeatureGrid
InstallSteps
CTASection
Footer
```

## Components

### `src/components/sections/`
| Component | Description |
|-----------|-------------|
| `Hero` | Above-fold hero with headline and CTA |
| `FeatureGrid` | Grid of product features |
| `InstallSteps` | Numbered install steps |
| `CTASection` | Bottom call-to-action |

### `src/components/ui/`
| Component | Description |
|-----------|-------------|
| `Button` | Styled CTA button |
| `AnimatedText` | Text with entrance animation |
| `ScrollReveal` | Fade-in on scroll (Framer Motion) |
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

## Version

Website reads version from `src/lib/version.ts` (kept in sync by `bump-version.sh`).
