/* Deck navigation, page transitions, progress chrome and code highlighting.
   Each slide is its own page; <body data-slide="N"> tells this script where we are. */
(function () {
  "use strict";

  var SLIDES = [
    "index.html",
    "slides/02-problem.html",
    "slides/03-the-app.html",
    "slides/04-first-guess.html",
    "slides/05-two-rules.html",
    "slides/06-before-after.html",
    "slides/07-fix-1.html",
    "slides/08-fix-2.html",
    "slides/09-the-code.html",
    "slides/10-results.html",
    "slides/11-on-screen.html",
    "slides/12-another-way.html",
    "slides/13-takeaways.html"
  ];
  var DECK_TITLE = "React.lazy, Suspense & the Hidden 300 ms Delay";

  var ROOT = new URL("../", document.currentScript.src);
  var html = document.documentElement;
  var body = document.body;
  var total = SLIDES.length;
  var index = Math.min(total - 1, Math.max(0, (parseInt(body.getAttribute("data-slide"), 10) || 1) - 1));
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function store(key, value) { try { sessionStorage.setItem(key, value); } catch (e) { /* ignore */ } }
  function read(key) { try { return sessionStorage.getItem(key); } catch (e) { return null; } }
  function urlFor(i) { return new URL(SLIDES[i], ROOT).href; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- Entry direction ---------- */
  if (read("deck-dir") === "prev") html.classList.add("enter-prev");
  store("deck-dir", "");

  /* ---------- Navigation ---------- */
  var leaving = false;
  function go(i) {
    if (leaving || i < 0 || i >= total || i === index) return;
    leaving = true;
    var forward = i > index;
    store("deck-dir", forward ? "next" : "prev");
    body.classList.add(forward ? "leave-next" : "leave-prev");
    setTimeout(function () { location.href = urlFor(i); }, reduceMotion ? 0 : 210);
  }

  // Restore if the page comes back from the back/forward cache.
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) {
      leaving = false;
      body.classList.remove("leave-next", "leave-prev");
    }
  });

  /* ---------- Chrome: progress bar + footer ---------- */
  var progress = document.createElement("div");
  progress.className = "deck-progress";
  progress.innerHTML = '<span style="width:' + ((index + 1) / total) * 100 + '%"></span>';

  var chevron = function (d) {
    return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
  };
  var footer = document.createElement("nav");
  footer.className = "deck-footer";
  footer.setAttribute("aria-label", "Slide navigation");
  footer.innerHTML =
    '<span class="deck-title">' + DECK_TITLE + "</span>" +
    '<span class="deck-count">' + pad(index + 1) + " <i>/</i> " + pad(total) + "</span>" +
    '<button class="deck-btn" type="button" data-dir="-1" aria-label="Previous slide"' + (index === 0 ? " disabled" : "") + ">" + chevron("M10 3 5 8l5 5") + "</button>" +
    '<button class="deck-btn" type="button" data-dir="1" aria-label="Next slide"' + (index === total - 1 ? " disabled" : "") + ">" + chevron("M6 3l5 5-5 5") + "</button>";
  footer.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-dir]");
    if (btn) go(index + Number(btn.getAttribute("data-dir")));
  });
  body.appendChild(progress);
  body.appendChild(footer);

  /* ---------- In-deck links: <a data-goto="5"> ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-goto]"), function (a) {
    var target = Number(a.getAttribute("data-goto")) - 1;
    if (a.tagName === "A") a.href = urlFor(target);
    a.addEventListener("click", function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      go(target);
    });
  });

  /* ---------- Keyboard ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "select" || tag === "textarea" || e.target.isContentEditable) return;
    var onButton = tag === "button" || tag === "a";
    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
        e.preventDefault(); go(index + 1); break;
      case " ":
        if (onButton) return;
        e.preventDefault(); go(e.shiftKey ? index - 1 : index + 1); break;
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault(); go(index - 1); break;
      case "Home":
        e.preventDefault(); go(0); break;
      case "End":
        e.preventDefault(); go(total - 1); break;
      case "f":
      case "F":
        if (!document.fullscreenElement) { if (html.requestFullscreen) html.requestFullscreen().catch(function () {}); }
        else if (document.exitFullscreen) document.exitFullscreen();
        break;
    }
  });

  /* ---------- Touch swipe ---------- */
  var touchX = null, touchY = null;
  document.addEventListener("touchstart", function (e) {
    touchX = e.touches[0].clientX; touchY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    touchX = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- Code blocks: <script type="text/plain" class="code" data-file data-badge data-mark> ---------- */
  var TOKEN = /(\/\/.*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(=>)|(<\/?[A-Za-z][\w.]*|\/>)|\b(const|let|var|function|return|if|else|try|catch|throw|new|type|interface|import|export|from|await|async|typeof|instanceof|of|in|default|as|void|it|expect)\b|\b(true|false|null|undefined|\d+(?:\.\d+)?)\b|\b([A-Z][\w$]*)\b|([a-zA-Z_$][\w$]*)(?=\s*\()/g;
  var CLASSES = [null, "com", "str", "op", "tag", "kw", "lit", "type", "fn"];

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function highlightLine(line) {
    var out = "", last = 0, m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(line))) {
      out += esc(line.slice(last, m.index));
      var cls = "fn";
      for (var g = 1; g < CLASSES.length; g++) { if (m[g] !== undefined) { cls = CLASSES[g]; break; } }
      out += '<span class="tok-' + cls + '">' + esc(m[0]) + "</span>";
      last = TOKEN.lastIndex;
    }
    return out + esc(line.slice(last));
  }

  function dedent(src) {
    var lines = src.replace(/^\s*\n/, "").replace(/\s+$/, "").split("\n");
    var min = Infinity;
    lines.forEach(function (l) { if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length); });
    if (min === Infinity) min = 0;
    return lines.map(function (l) { return l.slice(min); });
  }

  function parseMarks(spec) {
    var set = {};
    (spec || "").split(",").forEach(function (part) {
      var r = part.trim().split("-").map(Number);
      if (!r[0]) return;
      for (var n = r[0]; n <= (r[1] || r[0]); n++) set[n] = true;
    });
    return set;
  }

  Array.prototype.forEach.call(document.querySelectorAll('script[type="text/plain"].code'), function (node) {
    var lines = dedent(node.textContent);
    var marks = parseMarks(node.getAttribute("data-mark"));
    var badge = node.getAttribute("data-badge");
    var fig = document.createElement("figure");
    fig.className = "code" + (node.getAttribute("data-compact") !== null ? " compact" : "");
    fig.innerHTML =
      '<figcaption><span class="dots"><i></i><i></i><i></i></span>' + esc(node.getAttribute("data-file") || "") +
      (badge ? '<span class="badge' + (badge === "from the article" ? " article" : "") + '">' + esc(badge) + "</span>" : "") +
      "</figcaption><pre><code>" +
      lines.map(function (l, i) {
        return '<span class="ln' + (marks[i + 1] ? " ln-hl" : "") + '">' + (highlightLine(l) || " ") + "</span>";
      }).join("") +
      "</code></pre>";
    node.parentNode.replaceChild(fig, node);
  });

  /* ---------- Timeline replay: <button data-replay="#id"> (static until replayed) ---------- */
  function play(tl) {
    tl.classList.remove("play");
    void tl.offsetWidth; // restart CSS animations
    tl.classList.add("play");
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-replay]"), function (btn) {
    btn.addEventListener("click", function () {
      var tl = document.querySelector(btn.getAttribute("data-replay"));
      if (tl) play(tl);
    });
  });
})();
