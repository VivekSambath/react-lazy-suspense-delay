// 2. LAZY IMPORT + SUSPENSE  (the problem)
// Dashboard is split into its own chunk and loaded on its first render.
//
// What to notice: the code arrives in a few ms, but the Dashboard shows up ~300 ms after
// the fallback appeared. Two reasons (from the article):
//   1. A React.lazy component ALWAYS suspends on its first render, even if its code is ready.
//   2. React reveals suspended content at most once every 300 ms (FALLBACK_THROTTLE_MS).
import { lazy, Suspense } from "react";
import Loading from "../components/Loading.jsx";

const Dashboard = lazy(() => import("../components/Dashboard.jsx"));

export default function LazyImport({ startedAt }) {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard startedAt={startedAt} />
    </Suspense>
  );
}
