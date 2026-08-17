import { SectionHeading } from "@/components/ui/SectionHeading";

const faqs = [
  {
    q: "What is Dripwriter Origin?",
    a: "Dripwriter Origin is a free, open-source browser extension that types pasted text into Google Docs with adjustable speed, keyboard-neighbor typos that auto-correct, occasional false-start words, and configurable short breaks. The result reads like a person typing live, not a script pasting in one shot."
  },
  {
    q: "Is Dripwriter Origin free?",
    a: "Yes — Dripwriter Origin is free for all noncommercial use under the Dripwriter Origin License, and the source is open on GitHub. Commercial use requires a separate license; open an issue at github.com/alexey-max-fedorov/dripwriter-origin/issues."
  },
  {
    q: "Which browsers does Dripwriter Origin support?",
    a: "Dripwriter Origin works in Chrome, Microsoft Edge, and Firefox. The build pipeline ships both Chrome MV3 and Firefox MV3 packages, and extension.dripwriter.org routes you to the right store for your browser."
  },
  {
    q: "Can I use Dripwriter Origin on a school or work network?",
    a: "Dripwriter Origin runs entirely inside your browser with no external servers to call and no telemetry, so there is nothing for a network filter to block once the extension is installed. If your browser can open the extension store and your Google Doc, Dripwriter Origin works."
  },
  {
    q: "Does Dripwriter Origin work with AI like Claude?",
    a: "Yes. With API mode enabled, Dripwriter Origin exposes a window._dripwriter API on Google Docs tabs so an AI agent such as Claude can drive the typing engine. See the setup guide at /ai."
  },
  {
    q: "Does Dripwriter Origin work in Microsoft Word?",
    a: "Not today. Dripwriter Origin is built specifically for Google Docs, where its humanized typing engine is tuned to the Docs editor. Microsoft Word support is not currently available."
  }
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 lg:py-32 bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions about Dripwriter Origin, answered."
          subtitle="Free, cross-browser, and built for Google Docs."
        />
        <div className="mt-16 divide-y divide-[#1a1a1a] border-t border-[#1a1a1a]">
          {faqs.map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="cursor-pointer list-none text-lg font-semibold text-white flex justify-between items-center">
                {f.q}
                <span className="text-[#c9a84c] transition-transform group-open:rotate-45 text-2xl leading-none">+</span>
              </summary>
              <p className="text-[#a0a0a0] text-sm leading-relaxed mt-4">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}