import type { Metadata } from "next";
import AiGuide from "@/components/sections/AiGuide";

export const metadata: Metadata = {
  title: "Dripwriter AI — Let Claude Type Into Google Docs",
  description:
    "Connect Dripwriter Origin to Claude and let AI type your text into Google Docs with human cadence. Step-by-step setup for the Claude Chrome extension and Dripwriter API mode.",
  keywords: [
    "dripwriter ai",
    "dripwriter claude",
    "ai type into google docs",
    "claude google docs typing"
  ],
  alternates: { canonical: "https://dripwriter.org/ai" },
  openGraph: {
    title: "Dripwriter AI — Let Claude Type Into Google Docs",
    description:
      "Let Claude type for you — human-like, straight into Google Docs.",
    url: "https://dripwriter.org/ai",
    type: "article"
  }
};

export default function AiPage() {
  return <AiGuide />;
}
