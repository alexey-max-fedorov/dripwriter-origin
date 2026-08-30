"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  MotionConfig,
  type Variants
} from "framer-motion";
import { Check, X, Globe, Layers, Boxes, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { InstallButton } from "@/components/ui/InstallButton";
import { MockCrossPlatform } from "@/components/ui/MockCrossPlatform";
import { V3_FAQ } from "@/components/sections/v3-content";

const EASE = [0.25, 0.1, 0.25, 1] as const;
const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }
};

/**
 * A full-height slide. As the section crosses the viewport it scales up and
 * fades to full focus at center, then recedes and dims on the way out — so one
 * section is spotlit at a time. Paired with CSS scroll-snap, scrolling advances
 * from one focused slide to the next. Reduced-motion users get a static block.
 */
function FocusSection({
  id,
  children,
  className
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.2, 1, 1, 0.2]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.92, 1, 1, 0.92]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [48, 0, -48]);

  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        "snap-start min-h-screen flex flex-col justify-center border-t border-[#1a1a1a] relative z-10 py-24",
        className
      )}
    >
      <motion.div style={reduce ? undefined : { opacity, scale, y }}>{children}</motion.div>
    </section>
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

  // Scope scroll-snap to this page, and only when motion is welcome.
  useEffect(() => {
    if (reduce) return;
    const el = document.documentElement;
    el.classList.add("v3-snap");
    return () => el.classList.remove("v3-snap");
  }, [reduce]);

  // Window scroll drives the progress bar and the parallax glows.
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
      <main className="relative min-h-screen bg-black overflow-hidden">
        {/* Parallax background layers (fixed so they drift behind every slide) */}
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

        {/* ── Slide 1 · Hero ───────────────────────────────────── */}
        <section
          id="main-content"
          className="snap-start min-h-screen flex flex-col justify-center relative z-10 px-4 sm:px-6"
        >
          <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
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
                className="text-[#a0a0a0] text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-10"
              >
                It used to be Google Docs only. Now it types like a human into Canvas, Packback, and
                any text box on the web. Free, no account.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <InstallButton variant="primary" size="lg" showArrow />
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
          <span className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#555] text-xs tracking-[0.3em] uppercase animate-pulse">
            Scroll ↓
          </span>
        </section>

        {/* ── Slide 2 · What's new ─────────────────────────────── */}
        <FocusSection id="whats-new">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Eyebrow>✦ What&apos;s new in v3</Eyebrow>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-4 leading-tight"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              The typing you know, everywhere you write.
            </h2>
            <p className="text-[#a0a0a0] text-base leading-relaxed max-w-2xl mb-12">
              v2 mastered Google Docs. v3 keeps that engine and adds a universal one, so the same
              believable keystrokes land in any editor on the web.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {WHATS_NEW.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-sm p-6 transition-colors hover:border-[#2a2a2a]"
                >
                  <div className="text-[#c9a84c] mb-4">{f.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-[#a0a0a0] leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </FocusSection>

        {/* ── Slide 3 · How it works ───────────────────────────── */}
        <FocusSection id="how">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Eyebrow>✦ How it works</Eyebrow>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-10 leading-tight"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              Paste, click, press Start.
            </h2>
            <ol className="space-y-6">
              {[
                "Paste your text into the Dripwriter Origin popup and set your speed, typo rate, false-start rate, and break timing.",
                "Click into any text box — a Google Doc, a Canvas assignment, the Packback editor, or any textarea or contenteditable field.",
                "Press Start. Dripwriter Origin detects the editor and types character by character, confirming each keystroke landed before moving on."
              ].map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full border border-[#c9a84c] text-[#c9a84c] text-sm font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-[#a0a0a0] text-base leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </FocusSection>

        {/* ── Slide 4 · Where it works ─────────────────────────── */}
        <FocusSection id="where">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Eyebrow>✦ Where it works</Eyebrow>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-12 leading-tight"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              One extension, every editable surface.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {WHERE_IT_WORKS.map((p) => (
                <div
                  key={p.name}
                  className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-sm p-6"
                >
                  <h3 className="text-base font-semibold text-white mb-1">{p.name}</h3>
                  <p className="text-sm text-[#a0a0a0] leading-relaxed">{p.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-[#666] leading-relaxed max-w-2xl">
              Native desktop apps like Microsoft Word for Windows aren&apos;t supported — they
              aren&apos;t web pages, so there&apos;s no text field in the browser for the extension
              to reach.
            </p>
          </div>
        </FocusSection>

        {/* ── Slide 5 · Comparison / the flame ─────────────────── */}
        <FocusSection id="compare">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Eyebrow>✦ Dripwriter Origin vs. Dripwriter.com</Eyebrow>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-4 leading-tight"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              Free and everywhere vs. $15 a month and Docs only.
            </h2>
            <p className="text-[#a0a0a0] text-base leading-relaxed mb-10">
              Dripwriter Origin is a free, open-source extension that types like a human on any
              website. The commercial Dripwriter service at Dripwriter.com charges $15 per month,
              works only in Google Docs, isn&apos;t configurable, and makes you authorize it into
              your Google account — leaving a permission paper trail on your school login.
            </p>

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

            <p className="mt-8 text-lg text-white font-medium leading-relaxed">
              Same job. Done better, for free, on every website — with no paper trail.
            </p>
          </div>
        </FocusSection>

        {/* ── Slide 6 · FAQ ────────────────────────────────────── */}
        <FocusSection id="faq">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <Eyebrow>✦ FAQ</Eyebrow>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-10 leading-tight"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              Questions about v3.
            </h2>
            <div className="border-t border-[#1a1a1a]">
              {V3_FAQ.map((item) => (
                <div key={item.q} className="py-6 border-b border-[#1a1a1a]">
                  <h3 className="text-base font-semibold text-white mb-2">{item.q}</h3>
                  <p className="text-sm text-[#a0a0a0] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </FocusSection>

        {/* ── Slide 7 · Final CTA ──────────────────────────────── */}
        <section className="snap-start min-h-screen flex flex-col justify-center border-t border-[#1a1a1a] relative z-10 py-24">
          <motion.div
            className="max-w-3xl mx-auto px-4 sm:px-6 text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              Type like a human on every website.
            </h2>
            <p className="text-[#a0a0a0] text-base leading-relaxed max-w-xl mx-auto mb-10">
              Free, open-source, and cross-browser. No account, no OAuth, no subscription.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <InstallButton variant="primary" size="lg" showArrow />
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
          </motion.div>
        </section>
      </main>
      <Footer />
    </MotionConfig>
  );
}
