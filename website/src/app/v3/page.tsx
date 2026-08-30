import type { Metadata } from "next";
import V3Launch from "@/components/sections/V3Launch";
import { V3_FAQ } from "@/components/sections/v3-content";
import { VERSION } from "@/lib/version";

export const metadata: Metadata = {
  title: "Dripwriter Origin v3 — Human Typing on Every Website, Free",
  description:
    "Dripwriter Origin v3 types like a human into Google Docs, Canvas, Packback, and any text box. Free, open-source, no account — a free Dripwriter alternative.",
  keywords: [
    "dripwriter origin v3",
    "dripwriter v3",
    "dripwriter free alternative",
    "dripwriter alternative",
    "free dripwriter",
    "dripwriter canvas",
    "dripwriter packback",
    "type into any website like a human",
    "human typing extension canvas",
    "cross-platform typing extension"
  ],
  alternates: { canonical: "https://dripwriter.org/v3" },
  openGraph: {
    title: "Dripwriter Origin v3 — Human Typing on Every Website",
    description:
      "Types into Google Docs, Canvas, Packback, and any text box. Free, open-source, no account. A better, free alternative to the $15/mo Dripwriter.",
    url: "https://dripwriter.org/v3",
    type: "article"
  },
  twitter: {
    card: "summary_large_image",
    title: "Dripwriter Origin v3 — Now on every website",
    description:
      "Free, open-source, cross-browser human typing for Google Docs, Canvas, Packback, and any text box."
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      "@id": "https://dripwriter.org/v3#faq",
      mainEntity: V3_FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a }
      }))
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://dripwriter.org/v3#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://dripwriter.org" },
        { "@type": "ListItem", position: 2, name: "Dripwriter Origin v3", item: "https://dripwriter.org/v3" }
      ]
    },
    {
      "@type": "TechArticle",
      "@id": "https://dripwriter.org/v3#article",
      headline: "Dripwriter Origin v3 — Human Typing on Every Website",
      description:
        "Dripwriter Origin v3 makes the extension cross-platform: it types with human cadence into Google Docs, Canvas, the Packback editor, and virtually any text box on any website. Free and open-source.",
      datePublished: "2026-08-29",
      dateModified: "2026-08-29",
      author: { "@type": "Person", name: "Alexey Fedorov" },
      about: { "@id": "https://dripwriter.org/#app" },
      isPartOf: { "@id": "https://dripwriter.org/#app" },
      softwareVersion: VERSION
    }
  ]
};

export default function V3Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <V3Launch />
    </>
  );
}
