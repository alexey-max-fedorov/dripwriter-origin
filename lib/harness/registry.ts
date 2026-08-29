import { DefaultHarness } from "./default.ts";
import { DocsHarness } from "./docs.ts";
import type { Harness, HarnessDeps } from "./types.ts";

/**
 * Picks the harness that owns the current frame: DocsHarness on a Google Docs
 * document (its canvas editor needs caret-based verification), DefaultHarness
 * everywhere else (standard editables verified by reading their content).
 */
export function selectHarness(deps: HarnessDeps = {}): Harness {
  if (isGoogleDocsDocument()) {
    return new DocsHarness(deps);
  }
  return new DefaultHarness(deps);
}

function isGoogleDocsDocument(): boolean {
  return (
    location.hostname === "docs.google.com" && location.pathname.startsWith("/document/")
  );
}
