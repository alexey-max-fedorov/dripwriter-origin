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
import { Check, X, ArrowRight, Globe, Layers, Boxes, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { MockCrossPlatform } from "@/components/ui/MockCrossPlatform";
import { V3_FAQ } from "@/components/sections/v3-content";

// ── Motion variants ───────────────────────────────────────────────────────────
const EASE = [0.25, 0.1, 0.25, 1] as const;
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }
};
const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } }
};
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } }
};
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
};

function Reveal({
  children,
  className,
  variants = fadeUp,
  amount = 0.3
}: {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

// ── Content data ──────────────────────────────────────────────────────────────
const WHATS_NEW: { icon: React.ReactNode; title: string; body: string }[] = [
  {
    icon: <Globe size={22} />,
    title: "Every website, not just Docs",
    body: "v3 adds a universal engine that types into Canvas, Packback, and virtually any text box on any site. Google Docs stays the most finely tuned experience."
  },
  {
    icon: <Layers size={22} />,
    title: "One harness, one codebase",
    body: "A caret-verified Google Docs engine and a verified generic engine sit behind a single interface — the same humanized typing algorithm drives both. Chrome, Edge, and Firefox from one build."
  },
  {
    icon: <Boxes size={22} />,
    title: "Reaches embedded editors",
    body: "v3 types inside cross-origin iframes like the Packback editor embedded in Canvas — the kind of surface most typing tools can't reach at all."
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Fewer permissions",
    body: "v3 drops the “read your browsing history” warning. No account, no OAuth, no telemetry — just local storage and the page you're actively typing into."
  }
];

const WHERE_IT_WORKS: { name: string; note: string }[] = [
  { name: "Google Docs", note: "Most finely tuned — caret-verified engine" },
  { name: "Canvas LMS", note: "Assignments, discussions, rich-text fields" },
  { name: "Packback", note: "Including the cross-origin iframe inside Canvas" },
  { name: "Any text box", note: "Standard textarea, input, or contenteditable" },
  { name: "Word on the web", note: "The contenteditable editor at office.com" },
  { name: "Chrome · Edge · Firefox", note: "One codebase, all three browsers" }
];

const COMPARE: { feature: string; origin: string; rival: string }[] = [
  { feature: "Price", origin: "Free forever (noncommercial)", rival: "$15 / month" },
  { feature: "Works on", origin: "Any website — Docs, Canvas, Packback, any text box", rival: "Google Docs only" },
  { feature: "Account / sign-in", origin: "None — no login, no OAuth", rival: "Requires OAuth into your Google account" },
  { feature: "Permission paper trail", origin: "None to authorize into your school account", rival: "OAuth grant sits in your Google account" },
  { feature: "Configurable cadence", origin: "Speed, typos, false starts, breaks — all adjustable", rival: "Not configurable" },
  { feature: "Open source", origin: "Yes — auditable on GitHub", rival: "No — closed source" },
  { feature: "Cross-origin iframes (e.g. Packback)", origin: "Yes", rival: "No" },
  { feature: "Telemetry", origin: "None — runs entirely in your browser", rival: "—" }
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.3em] uppercase mb-6">
      {children}
    </p>
  );
}

