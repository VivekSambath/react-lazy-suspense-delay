// 2. Lazy import + Suspense: the hidden ~300 ms delay.
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
