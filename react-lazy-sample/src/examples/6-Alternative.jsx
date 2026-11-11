// 6. ARTICLE ALTERNATIVE: OWN CACHE, NO React.lazy, NO PRIVATE FIELDS
// Same result as fix #2 using only public React APIs: a module-level cache plus useState.
import Loading from "../components/Loading.jsx";
import { useLoadedComponent } from "../lazy/useLoadedComponent.js";

// Defined once at module level: the loader must be stable because it is the cache key.
const loadDashboard = () => import("../components/Dashboard.jsx");

export default function Alternative({ startedAt }) {
  const Dashboard = useLoadedComponent(loadDashboard);
  return Dashboard ? <Dashboard startedAt={startedAt} /> : <Loading />;
}
