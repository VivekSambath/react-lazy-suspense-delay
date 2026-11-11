import { useState } from "react";
import NormalImport from "./examples/1-NormalImport.jsx";
import LazyImport from "./examples/2-LazyImport.jsx";
import LazyTransition from "./examples/3-LazyTransition.jsx";
import Fix1Preload from "./examples/4-Fix1Preload.jsx";
import Fix2Gate from "./examples/5-Fix2Gate.jsx";
import Alternative from "./examples/6-Alternative.jsx";

const EXAMPLES = [
  {
    title: "Normal import",
    file: "src/examples/1-NormalImport.jsx",
    expect: "A few ms. The component is already in the main bundle.",
    Component: NormalImport,
  },
  {
    title: "Lazy import + Suspense",
    file: "src/examples/2-LazyImport.jsx",
    expect: "~300 ms on a cold start, even though the code loads in a few ms. React holds the reveal.",
    Component: LazyImport,
  },
  {
    title: "Lazy + useTransition",
    file: "src/examples/3-LazyTransition.jsx",
    expect: "“Home page” stays visible with “Updating…” instead of a fallback flash.",
    Component: LazyTransition,
    selfStarting: true,
  },
  {
    title: "Fix #1: preload before render",
    file: "src/examples/4-Fix1Preload.jsx · src/lazy/preloadLazy.js",
    expect: "Fast, because the code is ready before the first render. Slow code would still suspend.",
    Component: Fix1Preload,
  },
  {
    title: "Fix #2: gate, don't suspend",
    file: "src/examples/5-Fix2Gate.jsx · src/lazy/useLazyReady.js",
    expect: "A few ms. No suspension, so no 300 ms throttle. This is the fix that shipped.",
    Component: Fix2Gate,
  },
  {
    title: "Alternative: own cache",
    file: "src/examples/6-Alternative.jsx · src/lazy/useLoadedComponent.js",
    expect: "Same as fix #2, using only public React APIs.",
    Component: Alternative,
  },
];

function initialIndex() {
  const n = Number(new URLSearchParams(location.search).get("example"));
  return n >= 1 && n <= EXAMPLES.length ? n - 1 : 0;
}

export default function App() {
  const [index, setIndex] = useState(initialIndex);
  const [mount, setMount] = useState(null); // { key, startedAt } while mounted

  const example = EXAMPLES[index];
  const { Component } = example;

  function select(i) {
    setIndex(i);
    setMount(null);
    history.replaceState(null, "", `?example=${i + 1}`);
  }

  function mountExample() {
    setMount({ key: Date.now(), startedAt: performance.now() });
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>React.lazy samples</h1>
        <nav>
          {EXAMPLES.map((ex, i) => (
            <button key={ex.title} className={i === index ? "active" : ""} onClick={() => select(i)}>
              <span className="num">{i + 1}</span>
              {ex.title}
            </button>
          ))}
        </nav>
      </aside>

      <main className="panel">
        <header>
          <h2>{example.title}</h2>
          <code className="file">{example.file}</code>
        </header>

        <p className="expect">
          <strong>Expect:</strong> {example.expect}
        </p>

        <div className="row">
          {!example.selfStarting && (
            <button className="btn primary" onClick={mountExample}>
              {mount ? "↻ Remount" : "▶ Mount"}
            </button>
          )}
          {!example.selfStarting && mount && (
            <button className="btn" onClick={() => setMount(null)}>
              Unmount
            </button>
          )}
          <button className="btn" onClick={() => location.reload()} title="Reload the page for a cold start">
            ⟳ Cold start (reload)
          </button>
        </div>

        <section className="stage" aria-live="polite">
          {example.selfStarting ? (
            <Component />
          ) : mount ? (
            <Component key={mount.key} startedAt={mount.startedAt} />
          ) : (
            <p className="hint">Press Mount to render this example.</p>
          )}
        </section>

        <p className="note">
          React.lazy remembers a loaded component, so a <em>second</em> mount of the same example is instant.
          Use <strong>Cold start</strong> to see the first-load behaviour again. For production-like timing:
          <code>npm run build &amp;&amp; npm run preview</code>.
        </p>
      </main>
    </div>
  );
}
