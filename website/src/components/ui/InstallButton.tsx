"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BrowserIcon } from "@/components/ui/BrowserIcon";
import { useBrowser } from "@/lib/useBrowser";

const INSTALL_HREF = "https://extension.dripwriter.org";

/**
 * The official Chrome Web Store "verified/featured" checkmark. Shown only when
 * the install target is the Chrome Web Store, so it reads as a trust signal
 * rather than decoration.
 */
function ChromeVerifiedBadge() {
  return (
    <svg
      focusable="false"
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="Verified by Chrome Web Store"
    >
      <path d="M23 11.99L20.56 9.2l.34-3.69-3.61-.82L15.4 1.5 12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 11.99l2.44 2.79-.34 3.7 3.61.82 1.89 3.2 3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69 2.44-2.8zm-3.95 1.48l-.56.65.08.85.18 1.95-1.9.43-.84.19-.44.74-.99 1.68-1.78-.77-.8-.34-.79.34-1.78.77-.99-1.67-.44-.74-.84-.19-1.9-.43.18-1.96.08-.85-.56-.65L3.67 12l1.29-1.48.56-.65-.09-.86-.18-1.94 1.9-.43.84-.19.44-.74.99-1.68 1.78.77.8.34.79-.34 1.78-.77.99 1.68.44.74.84.19 1.9.43-.18 1.95-.08.85.56.65 1.29 1.47-1.28 1.48z" />
      <path d="M10.09 13.75l-2.32-2.33-1.48 1.49 3.8 3.81 7.34-7.36-1.48-1.49z" />
    </svg>
  );
}

interface InstallButtonProps {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Trailing arrow, for primary hero/CTA buttons. */
  showArrow?: boolean;
  /** Verb before the store name, e.g. "Install on". */
  labelPrefix?: string;
  iconSize?: number;
}

/**
 * The one install CTA used everywhere. Personalizes the label and icon to the
 * visitor's browser (Chrome Web Store / Edge Add-Ons / Mozilla Add-Ons) and shows
 * the Chrome verified badge whenever the target is the Chrome Web Store — so every
 * install link across the site stays consistent and can't drift apart again.
 */
export function InstallButton({
  variant = "primary",
  size = "lg",
  className,
  showArrow = false,
  labelPrefix = "Install on",
  iconSize = 18
}: InstallButtonProps) {
  const { browser, storeLabel } = useBrowser();
  const isChromeStore = storeLabel === "Chrome Web Store";

  return (
    <Button variant={variant} size={size} href={INSTALL_HREF} external className={className}>
      <BrowserIcon browser={browser} size={iconSize} />
      {labelPrefix} {storeLabel}
      {isChromeStore && <ChromeVerifiedBadge />}
      {showArrow && <ArrowRight size={iconSize} />}
    </Button>
  );
}
