"use client";

import { useState, useCallback, ReactNode } from "react";
import Image from "next/image";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// ─── logos ──────────────────────────────────────────────────────────────────

function LogoDripwriter() {
  return (
    <Image src="/logo.png" alt="Dripwriter Origin" width={36} height={36} className="rounded-md" />
  );
}

function LogoClaude() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9" fill="#D97757">
      <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
    </svg>
  );
}

function LogoCursor() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 1024 1024" role="img" aria-label="Browser cursor icon">
      <defs>
        <filter id="ai-softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.45" />
        </filter>
        <filter id="ai-lineWobble" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="1" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      {/* transparent background — removed fill="#030303" rect */}
      <g filter="url(#ai-softShadow)">
        <path d="M121 62H960V888H121Z" fill="#1d1d1a" opacity="0.85" />
        <path d="M116 879 C225 879 315 882 415 879 C570 874 739 879 949 878 C951 716 951 563 952 398 C952 311 955 238 957 184 C927 183 895 183 861 184" fill="none" stroke="#fffdf4" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" filter="url(#ai-lineWobble)" />
        <path d="M860 187C889 188 918 188 949 189V259C915 257 887 257 859 258" fill="none" stroke="#fffdf4" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" filter="url(#ai-lineWobble)" />
      </g>
      <g filter="url(#ai-softShadow)">
        <path d="M32 145 C154 145 236 143 344 146 C500 150 628 144 762 145 C800 145 829 146 856 147 L857 754 C715 752 604 752 491 753 C348 756 198 754 32 754Z" fill="#cf7a59" />
        <path d="M35 84 C151 85 221 91 337 87 C488 86 595 89 728 84 C777 82 812 83 858 84 C864 84 865 91 865 99 L866 144 C761 143 648 143 528 145 C405 147 290 147 167 146 C110 146 69 147 35 148Z" fill="#171715" />
        <path d="M36 88 C114 86 164 91 226 86 C342 82 453 89 566 85 C650 82 728 80 858 82 C869 82 870 93 870 104 L870 146 C760 144 651 144 529 146 C407 148 286 148 165 147 C104 147 66 148 34 150 M35 88 C28 112 31 130 32 149" fill="none" stroke="#fffdf4" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" filter="url(#ai-lineWobble)" />
        <path d="M34 148 C132 149 226 148 324 147 C469 146 612 145 758 145 C800 145 835 145 866 146" fill="none" stroke="#fffdf4" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" filter="url(#ai-lineWobble)" />
      </g>
      <g filter="url(#ai-softShadow)">
        <path d="M103 743 C99 779 101 818 104 848 C166 850 232 849 295 849 C348 849 396 856 451 854 C589 850 714 854 856 853 C895 853 928 853 958 853" fill="none" stroke="#fffdf4" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" filter="url(#ai-lineWobble)" />
        <path d="M956 259 C961 332 960 429 959 536 C958 655 958 761 958 854" fill="none" stroke="#fffdf4" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" filter="url(#ai-lineWobble)" />
      </g>
      <g filter="url(#ai-softShadow)">
        <path d="M282 318 C318 411 354 526 397 648 C409 619 420 587 431 555 C470 579 505 605 539 627 C556 599 572 570 589 541 C558 519 526 498 493 475 C532 448 570 421 609 390 C511 370 392 344 282 318Z" fill="#cf7a59" stroke="#fffdf4" strokeWidth="23" strokeLinecap="round" strokeLinejoin="round" filter="url(#ai-lineWobble)" />
      </g>
    </svg>
  );
}

function LogoApi() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
      <rect x="1.5" y="1.5" width="45" height="45" rx="11" stroke="#c9a84c" strokeWidth="1.5" />
      {/* toggle track */}
      <rect x="9" y="19" width="30" height="10" rx="5" stroke="#c9a84c" strokeWidth="1.5" />
      {/* toggle knob — on position (right) */}
      <circle cx="33" cy="24" r="4" fill="#c9a84c" />
      {/* small label dots */}
      <circle cx="15" cy="24" r="1.5" fill="#c9a84c" opacity="0.4" />
      {/* API text */}
      <text x="24" y="40" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#c9a84c" letterSpacing="1">API</text>
    </svg>
  );
}

function LogoGoogleDocs() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
      <path d="M14.727 6.727H14V0H4.91c-.905 0-1.637.732-1.637 1.636v20.728c0 .904.732 1.636 1.636 1.636h14.182c.904 0 1.636-.732 1.636-1.636V6.727h-6zm-.545 10.455H7.09v-1.364h7.09v1.364zm2.727-3.273H7.091v-1.364h9.818v1.364zm0-3.273H7.091V9.273h9.818v1.363zM14.727 6h6l-6-6v6z" fill="#4285F4" />
    </svg>
  );
}

