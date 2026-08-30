// Shared /v3 content data. Kept in a plain (non-"use client") module so both the
// server page (for FAQPage JSON-LD) and the client launch component can import it.

export const V3_FAQ: { q: string; a: string }[] = [
  {
    q: "What's new in Dripwriter Origin v3?",
    a: "Version 3 makes Dripwriter Origin cross-platform. It now types into Canvas, the Packback editor, and virtually any textarea or contenteditable field on any website — not just Google Docs. A new harness architecture pairs a caret-verified Google Docs engine with a verified generic engine for every other editor, and v3 drops the browsing-history permission warning."
  },
  {
    q: "Is Dripwriter Origin the same as the commercial Dripwriter service?",
    a: "No. Dripwriter Origin is an independent, free, open-source browser extension that types like a human on any website, with no account required. The commercial Dripwriter service is a separate paid product that costs $15 per month, works only in Google Docs, and requires you to authorize it into your Google account. Dripwriter Origin is not affiliated with it."
  },
  {
    q: "Does Dripwriter Origin work on Canvas and Packback?",
    a: "Yes. Dripwriter Origin v3 types into Canvas assignments and the Packback discussion editor, including when Packback is embedded as a cross-origin iframe inside Canvas. It also works in virtually any standard textarea, input, or contenteditable field."
  },
  {
    q: "Do I need an account or to sign in to use Dripwriter Origin?",
    a: "No. Dripwriter Origin requires no account, no login, and no OAuth. It never authorizes itself into your Google or school account, so it leaves no permission paper trail. Everything runs inside your browser with no external servers and no telemetry."
  },
  {
    q: "Is Dripwriter Origin really free?",
    a: "Yes. Dripwriter Origin is free for all noncommercial use under the Dripwriter Origin License, and the full source is open on GitHub. There are no paid tiers and no subscription. Commercial use requires a separate license."
  }
];
