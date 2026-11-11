// 6. Article alternative: own cache, no React.lazy, no private fields.
import Loading from "../components/Loading.jsx";
import { useLoadedComponent } from "../lazy/useLoadedComponent.js";

const loadDashboard = () => import("../components/Dashboard.jsx");

export default function Alternative({ startedAt }) {
  const Dashboard = useLoadedComponent(loadDashboard);
  return Dashboard ? <Dashboard startedAt={startedAt} /> : <Loading />;
}
