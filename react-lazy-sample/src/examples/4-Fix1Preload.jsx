// 4. Article fix #1: start the import before rendering, wait up to 100 ms.
import { lazy, Suspense, useEffect, useState } from "react";
import Loading from "../components/Loading.jsx";
import { preloadLazy } from "../lazy/preloadLazy.js";

const Dashboard = lazy(() => import("../components/Dashboard.jsx"));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Fix1Preload({ startedAt }) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.race([preloadLazy(Dashboard), wait(100)]).then(() => {
      if (active) setStarted(true);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!started) return null; // the "app" hasn't rendered yet (startup wait)

  return (
    <Suspense fallback={<Loading />}>
      <Dashboard startedAt={startedAt} />
    </Suspense>
  );
}
