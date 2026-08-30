// Shared /mogged content. Plain (non-"use client") module so the server page can
// pull MOGGED_FAQ into FAQPage JSON-LD while the client component renders it too.
//
// Deliberate constraint: the commercial competitor's domain is never written as a
// literal string in this file, so it can never end up inside machine-readable
// JSON-LD. The competitor is named in plain visible copy only, and never as a link
// — consistent with "only so much of the mark as reasonably necessary."

export const MOGGED_FAQ: { q: string; a: string }[] = [
  {
    q: "Did Dripwriter Origin get sued?",
    a: "No. Dripwriter Origin received a cease-and-desist letter — a demand letter from a law firm, not a lawsuit. No case has been filed. The mark in question is unregistered: USPTO Application No. 99/779938 is still pending, so the sender holds at most limited common-law rights, not a federal registration."
  },
  {
    q: "Is Dripwriter Origin affiliated with the commercial Dripwriter service?",
    a: "No. Dripwriter Origin is an independent, free, open-source browser extension with no account and no OAuth. It is not affiliated with, endorsed by, or connected to the separate commercial Dripwriter service, which is a paid product that costs $15 per month and works only in Google Docs."
  },
  {
    q: "Why is it called Dripwriter Origin and not just Dripwriter?",
    a: "The name follows the established open-source “Origin” convention — the same one behind uBlock Origin — which signals an independent, free project distinct from any similarly named commercial product. The full name “Dripwriter Origin” is used everywhere the project appears, never “Dripwriter” standing alone."
  },
  {
    q: "Is it legal to compare Dripwriter Origin to the paid Dripwriter?",
    a: "Yes. Truthfully naming a competitor to describe your own product is nominative fair use under New Kids on the Block v. News America and Toyota v. Tabari. Every comparison on this page states verifiable facts — price, platform support, account requirements — and nothing implies sponsorship or endorsement."
  },
  {
    q: "Did Dripwriter Origin comply with the cease-and-desist?",
    a: "No. The domain stays, the repository stays, the extension stays, and the name stays. A formal written response was sent declining every demand — citing the unregistered mark, the absence of any likelihood of confusion, the open-source “Origin” naming convention, and nominative fair use."
  },
  {
    q: "Does the commercial Dripwriter have a free tier?",
    a: "Yes, but a heavily limited one. As of its own pricing page (archived August 18, 2026), the free plan caps you at 250 words per day, limits drips to 60 minutes, allows “use existing Google Doc” for only the first 3 days, permits one drip at a time on standard queue priority, and reserves its version-history features for paid plans. Dripwriter Origin is free with no word caps, no queue, and no time limits."
  },
  {
    q: "Is Dripwriter Origin really free?",
    a: "Yes. Dripwriter Origin is free for all noncommercial use under the Dripwriter Origin License, and the full source is public on GitHub. There is no subscription, no paid tier, no account, and no OAuth. Commercial use requires a separate license."
  }
];
