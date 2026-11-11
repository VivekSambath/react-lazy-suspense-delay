import { useEffect, useReducer } from "react";
import { isLazySettled, preloadLazy } from "./preloadLazy.js";

/**
 * Article fix #2 (the one that shipped): a gate instead of a suspend.
 *
 * Returns false until the lazy component's code has loaded, so you render a placeholder
 * as ORDINARY content. When the code arrives, a normal re-render swaps in the component.
 * Nothing suspends, so React's 300 ms Suspense reveal throttle never applies.
 */
export function useLazyReady(component) {
  const [, rerender] = useReducer((n) => n + 1, 0);
  const ready = isLazySettled(component);

  useEffect(() => {
    if (ready) return;
    let active = true;
    preloadLazy(component).then(() => {
      if (active) rerender();
    });
    return () => {
      active = false;
    };
  }, [component, ready]);

  return ready;
}
