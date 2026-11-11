// Tiny JS/JSX highlighter with VS Code Dark+ colours (no library).
// Works one line at a time, which is all these short samples need.

const TOKEN = new RegExp(
  [
    /(\/\/.*)/.source, //                                           1 comment
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/.source, // 2 string
    /(=>|&&|\|\||===|\?\?|\?\.)/.source, //                         3 operator
    /(<\/?[A-Za-z][\w.]*|<\/?>|\/?>)/.source, //                     4 JSX tag / bracket
    /\b(import|from|export|default|return|if|else|try|catch|throw|new|typeof)\b/.source, // 5 control keyword
    /\b(const|let|var|function)\b/.source, //                        6 storage keyword
    /\b(true|false|null|undefined|\d+)\b/.source, //                 7 literal
    /([a-zA-Z]+)(?==[{"'])/.source, //                               8 JSX attribute
    /([a-zA-Z_$][\w$]*)(?=\s*\()/.source, //                          9 function call
  ].join("|"),
  "g"
);
const CLASSES = [null, "t-com", "t-str", "t-op", "tag", "t-kw", "t-storage", "t-lit", "t-attr", "t-fn"];

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function tag(text) {
  const parts = /^(<\/?)([A-Za-z][\w.]*)$/.exec(text);
  if (!parts) return `<span class="t-punc">${escape(text)}</span>`;
  const nameClass = /^[A-Z]/.test(parts[2]) ? "t-type" : "t-tag"; // components teal, html tags blue
  return `<span class="t-punc">${escape(parts[1])}</span><span class="${nameClass}">${escape(parts[2])}</span>`;
}

/** Returns safe HTML for one line of code. */
export function highlightLine(line) {
  let out = "";
  let last = 0;
  TOKEN.lastIndex = 0;
  for (let m = TOKEN.exec(line); m; m = TOKEN.exec(line)) {
    out += escape(line.slice(last, m.index));
    const group = m.findIndex((g, i) => i > 0 && g !== undefined);
    const cls = CLASSES[group];
    out += cls === "tag" ? tag(m[0]) : `<span class="${cls}">${escape(m[0])}</span>`;
    last = TOKEN.lastIndex;
  }
  return out + escape(line.slice(last));
}
