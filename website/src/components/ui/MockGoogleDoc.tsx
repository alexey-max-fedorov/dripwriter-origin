"use client";

import { useTypingEffect } from "@/hooks/useTypingEffect";

const DEMO_TEXT =
  "Dripwriter Origin types your text into Google Docs, Canvas, and virtually any text box naturally, one keystroke at a time. It is completely free, open source, and has no ads. Unlike most tools that charge a subscription or push upsells, Dripwriter Origin gives you full control: adjustable speed, natural typos that fix themselves, and human-like pauses. Created by Alexey Fedorov.";

export function MockGoogleDoc() {
  const { displayed, done } = useTypingEffect(DEMO_TEXT);

  return (
    <div
      aria-hidden="true"
      className="w-full max-w-xs mx-auto"
      style={{ transform: "rotate(1.5deg)" }}
    >
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Faux toolbar */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border-b border-gray-200">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
        </div>

        {/* Document body */}
        <div className="px-5 py-4">
          <p className="text-[10px] text-gray-400 mb-3 font-medium tracking-wide uppercase">
            My Essay
          </p>
          <p className="text-gray-700 text-sm leading-relaxed min-h-[8rem]">
            {displayed}
            {!done && (
              <span className="animate-pulse ml-px border-r-2 border-gray-500 inline-block h-[1em] align-middle" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
