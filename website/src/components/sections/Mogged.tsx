"use client";

import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  MotionConfig,
  type Variants
} from "framer-motion";
import { Check, X, ArrowRight, FileText, Scale, Gavel, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { InstallButton } from "@/components/ui/InstallButton";
import { MOGGED_FAQ } from "@/components/sections/mogged-content";

const EASE = [0.25, 0.1, 0.25, 1] as const;

// Local receipt assets — served from /public. These are Alexey's own received
// letter and his response, NOT links to the competitor. Kept clean-named for a
// readable URL on a page whose whole point is "nothing redacted."
const CD_HREF = "/cease-and-desist.pdf";
const RESPONSE_HREF = "/response.png";
const INSTALL_HREF = "https://extension.dripwriter.org";
const SOURCE_HREF = "https://github.com/alexey-max-fedorov/dripwriter-origin";

// Proof links point to the Wayback Machine, NOT to the competitor — the link host
// is web.archive.org, so archive.org receives any link equity and the competitor
// gets no backlink, while the snapshot is tamper-proof and shows the trust bar.
const ARCHIVE_HOME = "https://web.archive.org/web/20260818203851/https://www.dripwriter.com/";
const ARCHIVE_PRICING = "https://web.archive.org/web/20260818203851/https://www.dripwriter.com/pricing";

// Every limit below is quoted from the archived pricing page (Aug 18, 2026) — so
// these are citable facts, not estimates.
const FREE_TIER: string[] = [
  "250 words per day — then you’re cut off",
  "Drips capped at 60 minutes",
  "“Use existing Google Doc” for your first 3 days only — then it’s paywalled",
  "One drip at a time, on “Standard” queue priority",
  "“Basic” protection — the version-history features are locked behind Pro"
];

// ── Copy lives in data so the JSX stays lean and apostrophe-safe ───────────────
const STORY: { k: string; h: string; p: string }[] = [
  {
    k: "01",
    h: "They built a business out of a keystroke.",
    p: "The commercial Dripwriter charges $15 a month — $9 if you prepay a year — to type your text into Google Docs. One platform. Closed source. To use it, you authorize it into your Google account — so the permission grant sits on your school login, on the record, indefinitely."
  },
  {
    k: "02",
    h: "I built it better, and gave it away.",
    p: "Dripwriter Origin types like a human into Google Docs, Canvas, Packback, and any text box on any site. No account. No OAuth. No paper trail. Fully open source. v3 shipped cross-platform and beat the paid product on every axis that matters — for $0."
  },
  {
    k: "03",
    h: "So they sent a lawyer.",
    p: "Not a better product. Not a lower price. A cease-and-desist over the word “Dripwriter” — demanding I hand over my domain, delete my repository, scrub my commit history, and pull the extension from every store. Over a trademark that isn’t even registered. I declined."
  }
];

const COMPARE: { feature: string; origin: string; rival: string }[] = [
  { feature: "Price", origin: "Free forever — no caps, no queue", rival: "$15/mo ($9/mo billed annually); free tier capped at 250 words/day" },
  { feature: "Works on", origin: "Any website — Docs, Canvas, Packback, any text box", rival: "Google Docs only" },
  { feature: "Account / sign-in", origin: "None — no login, no OAuth", rival: "Requires OAuth into your Google account" },
  { feature: "Permission paper trail", origin: "None to authorize into your school account", rival: "OAuth grant sits in your Google account" },
  { feature: "Configurable cadence", origin: "Speed, typos, false starts, breaks — all adjustable", rival: "Not configurable" },
  { feature: "Open source", origin: "Yes — auditable on GitHub", rival: "No — closed source" },
  { feature: "Cross-origin iframes (e.g. Packback)", origin: "Yes", rival: "No" },
  { feature: "Telemetry", origin: "None — runs entirely in your browser", rival: "—" }
];

const DEMANDS: string[] = [
  "Stop using the Dripwriter name in the domain, the extension, and all branding",
  "Hand over the dripwriter.org domain — or permanently disable and de-list it",
  "Rename or take down the GitHub repository, and scrub every reference from the commit history",
  "Pull the browser extension from every web store and stop distributing it",
  "Send written confirmation that I complied with all of the above"
];

const MOVES: { h: string; p: string }[] = [
  {
    h: "The mark isn’t registered.",
    p: "USPTO Application No. 99/779938 is still pending. That means common-law rights at most — narrow, and limited to where they actually operate. There is no nationwide exclusivity to enforce."
  },
  {
    h: "Nobody is confused.",
    p: "A free, open-source extension is not a paid SaaS. Different price, different product, different distribution — and zero instances of actual confusion. The Sleekcraft factors don’t get them there."
  },
  {
    h: "“Origin” means independent.",
    p: "It’s the open-source naming convention — uBlock Origin is the template. The suffix signals the opposite of affiliation: a free, independent alternative. And it’s always used in full, never “Dripwriter” alone."
  },
  {
    h: "Truthful comparison is protected.",
    p: "Naming them to say “here’s the free alternative” is textbook nominative fair use — New Kids on the Block v. News America, Toyota v. Tabari. Protected even between direct competitors."
  }
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.3em] uppercase mb-6">
      {children}
    </p>
  );
}

