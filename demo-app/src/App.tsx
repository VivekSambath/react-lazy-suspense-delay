import { useCallback, useEffect, useRef, useState } from "react";
import { createWidgets, type Speed, type Widget } from "./widgets/registry";
import { preloadLazy } from "./lazy/preloadLazy";
import { startRun } from "./timing";
import { CachedTile, ErrorBoundary, GatedTile, SuspendingTile } from "./tiles";
import { Timeline } from "./Timeline";

type Mode = "suspend" | "preload" | "gate" | "cache";

const MODES: Record<Mode, { tab: string; title: string; text: string; file: string; code: string }> = {
  suspend: {
    tab: "Before",
    title: "React.lazy + Suspense",
    text: "Every widget suspends once, even when its code is quick. React then reveals suspended content at most every 300 ms, so widgets wait and pop in together.",
    file: "src/tiles.tsx → SuspendingTile",
    code: `import { lazy, Suspense } from "react"; // both from React

const Clock = lazy(() => import("./widgets/Clock"));

function SuspendingTile({ widget }) {
  return (
    <Suspense fallback={<WidgetLoading />}>
      <widget.Lazy />   {/* suspends on first render */}
    </Suspense>
  );
}`,
  },
  preload: {
    tab: "Fix #1",
    title: "Preload, then wait up to 100 ms",
    text: "Start every import before the first render and wait up to 100 ms. Widgets that loaded in time don't suspend, but they all wait for the cap. Music is slower than the cap, so it still suspends and hits the 300 ms rule later.",
    file: "src/App.tsx → openNewTab · src/lazy/preloadLazy.ts",
    code: `// App.tsx → openNewTab: start every import, wait ≤ 100 ms, then render
await Promise.race([
  Promise.all(widgets.map((w) => preloadLazy(w.Lazy))),
  new Promise((resolve) => setTimeout(resolve, 100)),
]);
setTab({ run, mode, widgets });

// ── lazy/preloadLazy.ts (custom helper, not from React) ──
// Uses React.lazy's private fields: _init, _payload, _payload._status
export function preloadLazy(component) {
  try {
    component._init(component._payload);   // starts import(); returns once loaded
    return Promise.resolve();
  } catch (promise) {
    return promise.then(done, done);       // still loading: wait for it
  }
}`,
  },
  gate: {
    tab: "Fix #2",
    title: "Gate instead of suspend (shipped)",
    text: "No suspending: the placeholder is ordinary content, and a normal state update swaps in each widget the moment its code arrives. The 300 ms rule never applies.",
    file: "src/tiles.tsx → GatedTile · src/lazy/useLazyReady.ts",
    code: `// ── tiles.tsx ──
import { useLazyReady } from "./lazy/useLazyReady"; // custom hook, not from React

function GatedTile({ widget }) {
  const ready = useLazyReady(widget.Lazy);            // false until the code loads
  return ready ? <widget.Lazy /> : <WidgetLoading />; // nothing suspends
}

// ── lazy/useLazyReady.ts (custom hook) ──
import { useEffect, useReducer } from "react";              // React hooks
import { isLazySettled, preloadLazy } from "./preloadLazy"; // custom helpers

export function useLazyReady(component) {
  const [, rerender] = useReducer((n) => n + 1, 0); // forces a re-render
  const ready = isLazySettled(component);           // code loaded yet?
  useEffect(() => {
    if (!ready) preloadLazy(component).then(rerender); // load, then re-render
  }, [component, ready]);
  return ready;
}

// ── lazy/preloadLazy.ts (custom helpers, use React.lazy's private fields) ──
export function isLazySettled(component) {
  const status = component._payload?._status; // 1 = loaded, 2 = failed
  return settled.has(component) || status === 1 || status === 2;
}
export function preloadLazy(component) {
  try {
    component._init(component._payload);   // starts import(); returns once loaded
    return Promise.resolve();
  } catch (promise) {
    return promise.then(done, done);       // still loading: wait for it
  }
}`,
  },
  cache: {
    tab: "Alternative",
    title: "Own cache, no React.lazy",
    text: "Same result without React's private fields: loaded components live in a module-level cache, and a state update renders them.",
    file: "src/tiles.tsx → CachedTile · src/lazy/useLoadedComponent.ts",
    code: `// ── lazy/useLoadedComponent.ts (custom hook, no React.lazy) ──
import { useEffect, useState } from "react"; // React hooks

const loaded = new WeakMap(); // loader → component

function useLoadedComponent(load) {
  const [C, setC] = useState(() => loaded.get(load));
  useEffect(() => {
    if (!C) load().then((m) => { loaded.set(load, m.default); setC(() => m.default); });
  }, [load, C]);
  return C;
}

function CachedTile({ widget }) {
  const Loaded = useLoadedComponent(widget.load);
  return Loaded ? <Loaded /> : <WidgetLoading />;
}`,
  },
};

