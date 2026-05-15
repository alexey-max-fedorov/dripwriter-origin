"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { VERSION_TAG } from "@/lib/version";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="main-content"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16"
    >
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%)"
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "80px 80px"
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.p
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[#c9a84c] text-xs font-semibold tracking-[0.3em] uppercase mb-6"
        >
          ✦ {VERSION_TAG} · Free &amp; open source
        </motion.p>

        <h1
          className="text-5xl sm:text-6xl lg:text-8xl leading-[1.05] text-white mb-6"
          style={{ fontFamily: "var(--font-playfair-display)" }}
        >
          <AnimatedText>Type into Google Docs like a human.</AnimatedText>
        </h1>

        <motion.p
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-[#a0a0a0] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Dripwriter Origin pastes your text into a Google Doc one believable
          keystroke at a time — with adjustable speed, keyboard-neighbor typos
          that auto-correct, false-start words, and short breaks.
        </motion.p>

        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button variant="primary" size="lg" href="/get">
            <Download size={18} />
            Get the Extension
            <ArrowRight size={18} />
          </Button>
          <Button variant="outline" size="lg" href="#features">
            See what it does
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
