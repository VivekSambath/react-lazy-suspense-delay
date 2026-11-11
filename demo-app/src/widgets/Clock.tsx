import { useEffect, useState } from "react";

export default function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="widget clock">
      <div className="big">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
      <div className="muted">{now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}</div>
    </div>
  );
}