const TILE = { suspend: SuspendingTile, preload: SuspendingTile, gate: GatedTile, cache: CachedTile };

type Tab = { run: number; mode: Mode; widgets: Widget[] };

export default function App() {
  // Deep-linkable: demo/?mode=gate opens straight on fix #2.
  const [mode, setMode] = useState<Mode>(() => {
    const fromUrl = new URLSearchParams(location.search).get("mode");
    return fromUrl && fromUrl in MODES ? (fromUrl as Mode) : "suspend";
  });
  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set("mode", mode);
    history.replaceState(null, "", url);
  }, [mode]);
  // demo/?embed=1 hides the page header and footer (used inside the slides).
  const embed = new URLSearchParams(location.search).has("embed");
  const [speed, setSpeed] = useState<Speed>("fast");
  const [tab, setTab] = useState<Tab | null>(null);
  const latestRun = useRef(0);

  /** Simulates opening a new browser tab: a cold start with fresh widgets. */
  const openNewTab = useCallback(async (nextMode: Mode, nextSpeed: Speed) => {
    setTab(null);
    const run = startRun();
    latestRun.current = run;
    const widgets = createWidgets(run, nextSpeed);

    if (nextMode === "preload") {
      // Fix #1: start every import now, give them up to 100 ms before the first render.
      await Promise.race([
        Promise.all(widgets.map((w) => preloadLazy(w.Lazy))),
        new Promise((resolve) => setTimeout(resolve, 100)),
      ]);
      if (latestRun.current !== run) return; // a newer tab was opened meanwhile
    }
    setTab({ run, mode: nextMode, widgets });
  }, []);

  // Open a fresh tab whenever the mode or speed changes (and on first load).
  useEffect(() => {
    openNewTab(mode, speed);
  }, [mode, speed, openNewTab]);

  const info = MODES[mode];
  const Tile = tab ? TILE[tab.mode] : null;

  return (
    <div className={embed ? "app embed" : "app"}>
      <header>
        <div>
          <p className="kicker">Live demo · React 19</p>
          <h1>The hidden 300 ms delay</h1>
        </div>
        <a className="back" href="../" target="_top">← Back to the slides</a>
      </header>

      <div className="controls">
        <div className="tabs" role="tablist" aria-label="Approach">
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <button key={m} role="tab" aria-selected={m === mode} className={m === mode ? "on" : ""} onClick={() => setMode(m)}>
              {MODES[m].tab}
            </button>
          ))}
        </div>
        <label className="speed">
          Code loads
          <select value={speed} onChange={(e) => setSpeed(e.target.value as Speed)}>
            <option value="fast">fast (local disk)</option>
            <option value="slow">slow (busy machine)</option>
          </select>
        </label>
        <button className="primary" onClick={() => openNewTab(mode, speed)}>
          ↻ Open a new tab
        </button>
      </div>

      <section className={`explain ${mode}`}>
        <h2>{info.title}</h2>
        <p>{info.text}</p>
        <code>{info.file}</code>
        <details open={embed}>
          <summary>Show the code</summary>
          <pre>
            <code>{info.code}</code>
          </pre>
        </details>
      </section>

      <main className="dashboard" aria-label="New tab dashboard">
        {tab && Tile
          ? tab.widgets.map((w) => (
              <article className="frame" key={`${tab.run}-${w.id}`}>
                <h3>{w.name}</h3>
                <div className="body">
                  <ErrorBoundary>
                    <Tile widget={w} run={tab.run} />
                  </ErrorBoundary>
                </div>
              </article>
            ))
          : WIDGET_NAMES.map((name) => (
              // Empty frames for the moment before the tab renders (e.g. during fix #1's wait).
              <article className="frame" key={name}>
                <h3>{name}</h3>
                <div className="body" />
              </article>
            ))}
      </main>

      {tab && <Timeline widgets={tab.widgets} />}

      <footer>
        Production build of React 19.1. Numbers are commit times after “Open a new tab”, measured in your browser.
        Based on <a href="https://tabwidgets.com/blog/react-lazy-suspense-delay">Matthew Wong's article</a>.
      </footer>
    </div>
  );
}

const WIDGET_NAMES = ["Clock", "Notes", "Weather", "To-do", "Quote", "Music"];
