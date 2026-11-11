import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { mark } from "../timing";
import type { Loader } from "../lazy/useLoadedComponent";

/**
 * The widget list. Each widget is its own module (its own chunk after `vite build`),
 * loaded with a dynamic import(). `loadMs` adds a small, realistic delay so you can see
 * the timing; Music is deliberately slower than fix #1's 100 ms cap.
 */
const WIDGETS = [
  { id: "clock", name: "Clock", loadMs: 20, importer: () => import("./Clock") },
  { id: "notes", name: "Notes", loadMs: 35, importer: () => import("./Notes") },
  { id: "weather", name: "Weather", loadMs: 50, importer: () => import("./Weather") },
  { id: "todo", name: "To-do", loadMs: 30, importer: () => import("./Todo") },
  { id: "quote", name: "Quote", loadMs: 15, importer: () => import("./Quote") },
  { id: "music", name: "Music", loadMs: 140, importer: () => import("./Music") },
] as const;

export type Speed = "fast" | "slow";

export type Widget = {
  id: string;
  name: string;
  loadMs: number;
  /** Plain loader, used by the "own cache" approach. */
  load: Loader;
  /** The same loader wrapped in React.lazy, used by the other approaches. */
  Lazy: LazyExoticComponent<ComponentType>;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Every "new tab" gets brand-new loaders and lazy components, like a cold start.
 * (The modules themselves stay cached by the browser, which is exactly the article's
 * point: even when code is effectively ready, React.lazy still suspends once.)
 */
export function createWidgets(run: number, speed: Speed): Widget[] {
  const factor = speed === "slow" ? 4 : 1;
  return WIDGETS.map((w) => {
    const load: Loader = () =>
      wait(w.loadMs * factor)
        .then(w.importer)
        .then((module) => {
          mark(run, w.id, "code");
          return module;
        });
    return { id: w.id, name: w.name, loadMs: w.loadMs * factor, load, Lazy: lazy(load) };
  });
}
