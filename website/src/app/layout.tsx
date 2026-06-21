import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { VERSION } from "@/lib/version";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dripwriter — Free Human Typing Extension for Google Docs",
  description:
    "Dripwriter is a free, open-source browser extension that types your text into Google Docs like a human — realistic typos, false starts, and short breaks. For Chrome, Edge & Firefox.",
  keywords: [
    "dripwriter",
    "dripwriter ai",
    "dripwriter free",
    "free dripwriter",
    "dripwriter unblocked",
    "dripwriter extension",
    "dripwriter chrome extension",
    "drip writer",
    "google docs typing extension",
    "human-like typing google docs",
    "type into google docs",
    "human typing simulator"
  ],
  metadataBase: new URL("https://dripwriter.org"),
  alternates: {
    canonical: "https://dripwriter.org"
  },
  openGraph: {
    title: "Dripwriter Origin",
    description:
      "Type pasted text into Google Docs with realistic typos, deleted false starts, and short breaks.",
    url: "https://dripwriter.org",
    siteName: "Dripwriter Origin",
    // TODO: replace with a dedicated 1200x630 OG card at /og-image.png before launch.
    // /logo.png is 512x512 — social platforms will letterbox or center-crop it.
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Dripwriter Origin logo" }],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Dripwriter Origin",
    description:
      "Type into Google Docs like a human — typos, false starts, breaks. Free, open-source, cross-browser.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Dripwriter Origin logo" }]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://dripwriter.org/#app",
      name: "Dripwriter Origin",
      alternateName: ["Dripwriter", "Dripwriter Google Docs Extension"],
      url: "https://dripwriter.org",
      downloadUrl: "https://extension.dripwriter.org",
      applicationCategory: "BrowserApplication",
      operatingSystem: "Chrome, Edge, Firefox",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      },
      softwareVersion: VERSION,
      description:
        "Free, open-source browser extension that types pasted text into Google Docs with believable typos, deleted false starts, and short breaks.",
      author: {
        "@type": "Person",
        name: "Alexey Fedorov"
      },
      sameAs: [
        "https://github.com/alexey-max-fedorov/dripwriter-origin",
        "https://chrome.dripwriter.org",
        "https://edge.dripwriter.org",
        "https://firefox.dripwriter.org"
      ],
      keywords: "dripwriter, dripwriter ai, free dripwriter, dripwriter extension, google docs human typing"
    },
    {
      "@type": "FAQPage",
      "@id": "https://dripwriter.org/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Dripwriter?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Dripwriter is a free, open-source browser extension that types pasted text into Google Docs with adjustable speed, keyboard-neighbor typos that auto-correct, occasional false-start words, and configurable short breaks. The result reads like a person typing live, not a script pasting in one shot."
          }
        },
        {
          "@type": "Question",
          name: "Is Dripwriter free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — Dripwriter is free for all noncommercial use under the Dripwriter Origin License, and the source is open on GitHub. Commercial use requires a separate license; open an issue at https://github.com/alexey-max-fedorov/dripwriter-origin/issues."
          }
        },
        {
          "@type": "Question",
          name: "Which browsers does Dripwriter support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Dripwriter works in Chrome, Microsoft Edge, and Firefox. The build pipeline ships both Chrome MV3 and Firefox MV3 packages, and extension.dripwriter.org routes you to the right store for your browser."
          }
        },
        {
          "@type": "Question",
          name: "Can I use Dripwriter on a school or work network?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Dripwriter runs entirely inside your browser with no external servers to call and no telemetry, so there is nothing for a network filter to block once the extension is installed. If your browser can open the extension store and your Google Doc, Dripwriter works."
          }
        },
        {
          "@type": "Question",
          name: "Does Dripwriter work with AI like Claude?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. With API mode enabled, Dripwriter exposes a window._dripwriter API on Google Docs tabs so an AI agent such as Claude can drive the typing engine. See the setup guide at https://dripwriter.org/ai."
          }
        },
        {
          "@type": "Question",
          name: "Does Dripwriter work in Microsoft Word?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Not today. Dripwriter is built specifically for Google Docs, where its humanized typing engine is tuned to the Docs editor. Microsoft Word support is not currently available."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
