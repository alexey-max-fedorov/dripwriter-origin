import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Download, Globe, GitBranch } from "lucide-react";
import { VERSION_TAG } from "@/lib/version";

export const metadata: Metadata = {
  title: "Get Dripwriter Origin",
  description:
    "Download the latest Dripwriter Origin packaged build for Chrome, Edge, or Firefox. Free, open-source, no signup.",
  alternates: { canonical: "https://dripwriter.org/get" }
};

export default function GetPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-black flex items-center justify-center">
        <section className="py-32 w-full relative overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)"
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.3em] uppercase mb-6">
              ✦ {VERSION_TAG}
            </p>

            <h1
              className="text-4xl sm:text-5xl font-semibold text-white mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              Get Dripwriter Origin
            </h1>

            <p className="text-[#a0a0a0] text-base sm:text-lg leading-relaxed mb-12">
              Download the packaged build for your browser below, unzip, and
              load it as an unpacked extension in Chrome / Edge or as a
              temporary add-on in Firefox. Store listings are coming soon.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
              <a
                href="https://github.com/alexey-max-fedorov/dripwriter-origin/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#c9a84c] text-black font-semibold rounded-md hover:bg-[#d4b65e] hover:shadow-[0_0_24px_rgba(201,168,76,0.4)] active:scale-[0.98] transition-all duration-200 text-base"
              >
                <Globe size={20} />
                Chrome / Edge build
              </a>

              <a
                href="https://github.com/alexey-max-fedorov/dripwriter-origin/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#c9a84c] text-black font-semibold rounded-md hover:bg-[#d4b65e] hover:shadow-[0_0_24px_rgba(201,168,76,0.4)] active:scale-[0.98] transition-all duration-200 text-base"
              >
                <Download size={20} />
                Firefox build
              </a>
            </div>

            <p className="text-[#a0a0a0] text-sm leading-relaxed mb-8">
              On the release page, pick the file ending in{" "}
              <code className="text-[#c9a84c]">-chrome-mv3-prod.zip</code> for
              Chrome/Edge or{" "}
              <code className="text-[#c9a84c]">-firefox-mv3-prod.zip</code> for
              Firefox.
            </p>

            <a
              href="https://github.com/alexey-max-fedorov/dripwriter-origin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 border border-[#c9a84c] text-[#c9a84c] font-semibold rounded-md hover:bg-[rgba(201,168,76,0.08)] hover:shadow-[0_0_16px_rgba(201,168,76,0.2)] active:scale-[0.98] transition-all duration-200 text-base"
            >
              <GitBranch size={20} />
              View source on GitHub
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
