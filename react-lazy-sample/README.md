# React.lazy samples

A small, standalone React 19 project for checking each pattern from
[“React.lazy, Suspense and the Hidden 300 ms Delay”](https://tabwidgets.com/blog/react-lazy-suspense-delay)
by hand. It isn't part of the slides or the deployed demo.

## Run

```sh
npm install
npm run dev                      # development
npm run build && npm run preview # production build (closest to real timing)
```

Open the URL Vite prints, pick an example on the left, press **Mount**, and read the
**“visible after X ms”** badge. Use **Cold start** to see first-load behaviour again,
because React.lazy remembers a component once it has loaded. `?example=2` opens an example directly.

Each example page also shows:

- **The code**: the real source files (imported with Vite's `?raw`, so they always match what runs),
  in a read-only editor with file tabs, line numbers and VS Code Dark+ colours.
- **How it works**: numbered steps explaining the code. Click a step to jump to its file and
  highlight the lines it talks about. The steps live in `src/exampleData.jsx`.

## Examples

| # | File | Shows | Expect |
| --- | --- | --- | --- |
| 1 | `src/examples/1-NormalImport.jsx` | Regular `import` | A few ms |
| 2 | `src/examples/2-LazyImport.jsx` | `React.lazy` + `Suspense` | **~300 ms** on a cold start, even though the code loads in a few ms |
| 3 | `src/examples/3-LazyTransition.jsx` | `useTransition` with lazy | “Home page” stays visible with “Updating…”, no fallback flash |
| 4 | `src/examples/4-Fix1Preload.jsx` | Article fix #1: preload before render | Fast when the code is ready within 100 ms |
| 5 | `src/examples/5-Fix2Gate.jsx` | Article fix #2: gate instead of suspend | A few ms (the fix that shipped) |
| 6 | `src/examples/6-Alternative.jsx` | Article alternative: own cache | Same as #5, public APIs only |

Helpers used by the fixes:

- `src/lazy/preloadLazy.js`: starts a lazy component's import early (uses React's private `_init` / `_payload` fields and fails safe if they change)
- `src/lazy/useLazyReady.js`: the gate hook for fix #2
- `src/lazy/useLoadedComponent.js`: the module-level cache for the alternative

## Why example 2 waits ~300 ms

1. A `React.lazy` component **always suspends on its first render**, even when its code is already available.
2. React reveals suspended content **at most once every 300 ms**, counted from when a fallback last appeared
   (`FALLBACK_THROTTLE_MS` in React's source). It's a throttle to avoid flicker, not a fixed delay:
   code that takes longer than 300 ms gets no extra wait.

Fixes #2 and the alternative never suspend, so the throttle never applies.

Tip: open DevTools → Network and press Mount on a lazy example. After a build, the Dashboard code arrives as
its own `Dashboard-*.js` chunk.
