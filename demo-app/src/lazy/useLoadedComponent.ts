import { useEffect, useState, type ComponentType } from "react";

/**
 * The alternative that avoids React's private fields: no React.lazy at all.
 * Loaded components live in a module-level cache; the hook shows a placeholder until the
 * import arrives, then renders it through a normal state update.
 *
 * Unlike React.lazy (which remembers a failed import forever), this could retry when the
 * widget remounts. A production version should also store the error and throw it during
 * render so an error boundary can show it.
 */
export type Loader<P = any> = () => Promise<{ default: ComponentType<P> }>;

// WeakMap keyed by the loader function: the loader must be stable (define it once).
const loaded = new WeakMap<Loader, ComponentType<any>>();

export function preload<P>(load: Loader<P>): Promise<ComponentType<P>> {
  return load().then((module) => {
    loaded.set(load, module.default);
    return module.default;
  });
}

export function useLoadedComponent<P>(load: Loader<P>): ComponentType<P> | undefined {
  const [Component, setComponent] = useState<ComponentType<P> | undefined>(() => loaded.get(load));

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