export default function V3Launch() {
  const reduce = useReducedMotion();

  // Page-level scroll signals drive the progress bar and the parallax glows.
  const { scrollYProgress, scrollY } = useScroll();
  const glowHero = useTransform(scrollY, [0, 900], [0, -160]);
  const glowMid = useTransform(scrollY, [400, 2200], [120, -120]);
  const glowLow = useTransform(scrollY, [1600, 3600], [160, -140]);

  return (
    <MotionConfig reducedMotion="user">
      {/* Scroll progress bar */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#c9a84c] origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      <Navbar />
      <main id="main-content" className="relative min-h-screen bg-black overflow-hidden">
        {/* Parallax background layers */}
        <motion.div
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[760px] h-[420px] rounded-full blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(201,168,76,0.10) 0%, transparent 70%)",
            ...(reduce ? {} : { y: glowHero })
          }}
        />
        <motion.div
          aria-hidden
          className="absolute top-[1400px] -left-40 w-[560px] h-[560px] rounded-full blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
            ...(reduce ? {} : { y: glowMid })
          }}
        />
        <motion.div
          aria-hidden
          className="absolute top-[2800px] -right-40 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
            ...(reduce ? {} : { y: glowLow })
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "80px 80px"
          }}
        />

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-36 pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <motion.div
              className="w-full lg:w-3/5 text-center lg:text-left"
              initial="hidden"
              animate="show"
              variants={container}
            >
              <motion.div variants={fadeUp}>
                <Eyebrow>✦ Dripwriter Origin v3 · Now cross-platform</Eyebrow>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-white mb-6"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                Now on every website.
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-[#a0a0a0] text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10"
              >
                Dripwriter Origin v3 types your text into Google Docs, Canvas, Packback, and
                virtually any text box on any site — with the same human cadence: real typos,
                deleted false starts, and short breaks. Free, open-source, and no account required.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Button variant="primary" size="lg" href="https://extension.dripwriter.org" external>
                  Install the extension
                  <ArrowRight size={18} />
                </Button>
                <Button variant="outline" size="lg" href="#compare">
                  See how it compares
                </Button>
              </motion.div>
              <motion.p variants={fadeUp} className="mt-6 text-xs text-[#666] tracking-wide">
                Free for noncommercial use · Chrome, Edge &amp; Firefox · Updated August 29, 2026
              </motion.p>
            </motion.div>

            <motion.div
              className="w-full lg:w-2/5"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            >
              <motion.div
                animate={reduce ? undefined : { y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <MockCrossPlatform />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── What's new ───────────────────────────────────────── */}
        <section id="whats-new" className="relative z-10 border-t border-[#1a1a1a]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            <Reveal variants={fadeLeft}>
              <Eyebrow>✦ What&apos;s new in v3</Eyebrow>
              <h2
                className="text-3xl sm:text-4xl font-semibold text-white mb-4 leading-tight"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                The typing you know, everywhere you write.
              </h2>
              <p className="text-[#a0a0a0] text-base leading-relaxed max-w-2xl mb-12">
                v2 mastered Google Docs. v3 keeps that engine and adds a universal one, so the same
                believable keystrokes land in any editor on the web.
              </p>
            </Reveal>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {WHATS_NEW.map((f) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  whileHover={reduce ? undefined : { y: -4 }}
                  className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-6 transition-colors hover:border-[#2a2a2a]"
                >
                  <div className="text-[#c9a84c] mb-4">{f.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-[#a0a0a0] leading-relaxed">{f.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section id="how" className="relative z-10 border-t border-[#1a1a1a]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
            <Reveal variants={fadeLeft}>
              <Eyebrow>✦ How it works</Eyebrow>
              <h2
                className="text-3xl sm:text-4xl font-semibold text-white mb-8 leading-tight"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                Paste, click, press Start.
              </h2>
            </Reveal>
            <motion.ol
              className="space-y-6"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {[
                "Paste your text into the Dripwriter Origin popup and set your speed, typo rate, false-start rate, and break timing.",
                "Click into any text box — a Google Doc, a Canvas assignment, the Packback editor, or any textarea or contenteditable field.",
                "Press Start. Dripwriter Origin detects the editor and types character by character, confirming each keystroke landed before moving on."
              ].map((step, i) => (
                <motion.li key={i} variants={fadeUp} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full border border-[#c9a84c] text-[#c9a84c] text-sm font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-[#a0a0a0] text-base leading-relaxed pt-1">{step}</p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>

        {/* ── Where it works ───────────────────────────────────── */}
        <section id="where" className="relative z-10 border-t border-[#1a1a1a]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            <Reveal variants={fadeLeft}>
              <Eyebrow>✦ Where it works</Eyebrow>
              <h2
                className="text-3xl sm:text-4xl font-semibold text-white mb-12 leading-tight"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                One extension, every editable surface.
              </h2>
            </Reveal>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
            >
              {WHERE_IT_WORKS.map((p) => (
                <motion.div
                  key={p.name}
                  variants={scaleIn}
                  className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-6"
                >
                  <h3 className="text-base font-semibold text-white mb-1">{p.name}</h3>
                  <p className="text-sm text-[#a0a0a0] leading-relaxed">{p.note}</p>
                </motion.div>
              ))}
            </motion.div>
            <Reveal>
              <p className="mt-8 text-sm text-[#666] leading-relaxed max-w-2xl">
                Native desktop apps like Microsoft Word for Windows aren&apos;t supported — they
                aren&apos;t web pages, so there&apos;s no text field in the browser for the extension
                to reach.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Comparison / the flame ───────────────────────────── */}
        <section id="compare" className="relative z-10 border-t border-[#1a1a1a]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
            <Reveal variants={fadeUp}>
              <Eyebrow>✦ Dripwriter Origin vs. Dripwriter.com</Eyebrow>
              <h2
                className="text-3xl sm:text-4xl font-semibold text-white mb-4 leading-tight"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                Free and everywhere vs. $15 a month and Docs only.
              </h2>
              <p className="text-[#a0a0a0] text-base leading-relaxed mb-10">
                Dripwriter Origin is a free, open-source extension that types like a human on any
                website. The commercial Dripwriter service at Dripwriter.com charges $15 per month,
                works only in Google Docs, isn&apos;t configurable, and makes you authorize it into
                your Google account — leaving a permission paper trail on your school login.
                Here&apos;s the head-to-head.
              </p>
            </Reveal>

            <motion.div
              className="overflow-x-auto rounded-xl border border-[#1a1a1a]"
              variants={scaleIn}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
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
                <motion.tbody
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.1 }}
                >
                  {COMPARE.map((row) => (
                    <motion.tr
                      key={row.feature}
                      variants={fadeUp}
                      className="border-b border-[#1a1a1a] last:border-0"
                    >
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
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </motion.div>

            <Reveal>
              <p className="mt-8 text-lg text-white font-medium leading-relaxed">
                Same job. Done better, for free, on every website — with no paper trail.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section id="faq" className="relative z-10 border-t border-[#1a1a1a]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
            <Reveal variants={fadeLeft}>
              <Eyebrow>✦ FAQ</Eyebrow>
              <h2
                className="text-3xl sm:text-4xl font-semibold text-white mb-10 leading-tight"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                Questions about v3.
              </h2>
            </Reveal>
            <motion.div
              className="border-t border-[#1a1a1a]"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {V3_FAQ.map((item) => (
                <motion.div key={item.q} variants={fadeUp} className="py-7 border-b border-[#1a1a1a]">
                  <h3 className="text-base font-semibold text-white mb-3">{item.q}</h3>
                  <p className="text-sm text-[#a0a0a0] leading-relaxed">{item.a}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section className="relative z-10 border-t border-[#1a1a1a]">
          <Reveal variants={scaleIn} amount={0.4}>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
              <h2
                className="text-4xl sm:text-5xl font-semibold text-white mb-6 leading-tight"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                Type like a human on every website.
              </h2>
              <p className="text-[#a0a0a0] text-base leading-relaxed max-w-xl mx-auto mb-10">
                Free, open-source, and cross-browser. No account, no OAuth, no subscription.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" size="lg" href="https://extension.dripwriter.org" external>
                  Install Dripwriter Origin v3
                  <ArrowRight size={18} />
                </Button>
                <Button variant="outline" size="lg" href="https://github.com/alexey-max-fedorov/dripwriter-origin" external>
                  View the source
                </Button>
              </div>
              <p className="mt-8 text-sm text-[#a0a0a0]">
                New here?{" "}
                <Link href="/" className="text-[#c9a84c] hover:underline">
                  See what Dripwriter Origin does
                </Link>{" "}
                or read the{" "}
                <Link href="/ai" className="text-[#c9a84c] hover:underline">
                  AI integration guide
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </MotionConfig>
  );
}
