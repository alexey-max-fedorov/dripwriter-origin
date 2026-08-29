import { DocsHarness } from "./docs.ts";
import type { Harness, HarnessDeps } from "./types.ts";

/**
 * Picks the harness that owns the current frame. DocsHarness on a Google Docs
 * document; DefaultHarness everywhere else (added in a later task).
 */
export function selectHarness(deps: HarnessDeps = {}): Harness {
  return new DocsHarness(deps);
}
