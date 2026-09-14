import { useCallback, useEffect, useRef, useState } from "react";

import {
  API_MODE_STORAGE_KEY,
  DEFAULT_SETTINGS,
  type DripwriterMessage,
  type DripwriterResponse,
  type DripwriterSettings,
  type TargetFrameResponse,
  type TypingStatus
} from "./types";
import { VERSION_TAG } from "~/lib/version";

type StatusState = "idle" | "running" | "error" | "done";

function stateForStatus(status: TypingStatus, settled: StatusState): StatusState {
  if (status.failed) return "error";
  return status.running ? "running" : settled;
}

const TITLE = "Dripwriter Origin";
const TITLE_SPLIT = 10;
const THEME_KEY = "dripwriterTheme";

function MixRow({ id, label, unit, min, max, step = 1, value, onChange }: {
  id: string; label: string; unit: string;
  min: number; max: number; step?: number;
  value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="mix-row">
      <span className="mr-label">{label}</span>
      <div className="mr-track-wrap">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => {
            const v = Number(e.target.value);
            onChange(v);
            const pct = (v - min) / (max - min) * 100;
            e.target.style.setProperty("--pct", `${pct}%`);
          }}
          ref={el => {
            if (el) {
              const pct = (value - min) / (max - min) * 100;
              el.style.setProperty("--pct", `${pct}%`);
            }
          }}
        />
      </div>
      <span className="mr-val"><span>{value}</span><em>{unit}</em></span>
    </div>
  );
}

const STORAGE_KEY = "dripwriterSettings";

