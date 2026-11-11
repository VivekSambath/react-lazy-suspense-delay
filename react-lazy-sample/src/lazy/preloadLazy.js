/**
 * Article fix #1 helper: start a React.lazy component's import BEFORE React renders it.
 *
 * React.lazy keeps its state in PRIVATE fields (not a public API):
 *   component._init(component._payload)  starts the import, or returns the loaded component
 *   component._payload._status           -1 not started · 0 loading · 1 loaded · 2 failed
 *
 * If React ever changes these fields, every component just counts as "settled" and the
 * app behaves exactly as it would without this helper.
 */
const settled = new WeakSet();

export function preloadLazy(component) {
  // Not a lazy component (or React changed its internals): nothing to wait for.
  if (typeof component._init !== "function") {
    settled.add(component);
    return Promise.resolve();
  }

  try {
    component._init(component._payload); // starts import(); returns normally once loaded
    settled.add(component);
    return Promise.resolve();
  } catch (thrown) {
    if (thrown && typeof thrown.then === "function") {
      // Still loading: wait for it, then mark as settled (loaded or failed).
      const done = () => settled.add(component);
      return Promise.resolve(thrown).then(done, done);
    }
    // Already failed: settle, so the widget renders and its error boundary shows the error.
    settled.add(component);
    return Promise.resolve();
  }
}

export function isLazySettled(component) {
  const status = component._payload?._status;
  return settled.has(component) || status === 1 || status === 2;
}
