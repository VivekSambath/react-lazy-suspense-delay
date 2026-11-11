// Each example: the live component, its real source files (imported as text with ?raw,
// so the code shown is always the code that runs), and a step-by-step explanation.
// A step's `mark` is a code snippet; lines containing it get highlighted.

import NormalImport from "./examples/1-NormalImport.jsx";
import LazyImport from "./examples/2-LazyImport.jsx";
import LazyTransition from "./examples/3-LazyTransition.jsx";
import Fix1Preload from "./examples/4-Fix1Preload.jsx";
import Fix2Gate from "./examples/5-Fix2Gate.jsx";
import Alternative from "./examples/6-Alternative.jsx";

import ex1 from "./examples/1-NormalImport.jsx?raw";
import ex2 from "./examples/2-LazyImport.jsx?raw";
import ex3 from "./examples/3-LazyTransition.jsx?raw";
import ex4 from "./examples/4-Fix1Preload.jsx?raw";
import ex5 from "./examples/5-Fix2Gate.jsx?raw";
import ex6 from "./examples/6-Alternative.jsx?raw";
import profileSrc from "./components/Profile.jsx?raw";
import dashboardSrc from "./components/Dashboard.jsx?raw";
import loadingSrc from "./components/Loading.jsx?raw";
import preloadLazySrc from "./lazy/preloadLazy.js?raw";
import useLazyReadySrc from "./lazy/useLazyReady.js?raw";
import useLoadedComponentSrc from "./lazy/useLoadedComponent.js?raw";

const F = {
  ex1: { path: "src/examples/1-NormalImport.jsx", source: ex1 },
  ex2: { path: "src/examples/2-LazyImport.jsx", source: ex2 },
  ex3: { path: "src/examples/3-LazyTransition.jsx", source: ex3 },
  ex4: { path: "src/examples/4-Fix1Preload.jsx", source: ex4 },
  ex5: { path: "src/examples/5-Fix2Gate.jsx", source: ex5 },
  ex6: { path: "src/examples/6-Alternative.jsx", source: ex6 },
  profile: { path: "src/components/Profile.jsx", source: profileSrc },
  dashboard: { path: "src/components/Dashboard.jsx", source: dashboardSrc },
  loading: { path: "src/components/Loading.jsx", source: loadingSrc },
  preloadLazy: { path: "src/lazy/preloadLazy.js", source: preloadLazySrc },
  useLazyReady: { path: "src/lazy/useLazyReady.js", source: useLazyReadySrc },
  useLoadedComponent: { path: "src/lazy/useLoadedComponent.js", source: useLoadedComponentSrc },
};

