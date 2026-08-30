import Link from "next/link";
import { Check, X, ArrowRight, Globe, Layers, Boxes, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

// Single source of truth for the FAQ — also consumed by the page's FAQPage JSON-LD.
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

// Comparison rows. `origin` and `rival` are the cell text; `originWins` drives the icon.
const COMPARE: { feature: string; origin: string; rival: string; originWins: boolean }[] = [
  { feature: "Price", origin: "Free forever (noncommercial)", rival: "$15 / month", originWins: true },
  { feature: "Works on", origin: "Any website — Docs, Canvas, Packback, any text box", rival: "Google Docs only", originWins: true },
  { feature: "Account / sign-in", origin: "None — no login, no OAuth", rival: "Requires OAuth into your Google account", originWins: true },
  { feature: "Permission paper trail", origin: "None to authorize into your school account", rival: "OAuth grant sits in your Google account", originWins: true },
  { feature: "Configurable cadence", origin: "Speed, typos, false starts, breaks — all adjustable", rival: "Not configurable", originWins: true },
  { feature: "Open source", origin: "Yes — auditable on GitHub", rival: "No — closed source", originWins: true },
  { feature: "Cross-origin iframes (e.g. Packback)", origin: "Yes", rival: "No", originWins: true },
  { feature: "Telemetry", origin: "None — runs entirely in your browser", rival: "—", originWins: true }
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.3em] uppercase mb-6">
      {children}
    </p>
  );
}

export default function V3Launch() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-black">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] rounded-full blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(201,168,76,0.09) 0%, transparent 70%)" }}
          />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-40 pb-20 text-center">
            <Eyebrow>✦ Dripwriter Origin v3 · Now cross-platform</Eyebrow>
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-white mb-6"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              Now on every website.
            </h1>
            <p className="text-[#a0a0a0] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              Dripwriter Origin v3 types your text into Google Docs, Canvas, Packback, and
              virtually any text box on any site — with the same human cadence: real typos,
              deleted false starts, and short breaks. Free, open-source, and no account required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" href="https://extension.dripwriter.org" external>
                Install the extension
                <ArrowRight size={18} />
              </Button>
              <Button variant="outline" size="lg" href="#compare">
                See how it compares
              </Button>
            </div>
            <p className="mt-6 text-xs text-[#666] tracking-wide">
              Free for noncommercial use · Chrome, Edge &amp; Firefox · Updated August 29, 2026
            </p>
          </div>
        </section>

        {/* ── What's new ───────────────────────────────────────── */}
        <section id="whats-new" className="border-t border-[#1a1a1a]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {WHATS_NEW.map((f) => (
                <div key={f.title} className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-6">
                  <div className="text-[#c9a84c] mb-4">{f.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-[#a0a0a0] leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section id="how" className="border-t border-[#1a1a1a]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
            <Eyebrow>✦ How it works</Eyebrow>
            <h2
              className="text-3xl sm:text-4xl font-semibold text-white mb-8 leading-tight"
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
        </section>

        {/* ── Where it works ───────────────────────────────────── */}
        <section id="where" className="border-t border-[#1a1a1a]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            <Eyebrow>✦ Where it works</Eyebrow>
            <h2
              className="text-3xl sm:text-4xl font-semibold text-white mb-12 leading-tight"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              One extension, every editable surface.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {WHERE_IT_WORKS.map((p) => (
                <div key={p.name} className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-6">
                  <h3 className="text-base font-semibold text-white mb-1">{p.name}</h3>
                  <p className="text-sm text-[#a0a0a0] leading-relaxed">{p.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-[#666] leading-relaxed max-w-2xl">
              Native desktop apps like Microsoft Word for Windows aren&apos;t supported — they aren&apos;t
              web pages, so there&apos;s no text field in the browser for the extension to reach.
            </p>
          </div>
        </section>

        {/* ── Comparison / the flame ───────────────────────────── */}
        <section id="compare" className="border-t border-[#1a1a1a]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
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
              your Google account — leaving a permission paper trail on your school login. Here&apos;s
              the head-to-head.
            </p>

            <div className="overflow-x-auto rounded-xl border border-[#1a1a1a]">
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
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section id="faq" className="border-t border-[#1a1a1a]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
            <Eyebrow>✦ FAQ</Eyebrow>
            <h2
              className="text-3xl sm:text-4xl font-semibold text-white mb-10 leading-tight"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              Questions about v3.
            </h2>
            <div className="border-t border-[#1a1a1a]">
              {V3_FAQ.map((item) => (
                <div key={item.q} className="py-7 border-b border-[#1a1a1a]">
                  <h3 className="text-base font-semibold text-white mb-3">{item.q}</h3>
                  <p className="text-sm text-[#a0a0a0] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section className="border-t border-[#1a1a1a]">
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
        </section>
      </main>
      <Footer />
    </>
  );
}
