import type { PlasmoCSConfig } from "plasmo";

import {
  BRIDGE_CONTROL_SOURCE,
  BRIDGE_REQUEST_SOURCE,
  BRIDGE_RESPONSE_SOURCE,
  type BridgeControl,
  type BridgeRequest,
  type BridgeResponse,
  DEFAULT_SETTINGS,
  type DripwriterSettings,
  type TypingStatus
} from "../types";

export const config: PlasmoCSConfig = {
  matches: ["https://docs.google.com/document/*"],
  run_at: "document_idle",
  world: "MAIN"
};

interface DripwriterApi {
  readonly version: string;
  config: DripwriterSettings;
  start(): Promise<void>;
  stop(): Promise<void>;
  test(): Promise<void>;
  status(): Promise<TypingStatus>;
}

declare global {
  interface Window {
    _dripwriter?: DripwriterApi;
  }
}

const pending = new Map<string, {
  resolve: (response: BridgeResponse) => void;
  reject: (error: Error) => void;
}>();

export const VERSION = "2.2.1";

let apiVersion = VERSION;

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.origin !== window.location.origin) return;
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.source === BRIDGE_CONTROL_SOURCE) {
    handleControl(data as BridgeControl);
    return;
  }

  if (data.source === BRIDGE_RESPONSE_SOURCE) {
    const response = data as BridgeResponse;
    const entry = pending.get(response.id);
    if (!entry) return;
    pending.delete(response.id);
    entry.resolve(response);
  }
});

function handleControl(control: BridgeControl) {
  if (control.action === "enable") {
    apiVersion = control.version;
    if (!window._dripwriter) {
      window._dripwriter = createApi();
    }
    return;
  }

  if (control.action === "disable") {
    if (window._dripwriter) {
      delete window._dripwriter;
    }
    for (const entry of pending.values()) {
      entry.reject(new Error("Dripwriter API mode was disabled."));
    }
    pending.clear();
  }
}

function createApi(): DripwriterApi {
  const userConfig: DripwriterSettings = { ...DEFAULT_SETTINGS };

  function send<T extends BridgeRequest["method"]>(
    method: T,
    extra: Omit<Extract<BridgeRequest, { method: T }>, "source" | "id" | "method">
  ): Promise<BridgeResponse> {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      pending.set(id, { resolve, reject });
      const request = {
        source: BRIDGE_REQUEST_SOURCE,
        id,
        method,
        ...extra
      } as BridgeRequest;
      window.postMessage(request, window.location.origin);
    });
  }

  const api: DripwriterApi = {
    get version() {
      return apiVersion;
    },
    config: userConfig,
    async start() {
      const response = await send("start", { settings: { ...userConfig } });
      if (!response.ok) {
        throw new Error(response.error ?? "Dripwriter start failed.");
      }
    },
    async stop() {
      const response = await send("stop", {});
      if (!response.ok) {
        throw new Error(response.error ?? "Dripwriter stop failed.");
      }
    },
    async test() {
      const response = await send("test", {});
      if (!response.ok) {
        throw new Error(response.error ?? "Dripwriter test failed.");
      }
    },
    async status() {
      const response = await send("status", {});
      if (!response.ok || !response.status) {
        throw new Error(response.error ?? "Could not fetch status.");
      }
      return response.status;
    }
  };

  return api;
}
