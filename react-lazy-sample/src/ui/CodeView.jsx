import { useEffect, useRef } from "react";
import { highlightLine } from "./highlight.js";

/**
 * A small read-only "editor": file tabs, line numbers, Dark+ colours.
 * Lines containing `mark` (a code snippet) are highlighted.
 */
export default function CodeView({ files, activePath, onSelectFile, mark }) {
  const file = files.find((f) => f.path === activePath) ?? files[0];
  const lines = file.source.replace(/\s+$/, "").split("\n");
  const preRef = useRef(null);

  // Bring the highlighted line into view inside the code box.
  useEffect(() => {
    const pre = preRef.current;
    const line = pre?.querySelector(".ln.hl");
    if (pre && line) pre.scrollTop = Math.max(0, line.offsetTop - pre.clientHeight / 3);
  }, [mark, file.path]);

  return (
    <div className="editor">
      <div className="editor-tabs" role="tablist" aria-label="Files">
        {files.map((f) => (
          <button
            key={f.path}
            role="tab"
            aria-selected={f.path === file.path}
            className={f.path === file.path ? "editor-tab on" : "editor-tab"}
            onClick={() => onSelectFile(f.path)}
          >
            {f.path.split("/").pop()}
          </button>
        ))}
      </div>
      <div className="editor-path">{file.path}</div>
      <pre ref={preRef} className="editor-code">
        <code>
          {lines.map((line, i) => (
            <span key={i} className={mark && line.includes(mark) ? "ln hl" : "ln"}>
              <span className="gutter" aria-hidden="true">{i + 1}</span>
              <span dangerouslySetInnerHTML={{ __html: highlightLine(line) || " " }} />
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