export const EXAMPLES = [
  {
    title: "Normal import",
    summary: "A regular import. The component ships with the app, so it renders straight away.",
    expect: "A few ms.",
    Component: NormalImport,
    files: [F.ex1, F.profile],
    steps: [
      { file: F.ex1.path, mark: "import Profile from", body: <>A regular <code>import</code>. The bundler puts <code>Profile</code> into the main bundle (<code>index-*.js</code>), which downloads before the app starts.</> },
      { file: F.ex1.path, mark: "<Profile startedAt", body: <>React renders it right away. The code is already in memory, so there's nothing to wait for and nothing can suspend.</> },
      { file: F.profile.path, mark: "useVisibleAfter(startedAt)", body: <><code>useVisibleAfter</code> measures the time from your click to the moment React commits the component. That's the badge you see.</> },
      { file: F.ex1.path, mark: null, body: <><strong>Trade-off:</strong> every static import makes the first download bigger. That's why big or rarely used parts are lazy-loaded instead (next example).</> },
    ],
  },
  {
    title: "Lazy import + Suspense",
    summary: "Code splitting with React.lazy. This is the setup that hides the ~300 ms delay.",
    expect: "~300 ms on a cold start, even though the code loads in a few ms.",
    Component: LazyImport,
    files: [F.ex2, F.dashboard, F.loading],
    steps: [
      { file: F.ex2.path, mark: "lazy(() => import(", body: <><code>lazy()</code> wraps a dynamic <code>import()</code>. Nothing loads yet. The bundler splits <code>Dashboard</code> into its own chunk (<code>Dashboard-*.js</code>).</> },
      { file: F.ex2.path, mark: "<Dashboard startedAt", body: <>On the first render React starts the import. The promise can't resolve during that render, so <code>Dashboard</code> <strong>always suspends once</strong>, even if the file is already cached.</> },
      { file: F.ex2.path, mark: "fallback={<Loading />}", body: <>The nearest <code>&lt;Suspense&gt;</code> shows its fallback, <code>&lt;Loading /&gt;</code>.</> },
      { file: F.loading.path, mark: 'className="widget loading"', body: <>The fallback is the same size as the real widget, so nothing jumps when it's replaced.</> },
      { file: F.ex2.path, mark: null, body: <>The code arrives in a few ms, but React reveals suspended content <strong>at most once every 300 ms</strong> after a fallback appeared (<code>FALLBACK_THROTTLE_MS</code>). That's the ~300 ms on the badge. It's a throttle to prevent flicker, not a fixed delay: slower code gets no extra wait.</> },
      { file: F.ex2.path, mark: "const Dashboard = lazy", body: <>Press <strong>Remount</strong> and it's instant: the lazy component remembers its loaded module, so it doesn't suspend again. <strong>Cold start</strong> resets it.</> },
    ],
  },
  {
    title: "Lazy + useTransition",
    summary: "A transition keeps already-visible content on screen instead of flashing the fallback.",
    expect: "“Home page” stays visible (with “Updating…”) until the Dashboard is ready.",
    Component: LazyTransition,
    selfStarting: true,
    files: [F.ex3],
    steps: [
      { file: F.ex3.path, mark: "🏠 Home page", body: <>The Suspense boundary starts by showing <code>Home page</code>. Nothing suspends yet.</> },
      { file: F.ex3.path, mark: "startTransition(() => {", body: <>Clicking runs <code>setPage("dashboard")</code> inside <code>startTransition</code>, which marks the update as non-urgent.</> },
      { file: F.ex3.path, mark: "{isPending &&", body: <><code>Dashboard</code> suspends during the transition. Instead of swapping Home for the fallback, React keeps Home on screen and sets <code>isPending</code>, so we show “Updating…”.</> },
      { file: F.ex3.path, mark: "<Dashboard startedAt={clickedAt}", body: <>When the code arrives, React commits the Dashboard. Transition updates aren't held by the Suspense reveal throttle, so it appears as soon as it's ready.</> },
      { file: F.ex3.path, mark: null, body: <><strong>Limit:</strong> this only helps when content is already visible. A boundary mounting for the first time (example 2) still shows its fallback. Tip: DevTools → Network → <em>Slow 4G</em> makes “Updating…” easier to see.</> },
    ],
  },
  {
    title: "Fix #1: preload before render",
    summary: "Article fix #1: start the import early so the component doesn't suspend when it renders.",
    expect: "Fast, because the code is ready before the first render.",
    Component: Fix1Preload,
    files: [F.ex4, F.preloadLazy],
    steps: [
      { file: F.preloadLazy.path, mark: "component._init(component._payload)", body: <><code>preloadLazy</code> calls React.lazy's <strong>private</strong> <code>_init(_payload)</code>. That starts the import <em>before</em> React renders the component.</> },
      { file: F.preloadLazy.path, mark: "thrown.then", body: <>If the code is still loading, <code>_init</code> throws a promise. We wait for it, then mark the component as settled in a <code>WeakSet</code>.</> },
      { file: F.preloadLazy.path, mark: "typeof component._init", body: <><strong>Fails safe:</strong> if React ever renames these private fields, the helper simply does nothing and the app behaves as before.</> },
      { file: F.ex4.path, mark: "Promise.race", body: <>Startup waits for the preload <strong>or 100 ms</strong>, whichever comes first, then renders. (Tab Widgets did this once before <code>root.render()</code>.)</> },
      { file: F.ex4.path, mark: "<Dashboard startedAt", body: <>The code is already loaded, so React.lazy returns the component synchronously: <strong>no suspend, no 300 ms throttle</strong>.</> },
      { file: F.ex4.path, mark: null, body: <><strong>Weak spot:</strong> code slower than 100 ms still suspends, just later, so its 300 ms window starts later too. That's why the article moved on to fix #2.</> },
    ],
  },
  {
    title: "Fix #2: gate, don't suspend",
    summary: "Article fix #2, the one that shipped: render the placeholder yourself instead of suspending.",
    expect: "A few ms. Nothing suspends, so there's no 300 ms throttle.",
    Component: Fix2Gate,
    files: [F.ex5, F.useLazyReady, F.preloadLazy],
    steps: [
      { file: F.ex5.path, mark: "useLazyReady(Dashboard)", body: <><code>useLazyReady</code> answers one question: is the Dashboard code loaded yet?</> },
      { file: F.ex5.path, mark: ": <Loading />", body: <>Not yet? Render <code>&lt;Loading /&gt;</code> as <strong>ordinary content</strong>. It isn't a Suspense fallback, so nothing suspends.</> },
      { file: F.useLazyReady.path, mark: "preloadLazy(component).then", body: <>Meanwhile the hook's effect starts the import with <code>preloadLazy</code>…</> },
      { file: F.useLazyReady.path, mark: "if (active) rerender();", body: <>…and when it finishes, forces a normal re-render. Plain state updates aren't throttled.</> },
      { file: F.ex5.path, mark: "{ready ? <Dashboard", body: <>On that re-render the code is loaded, so <code>&lt;Dashboard /&gt;</code> renders immediately. In Tab Widgets this made content appear <strong>~200 ms sooner</strong>.</> },
      { file: F.ex5.path, mark: "<Suspense fallback", body: <>Keep <code>&lt;Suspense&gt;</code> (and an error boundary in a real app) as a safety net: it still catches failed imports, and any suspension if React's private fields change.</> },
    ],
  },
  {
    title: "Alternative: own cache",
    summary: "The same result as fix #2 using only public React APIs: no React.lazy, no private fields.",
    expect: "A few ms, same as fix #2.",
    Component: Alternative,
    files: [F.ex6, F.useLoadedComponent],
    steps: [
      { file: F.ex6.path, mark: "const loadDashboard", body: <>The loader is defined once, at module level. It must be stable because it's the cache key.</> },
      { file: F.ex6.path, mark: "useLoadedComponent(loadDashboard)", body: <><code>useLoadedComponent</code> returns <code>undefined</code> until the code is loaded, so we show <code>&lt;Loading /&gt;</code>.</> },
      { file: F.useLoadedComponent.path, mark: "loaded.set(load, module.default)", body: <>When the import resolves, the component goes into a module-level <code>WeakMap</code> cache…</> },
      { file: F.useLoadedComponent.path, mark: "setComponent(() => C)", body: <>…and into state. The function form <code>() =&gt; C</code> is needed because a component is itself a function.</> },
      { file: F.useLoadedComponent.path, mark: "useState(() => loaded.get(load))", body: <>The next mount reads straight from the cache, so it renders instantly.</> },
      { file: F.ex6.path, mark: null, body: <><strong>Bonus:</strong> React.lazy remembers a failed import forever. This version can retry when the widget remounts. (A real app should also store the error and throw it during render, so an error boundary shows it.)</> },
    ],
  },
];
