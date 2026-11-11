import { useEffect, useState } from "react";

/**
 * Article alternative: no React.lazy and no private fields.
 * Loaded components live in a module-level cache; show a placeholder until the import
 * arrives, then render it through a normal state update.
 *
 * `load` must be stable (define it once at module level), because it is the cache key.
 * Unlike React.lazy (which remembers a failed import forever), this can retry on remount.
 * A production version should also store the error and throw it during render, so an
 * error boundary can show it.
 */
const loaded = new WeakMap();

export function preload(load) {
  return load().then((module) => {
    loaded.set(load, module.default);
    return module.default;
  });
}

export function useLoadedComponent(load) {
  const [Component, setComponent] = useState(() => loaded.get(load));

  useEffect(() => {
    if (Component) return;
    let active = true;
    preload(load).then((C) => {
      if (active) setComponent(() => C); // function form: a component is itself a function
    });
    return () => {
      active = false;
    };
  }, [load, Component]);

  return Component;
}
