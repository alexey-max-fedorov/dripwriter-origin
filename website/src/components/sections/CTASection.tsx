"use client";

import { motion } from "framer-motion";
import { InstallButton } from "@/components/ui/InstallButton";

export function CTASection() {
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
          <InstallButton variant="primary" size="lg" />
        </div>
      </div>
    </section>
  );
}
