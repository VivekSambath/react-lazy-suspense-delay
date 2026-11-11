/**
 * A tiny store that records, per widget, when (ms after "open a new tab"):
 *   placeholder – the loading placeholder first appeared
 *   code        – the widget's code finished loading
 *   shown       – the real widget was committed to the screen
 *
 * Kept outside React on purpose: recording a time must not trigger extra renders in the
 * dashboard, or we'd be measuring our own measuring.
 */
export type WidgetTiming = { placeholder?: number; code?: number; shown?: number };
export type Timings = Record<string, WidgetTiming>;

let startedAt = performance.now();
let currentRun = 0;
let timings: Timings = {};
const listeners = new Set<() => void>();
let notifyScheduled = false;

/** Start a new "tab": resets the clock and returns its run id. */
export function startRun(): number {
  currentRun += 1;
  startedAt = performance.now();
  timings = {};
  notify();
  return currentRun;
}

export function elapsed(): number {
  return Math.round(performance.now() - startedAt);
}

export function mark(run: number, widgetId: string, event: keyof WidgetTiming): void {
  if (run !== currentRun) return; // ignore late events from a previous tab
  const current = timings[widgetId] ?? {};
  if (current[event] !== undefined) return; // keep the first time only
  timings = { ...timings, [widgetId]: { ...current, [event]: elapsed() } };
  notify();
}

// Listeners are told once per frame, after the browser has painted.
function notify(): void {
  if (notifyScheduled) return;
  notifyScheduled = true;
  requestAnimationFrame(() => {
    notifyScheduled = false;
    listeners.forEach((listener) => listener());
  });
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTimings(): Timings {
  return timings;
}
