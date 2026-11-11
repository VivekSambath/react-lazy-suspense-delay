import { useState } from "react";

const START = [
  { id: 1, text: "Profile the new tab", done: true },
  { id: 2, text: "Find the idle gap", done: true },
  { id: 3, text: "Stop suspending", done: false },
];

export default function Todo() {
  const [items, setItems] = useState(START);
  const toggle = (id: number) =>
    setItems((list) => list.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  return (
    <ul className="widget todo">
      {items.map((item) => (
        <li key={item.id}>
          <label>
            <input type="checkbox" checked={item.done} onChange={() => toggle(item.id)} /> {item.text}
          </label>
        </li>
      ))}
    </ul>
  );
}
