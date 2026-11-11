import { Component, Suspense, useLayoutEffect, type ReactNode } from "react";
import { mark } from "./timing";
import { useLazyReady } from "./lazy/useLazyReady";
import { useLoadedComponent } from "./lazy/useLoadedComponent";
import type { Widget } from "./widgets/registry";

type TileProps = { widget: Widget; run: number };

/* ------------------------------------------------------------------ *
 * BEFORE (and fix #1): React.lazy inside Suspense.
 * The lazy component suspends once, and React reveals suspended content
 * at most every 300 ms (FALLBACK_THROTTLE_MS), page-wide.
 * ------------------------------------------------------------------ */
export function SuspendingTile({ widget, run }: TileProps) {
  return (
    <Suspense fallback={<WidgetLoading widget={widget} run={run} />}>
      <widget.Lazy />
      <Shown widget={widget} run={run} />
    </Suspense>
  );
}

/* ------------------------------------------------------------------ *
 * FIX #2 (shipped): gate instead of suspend.
 * The placeholder is ordinary content; a normal re-render swaps in the
 * widget when its code is ready. Suspense stays only as a safety net.
 * ------------------------------------------------------------------ */
export function GatedTile({ widget, run }: TileProps) {
  const ready = useLazyReady(widget.Lazy);
  return (
    <Suspense fallback={<WidgetLoading widget={widget} run={run} />}>
      {ready ? (
        <>
          <widget.Lazy />
          <Shown widget={widget} run={run} />
        </>
      ) : (
        <WidgetLoading widget={widget} run={run} />
      )}
    </Suspense>
  );
}

/* ------------------------------------------------------------------ *
 * ALTERNATIVE: no React.lazy, no private fields — a module-level cache.
 * ------------------------------------------------------------------ */
export function CachedTile({ widget, run }: TileProps) {
  const Loaded = useLoadedComponent(widget.load);
  return Loaded ? (
    <>
      <Loaded />
      <Shown widget={widget} run={run} />
    </>
  ) : (
    <WidgetLoading widget={widget} run={run} />
  );
}

/* ---------------------------- helpers ---------------------------- */

/** The loading placeholder. Records when it first appeared. */
function WidgetLoading({ widget, run }: TileProps) {
  useLayoutEffect(() => mark(run, widget.id, "placeholder"), [run, widget.id]);
  return (
    <div className="placeholder" aria-label={`${widget.name} loading`}>
      <span>loading {widget.name.toLowerCase()}…</span>
    </div>
  );
}

/** Rendered next to the real widget; its layout effect runs when the widget is committed. */
function Shown({ widget, run }: TileProps) {
  useLayoutEffect(() => mark(run, widget.id, "shown"), [run, widget.id]);
  return null;
}

/** Each widget frame keeps an error boundary, as in the article. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <div className="placeholder error">This widget failed to load.</div> : this.props.children;
  }
}
