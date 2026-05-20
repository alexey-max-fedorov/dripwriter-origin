# Meta Directory

This directory contains metadata, documentation, and store-specific assets for the Dripwriter Origin browser extension.

## Contents

### 📋 [PRIVACY_POLICY.md](./PRIVACY_POLICY.md)
The official privacy policy for Dripwriter Origin. Details our data handling practices:
- No data collection or transmission
- No analytics or telemetry
- No backend servers
- Local storage only
- Extension permissions and limitations

### 🔌 [api/](./api/)
Documentation for the Dripwriter Console API — a scriptable JavaScript interface for controlling the typing engine programmatically.
- **[README.md](./api/README.md)** — API overview and minimum example
- **[reference.md](./api/reference.md)** — Complete API reference with all available methods and properties
- **[example_prompt.md](./api/example_prompt.md)** — Example prompts and use cases

**Use case:** Developers and AI agents can control typing from the page's DevTools console or external scripts.

### 🌐 [chrome/](./chrome/)
Chrome Web Store submission materials:
- `DESCRIPTION.txt` — Store listing description
- `TEST_INSTRUCTIONS.txt` — Testing guidelines for reviewers
- `single-purpose.txt` — Single-purpose declaration
- Permission justifications:
  - `host-permission.txt`
  - `scripting-permission.txt`
  - `storage-permission.txt`
  - `tabs-permission.txt`

### ⚫ [edge/](./edge/)
Microsoft Edge Add-ons submission materials:
- `DESCRIPTION.txt` — Store listing description
- `TEST_INSTRUCTIONS.txt` — Testing guidelines for reviewers

### 🔥 [firefox/](./firefox/)
Firefox Add-ons (AMO) submission materials:
- `DESCRIPTION.md` — Store listing description

### 🖼️ [images/](./images/)
Store listing assets:
- `screenshot_1.png` — Screenshot for store listings
- `small_banner.png` — Banner image for promotional use

---

**Note:** Store-specific files are used during the extension review and publication process for each platform (Chrome, Edge, Firefox).
