import type { MetadataRoute } from "next";

const BASE = "https://dripwriter.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/v3`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/mogged`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/ai`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/api`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/links`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/license`, lastModified: now, changeFrequency: "yearly", priority: 0.3 }
  ];
}
