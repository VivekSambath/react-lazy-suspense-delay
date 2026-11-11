/** Numbered "How it works" steps. Clicking a step highlights its code. */
export default function Steps({ steps, active, onSelect }) {
  return (
    <ol className="steps">
      {steps.map((step, i) => (
        <li key={i}>
          <button className={i === active ? "step on" : "step"} onClick={() => onSelect(i)} aria-pressed={i === active}>
            <span className="step-num">{i + 1}</span>
            <span className="step-body">{step.body}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
