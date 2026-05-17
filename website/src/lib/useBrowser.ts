"use client";

import { useEffect, useState } from "react";

export type Browser = "chrome" | "edge" | "firefox" | "other";

export interface BrowserInfo {
  browser: Browser;
  storeLabel: string;
}

function detect(ua: string): Browser {
  if (/Edg\//i.test(ua)) return "edge";
  if (/Firefox\//i.test(ua)) return "firefox";
  if (/Chrome\//i.test(ua)) return "chrome";
  return "other";
}

const labels: Record<Browser, string> = {
  chrome: "Chrome Web Store",
  edge: "Edge Add-Ons",
  firefox: "Mozilla Add-Ons",
  other: "Chrome Web Store",
};

export function useBrowser(): BrowserInfo {
  const [browser, setBrowser] = useState<Browser>("chrome");

  useEffect(() => {
    setBrowser(detect(navigator.userAgent));
  }, []);

  return { browser, storeLabel: labels[browser] };
}
