# Dripwriter Origin Marketing Website

A Next.js marketing website for Dripwriter Origin, the cross-browser extension that types pasted text with human-like cadence.

Deployed to **[dripwriter.org](https://dripwriter.org)** on Vercel.

## Quick Start

### Development

```bash
cd website
pnpm install
pnpm dev
```

Opens at `http://localhost:3000` with HMR enabled.

### Build

```bash
pnpm build
pnpm start
```

Builds an optimized production bundle for Vercel deployment.

## Project Structure

```
website/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home (/)
│   │   ├── get/page.tsx       # Install instructions (/get)
│   │   ├── privacy/page.tsx   # Privacy policy (/privacy)
│   │   ├── license/page.tsx   # License text (/license)
│   │   ├── ai/page.tsx        # AI page (/ai)
│   │   ├── api/page.tsx       # API docs (/api)
│   │   ├── layout.tsx         # Root layout with Analytics
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── sections/          # Page sections
│   │   │   ├── Hero.tsx       # Above-fold hero
│   │   │   ├── FeatureGrid.tsx
│   │   │   ├── InstallSteps.tsx
│   │   │   └── CTASection.tsx
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── AnimatedText.tsx
│   │   │   ├── MockGoogleDoc.tsx
│   │   │   ├── BrowserIcon.tsx
│   │   │   └── SectionHeading.tsx
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       └── Footer.tsx
│   └── lib/
│       ├── version.ts         # Version string (synced by bump-version.sh)
│       ├── useBrowser.ts      # Browser detection hook
│       └── utils.ts           # Utility functions
├── public/                    # Static assets
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
└── package.json
```

## Routes

| URL | Purpose |
|-----|---------|
| `/` | Marketing home page |
| `/get` | Installation & download instructions |
| `/privacy` | Privacy policy |
| `/license` | License text |
| `/ai` | AI assistance information |
| `/api` | API documentation |

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **UI Icons**: [Lucide React](https://lucide.dev/)
- **Analytics**: Vercel [Analytics](https://vercel.com/analytics) + [Speed Insights](https://vercel.com/speed-insights)

## Development Scripts

```bash
pnpm dev        # Start dev server with HMR
pnpm build      # Build for production
pnpm start      # Start production server
pnpm typecheck  # Run TypeScript type checking
```

## Version Management

The website version is managed by the root-level `bump-version.sh` script, which automatically syncs the version across multiple files including `website/package.json` and `src/lib/version.ts`.

Example:
```bash
./bump-version.sh 2.1.0
```

## Deployment

The website is configured for deployment on [Vercel](https://vercel.com/). Push to the repository to trigger automatic builds and deployments.

### Environment & Features

- **Root Path**: `/` (not nested under a subdomain)
- **Analytics**: Vercel Analytics and Speed Insights are configured in `src/app/layout.tsx`
- **Styling**: Tailwind CSS v4 with postcss
- **SEO**: Next.js metadata and sitemap at `public/sitemap.xml`

## Key Features

- **Responsive Design**: Mobile-first Tailwind CSS layout
- **Scroll Animations**: Framer Motion scroll reveal effects
- **Browser Detection**: Custom hook for platform-specific messaging
- **CTA-Focused**: Call-to-action sections throughout the page
- **Type Safe**: Full TypeScript support with strict tsconfig

## Contributing

1. Create a feature branch
2. Make changes to pages or components in `src/`
3. Run `pnpm dev` to test locally
4. Commit and push to GitHub
5. Create a pull request

## License

[Dripwriter Origin License](../LICENSE) — noncommercial use is permitted; commercial use requires a separate license.
