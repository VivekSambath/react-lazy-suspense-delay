// Reconstructed from the article "React.lazy, Suspense and the Hidden 300 ms Delay".
//
// Gate instead of suspend: returns false (render a placeholder as ordinary content)
// until the lazy component's code has loaded, then forces a normal re-render.
// Because nothing suspends, React's 300 ms Suspense reveal throttle never applies.

import { useEffect, useReducer } from "react";
import { isLazySettled, preloadLazy } from "./preloadLazy";

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
