import { useState } from "react";

export default function Notes() {
  const [text, setText] = useState("Explain the 300 ms rule\nShow fix #2 live");
  return (
    <div className="widget notes">
      <textarea aria-label="Notes" value={text} onChange={(e) => setText(e.target.value)} />
    </div>
  );
}
