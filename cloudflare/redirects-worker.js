// Cloudflare Worker "dripwriter-redirects": 301 redirects for store subdomains.
// Routes (zone dripwriter.org): chrome/edge/firefox/extension.dripwriter.org/*
const MAP = {
  "chrome.dripwriter.org": "https://chromewebstore.google.com/detail/cnkagcdjffdfjemggoeaibjlhoeckmgh?utm_source=chrome.dripwriter.org",
  "edge.dripwriter.org": "https://microsoftedge.microsoft.com/addons/detail/dripwriter-origin/iglhighcgeehoobmdimegicldnchcaoh?utm_source=edge.dripwriter.org",
  "firefox.dripwriter.org": "https://addons.mozilla.org/en-US/firefox/addon/dripwriter-origin/?utm_source=firefox.dripwriter.org",
  "extension.dripwriter.org": "https://chromewebstore.google.com/detail/cnkagcdjffdfjemggoeaibjlhoeckmgh?utm_source=extension.dripwriter.org",
};

export default {
  async fetch(request) {
    const host = new URL(request.url).hostname.toLowerCase();
    if (host === "dripwriter.org" || host === "www.dripwriter.org") return fetch(request);
    const dest = MAP[host];
    if (dest) return Response.redirect(dest, 301);
    return new Response("Not found", { status: 404 });
  },
};
