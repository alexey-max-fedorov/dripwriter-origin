import Link from "next/link";
import Image from "next/image";
import { VERSION_TAG } from "@/lib/version";

type FooterLink = { label: string; href: string; external?: boolean; gold?: boolean };

const productLinks: FooterLink[] = [
  { label: "Features", href: "/#features" },
  { label: "Install", href: "/#install" },
  { label: "API", href: "/api" }
];

const resourceLinks: FooterLink[] = [
  { label: "What's New — v3", href: "/v3", gold: true },
  { label: "Mogged — the C&D", href: "/mogged" },
  { label: "Support", href: "https://github.com/alexey-max-fedorov/dripwriter-origin/issues", external: true },
  { label: "Dripwriter + AI", href: "/ai", gold: true }
];

const legalLinks: FooterLink[] = [
  { label: "License", href: "/license" },
  { label: "Privacy Policy", href: "/privacy" }
];

function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="text-[11px] uppercase tracking-[0.25em] text-white font-semibold mb-4">
        {title}
      </h3>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  link.gold
                    ? "text-sm text-[#c9a84c] hover:text-[#e2c97e] transition-colors font-medium"
                    : "text-sm text-[#a0a0a0] hover:text-[#c9a84c] transition-colors"
                }
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className={
                  link.gold
                    ? "text-sm text-[#c9a84c] hover:text-[#e2c97e] transition-colors font-medium"
                    : "text-sm text-[#a0a0a0] hover:text-[#c9a84c] transition-colors"
                }
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt="" width={36} height={36} className="rounded-md" />
              <span
                className="text-lg font-semibold text-white"
                style={{ fontFamily: "var(--font-playfair-display)" }}
              >
                Dripwriter Origin
              </span>
            </Link>
            <p className="text-sm text-[#a0a0a0] leading-relaxed max-w-xs">
              Type into any website like a human — Google Docs, Canvas, any text box. Typos, false starts, breaks. Free, open-source, cross-browser.
            </p>
          </div>

          <LinkColumn title="Product" links={productLinks} />
          <LinkColumn title="Resources" links={resourceLinks} />
          <LinkColumn title="Legal" links={legalLinks} />
        </div>

        <div className="mt-16 pt-8 border-t border-[#1a1a1a] flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-xs text-[#a0a0a0]">© 2026 Alexey Fedorov · Noncommercial use free</p>
          <p className="text-xs text-[#a0a0a0] tracking-[0.2em] uppercase">{VERSION_TAG}</p>
        </div>
      </div>
    </footer>
  );
}
