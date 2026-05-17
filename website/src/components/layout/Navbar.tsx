"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Install", href: "/#install" },
{ label: "Support", href: "https://github.com/alexey-max-fedorov/dripwriter-origin/issues", external: true }
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-black/90 backdrop-blur-md border-b border-[#1a1a1a]"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" aria-label="Dripwriter Origin home">
          <Image
            src="/logo.png"
            alt=""
            width={36}
            height={36}
            className="rounded-md"
            priority
          />
          <span
            className="text-xl font-semibold text-white group-hover:text-[#c9a84c] transition-colors"
            style={{ fontFamily: "var(--font-playfair-display)" }}
          >
            Dripwriter Origin
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-sm text-[#a0a0a0] hover:text-white tracking-wide transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Button variant="primary" size="sm" href="https://extension.dripwriter.org" external>
            Install Extension
          </Button>
        </div>

        <button
          className="lg:hidden text-white p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-black/95 backdrop-blur-md border-t border-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="text-base text-[#a0a0a0] hover:text-white tracking-wide"
              >
                {link.label}
              </a>
            ))}
            <Button variant="primary" size="md" href="https://extension.dripwriter.org" external className="mt-2">
              Install Extension
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
