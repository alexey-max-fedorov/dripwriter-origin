import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Links — Dripwriter Origin",
  description:
    "All Dripwriter Origin shortlinks and subdomain redirects in one place.",
  alternates: { canonical: "https://dripwriter.org/links" }
};

const groups = [
  {
    label: "Install",
    links: [
      {
        subdomain: "extension.dripwriter.org",
        destination: "Auto-detects your browser → Chrome, Edge, or Firefox store",
        href: "https://extension.dripwriter.org"
      },
      {
        subdomain: "chrome.dripwriter.org",
        destination: "Chrome Web Store",
        href: "https://chrome.dripwriter.org"
      },
      {
        subdomain: "edge.dripwriter.org",
        destination: "Microsoft Edge Add-ons",
        href: "https://edge.dripwriter.org"
      },
      {
        subdomain: "firefox.dripwriter.org",
        destination: "Firefox Add-ons (AMO)",
        href: "https://firefox.dripwriter.org"
      }
    ]
  },
  {
    label: "Developers",
    links: [
      {
        subdomain: "api.dripwriter.org",
        destination: "dripwriter.org/api — window._dripwriter API docs",
        href: "https://api.dripwriter.org"
      },
      {
        subdomain: "ai.dripwriter.org",
        destination: "dripwriter.org/ai — AI integration guide",
        href: "https://ai.dripwriter.org"
      },
      {
        subdomain: "gh.dripwriter.org",
        destination: "github.com/alexey-max-fedorov/dripwriter-origin",
        href: "https://gh.dripwriter.org"
      },
      {
        subdomain: "github.dripwriter.org",
        destination: "github.com/alexey-max-fedorov/dripwriter-origin",
        href: "https://github.dripwriter.org"
      }
    ]
  },
  {
    label: "Support",
    links: [
      {
        subdomain: "support.dripwriter.org",
        destination: "Open a GitHub issue",
        href: "https://support.dripwriter.org"
      },
      {
        subdomain: "contact.dripwriter.org",
        destination: "Open a GitHub issue",
        href: "https://contact.dripwriter.org"
      },
      {
        subdomain: "privacy.dripwriter.org",
        destination: "dripwriter.org/privacy",
        href: "https://privacy.dripwriter.org"
      }
    ]
  }
];

export default function LinksPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-black">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)"
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-40 pb-24">
          <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.3em] uppercase mb-6">
            ✦ Directory
          </p>

          <h1
            className="text-4xl sm:text-5xl font-semibold text-white mb-4 leading-tight"
            style={{ fontFamily: "var(--font-playfair-display)" }}
          >
            Links
          </h1>

          <p className="text-[#a0a0a0] text-base sm:text-lg leading-relaxed mb-12">
            All Dripwriter Origin shortlinks and subdomain redirects.
          </p>

          <div className="space-y-12">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a84c] mb-4">
                  {group.label}
                </p>
                <div className="border-t border-[#1a1a1a]">
                  {group.links.map((link) => (
                    <a
                      key={link.subdomain}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 py-5 border-b border-[#1a1a1a] group hover:bg-[#0a0a0a] transition-colors -mx-4 px-4 sm:-mx-6 sm:px-6"
                    >
                      <span className="text-sm font-medium text-white group-hover:text-[#c9a84c] transition-colors shrink-0 font-mono">
                        {link.subdomain}
                      </span>
                      <span className="text-sm text-[#555] shrink-0 hidden sm:block">→</span>
                      <span className="text-sm text-[#a0a0a0]">{link.destination}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
