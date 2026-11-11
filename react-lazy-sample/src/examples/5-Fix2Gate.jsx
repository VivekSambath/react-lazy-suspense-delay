// 5. Article fix #2 (shipped): don't suspend, gate instead.
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
