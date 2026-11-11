import { useVisibleAfter } from "../useVisibleAfter.js";
import Timing from "./Timing.jsx";

// A NORMAL component: imported with a regular `import`, so it ships in the main bundle.
export default function Profile({ startedAt }) {
  const ms = useVisibleAfter(startedAt);
  return (
    <div className="widget">
      <span className="icon">👤</span>
      <div>
        <strong>Profile</strong>
        <p>Normal import · part of the main bundle</p>
      </div>
      <Timing ms={ms} />
    </div>
  );
}
