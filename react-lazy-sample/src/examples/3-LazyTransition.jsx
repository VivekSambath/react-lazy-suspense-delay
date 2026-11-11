// 3. LAZY + useTransition
// The Suspense boundary is already showing "Home page". Switching to the Dashboard inside
// a transition keeps "Home page" on screen (no fallback flash) and shows `isPending` instead.
//
// Note (from the article): a transition can't skip the fallback of a boundary that is
// mounting for the FIRST time. It only helps when content is already visible, like here.
import { lazy, Suspense, useState, useTransition } from "react";
import Loading from "../components/Loading.jsx";

const Dashboard = lazy(() => import("../components/Dashboard.jsx"));

export default function LazyTransition() {
  const [page, setPage] = useState("home");
  const [clickedAt, setClickedAt] = useState(0);
  const [isPending, startTransition] = useTransition();

  function openDashboard() {
    const now = performance.now();
    startTransition(() => {
      setClickedAt(now);
      setPage("dashboard");
    });
  }

  return (
    <div className="stack">
      <div className="row">
        <button className="btn" onClick={openDashboard} disabled={page === "dashboard"}>
          Open dashboard
        </button>
        {isPending && <span className="pending">Updating…</span>}
      </div>

      <Suspense fallback={<Loading />}>
        {page === "dashboard" ? (
          <Dashboard startedAt={clickedAt} />
        ) : (
          <div className="widget home">🏠 Home page</div>
        )}
      </Suspense>
    </div>
  );
}
