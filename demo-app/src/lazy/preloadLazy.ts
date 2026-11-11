/**
 * Start a React.lazy component's import BEFORE React renders it.
 *
 * React.lazy keeps its state in private fields:
 *   _init(_payload)  starts the import (or returns the loaded component)
 *   _payload._status -1 not started · 0 loading · 1 loaded · 2 failed
 *
 * If React ever changes these fields, every component simply counts as "settled"
 * and the app behaves exactly as it would without this helper.
 */
type LazyInternals = {
  _init?: (payload: unknown) => unknown;
  _payload?: { _status?: number };
};

const settled = new WeakSet<object>();

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return !!value && typeof (value as PromiseLike<unknown>).then === "function";
}

export function preloadLazy(component: object): Promise<void> {
  const lazy = component as LazyInternals;

  // Not a lazy component (or React changed its internals): nothing to wait for.
  if (typeof lazy._init !== "function") {
    settled.add(component);
    return Promise.resolve();
  }

  try {
    lazy._init(lazy._payload); // starts import(); returns normally once it has loaded
    settled.add(component);
    return Promise.resolve();
  } catch (thrown) {
    if (isThenable(thrown)) {
      // Still loading: wait for it, then mark as settled (loaded or failed).
      const done = () => {
        settled.add(component);
      };
      return Promise.resolve(thrown).then(done, done);
    }
    // Already failed: settle so the widget renders and its error boundary shows the error.
    settled.add(component);
    return Promise.resolve();
  }
}

export function isLazySettled(component: object): boolean {
  const status = (component as LazyInternals)._payload?._status;
  return settled.has(component) || status === 1 || status === 2;
}