// ─── copy button ─────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button
      onClick={handle}
      aria-label="Copy to clipboard"
      className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
    >
      {copied ? <Check size={12} className="text-[#c9a84c]" /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─── code block ──────────────────────────────────────────────────────────────

function CodeBlock({ text, scrollable }: { text: string; scrollable?: boolean }) {
  return (
    <div className="relative my-3 rounded-lg border border-[#1a1a1a] bg-[#060606] overflow-hidden">
      <div className="flex items-center justify-end border-b border-[#1a1a1a] px-3 py-1.5">
        <CopyButton text={text} />
      </div>
      <pre
        className={[
          "px-4 py-3 text-sm font-mono text-[#c9a84c] leading-relaxed",
          scrollable ? "max-h-72 overflow-y-auto whitespace-pre" : "overflow-x-auto whitespace-pre",
        ].join(" ")}
      >
        {text}
      </pre>
    </div>
  );
}

// ─── step card ───────────────────────────────────────────────────────────────

function StepCard({
  step,
  logo,
  title,
  children,
}: {
  step: string;
  logo: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-5 sm:gap-6 bg-[#080808] border border-[#1a1a1a] rounded-xl p-5 sm:p-7">
      <div className="flex-shrink-0 flex flex-col items-center gap-2 pt-0.5">
        <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-black border border-[#222]">
          {logo}
        </div>
        <span className="text-[10px] font-mono text-[#c9a84c] tracking-[0.2em]">{step}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3
          className="text-lg font-semibold text-white mb-3 leading-snug"
          style={{ fontFamily: "var(--font-playfair-display)" }}
        >
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

// ─── instruction line ────────────────────────────────────────────────────────

function Instruction({ children }: { children: ReactNode }) {
  return <p className="text-sm text-[#a0a0a0] leading-relaxed mb-1">{children}</p>;
}

// ─── strings ─────────────────────────────────────────────────────────────────

const SHORTCUT_URL =
  "chrome-extension://fcoeoabgfenejglbffodgkkbkcdhcgfn/options.html#prompts";

const SHORTCUT_NAME = "/dripwriter";

const DRIPWRITER_PROMPT =
  "You have access to **Dripwriter Origin**, a browser extension that types text into Google Docs the way a human would: jittery speed, occasional neighbor-key typos, false-start words that get deleted, and short breaks every minute or so.\n" +
  "\n" +
  "You interact with it using your **built-in JavaScript execution tool** — the tool that lets you run a script in the active browser tab. Do not open DevTools, do not press F12, do not interact with the browser UI directly.\n" +
  "\n" +
  "On any open Google Docs document tab, with the extension's **Enable API mode** toggle turned on, the page exposes a global object:\n" +
  "\n" +
  "```js\n" +
  "window._dripwriter\n" +
  "```\n" +
  "\n" +
  "### Capabilities\n" +
  "\n" +
  "| Member | Type | Behavior |\n" +
  "|--------|------|----------|\n" +
  "| `config` | mutable object | Settings snapshotted at `start()` time. See fields below. |\n" +
  "| `start()` | `() => Promise<void>` | Begins typing. Resolves when typing finishes; rejects on error or cancellation. |\n" +
  "| `stop()` | `() => Promise<void>` | Cancels the active run. |\n" +
  "| `test()` | `() => Promise<void>` | Runs a diagnostic matrix (8 input strategies). Use only when debugging. |\n" +
  "| `status()` | `() => Promise<{ running: boolean, detail: string }>` | One-shot snapshot. **Do not poll in a loop.** |\n" +
  "| `version` | `string` | Extension semver. |\n" +
  "\n" +
  "### `config` fields (mutate directly, then call `start()`)\n" +
  "\n" +
  "| Field | Default | Valid range at `start()` |\n" +
  "|-------|---------|---------------------------|\n" +
  "| `text` | `\"\"` | non-empty trimmed string |\n" +
  "| `wpm` | `60` | `20`–`150` |\n" +
  "| `speedVariance` | `30` | `0`–`80` (%) |\n" +
  "| `typoRate` | `3` | `0`–`30` (%) |\n" +
  "| `detourRate` | `3` | `0`–`25` (%) |\n" +
  "| `breakFrequencySeconds` | `55` | `10`–`600` |\n" +
  "| `breakFrequencyVariance` | `30` | `0`–`100` (%) |\n" +
  "| `breakMinSeconds` | `3` | `3`–`60` |\n" +
  "| `breakMaxSeconds` | `15` | `breakMinSeconds`–`90` |\n" +
  "\n" +
  "Out-of-range values are clamped at `start()` time, not on assignment.\n" +
  "\n" +
  "### Rules of use\n" +
  "\n" +
  "1. **`await start()`.** It resolves on natural completion. Do not poll `status()` in a loop.\n" +
  "2. **Snapshot the text into `config.text` BEFORE calling `start()`.** Mutations after `start()` do not affect the in-flight run.\n" +
  "3. **Check that you are on a Google Docs document URL** (`https://docs.google.com/document/...`) before touching `_dripwriter`. Use your JavaScript execution tool to read `location.href`. On any other URL, `_dripwriter` will be `undefined`.\n" +
  "4. **Check that `window._dripwriter` exists.** If it's `undefined`, the user has not enabled API mode in the popup. Surface this to the user: *\"Open the Dripwriter popup and enable API mode.\"*\n" +
  "5. **Ensure the cursor is inside the document body** before calling `start()`. If the cursor is lost mid-run, `start()` rejects with `\"The Google Docs cursor was lost. Click back into the document and retry.\"` — surface this verbatim.\n" +
  "6. **Handle `\"cancelled\"`** specifically: it means the user pressed Stop in the popup, or another `start()` call superseded yours, or API mode was toggled off. This is a *user action*, not an error — handle it gracefully (don't retry).\n" +
  "7. **Handle `\"Dripwriter API mode was disabled.\"`** by stopping further work; the user explicitly opted out.\n" +
  "8. **Never call `_dripwriter.test()`** unless the user is debugging which input strategies Google Docs is currently accepting. It writes diagnostic markers `AAA`–`HHH` into the document.";

const EXAMPLE_PROMPT =
  "/dripwriter\nUse dripwriter to type 2 sentences about what GDP is in the Part A Response box, then type 2 sentences about what checking accounts are in the Part B response box. Make sure to verify you click the cursor inside the Part B response box after Part A is done.";

// ─── page ────────────────────────────────────────────────────────────────────

export default function AiGuide() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-black">
        {/* hero */}
        <div className="relative pt-40 pb-16 text-center px-4">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10">
            <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.3em] uppercase mb-6">
              ✦ Setup Guide
            </p>
            <h1
              className="text-5xl sm:text-6xl font-semibold text-white mb-5 leading-tight"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              Dripwriter{" "}
              <span className="text-[#c9a84c]">+ AI</span>
            </h1>
            <p className="text-[#a0a0a0] text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
              Let Claude type for you — human-like, straight into Google Docs.
            </p>
          </div>
        </div>

        {/* steps */}
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pb-28 flex flex-col gap-3">
          {/* ── step 1 ── */}
          <StepCard step="01" logo={<LogoDripwriter />} title="Install Dripwriter Origin">
            <Instruction>Get the extension that powers human-like typing in Google Docs.</Instruction>
            <div className="mt-4">
              <a
                href="https://extension.dripwriter.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#c9a84c] text-black text-sm font-semibold rounded-md hover:bg-[#d4b65e] transition-colors cursor-pointer"
              >
                Install Extension
                <ExternalLink size={13} />
              </a>
            </div>
          </StepCard>

          {/* ── step 2 ── */}
          <StepCard step="02" logo={<LogoClaude />} title="Install Claude in Chrome">
            <Instruction>Add Claude&rsquo;s official Chrome extension to your browser.</Instruction>
            <div className="mt-4 flex flex-col gap-3">
              <a
                href="https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#c9a84c] text-black text-sm font-semibold rounded-md hover:bg-[#d4b65e] transition-colors cursor-pointer w-fit"
              >
                Add to Chrome
                <ExternalLink size={13} />
              </a>
              <p className="text-xs text-[#555] leading-relaxed">
                Requires a paid Claude plan — e.g. Claude Pro at $20/month.
              </p>
            </div>
          </StepCard>

          {/* ── step 3 ── */}
          <StepCard step="03" logo={<LogoCursor />} title="Add the Dripwriter Origin Skill to Claude">
            <Instruction>
              Copy the URL below and paste it directly in your address bar to open Claude&rsquo;s Shortcuts page.
            </Instruction>
            <CodeBlock text={SHORTCUT_URL} />

            <Instruction>
              Click <strong className="text-white font-medium">+ Create shortcut</strong>, set the name to:
            </Instruction>
            <CodeBlock text={SHORTCUT_NAME} />

            <Instruction>Paste this prompt into the prompt field:</Instruction>
            <CodeBlock text={DRIPWRITER_PROMPT} scrollable />

            <Instruction>Leave everything else blank and click <strong className="text-white font-medium">Create shortcut</strong>.</Instruction>
          </StepCard>

          {/* ── step 4 ── */}
          <StepCard step="04" logo={<LogoApi />} title="Enable API Mode">
            <Instruction>Reload your Google Doc tab, open the Dripwriter Origin extension, scroll to the bottom, and toggle <strong className="text-white font-medium">Enable API mode</strong>.</Instruction>
          </StepCard>

          {/* ── step 5 ── */}
          <StepCard step="05" logo={<LogoGoogleDocs />} title="Use Dripwriter Origin with Claude">
            <Instruction>
              Click the Claude in Chrome extension and give it a natural-language instruction using{" "}
              <code className="text-[#c9a84c] font-mono text-xs bg-[#0a0a0a] border border-[#1a1a1a] rounded px-1.5 py-0.5">
                /dripwriter
              </code>
              .
            </Instruction>
            <p className="text-xs text-[#555] mb-1 mt-4">Example</p>
            <CodeBlock text={EXAMPLE_PROMPT} />
          </StepCard>
        </div>
      </main>
      <Footer />
    </>
  );
}
