// 1. Normal import: Profile ships in the main bundle and renders immediately.
import Profile from "../components/Profile.jsx";

export default function NormalImport({ startedAt }) {
  return <Profile startedAt={startedAt} />;
}
