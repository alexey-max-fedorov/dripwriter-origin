"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { BrowserIcon } from "@/components/ui/BrowserIcon";
import { useBrowser } from "@/lib/useBrowser";

export function CTASection() {
  const { browser, storeLabel } = useBrowser();

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)"
        }}
      />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-6xl text-white mb-6"
          style={{ fontFamily: "var(--font-playfair-display)" }}
        >
          Drip your draft into the doc.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[#a0a0a0] text-lg mb-10"
        >
          Free, open source, runs entirely in your browser. Install once, tune once, paste forever.
        </motion.p>
        <div className="flex justify-center">
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
          </Button>
        </div>
      </div>
    </section>
  );
}
