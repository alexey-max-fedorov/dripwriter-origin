# Off-Page Authority + Backlink Tracker

Goal: build inbound links and brand citations that anchor the "Dripwriter" entity to dripwriter.org, consolidating authority away from dripwriter.com and pushing dripwriter.org to #1 for the brand term.

---

## Link / Citation Status

| Target | Type | URL | Submitted | Live | Status | Notes |
|--------|------|-----|-----------|------|--------|-------|
| Chrome Web Store listing | dofollow (entity signal) | https://chromewebstore.google.com/detail/dripwriter-origin/ | — | — | pending | Ensure "Website" field = https://dripwriter.org |
| Edge Add-ons listing | dofollow (entity signal) | https://microsoftedge.microsoft.com/addons/ | — | — | pending | Ensure "Homepage URL" field = https://dripwriter.org |
| Firefox AMO listing | dofollow | https://addons.mozilla.org/en-US/firefox/addon/dripwriter-origin/ | — | — | pending | Ensure "Homepage" field = https://dripwriter.org (already ranking for "dripwriter unblocked" #2) |
| Product Hunt launch | nofollow + brand citation | https://www.producthunt.com/ | — | — | pending | Target a Tuesday or Wednesday launch; use tagline "Free browser extension — no account, no OAuth" to differentiate from dripwriter.com |
| There's An AI For That (TAAFT) | dofollow | https://theresanaiforthat.com/ | — | — | pending | Category: "Productivity / Writing"; link to https://dripwriter.org |
| Futurepedia | nofollow + brand citation | https://www.futurepedia.io/ | — | — | pending | Category: "AI Writing Tools" |
| AlternativeTo | nofollow + brand citation | https://alternativeto.net/ | — | — | pending | Position as free, open-source, privacy-first alternative to dripwriter.com; no OAuth required |
| SaaSHub | dofollow | https://www.saashub.com/ | — | — | pending | Category: "Browser Extension / Productivity" |
| GitHub repo README | dofollow | https://github.com/ (repo root README.md) | — | — | pending | Add anchor text "Dripwriter" → https://dripwriter.org near top of README |

---

## Entity Consolidation Checklist

The `sameAs` array added in the JSON-LD (Task 2) tells Google these surfaces are the same entity — but only works if each store listing's homepage/website field actually points to https://dripwriter.org. Verify each one:

- [ ] **Chrome Web Store** — Developer Dashboard → Extension listing → "Website" field → `https://dripwriter.org`
- [ ] **Edge Add-ons** — Partner Center → Extension listing → "Homepage URL" → `https://dripwriter.org`
- [ ] **Firefox AMO** — AMO Developer Hub → Extension listing → "Homepage" → `https://dripwriter.org`
- [ ] **GitHub repo** — Repository Settings → "Website" field → `https://dripwriter.org`

Confirming all four means every "Dripwriter" surface Google indexes points to the same domain — the clearest entity signal available without earning editorial links.

---

## Further Resources

For a fuller directory list and submission workflow, invoke the `marketing-skills:directory-submissions` skill. For a competitor/alternatives page strategy (targeting comparison intent against dripwriter.com), invoke `marketing-skills:competitors`.
