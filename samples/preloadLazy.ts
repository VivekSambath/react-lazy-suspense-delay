// Reconstructed from the article "React.lazy, Suspense and the Hidden 300 ms Delay"
// (https://tabwidgets.com/blog/react-lazy-suspense-delay). Not a verbatim copy.
//
// Starts a React.lazy component's import ahead of render, using React's private
// lazy fields (_init / _payload / _status). If React ever changes those fields,
// components simply count as settled immediately and behave as before.

type LazyInternals = {
  _init?: (payload: unknown) => unknown;
  _payload?: { _status?: number }; // -1 uninitialized, 0 pending, 1 loaded, 2 failed
};

const settled = new WeakSet<object>();

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return !!value && typeof (value as PromiseLike<unknown>).then === "function";
}

export function preloadLazy(component: object): Promise<void> {
  const lazy = component as LazyInternals;

  // Not a lazy component (or React changed its internals): settle immediately.
  if (typeof lazy._init !== "function") {
    settled.add(component);
    return Promise.resolve();
  }

  try {
    // Starts import() on first call; returns the component once it has loaded.
    lazy._init(lazy._payload);
    settled.add(component);
    return Promise.resolve();
  } catch (thrown) {
    if (isThenable(thrown)) {
      // Still loading: wait for it, then settle (loaded or failed).
      const done = () => {
        settled.add(component);
      };
      return Promise.resolve(thrown).then(done, done);
    }
    // Already failed: settle so the widget renders and its error boundary shows it.
    settled.add(component);
    return Promise.resolve();
  }
}

export function isLazySettled(component: object): boolean {
  const status = (component as LazyInternals)._payload?._status;
  return settled.has(component) || status === 1 || status === 2;
}
