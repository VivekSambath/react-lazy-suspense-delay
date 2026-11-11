import { useLayoutEffect, useState } from "react";

/**
 * Measures how long after `startedAt` (performance.now() at the click) this component
 * was committed to the screen. Used by the sample components to show "visible after X ms".
 */
export function useVisibleAfter(startedAt) {
  const [ms, setMs] = useState(null);
  useLayoutEffect(() => {
    setMs(Math.round(performance.now() - startedAt));
  }, [startedAt]);
  return ms;
}
