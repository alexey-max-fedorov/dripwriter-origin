# Cloudflare setup for dripwriter.org

- DNS is hosted on Cloudflare (Free plan); registrar is Namecheap with custom nameservers pointing at Cloudflare.
- Apex `A` records (GitHub Pages IPs) and `www` CNAME are DNS-only (not proxied) so GitHub Pages issues the cert and handles www -> apex.
- `chrome`, `edge`, `firefox`, `extension` are proxied dummy `A 192.0.2.1` records; the Worker `dripwriter-redirects` (`redirects-worker.js`) is bound by per-host routes `<sub>.dripwriter.org/*` and returns 301.

| Host | Destination |
|---|---|
| chrome.dripwriter.org | Chrome Web Store listing |
| edge.dripwriter.org | Edge Add-ons listing |
| firefox.dripwriter.org | Firefox AMO listing |
| extension.dripwriter.org | Chrome Web Store listing |

Full destinations are in `redirects-worker.js`. Deploy: PUT `/accounts/{id}/workers/scripts/dripwriter-redirects` (module, main_module `index.js`).
