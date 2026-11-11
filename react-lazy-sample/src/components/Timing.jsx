// Small badge: "visible after X ms". Amber when React held the component back.
export default function Timing({ ms }) {
  if (ms === null) return null;
  return (
    <span className={`timing ${ms > 150 ? "slow" : "fast"}`}>
      visible after <b>{ms} ms</b>
    </span>
  );
}
