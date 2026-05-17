"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Store, PlusCircle, Pin, PlayCircle } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { BrowserIcon } from "@/components/ui/BrowserIcon";
import { useBrowser } from "@/lib/useBrowser";

const steps = [
  {
    icon: Store,
    title: "Visit the store",
    desc: "Open the Dripwriter Origin listing on the Chrome Web Store, Edge Add-Ons, or Mozilla Add-Ons."
  },
  {
    icon: PlusCircle,
    title: "Add to browser",
    desc: "Click Add to Chrome / Add / Add to Firefox and confirm the install prompt."
  },
  {
    icon: Pin,
    title: "Pin it",
    desc: "Pin Dripwriter Origin to your toolbar from the puzzle-piece menu so it's one click away."
  },
  {
    icon: PlayCircle,
    title: "Drip away",
    desc: "Open a Google Doc, paste your text into the popup, tune the sliders, and press Start."
  }
];

export function InstallSteps() {
  const reduce = useReducedMotion();
  const { browser, storeLabel } = useBrowser();

  return (
    <section id="install" className="py-24 lg:py-32 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Get started"
          title="Install in four steps."
          subtitle="Works in Chrome, Edge, and Firefox. No accounts. No signup."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      duration: 0.6,
                      delay: i * 0.1,
                      ease: [0.25, 0.1, 0.25, 1]
                    }
              }
              className="relative bg-[#111] border border-[#1a1a1a] rounded-xl p-6"
            >
              <span
                className="absolute top-4 right-5 text-[#c9a84c]/25 text-4xl font-bold leading-none"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                {i + 1}
              </span>
              <s.icon size={24} className="text-[#c9a84c] mb-4" />
              <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-[#a0a0a0] text-xs leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-center mt-14">
          <Button
            variant="primary"
            size="lg"
            href="https://extension.dripwriter.org"
            external
          >
            <BrowserIcon browser={browser} size={18} />
            Install from {storeLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
