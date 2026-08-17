"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { BrowserIcon } from "@/components/ui/BrowserIcon";
import { VERSION_TAG } from "@/lib/version";
import { MockGoogleDoc } from "@/components/ui/MockGoogleDoc";
import { useBrowser } from "@/lib/useBrowser";

export function Hero() {
  const reduce = useReducedMotion();
  const { browser, storeLabel } = useBrowser();

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

      <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        <div className="w-full lg:w-2/3 min-w-0 text-center lg:text-left">
          <motion.p
            initial={reduce ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[#c9a84c] text-xs font-semibold tracking-[0.3em] uppercase mb-6"
          >
            ✦ {VERSION_TAG} · Free & open source
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
            className="text-[#a0a0a0] text-base sm:text-lg leading-relaxed mb-10"
          >
            Dripwriter Origin is a free browser extension that pastes your text into a
            Google Doc one believable keystroke at a time — with adjustable
            speed, keyboard-neighbor typos that auto-correct, false-start words,
            and short breaks.
          </motion.p>

          <motion.div
            initial={reduce ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Button
              variant="primary"
              size="lg"
              href="https://extension.dripwriter.org"
              external
            >
              <BrowserIcon browser={browser} size={18} />
              Install on {storeLabel}
              {browser === "chrome" && (
                <svg focusable="false" width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-label="Verified by Chrome Web Store">
                  <path d="M23 11.99L20.56 9.2l.34-3.69-3.61-.82L15.4 1.5 12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 11.99l2.44 2.79-.34 3.7 3.61.82 1.89 3.2 3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69 2.44-2.8zm-3.95 1.48l-.56.65.08.85.18 1.95-1.9.43-.84.19-.44.74-.99 1.68-1.78-.77-.8-.34-.79.34-1.78.77-.99-1.67-.44-.74-.84-.19-1.9-.43.18-1.96.08-.85-.56-.65L3.67 12l1.29-1.48.56-.65-.09-.86-.18-1.94 1.9-.43.84-.19.44-.74.99-1.68 1.78.77.8.34.79-.34 1.78-.77.99 1.68.44.74.84.19 1.9.43-.18 1.95-.08.85.56.65 1.29 1.47-1.28 1.48z" />
                  <path d="M10.09 13.75l-2.32-2.33-1.48 1.49 3.8 3.81 7.34-7.36-1.48-1.49z" />
                </svg>
              )}
              <ArrowRight size={18} />
            </Button>
            <Button variant="outline" size="lg" href="#features">
              See what it does
            </Button>
          </motion.div>
        </div>

        <div className="w-full lg:w-1/3 flex-shrink-0 lg:order-first">
          <MockGoogleDoc />
        </div>
      </div>
    </section>
  );
}
