import { useState } from "react";
import { EXAMPLES } from "./exampleData.jsx";
import CodeView from "./ui/CodeView.jsx";
import Steps from "./ui/Steps.jsx";

function initialIndex() {
  const n = Number(new URLSearchParams(location.search).get("example"));
  return n >= 1 && n <= EXAMPLES.length ? n - 1 : 0;
}

export default function App() {
  const [index, setIndex] = useState(initialIndex);
  const [mount, setMount] = useState(null); // { key, startedAt } while mounted
  const [step, setStep] = useState(null); // selected explanation step
  const [filePath, setFilePath] = useState(null); // open code tab

  const example = EXAMPLES[index];
  const { Component } = example;
  const activeStep = step === null ? null : example.steps[step];

  function select(i) {
    setIndex(i);
    setMount(null);
    setStep(null);
    setFilePath(null);
    history.replaceState(null, "", `?example=${i + 1}`);
  }

  function selectStep(i) {
    setStep(i);
    setFilePath(example.steps[i].file);
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
        <header className="panel-head">
          <p className="eyebrow">Example {index + 1} of {EXAMPLES.length}</p>
          <h2>{example.title}</h2>
          <p className="summary">{example.summary}</p>
        </header>

        {/* ---------- Try it ---------- */}
        <section className="card try">
          <div className="row">
            {!example.selfStarting && (
              <button className="btn primary" onClick={() => setMount({ key: Date.now(), startedAt: performance.now() })}>
                {mount ? "↻ Remount" : "▶ Mount"}
              </button>
            )}
            {!example.selfStarting && mount && (
              <button className="btn" onClick={() => setMount(null)}>
                Unmount
              </button>
            )}
            <button className="btn" onClick={() => location.reload()} title="Reload the page for a cold start">
              ⟳ Cold start
            </button>
            <span className="expect">
              <strong>Expect:</strong> {example.expect}
            </span>
          </div>

          <div className="stage" aria-live="polite">
            {example.selfStarting ? (
              <Component key={index} />
            ) : mount ? (
              <Component key={mount.key} startedAt={mount.startedAt} />
            ) : (
              <p className="hint">Press Mount to render this example.</p>
            )}
          </div>
        </section>

        {/* ---------- Explanation + code ---------- */}
        <section className="learn">
          <div className="explain">
            <h3>How it works</h3>
            <p className="hint small">Click a step to highlight its code.</p>
            <Steps steps={example.steps} active={step} onSelect={selectStep} />
          </div>
          <CodeView
            key={index}
            files={example.files}
            activePath={filePath ?? example.files[0].path}
            onSelectFile={setFilePath}
            mark={activeStep && activeStep.file === (filePath ?? example.files[0].path) ? activeStep.mark : null}
          />
        </section>
      </main>
    </div>
  );
}
