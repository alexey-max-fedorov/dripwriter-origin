export interface DripwriterSettings {
  text: string;
  wpm: number;
  speedVariance: number;
  typoRate: number;
  detourRate: number;
  breakFrequencySeconds: number;
  breakFrequencyVariance: number;
  breakMinSeconds: number;
  breakMaxSeconds: number;
}

export interface TypingStatus {
  running: boolean;
  detail: string;
}

export type DripwriterMessage =
  | { type: "START_DRIP"; payload: DripwriterSettings }
  | { type: "RUN_DIAGNOSTICS" }
  | { type: "STOP_DRIP" }
  | { type: "GET_STATUS" };

export interface DripwriterResponse {
  ok: boolean;
  status: TypingStatus;
  error?: string;
}

export const DEFAULT_SETTINGS: DripwriterSettings = {
  text: "",
  wpm: 60,
  speedVariance: 30,
  typoRate: 3,
  detourRate: 3,
  breakFrequencySeconds: 55,
  breakFrequencyVariance: 30,
  breakMinSeconds: 3,
  breakMaxSeconds: 15
};

// ---- API mode / console bridge ----

export const API_MODE_STORAGE_KEY = "dripwriterApiMode";

/** Marker on every message the bridge and content script exchange. */
export const BRIDGE_REQUEST_SOURCE = "dripwriter-api-request";
export const BRIDGE_RESPONSE_SOURCE = "dripwriter-api-response";
export const BRIDGE_CONTROL_SOURCE = "dripwriter-api-control";

/** Sent from isolated content script to the MAIN-world bridge. */
export type BridgeControl =
  | { source: typeof BRIDGE_CONTROL_SOURCE; action: "enable"; version: string }
  | { source: typeof BRIDGE_CONTROL_SOURCE; action: "disable" };

/** Sent from MAIN-world bridge to isolated content script. */
export type BridgeRequest =
  | { source: typeof BRIDGE_REQUEST_SOURCE; id: string; method: "start"; settings: DripwriterSettings }
  | { source: typeof BRIDGE_REQUEST_SOURCE; id: string; method: "stop" }
  | { source: typeof BRIDGE_REQUEST_SOURCE; id: string; method: "test" }
  | { source: typeof BRIDGE_REQUEST_SOURCE; id: string; method: "status" };

/** Sent from isolated content script back to the MAIN-world bridge. */
export interface BridgeResponse {
  source: typeof BRIDGE_RESPONSE_SOURCE;
  id: string;
  ok: boolean;
  error?: string;
  status?: TypingStatus;
}
