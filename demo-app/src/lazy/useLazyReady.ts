import { useEffect, useReducer } from "react";
import { isLazySettled, preloadLazy } from "./preloadLazy";

/**
 * A gate instead of a suspend.
 *
 * Returns false until the lazy component's code has loaded, so the caller can render a
 * placeholder as ORDINARY content. When the code arrives, a normal re-render swaps in the
 * real component. Nothing suspends, so React's 300 ms Suspense reveal throttle never applies.
 */
export function useLazyReady(component: object): boolean {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
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