function Reveal({
  children,
  className,
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const variants: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay } }
  };
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

export default function Mogged() {
  const reduce = useReducedMotion();
  const { scrollYProgress, scrollY } = useScroll();
  const glowHero = useTransform(scrollY, [0, 900], [0, -160]);
  const glowMid = useTransform(scrollY, [400, 2600], [140, -140]);
  const glowLow = useTransform(scrollY, [2000, 4200], [160, -160]);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#c9a84c] origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      <Navbar />
      <main className="relative bg-black overflow-hidden">
        {/* Parallax background layers (fixed so they drift behind the article) */}
        <motion.div
          aria-hidden
          className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[760px] h-[420px] rounded-full blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(201,168,76,0.10) 0%, transparent 70%)",
            ...(reduce ? {} : { y: glowHero })
          }}
        />
        <motion.div
          aria-hidden
          className="fixed top-1/3 -left-40 w-[560px] h-[560px] rounded-full blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)",
            ...(reduce ? {} : { y: glowMid })
          }}
        />
        <motion.div
          aria-hidden
          className="fixed bottom-1/4 -right-40 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)",
            ...(reduce ? {} : { y: glowLow })
          }}
        />
        <div
          aria-hidden
          className="fixed inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "80px 80px"
          }}
        />

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section id="main-content" className="relative z-10 px-4 sm:px-6 pt-32 pb-24">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <Eyebrow>✦ Mogged · the cease &amp; desist, and the receipts</Eyebrow>
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl leading-[1.05] text-white mb-8"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              A cease-and-desist isn’t the death of Dripwriter Origin.
              <br/>
              <br className="hidden sm:block" />
              <span className="text-[#c9a84c]"> It’s our fucking birth certificate.</span> 💯🖕
            </h1>
            <div className="max-w-2xl mx-auto mb-10 space-y-4">
              <p className="text-[#c0c0c0] text-lg leading-relaxed">
                A paid, Google-Docs-only tool charges $15 a month to type into your own documents.
                Dripwriter Origin does it{" "}
                <span className="text-white font-medium">
                  better — free, open source, on every website.
                </span>
              </p>
              <p className="text-[#c0c0c0] text-lg leading-relaxed">
                So instead of competing, they sent a lawyer. Here’s the letter, my response, and the
                scoreboard.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" href={CD_HREF} external>
                <FileText size={18} />
                Read the cease &amp; desist
              </Button>
              <Button variant="outline" size="lg" href={RESPONSE_HREF} external>
                Read my response
              </Button>
            </div>
            <p className="mt-6 text-sm text-[#888]">
              Or skip the drama and{" "}
              <a
                href={INSTALL_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c9a84c] hover:underline"
              >
                get the free extension →
              </a>
            </p>
          </motion.div>

          {/* Dictionary block — a citable definition, and the whole thesis in one card */}
          <Reveal className="max-w-2xl mx-auto mt-16" delay={0.1}>
            <div className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-sm p-6 sm:p-8">
              <p className="text-2xl text-white mb-1" style={{ fontFamily: "var(--font-playfair-display)" }}>
                mogged <span className="text-[#666] text-lg font-normal">/mɒɡd/</span>{" "}
                <span className="text-[#c9a84c] text-sm italic font-normal">verb</span>
              </p>
              <p className="text-[#a0a0a0] text-base leading-relaxed">
                To comprehensively outclass or outshine. <span className="text-[#d8d8d8]">“A free,
                open-source extension that works on every website mogged a $15-a-month tool that only
                works in Google Docs.”</span>
              </p>
            </div>
          </Reveal>
        </section>

        {/* ── The story ────────────────────────────────────────── */}
        <section className="relative z-10 px-4 sm:px-6 py-24 border-t border-[#1a1a1a]">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <Eyebrow>✦ What actually happened</Eyebrow>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-12 leading-tight"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                Three facts, in order.
              </h2>
            </Reveal>
            <div className="space-y-5">
              {STORY.map((s, i) => (
                <Reveal key={s.k} delay={i * 0.08}>
                  <div className="flex gap-5 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-sm p-6 sm:p-7">
                    <span
                      className="text-[#c9a84c] text-2xl font-semibold flex-shrink-0"
                      style={{ fontFamily: "var(--font-playfair-display)" }}
                    >
                      {s.k}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{s.h}</h3>
                      <p className="text-[#a0a0a0] text-base leading-relaxed">{s.p}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── The scoreboard ───────────────────────────────────── */}
        <section id="scoreboard" className="relative z-10 px-4 sm:px-6 py-24 border-t border-[#1a1a1a]">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <Eyebrow>✦ The mogging, itemized</Eyebrow>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-4 leading-tight"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                Free and everywhere vs. $15 a month and Docs only.
              </h2>
              <p className="text-[#a0a0a0] text-base leading-relaxed mb-10">
                Same job — text typed with a believable human cadence. One does it for free, on every
                website, with no account and no paper trail. The other charges $15 a month, works only
                in Google Docs, isn’t configurable, and makes you authorize it into your Google account.
                Read the rows.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="overflow-x-auto rounded-xl border border-[#1a1a1a] bg-[#0a0a0a]/60 backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1a1a1a]">
                      <th scope="col" className="py-4 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#a0a0a0]">
                        Feature
                      </th>
                      <th scope="col" className="py-4 px-4 text-sm font-semibold text-[#c9a84c]">
                        Dripwriter Origin v3
                      </th>
                      <th scope="col" className="py-4 px-4 text-sm font-semibold text-[#a0a0a0]">
                        Dripwriter.com ($15/mo)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE.map((row) => (
                      <tr key={row.feature} className="border-b border-[#1a1a1a] last:border-0">
                        <th scope="row" className="py-4 px-4 text-sm font-medium text-white align-top">
                          {row.feature}
                        </th>
                        <td className="py-4 px-4 text-sm text-[#d8d8d8] align-top">
                          <span className="inline-flex items-start gap-2">
                            <Check size={16} className="text-[#c9a84c] mt-0.5 flex-shrink-0" aria-hidden />
                            <span>{row.origin}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-[#8a8a8a] align-top">
                          <span className="inline-flex items-start gap-2">
                            <X size={16} className="text-[#6b4a4a] mt-0.5 flex-shrink-0" aria-hidden />
                            <span>{row.rival}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="mt-8 text-lg text-white font-medium leading-relaxed">
                That’s not competition. That’s a mogging. 💯
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── The "free" tier ──────────────────────────────────── */}
        <section className="relative z-10 px-4 sm:px-6 py-24 border-t border-[#1a1a1a]">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <Eyebrow>✦ About that “free” tier</Eyebrow>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-4 leading-tight"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                Yes, they have a free plan. Here’s what “free” buys you.
              </h2>
              <p className="text-[#a0a0a0] text-base leading-relaxed max-w-2xl mb-10">
                Straight from their own pricing page — every limit below is verbatim, not a guess.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-xl border border-[#2a1a1a] bg-[#0a0a0a]/80 backdrop-blur-sm p-6 sm:p-8">
                <ul className="space-y-3">
                  {FREE_TIER.map((limit) => (
                    <li key={limit} className="flex gap-3 text-sm text-[#a0a0a0] leading-relaxed">
                      <X size={16} className="text-[#6b4a4a] mt-0.5 flex-shrink-0" aria-hidden />
                      <span>{limit}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-base text-white font-medium leading-relaxed">
                  Dripwriter Origin has none of these. No word cap, no queue, no 60-minute ceiling, no
                  three-day door slamming shut — because there’s nothing to upsell you to.
                </p>
                <a
                  href={ARCHIVE_PRICING}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm text-[#c9a84c] hover:text-[#e2c97e] transition-colors"
                >
                  See their pricing page — archived Aug 18, 2026
                  <ExternalLink size={14} aria-hidden />
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── The logos that don't add up ──────────────────────── */}
        <section className="relative z-10 px-4 sm:px-6 py-24 border-t border-[#1a1a1a]">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <Eyebrow>✦ The logos that don’t add up</Eyebrow>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-4 leading-tight"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                “Trusted by students and professionals at…”
              </h2>
              <p className="text-[#a0a0a0] text-base leading-relaxed max-w-2xl mb-10">
                That’s the exact line on their homepage, above a wall of logos: Goldman Sachs,
                McKinsey &amp; Company, Google, MIT, Princeton, and Stanford.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-sm p-6 sm:p-8 space-y-5">
                <p className="text-base text-[#c0c0c0] leading-relaxed">
                  Here’s the thing. This is a product whose own Pro plan sells{" "}
                  <span className="text-white">“Beats version history &amp; writing playback
                  analysis”</span> and an{" "}
                  <span className="text-white">“end-of-session revision sweep that simulates you
                  editing your own work.”</span> Its homepage slogan is{" "}
                  <span className="text-white">“The version history doesn’t lie”</span> — for a tool
                  whose entire job is to make the version history lie convincingly.
                </p>
                <p className="text-base text-[#c0c0c0] leading-relaxed">
                  So does anyone actually believe Goldman Sachs analysts and McKinsey consultants are
                  dripping essays into Google Docs overnight? There’s not one named person, quote,
                  testimonial, or case study behind those logos. Just logos. In my opinion, that’s not
                  social proof — it’s set dressing.
                </p>
                <a
                  href={ARCHIVE_HOME}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#c9a84c] hover:text-[#e2c97e] transition-colors"
                >
                  See their homepage — archived Aug 18, 2026
                  <ExternalLink size={14} aria-hidden />
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── The receipts ─────────────────────────────────────── */}
        <section id="receipts" className="relative z-10 px-4 sm:px-6 py-24 border-t border-[#1a1a1a]">
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <Eyebrow>✦ The receipts · nothing redacted</Eyebrow>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-4 leading-tight"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                They lawyered up. So I published everything.
              </h2>
              <p className="text-[#a0a0a0] text-base leading-relaxed max-w-2xl mb-12">
                The full cease-and-desist and my full response are below — hosted right here, in the
                open, for anyone to read. Judge it yourself.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* The C&D */}
              <Reveal delay={0.05}>
                <div className="h-full rounded-xl border border-[#2a1a1a] bg-[#0a0a0a]/80 backdrop-blur-sm p-6 sm:p-7 flex flex-col">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[#b06a6a]"><Gavel size={22} /></span>
                    <h3 className="text-lg font-semibold text-white">The cease &amp; desist</h3>
                  </div>
                  <p className="text-sm text-[#888] mb-4 leading-relaxed">
                    Sent August 17, 2026, by Dripwriter, LLC’s law firm. Five demands:
                  </p>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {DEMANDS.map((d) => (
                      <li key={d} className="flex gap-2.5 text-sm text-[#a0a0a0] leading-relaxed">
                        <X size={15} className="text-[#6b4a4a] mt-0.5 flex-shrink-0" aria-hidden />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" size="md" href={CD_HREF} external className="w-full">
                    <FileText size={16} />
                    Read the full letter (PDF)
                  </Button>
                </div>
              </Reveal>

              {/* The response */}
              <Reveal delay={0.12}>
                <div className="h-full rounded-xl border border-[#1a2a1a] bg-[#0a0a0a]/80 backdrop-blur-sm p-6 sm:p-7 flex flex-col">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[#c9a84c]"><Scale size={22} /></span>
                    <h3 className="text-lg font-semibold text-white">My response</h3>
                  </div>
                  <p className="text-sm text-[#888] mb-4 leading-relaxed">
                    Declined every demand. The domain, the repo, the extension, and the name all stay.
                    Four moves:
                  </p>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {MOVES.map((m) => (
                      <li key={m.h} className="flex gap-2.5 text-sm text-[#a0a0a0] leading-relaxed">
                        <Check size={15} className="text-[#c9a84c] mt-0.5 flex-shrink-0" aria-hidden />
                        <span className="text-[#d8d8d8] font-medium">{m.h}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="primary" size="md" href={RESPONSE_HREF} external className="w-full">
                    Read the full response
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Why it doesn't hold ──────────────────────────────── */}
        <section className="relative z-10 px-4 sm:px-6 py-24 border-t border-[#1a1a1a]">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <Eyebrow>✦ Why the letter doesn’t hold</Eyebrow>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-4 leading-tight"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                An unregistered mark, a weak case, and a naming convention older than their company.
              </h2>
              <p className="text-[#a0a0a0] text-base leading-relaxed max-w-2xl mb-12">
                None of this is bravado — it’s the law. Here’s the response, in four moves.
              </p>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {MOVES.map((m, i) => (
                <Reveal key={m.h} delay={i * 0.07}>
                  <div className="h-full rounded-xl border border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-sm p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{m.h}</h3>
                    <p className="text-sm text-[#a0a0a0] leading-relaxed">{m.p}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.1}>
              <p className="mt-10 text-base text-[#a0a0a0] leading-relaxed max-w-2xl">
                I offered exactly one thing in good faith: a clear notice that this project isn’t
                affiliated with them. That notice is at the bottom of this page. Everything else was
                declined.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section id="faq" className="relative z-10 px-4 sm:px-6 py-24 border-t border-[#1a1a1a]">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <Eyebrow>✦ Straight answers</Eyebrow>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-10 leading-tight"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                The questions people actually ask.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="border-t border-[#1a1a1a]">
                {MOGGED_FAQ.map((item) => (
                  <div key={item.q} className="py-6 border-b border-[#1a1a1a]">
                    <h3 className="text-base font-semibold text-white mb-2">{item.q}</h3>
                    <p className="text-sm text-[#a0a0a0] leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section className="relative z-10 px-4 sm:px-6 py-28 border-t border-[#1a1a1a]">
          <Reveal className="max-w-3xl mx-auto text-center">
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              The free one works everywhere. Go get it.
            </h2>
            <p className="text-[#a0a0a0] text-base leading-relaxed max-w-xl mx-auto mb-10">
              Free, open-source, and cross-browser. No account, no OAuth, no subscription — and no
              lawyer required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <InstallButton variant="primary" size="lg" showArrow />
              <Button variant="outline" size="lg" href={SOURCE_HREF} external>
                View the source
              </Button>
            </div>
            <p className="mt-8 text-sm text-[#a0a0a0]">
              Read{" "}
              <Link href="/v3" className="text-[#c9a84c] hover:underline">
                what’s new in v3
              </Link>{" "}
              or{" "}
              <Link href="/" className="text-[#c9a84c] hover:underline">
                see what Dripwriter Origin does
              </Link>
              .
            </p>
          </Reveal>
        </section>

        {/* ── Disclaimer strip (the shield) ────────────────────── */}
        <section className="relative z-10 px-4 sm:px-6 pb-20">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-[#666] leading-relaxed text-center border-t border-[#1a1a1a] pt-8">
              Dripwriter Origin is an independent, open-source project. It is not affiliated with,
              endorsed by, or connected to Dripwriter, LLC or its commercial service. All references
              to “Dripwriter” on this page are nominative and factual, used only to identify the
              product being compared. Statements about the commercial service describe its own
              publicly published marketing and pricing as of the archived snapshots linked above;
              any characterizations are the author’s opinion.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </MotionConfig>
  );
}
