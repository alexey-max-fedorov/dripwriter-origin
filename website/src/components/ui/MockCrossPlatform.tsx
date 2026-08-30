"use client";

import { useTypingEffect } from "@/hooks/useTypingEffect";

const DEMO_TEXT =
  "Dripwriter Origin v3 types this into Canvas, Packback, and Google Docs — any text box on any website — one human keystroke at a time. No account, no OAuth, no paper trail. Adjustable speed, natural typos that fix themselves, and lifelike pauses. Completely free and open source.";

const TABS = ["Google Docs", "Canvas", "Packback"];

export function MockCrossPlatform() {
  const { displayed, done } = useTypingEffect(DEMO_TEXT);

  // Advance the "active site" tab as the text types, so the mock visibly moves
  // across platforms — Docs → Canvas → Packback — reinforcing the v3 story.
  const frac = DEMO_TEXT.length ? displayed.length / DEMO_TEXT.length : 0;
  const active = Math.min(TABS.length - 1, Math.floor(frac * TABS.length));

  return (
    <div aria-hidden="true" className="w-full max-w-sm mx-auto" style={{ transform: "rotate(-1.5deg)" }}>
      <div className="bg-[#111] rounded-xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#1c1c1c] border-b border-white/5">
          <span className="w-3 h-3 rounded-full bg-red-400/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <span className="w-3 h-3 rounded-full bg-green-400/80" />
          <div className="ml-3 flex-1 h-5 rounded-md bg-black/40 border border-white/5" />
        </div>

        {/* Site tabs — active one lights up gold as typing progresses */}
        <div className="flex items-stretch text-[11px] font-medium border-b border-white/5 bg-[#161616]">
          {TABS.map((tab, i) => (
            <div
              key={tab}
              className={
                "px-3 py-2 border-r border-white/5 transition-colors duration-300 " +
                (i === active
                  ? "text-[#c9a84c] bg-[#111] border-b-2 border-b-[#c9a84c] -mb-px"
                  : "text-[#6b6b6b]")
              }
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Editor body */}
        <div className="px-5 py-4 bg-[#111]">
          <p className="text-[10px] text-[#666] mb-3 font-medium tracking-wide uppercase">
            Discussion post · untitled
          </p>
          <p className="text-[#d8d8d8] text-sm leading-relaxed min-h-[9rem]">
            {displayed}
            {!done && (
              <span className="animate-pulse ml-px border-r-2 border-[#c9a84c] inline-block h-[1em] align-middle" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
