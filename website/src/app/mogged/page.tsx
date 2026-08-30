import type { Metadata } from "next";
import Mogged from "@/components/sections/Mogged";
import { MOGGED_FAQ } from "@/components/sections/mogged-content";

export const metadata: Metadata = {
  title: "Mogged — The Dripwriter Cease-and-Desist, Answered",
  description:
    "A paid, Google-Docs-only tool sent an indie dev a cease-and-desist over a name. Dripwriter Origin is free, open-source, and works on every site — here's the reply.",
  keywords: [
    "dripwriter cease and desist",
    "dripwriter origin",
    "dripwriter trademark",
    "dripwriter lawsuit",
    "dripwriter free alternative",
    "dripwriter alternative",
    "free dripwriter",
    "is dripwriter origin affiliated with dripwriter",
    "open source dripwriter"
  ],
  alternates: { canonical: "https://dripwriter.org/mogged" },
  openGraph: {
    title: "Mogged — The Dripwriter Cease-and-Desist, Answered",
    description:
      "A $15/mo, Google-Docs-only tool sent a cease-and-desist over a name. Dripwriter Origin is free, open-source, works everywhere. The letter, the reply, the scoreboard.",
    url: "https://dripwriter.org/mogged",
    type: "article"
  },
  twitter: {
    card: "summary_large_image",
    title: "A cease-and-desist isn't the death of Dripwriter Origin. It's the birth certificate.",
    description:
      "Free, open-source, works on every website — vs. a $15/mo Google-Docs-only tool that answered with a lawyer. Receipts inside."
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://dripwriter.org/mogged#article",
      headline: "Mogged — The Dripwriter Cease-and-Desist, Answered",
      description:
        "Dripwriter Origin, a free and open-source browser extension, received a cease-and-desist over its name from the separate commercial paid Dripwriter service. This is the response: the unregistered mark, the absence of confusion, the open-source 'Origin' naming convention, and nominative fair use — alongside a feature-by-feature comparison.",
      datePublished: "2026-08-29",
      dateModified: "2026-08-29",
      author: { "@type": "Person", name: "Alexey Fedorov" },
      publisher: { "@type": "Person", name: "Alexey Fedorov" },
      about: { "@id": "https://dripwriter.org/#app" },
      isPartOf: { "@id": "https://dripwriter.org/#app" }
    },
    {
      "@type": "FAQPage",
      "@id": "https://dripwriter.org/mogged#faq",
      mainEntity: MOGGED_FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a }
      }))
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://dripwriter.org/mogged#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://dripwriter.org" },
        { "@type": "ListItem", position: 2, name: "Mogged", item: "https://dripwriter.org/mogged" }
      ]
    }
  ]
};

export default function MoggedPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Mogged />
    </>
  );
}
