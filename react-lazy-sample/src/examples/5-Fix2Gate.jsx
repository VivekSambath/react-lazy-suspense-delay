// 5. ARTICLE FIX #2: DON'T SUSPEND, GATE INSTEAD  (the fix that shipped)
// Render the placeholder as ordinary content until the code is loaded, then a normal
// state update swaps in the Dashboard. Nothing suspends, so the 300 ms rule never applies.
//
// Keep the Suspense boundary (and an error boundary in a real app) as a safety net:
// it still catches failed imports, and any suspension if React's private fields change.
import { lazy, Suspense } from "react";
import Loading from "../components/Loading.jsx";
import { useLazyReady } from "../lazy/useLazyReady.js";

const Dashboard = lazy(() => import("../components/Dashboard.jsx"));

export default function Fix2Gate({ startedAt }) {
  const ready = useLazyReady(Dashboard);

  return (
    <Suspense fallback={<Loading />}>
      {ready ? <Dashboard startedAt={startedAt} /> : <Loading />}
    </Suspense>
  );
}
