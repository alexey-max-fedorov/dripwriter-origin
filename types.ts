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
