import { useSyncExternalStore } from "react";
import { getTimings, subscribe } from "./timing";
import type { Widget } from "./widgets/registry";

/** A bar per widget: grey while the placeholder shows, green once the widget is visible. */
export function Timeline({ widgets }: { widgets: Widget[] }) {
  const timings = useSyncExternalStore(subscribe, getTimings);

  const shownTimes = widgets.map((w) => timings[w.id]?.shown).filter((t): t is number => t !== undefined);
  const allShown = shownTimes.length === widgets.length;
  const scale = Math.max(600, ...shownTimes.map((t) => t + 60));
  const pct = (ms: number) => `${(ms / scale) * 100}%`;

  return (
    <section className="timeline" aria-label="When each widget appeared">
      <div className="timeline-head">
        <h2>What happened</h2>
        <div className="summary">
          <span>
            First widget <b>{shownTimes.length ? `${Math.min(...shownTimes)} ms` : "…"}</b>
          </span>
          <span>
            All widgets <b>{allShown ? `${Math.max(...shownTimes)} ms` : "…"}</b>
          </span>
        </div>
      </div>

      {widgets.map((w) => {
        const t = timings[w.id] ?? {};
        const waited = t.shown !== undefined && t.code !== undefined ? t.shown - t.code : undefined;
        return (
          <div className="row" key={w.id}>
            <div className="label">{w.name}</div>
            <div className="track">
              {t.placeholder !== undefined && (
                <span className="seg ph" style={{ left: pct(t.placeholder), width: pct((t.shown ?? scale) - t.placeholder) }} />
              )}
              {t.shown !== undefined && <span className="seg ok" style={{ left: pct(t.shown), right: 0 }} />}
              {t.code !== undefined && <span className="code-mark" style={{ left: pct(t.code) }} title="code ready" />}
            </div>
            <div className={`waited ${waited !== undefined && waited > 50 ? "slow" : ""}`}>
              {waited === undefined ? "…" : waited > 50 ? `held ${waited} ms` : "instant"}
            </div>
          </div>
        );
      })}

      <div className="axis">
        <span>0</span>
        <span>{Math.round(scale / 2)} ms</span>
        <span>{scale} ms</span>
      </div>
      <p className="legend">
        <i className="ph" /> placeholder <i className="ok" /> widget visible <i className="code" /> code ready ·
        “held” = time between the code being ready and the widget appearing
      </p>
    </section>
  );
}
