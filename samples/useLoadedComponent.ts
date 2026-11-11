// Alternative without React's private fields (reconstructed from the article).
// Skips React.lazy: loaded components live in a module-level cache, the import starts
// early, a placeholder shows until it arrives, then a normal state update renders it.
//
// A production version should also handle failed imports: store the error and throw
// it during render so an error boundary shows it. Unlike React.lazy (which keeps a
// failed import permanently), this approach can retry, e.g. when the widget remounts.

import { useEffect, useState, type ComponentType } from "react";

export type Loader<P> = () => Promise<{ default: ComponentType<P> }>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loaded = new Map<Loader<any>, ComponentType<any>>();

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
      if (active) setComponent(() => C); // function form: components are functions
    });
    return () => {
      active = false;
    };
  }, [load, Component]);

  return Component;
}
