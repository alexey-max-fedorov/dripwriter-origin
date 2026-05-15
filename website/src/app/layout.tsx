import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { VERSION } from "@/lib/version";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dripwriter Origin | Type into Google Docs like a human",
  description:
    "Free, open-source browser extension that types pasted text into Google Docs with believable typos, false starts, and short breaks. Cross-browser — Chrome, Edge, Firefox.",
  keywords: [
    "dripwriter",
    "dripwriter origin",
    "google docs typing extension",
    "human-like typing google docs",
    "google docs auto type",
    "type into google docs",
    "typing simulator extension",
    "google docs typewriter",
    "human typing simulator",
    "typing bot google docs"
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
      downloadUrl: "https://dripwriter.org/get",
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
      }
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
            text: "Dripwriter Origin is a free, open-source browser extension that types pasted text into Google Docs with adjustable speed, keyboard-neighbor typos that auto-correct, occasional false-start words, and configurable short breaks. The result reads like a person typing live, not a script pasting in one shot."
          }
        },
        {
          "@type": "Question",
          name: "Which browsers does Dripwriter Origin support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Dripwriter Origin works in Chrome, Microsoft Edge, and Firefox. The build pipeline produces both Chrome MV3 and Firefox MV3 packages."
          }
        },
        {
          "@type": "Question",
          name: "How do I install Dripwriter Origin?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Visit dripwriter.org/get for the latest packaged build, or load the unpacked extension from the repository's build directory. Open a Google Doc, click the Dripwriter Origin toolbar icon, paste your text, tune the sliders, and press Start."
          }
        },
        {
          "@type": "Question",
          name: "Is Dripwriter Origin free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The extension is free for all noncommercial use under the Dripwriter Origin License. Commercial use requires a separate license — open an issue at https://github.com/alexey-max-fedorov/dripwriter-origin/issues."
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
