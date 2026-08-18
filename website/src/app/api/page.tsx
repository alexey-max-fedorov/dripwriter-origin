import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Console API — Dripwriter Origin",
  description:
    "Dripwriter Origin exposes a scriptable window._dripwriter API on Google Docs tabs when API mode is enabled. Drive the typing engine from DevTools or an AI agent.",
  alternates: { canonical: "https://dripwriter.org/api" }
};

const configFields = [
  { field: "text", type: "string", default: '""', range: "non-empty (trimmed)", notes: "Required for start(). \\r\\n normalized to \\n." },
  { field: "wpm", type: "number", default: "60", range: "20–150", notes: "Base typing speed (words per minute, 5 chars/word)." },
  { field: "speedVariance", type: "number", default: "30", range: "0–80", notes: "Per-character speed jitter, percent." },
  { field: "typoRate", type: "number", default: "3", range: "0–30", notes: "Probability of a neighbor-key typo per letter, percent." },
  { field: "detourRate", type: "number", default: "3", range: "0–25", notes: 'Probability of a "false start" word at the start of a word, then deleting it.' },
  { field: "breakFrequencySeconds", type: "number", default: "55", range: "10–600", notes: "Average active-typing seconds between idle breaks." },
  { field: "breakFrequencyVariance", type: "number", default: "30", range: "0–100", notes: "Percent jitter applied to breakFrequencySeconds." },
  { field: "breakMinSeconds", type: "number", default: "3", range: "3–60", notes: "Minimum idle-break duration." },
  { field: "breakMaxSeconds", type: "number", default: "15", range: "breakMinSeconds–90", notes: "Maximum idle-break duration. Raised to breakMinSeconds if lower." }
];

const methods = [
  { name: "start()", returns: "Promise<void>", behavior: "Begins typing; resolves when complete; rejects on error or cancellation." },
  { name: "stop()", returns: "Promise<void>", behavior: "Cancels the active run; resolves once acknowledged." },
  { name: "test()", returns: "Promise<void>", behavior: "Runs the input-event diagnostic matrix (~10 seconds); resolves when all 8 methods have been tried." },
  { name: "status()", returns: "Promise<{ running: boolean, detail: string }>", behavior: "Returns a snapshot of the current run state." },
  { name: "version", returns: "string", behavior: "Read-only. Extension semver, e.g. \"2.1.0\"." }
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 overflow-x-auto my-4">
      <code className="text-sm font-mono text-[#c9a84c] leading-relaxed whitespace-pre">
        {children}
      </code>
    </pre>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-semibold text-white mt-14 mb-4" style={{ fontFamily: "var(--font-playfair-display)" }}>
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-white mt-8 mb-2">
      {children}
    </h3>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-[#a0a0a0] leading-relaxed">
      {children}
    </p>
  );
}

function InlineCode({ children }: { children: string }) {
  return (
    <code className="text-[#c9a84c] font-mono text-[0.85em] bg-[#0a0a0a] border border-[#1a1a1a] rounded px-1.5 py-0.5">
      {children}
    </code>
  );
}

