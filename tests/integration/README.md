# Integration tests

These drive the **real extension** in a **real browser** against a **real Google Doc**.

That is not over-engineering: the bug they guard against only exists at that seam.
Google Docs serves different editor builds to different users, each accepting a
different subset of synthetic events, and it renders document text to `<canvas>` —
so none of it is reproducible against a mocked DOM.

## Setup

1. Launch a Chromium browser with remote debugging and the extension loaded:

   ```bash
   pnpm dev                       # builds build/chrome-mv3-dev
   # load build/chrome-mv3-dev as an unpacked extension, then:
   # (quit the browser first — the flag only applies on a cold start)
   /Applications/Brave\ Browser.app/Contents/MacOS/Brave\ Browser \
     --remote-debugging-port=9224
   ```

2. Open a **scratch** Google Doc. The tests append text and do not clean up.

3. Run them:

   ```bash
   pnpm test:integration
   ```

Point at a different port with `DRIPWRITER_CDP_URL=http://localhost:9222`.

Every test **skips** (rather than fails) when no debuggable browser, Docs tab, or
loaded extension is found, so the suite is safe to run in CI.

## How the failure simulation works

`_cdp.mjs` reproduces a Docs build that rejects everything by patching
`EventTarget.prototype.dispatchEvent` **inside the extension's own isolated
realms** to swallow editing events. `execCommand("insertText")` already returns
`false` on Docs' editing host, so it needs no patch.

The critical detail: isolated worlds are **per-frame**. The `docs-texteventtarget-iframe`
is an `about:blank` frame with its own realm and its own `EventTarget.prototype`, and
that realm owns the element the extension dispatches to. Patch only the top frame's
realm and the blocker silently fails to hold — the test then passes for the wrong
reason. `findExtensionRealms` collects every realm, and the tests assert an
`about:blank` realm was among them before trusting a result.

## Ground truth

Inserted text is painted to canvas and never appears in the DOM, and the
`docs-texteventtarget-iframe` contenteditable is a 1px offscreen keystroke buffer
holding zero-width spaces that never changes. The caret (`.kix-cursor`) is the one
DOM element that moves when Docs actually applies an edit, so it is what these
tests — and the extension itself — use as proof of a write.
