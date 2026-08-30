import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { VERSION } from "@/lib/version";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dripwriter Origin — Free Human Typing Extension for Google Docs & Canvas",
  description:
    "Dripwriter Origin is a free, open-source browser extension that types your text into any website like a human — Google Docs, Canvas, Packback, and virtually any text box. Realistic typos, false starts, and short breaks. For Chrome, Edge & Firefox.",
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
    "human typing simulator",
    "canvas typing extension",
    "canvas lms typing",
    "packback typing",
    "type into any website",
    "human typing any text box",
    "type into textarea like a human"
  ],
  metadataBase: new URL("https://dripwriter.org"),
  alternates: {
    canonical: "https://dripwriter.org"
  },
  openGraph: {
    title: "Dripwriter Origin",
    description:
      "Type pasted text into any website — Google Docs, Canvas, and any text box — with realistic typos, deleted false starts, and short breaks.",
    url: "https://dripwriter.org",
    siteName: "Dripwriter Origin",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Dripwriter Origin",
    description:
      "Type into any website like a human — Google Docs, Canvas, any text box. Typos, false starts, breaks. Free, open-source, cross-browser."
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
      alternateName: ["Dripwriter", "Dripwriter Google Docs Extension", "Dripwriter Canvas Extension"],
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
        "Free, open-source browser extension that types pasted text into any website — Google Docs, Canvas, Packback, and virtually any text box — with believable typos, deleted false starts, and short breaks.",
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
      keywords: "dripwriter, dripwriter ai, free dripwriter, dripwriter extension, google docs human typing, canvas typing extension, type into any website, human typing any text box"
    },
    {
      "@type": "FAQPage",
      "@id": "https://dripwriter.org/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Dripwriter Origin?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Dripwriter Origin is a free, open-source browser extension that types pasted text into Google Docs, Canvas, the Packback editor, and virtually any text box on any website — with adjustable speed, keyboard-neighbor typos that auto-correct, occasional false-start words, and configurable short breaks. The result reads like a person typing live, not a script pasting in one shot."
          }
        },
        {
          "@type": "Question",
          name: "Is Dripwriter Origin free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — Dripwriter Origin is free for all noncommercial use under the Dripwriter Origin License, and the source is open on GitHub. Commercial use requires a separate license; open an issue at https://github.com/alexey-max-fedorov/dripwriter-origin/issues."
          }
        },
        {
          "@type": "Question",
          name: "Which browsers does Dripwriter Origin support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Dripwriter Origin works in Chrome, Microsoft Edge, and Firefox. The build pipeline ships both Chrome MV3 and Firefox MV3 packages, and extension.dripwriter.org routes you to the right store for your browser."
          }
        },
        {
          "@type": "Question",
          name: "Can I use Dripwriter Origin on a school or work network?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Dripwriter Origin runs entirely inside your browser with no external servers to call and no telemetry, so there is nothing for a network filter to block once the extension is installed. If your browser can open the extension store and the page you're typing into — a Google Doc, a Canvas assignment, or any text box — Dripwriter Origin works."
          }
        },
        {
          "@type": "Question",
          name: "Does Dripwriter Origin work with AI like Claude?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. With API mode enabled, Dripwriter Origin exposes a window._dripwriter API on any site you're typing into — Google Docs, Canvas, and beyond — so an AI agent such as Claude can drive the typing engine. See the setup guide at https://dripwriter.org/ai."
          }
        },
        {
          "@type": "Question",
          name: "Does Dripwriter Origin work in Microsoft Word?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "It works in any web-based text box, so Microsoft Word on the web (the contenteditable editor at office.com) works. Native desktop Word does not, because it isn't a web page and has no text field the extension can reach. Google Docs remains the most polished experience, but Canvas, Packback, and most standard textareas and contenteditable fields work too."
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
