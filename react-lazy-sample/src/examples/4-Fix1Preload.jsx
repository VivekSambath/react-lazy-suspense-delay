// 4. ARTICLE FIX #1: PRELOAD BEFORE THE FIRST RENDER
// Start the import before React renders the lazy component, and wait up to 100 ms.
// If the code is ready by then, React.lazy doesn't suspend, so there's no 300 ms throttle.
//
// In the real app this happens once at startup, before root.render(). Here it runs in an
// effect so you can trigger it with the Mount button.
//
// Weak spot: if the code takes longer than 100 ms, the component still suspends, just
// later, and the 300 ms window starts later too.
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

  if (!started) return null; // the app hasn't rendered yet (startup wait)

  return (
    <Suspense fallback={<Loading />}>
      <Dashboard startedAt={startedAt} />
    </Suspense>
  );
}
