"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Gauge,
  Keyboard,
  Undo2,
  Coffee,
  Stethoscope,
  ShieldCheck
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const features = [
  {
    icon: Gauge,
    title: "Adjustable cadence",
    desc: "Dial typing speed from 20 to 150 WPM with a configurable variance band, so the rhythm never feels mechanical."
  },
  {
    icon: Keyboard,
    title: "Neighbor-key typos",
    desc: "The agent slips on adjacent keys at a rate you set, then visibly backspaces and corrects them just like a tired writer would."
  },
  {
    icon: Undo2,
    title: "False starts",
    desc: "Occasionally types a wrong nearby word, pauses, and deletes it — the kind of micro-detour real drafting produces."
  },
  {
    icon: Coffee,
    title: "Natural breaks",
    desc: "Configurable short pauses at sentence boundaries keep long pastes from looking like one uninterrupted burst."
  },
  {
    icon: Stethoscope,
    title: "Diagnostics mode",
    desc: "Run a one-shot probe to see which typing event paths your Google Docs build accepts — handy when Docs ships changes."
  },
  {
    icon: ShieldCheck,
    title: "Local & private",
    desc: "All settings live in your browser's local storage. No accounts, no telemetry, no servers."
  }
];

export function FeatureGrid() {
  const reduce = useReducedMotion();
  return (
    <section id="features" className="py-24 lg:py-32 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What it does"
          title="Built to read like a human, not a script."
          subtitle="Six knobs you actually want, none of the ones you don't. Set it once; the popup remembers."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      duration: 0.6,
                      delay: i * 0.08,
                      ease: [0.25, 0.1, 0.25, 1]
                    }
              }
              whileHover={reduce ? undefined : { y: -4 }}
              className="bg-[#111] border border-[#1a1a1a] rounded-xl p-8 transition-all hover:border-[rgba(201,168,76,0.35)] hover:shadow-[0_0_40px_rgba(201,168,76,0.08)]"
            >
              <div className="w-12 h-12 rounded-lg bg-[rgba(201,168,76,0.1)] flex items-center justify-center mb-5">
                <f.icon size={22} className="text-[#c9a84c]" />
              </div>
              <h3
                className="text-xl font-semibold text-white mb-2"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                {f.title}
              </h3>
              <p className="text-[#a0a0a0] text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
