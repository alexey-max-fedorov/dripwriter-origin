import { DefaultHarness } from "./default.ts";
import { DocsHarness } from "./docs.ts";
import { isWordOnlineDocument, WordHarness } from "./word.ts";
import type { Harness, HarnessDeps } from "./types.ts";

/**
 * Picks the harness that owns the current frame: DocsHarness on a Google Docs
 * document (its canvas editor needs caret-based verification), WordHarness on
 * a Word Online document (its contenteditable surface is verified by reading
 * its content), DefaultHarness everywhere else (standard editables verified
 * by reading their content).
 */
export function selectHarness(deps: HarnessDeps = {}): Harness {
  if (isGoogleDocsDocument()) {
    return new DocsHarness(deps);
  }
  if (isWordOnlineDocument()) {
    return new WordHarness(deps);
  }
  return new DefaultHarness(deps);
}

function isGoogleDocsDocument(): boolean {
  return (
    location.hostname === "docs.google.com" && location.pathname.startsWith("/document/")
  );
}