export default function ApiPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-black">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)"
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-40 pb-24">
          <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.3em] uppercase mb-6">
            ✦ Developer
          </p>

          <h1
            className="text-4xl sm:text-5xl font-semibold text-white mb-4 leading-tight"
            style={{ fontFamily: "var(--font-playfair-display)" }}
          >
            Console API
          </h1>

          <p className="text-[#a0a0a0] text-base sm:text-lg leading-relaxed mb-12">
            When API mode is enabled, Dripwriter Origin exposes <InlineCode>window._dripwriter</InlineCode> on
            every open Google Docs tab — the same typing engine that powers the popup,
            scriptable from DevTools or an AI agent running in the page.
          </p>

          <div className="border-t border-[#1a1a1a] pt-2">

            {/* Enabling */}
            <SectionHeading>Enabling</SectionHeading>
            <ol className="list-decimal list-inside space-y-2 text-sm text-[#a0a0a0] leading-relaxed">
              <li>Open the Dripwriter Origin popup.</li>
              <li>Toggle <span className="text-white font-medium">Enable API mode</span> at the bottom of the popup.</li>
              <li>The API is now active on every currently-open Google Docs tab. No reload required.</li>
            </ol>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mt-4">
              Toggling off removes <InlineCode>window._dripwriter</InlineCode> from every Docs tab
              immediately. Any in-flight <InlineCode>start()</InlineCode> Promises reject with{" "}
              <InlineCode>"Dripwriter API mode was disabled."</InlineCode>
            </p>

            {/* Quick example */}
            <SectionHeading>Quick example</SectionHeading>
            <CodeBlock>{`_dripwriter.config.text = "Hello from the console.";
await _dripwriter.start();`}</CodeBlock>
            <Prose>
              After <InlineCode>await _dripwriter.start()</InlineCode> resolves, typing is complete
              and the cursor is positioned at the end of the inserted text.
            </Prose>

            {/* Config */}
            <SectionHeading>_dripwriter.config</SectionHeading>
            <Prose>
              A plain, mutable object. Assign fields directly — out-of-range values are accepted
              at assignment time and clamped only when <InlineCode>start()</InlineCode> is called.
            </Prose>
            <CodeBlock>{`_dripwriter.config.text = "Paste your draft here.";
_dripwriter.config.wpm = 90;                   // 20–150
_dripwriter.config.speedVariance = 25;         // 0–80 (%)
_dripwriter.config.typoRate = 4;               // 0–30 (%)
_dripwriter.config.detourRate = 2;             // 0–25 (%)
_dripwriter.config.breakFrequencySeconds = 60; // 10–600
_dripwriter.config.breakFrequencyVariance = 30; // 0–100 (%)
_dripwriter.config.breakMinSeconds = 3;        // 3–60
_dripwriter.config.breakMaxSeconds = 12;       // breakMinSeconds–90`}</CodeBlock>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    <th className="text-left text-xs font-semibold text-white pb-3 pr-4 w-48">Field</th>
                    <th className="text-left text-xs font-semibold text-white pb-3 pr-4 w-20">Default</th>
                    <th className="text-left text-xs font-semibold text-white pb-3 pr-4 w-28">Valid range</th>
                    <th className="text-left text-xs font-semibold text-white pb-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {configFields.map((f) => (
                    <tr key={f.field} className="border-b border-[#1a1a1a]">
                      <td className="py-3 pr-4 font-mono text-[#c9a84c] text-xs align-top">{f.field}</td>
                      <td className="py-3 pr-4 text-[#a0a0a0] font-mono text-xs align-top">{f.default}</td>
                      <td className="py-3 pr-4 text-[#a0a0a0] text-xs align-top whitespace-nowrap">{f.range}</td>
                      <td className="py-3 text-[#a0a0a0] text-xs leading-relaxed align-top">{f.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Methods */}
            <SectionHeading>Methods</SectionHeading>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    <th className="text-left text-xs font-semibold text-white pb-3 pr-4 w-36">Method</th>
                    <th className="text-left text-xs font-semibold text-white pb-3 pr-4 w-48">Returns</th>
                    <th className="text-left text-xs font-semibold text-white pb-3">Behavior</th>
                  </tr>
                </thead>
                <tbody>
                  {methods.map((m) => (
                    <tr key={m.name} className="border-b border-[#1a1a1a]">
                      <td className="py-3 pr-4 font-mono text-[#c9a84c] text-xs align-top">{m.name}</td>
                      <td className="py-3 pr-4 text-[#a0a0a0] font-mono text-xs align-top">{m.returns}</td>
                      <td className="py-3 text-[#a0a0a0] text-xs leading-relaxed align-top">{m.behavior}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubHeading>start()</SubHeading>
            <Prose>
              Begins a typing run using a <strong className="text-white font-medium">snapshot</strong> of{" "}
              <InlineCode>_dripwriter.config</InlineCode> at the moment of the call. Mutating config
              after <InlineCode>start()</InlineCode> has no effect on the in-flight run. If a previous
              run is in progress it is stopped first — that run rejects with{" "}
              <InlineCode>"cancelled"</InlineCode>. A 3-second countdown precedes every run.
            </Prose>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mt-3">
              <strong className="text-white font-medium">Rejects when:</strong> text is empty ·
              Google Docs cursor is lost · run is cancelled · API mode is disabled mid-run.
              Popup-initiated runs are <em>not</em> stopped when API mode is disabled.
            </p>

            <SubHeading>stop()</SubHeading>
            <Prose>
              Cancels the active run. Resolves with <InlineCode>undefined</InlineCode> once
              acknowledged — even if no run was active. Any pending{" "}
              <InlineCode>start()</InlineCode> or <InlineCode>test()</InlineCode> Promise rejects
              with <InlineCode>"cancelled"</InlineCode>.
            </Prose>

            <SubHeading>test()</SubHeading>
            <Prose>
              Dispatches 8 different input-event strategies into the document at ~900 ms intervals,
              labelled <InlineCode>AAA</InlineCode> through <InlineCode>HHH</InlineCode>. Use it to
              identify which event types Google Docs is currently accepting. Resolves after ~10 seconds.
            </Prose>

            <SubHeading>status()</SubHeading>
            <Prose>
              Returns a snapshot — not a subscription. For waiting on completion, use{" "}
              <InlineCode>await _dripwriter.start()</InlineCode>; don't poll{" "}
              <InlineCode>status()</InlineCode> in a loop.
            </Prose>

            {/* Error handling */}
            <SectionHeading>Error handling</SectionHeading>
            <CodeBlock>{`try {
  _dripwriter.config.text = draft;
  await _dripwriter.start();
  console.log("Typed successfully.");
} catch (err) {
  if (err.message === "cancelled") {
    console.log("User stopped the run.");
  } else {
    console.error("Typing failed:", err.message);
  }
}`}</CodeBlock>

            {/* Lifecycle */}
            <SectionHeading>Lifecycle</SectionHeading>
            <ul className="list-disc list-inside space-y-2 text-sm text-[#a0a0a0] leading-relaxed">
              <li>
                The API is only available on tabs matching{" "}
                <InlineCode>https://docs.google.com/document/*</InlineCode>.
              </li>
              <li>
                Calling <InlineCode>start()</InlineCode> while another run is in progress stops
                the previous run before starting the new one.
              </li>
              <li>
                A popup-driven stop will reject any pending API-driven{" "}
                <InlineCode>start()</InlineCode> Promise with <InlineCode>"cancelled"</InlineCode>.
              </li>
            </ul>

            {/* For AI agents */}
            <SectionHeading>For AI agents</SectionHeading>
            <ol className="list-decimal list-inside space-y-3 text-sm text-[#a0a0a0] leading-relaxed">
              <li>
                Always <InlineCode>await</InlineCode> <InlineCode>start()</InlineCode>. The Promise
                resolves on natural completion — don&apos;t poll <InlineCode>status()</InlineCode>.
              </li>
              <li>
                Snapshot the text into <InlineCode>config.text</InlineCode> before calling{" "}
                <InlineCode>start()</InlineCode>. Mutating it mid-run has no effect.
              </li>
              <li>
                If the cursor isn&apos;t in the editable area, typing fails with{" "}
                <InlineCode>"The Google Docs cursor was lost. Click back into the document and retry."</InlineCode>{" "}
                — surface this to the user.
              </li>
            </ol>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