export default function PopupView({ closeOnStart }: { closeOnStart?: boolean }) {
  const [settings, setSettings] = useState<DripwriterSettings>(DEFAULT_SETTINGS);
  const [statusDetail, setStatusDetail] = useState<string>(
    "Idle. Click into any text box, then press Start."
  );
  const [statusState, setStatusState] = useState<StatusState>("idle");
  const [resumable, setResumable] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [titleLen, setTitleLen] = useState(TITLE.length);
  const loaded = useRef(false);
  const themeLoaded = useRef(false);
  const [apiMode, setApiMode] = useState<boolean>(false);
  const apiModeLoaded = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = (await chrome.storage.local.get({ dripwriterSettings: DEFAULT_SETTINGS })) as {
        dripwriterSettings?: Partial<DripwriterSettings>;
      };

      const merged: DripwriterSettings = {
        ...DEFAULT_SETTINGS,
        ...stored.dripwriterSettings
      };

      if (merged.breakMaxSeconds < merged.breakMinSeconds) {
        merged.breakMaxSeconds = merged.breakMinSeconds;
      }

      if (cancelled) return;
      setSettings(merged);
      loaded.current = true;

      void refreshStatus();
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    void chrome.storage.local.set({ [STORAGE_KEY]: settings });
  }, [settings]);

  useEffect(() => {
    chrome.storage.local.get({ [THEME_KEY]: "dark" }).then(r => {
      setTheme((r[THEME_KEY] as "dark" | "light") || "dark");
      themeLoaded.current = true;
    });
  }, []);

  useEffect(() => {
    document.body.dataset.theme = theme;
    if (!themeLoaded.current) return;
    void chrome.storage.local.set({ [THEME_KEY]: theme });
  }, [theme]);

  useEffect(() => {
    chrome.storage.local.get({ [API_MODE_STORAGE_KEY]: false }).then(r => {
      setApiMode(Boolean(r[API_MODE_STORAGE_KEY]));
      apiModeLoaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (!apiModeLoaded.current) return;
    void chrome.storage.local.set({ [API_MODE_STORAGE_KEY]: apiMode });
  }, [apiMode]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (!tab?.id) return;
      const key = `title_played_${tab.id}`;
      chrome.storage.session.get(key).then(r => {
        if (!r[key]) {
          chrome.storage.session.set({ [key]: true });
          setTitleLen(0);
        }
      });
    });
  }, []);

  useEffect(() => {
    if (titleLen >= TITLE.length) return;
    const t = setTimeout(() => setTitleLen(l => l + 1), 55);
    return () => clearTimeout(t);
  }, [titleLen]);

  const sendToActiveTab = useCallback(
    async (message: DripwriterMessage): Promise<DripwriterResponse | null> => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab?.id) {
        setStatusDetail("No active tab to type into.");
        setStatusState("error");
        return null;
      }

      const isDocs = tab.url?.startsWith("https://docs.google.com/document/");
      let frameId: number | undefined = isDocs ? 0 : undefined;

      if (!isDocs) {
        const res = (await chrome.runtime.sendMessage({
          type: "GET_TARGET_FRAME",
          tabId: tab.id
        })) as TargetFrameResponse | undefined;

        if (res?.frameId == null) {
          setStatusDetail("Click into a text box on the page, then press Start.");
          setStatusState("error");
          return null;
        }
        frameId = res.frameId;
      }

      try {
        return (await chrome.tabs.sendMessage(
          tab.id,
          message,
          frameId != null ? { frameId } : undefined
        )) as DripwriterResponse;
      } catch {
        setStatusDetail("Reload the page so the extension can attach, then try again.");
        setStatusState("error");
        return null;
      }
    },
    []
  );

  const refreshStatus = useCallback(async () => {
    const response = await sendToActiveTab({ type: "GET_STATUS" });
    if (!response) return;
    setStatusDetail(response.status.detail);
    setStatusState(stateForStatus(response.status, "idle"));
    setResumable(Boolean(response.status.resumable) && !response.status.running);
  }, [sendToActiveTab]);

  useEffect(() => {
    if (statusState !== "running") return;
    const id = setInterval(() => void refreshStatus(), 500);
    return () => clearInterval(id);
  }, [statusState, refreshStatus]);

  const onStart = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!settings.text.trim()) {
        setStatusDetail("Paste some text into the extension first.");
        setStatusState("error");
        return;
      }

      let payload = settings;
      if (settings.breakMaxSeconds < settings.breakMinSeconds) {
        payload = { ...settings, breakMaxSeconds: settings.breakMinSeconds };
        setSettings(payload);
      }

      setResumable(false);

      const response = await sendToActiveTab({ type: "START_DRIP", payload });
      if (!response) return;

      setStatusDetail(response.status.detail);
      setStatusState(stateForStatus(response.status, "done"));

      if (response.ok && closeOnStart) {
        window.close();
      }
    },
    [settings, sendToActiveTab, closeOnStart]
  );

  const onStop = useCallback(async () => {
    const response = await sendToActiveTab({ type: "STOP_DRIP" });
    if (!response) {
      setStatusDetail("Stopped locally.");
      setStatusState("idle");
      setResumable(false);
      return;
    }
    setStatusDetail(response.status.detail);
    setStatusState("idle");
    setResumable(Boolean(response.status.resumable) && !response.status.running);
  }, [sendToActiveTab]);

  const onResume = useCallback(async () => {
    const response = await sendToActiveTab({ type: "RESUME_DRIP", payload: { ...settings } });
    if (!response) return;

    setStatusDetail(response.status.detail);
    setStatusState(stateForStatus(response.status, "done"));

    if (!response.status.resumable) {
      setResumable(false);
    }

    if (response.ok && closeOnStart) {
      window.close();
    }
  }, [settings, sendToActiveTab, closeOnStart]);

  const onDiagnostics = useCallback(async () => {
    const response = await sendToActiveTab({ type: "RUN_DIAGNOSTICS" });
    if (!response) return;
    setResumable(false);
    setStatusDetail(response.status.detail);

    setStatusState(stateForStatus(response.status, "done"));
    if (response.ok && closeOnStart) window.close();
  }, [sendToActiveTab, closeOnStart]);

  const update = <K extends keyof DripwriterSettings>(key: K, value: DripwriterSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <main className="shell">
      <header className="hero">
        <h1 className="title">
          {TITLE.slice(0, Math.min(titleLen, TITLE_SPLIT))}
          {titleLen > TITLE_SPLIT ? <em>{TITLE.slice(TITLE_SPLIT, titleLen)}</em> : null}
          {titleLen < TITLE.length && <span className="title-cursor" />}
        </h1>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <ol className="subcopy">
          <li>Paste text</li>
          <li>Click where you want to type</li>
          <li>Hit <kbd>START</kbd></li>
          <li>Let the extension type it naturally, indistinguishable from a human.</li>
        </ol>
      </header>

      <section className="status" data-state={statusState}>
        {statusDetail}
      </section>

      <form className="panel" onSubmit={onStart}>
        <label className="text-block" htmlFor="text">
          <span className="text-block__label">Text to type</span>
          <textarea
            id="text"
            rows={9}
            placeholder="Paste the text you want typed into any text box..."
            value={settings.text}
            onChange={(e) => update("text", e.target.value)}
          />
        </label>

        <div className="mixer">

          {/* Speed */}
          <div className="mix-group">
            <div className="mix-options-hd">Options</div>
            <div className="mix-group-hd">Speed</div>
            <MixRow id="wpm" label="Typing speed"  unit="wpm" min={20}  max={150} value={settings.wpm}          onChange={v => update("wpm", v)} />
            <MixRow id="sv"  label="Speed variance" unit="%"   min={0}   max={80}  value={settings.speedVariance} onChange={v => update("speedVariance", v)} />
          </div>

          {/* Breaks */}
          <div className="mix-group">
            <div className="mix-group-hd">Breaks</div>
            <MixRow id="bf"   label="Break frequency" unit="s"  min={15} max={180} step={5} value={settings.breakFrequencySeconds}  onChange={v => update("breakFrequencySeconds", v)} />
            <MixRow id="bfv"  label="Frequency vary"  unit="%"  min={0}  max={100} step={5} value={settings.breakFrequencyVariance} onChange={v => update("breakFrequencyVariance", v)} />
            <MixRow id="bmin" label="Shortest break"  unit="s"  min={3}  max={20}           value={settings.breakMinSeconds}        onChange={v => update("breakMinSeconds", v)} />
            <MixRow id="bmax" label="Longest break"   unit="s" min={4}  max={25}           value={settings.breakMaxSeconds}       onChange={v => update("breakMaxSeconds", v)} />
          </div>

          {/* Natural Mistakes */}
          <div className="mix-group">
            <div className="mix-group-hd">Natural Mistakes</div>
            <MixRow id="typo" label="Typos"        unit="%" min={0} max={25} value={settings.typoRate}   onChange={v => update("typoRate", v)} />
            <MixRow id="fs"   label="False starts" unit="%" min={0} max={20} value={settings.detourRate} onChange={v => update("detourRate", v)} />
          </div>

        </div>

        <div className="actions">
          <button type="submit" className="button button--primary">
            Start
          </button>
          {resumable && statusState !== "running" && (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => void onResume()}
            >
              Resume
            </button>
          )}
          <button
            type="button"
            className="button button--ghost"
            onClick={() => void onDiagnostics()}
          >
            Run Test
          </button>
          {statusState === "running" && (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => void onStop()}
            >
              Stop
            </button>
          )}
        </div>
      </form>

      <footer className="popup-footer">
        <span className="footer-brand">Dripwriter Origin</span>
        <span className="popup-version">{VERSION_TAG}</span>
      </footer>

      <div className="api-toggle">
        <label className="api-toggle__row">
          <input
            type="checkbox"
            checked={apiMode}
            onChange={(e) => setApiMode(e.target.checked)}
          />
          <span className="api-toggle__label">Enable API mode</span>
          <span
            className="api-toggle__pill"
            aria-hidden
            data-on={apiMode}
          />
        </label>
        <p className="api-toggle__hint">
          Exposes <code>window._dripwriter</code> on the active page. Active immediately — no reload needed.
        </p>
      </div>
    </main>
  );
}
