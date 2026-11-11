import { useVisibleAfter } from "../useVisibleAfter.js";
import Timing from "./Timing.jsx";

// The LAZY-LOADED component. Every example loads this file with a dynamic import(),
// so Vite puts it in its own chunk (see dist/assets/Dashboard-*.js after `npm run build`).
export default function Dashboard({ startedAt }) {
  const ms = useVisibleAfter(startedAt);
  return (
    <div className="widget lazy">
      <span className="icon">📊</span>
      <div>
        <strong>Dashboard</strong>
        <p>Lazy-loaded · its own chunk</p>
      </div>
      <Timing ms={ms} />
    </div>
  );
}
