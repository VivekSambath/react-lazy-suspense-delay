// 1. NORMAL IMPORT
// Profile is part of the main bundle. Nothing to load, nothing to wait for:
// it renders immediately.
import Profile from "../components/Profile.jsx";

export default function NormalImport({ startedAt }) {
  return <Profile startedAt={startedAt} />;
}
