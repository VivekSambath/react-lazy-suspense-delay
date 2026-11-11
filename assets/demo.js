/* Live demo for slide 6: real React 19 (production) loaded from esm.sh.
   Lane A ("before"): React.lazy inside Suspense (suspends → 300 ms reveal throttle).
   Lane B ("after"):  the same lazy component gated with useLazyReady (no suspension). */
(async function () {
  "use strict";

  var statusEl = document.getElementById("status");
  var runBtn = document.getElementById("run");
  var delayEl = document.getElementById("delay");

  var React, ReactDOMClient;
  try {
    var mods = await Promise.all([
      import("https://esm.sh/react@19.1.0"),
      import("https://esm.sh/react-dom@19.1.0/client?deps=react@19.1.0")
    ]);
    React = mods[0].default || mods[0];
    ReactDOMClient = mods[1].default || mods[1];
  } catch (err) {
    statusEl.textContent = "Couldn't load React from esm.sh (offline?). The demo needs an internet connection.";
    statusEl.classList.add("err");
    return;
  }

  var h = React.createElement;

  /* ---- preloadLazy / isLazySettled (same idea as samples/preloadLazy.ts) ---- */
  var settled = new WeakSet();

  function preloadLazy(component) {
    var init = component && component._init;
    if (typeof init !== "function") { settled.add(component); return Promise.resolve(); }
    try {
      init(component._payload); // starts import(); returns the module once loaded
      settled.add(component);
      return Promise.resolve();
    } catch (thrown) {
      if (thrown && typeof thrown.then === "function") {
        var done = function () { settled.add(component); };
        return Promise.resolve(thrown).then(done, done); // still loading → wait, then settle
      }
      settled.add(component); // already failed → let the error boundary show it
      return Promise.resolve();
    }
  }

  function isLazySettled(component) {
    var status = component && component._payload && component._payload._status;
    return settled.has(component) || status === 1 || status === 2;
  }

  /* ---- useLazyReady (same idea as samples/useLazyReady.ts) ---- */
  function useLazyReady(component) {
    var rerender = React.useReducer(function (n) { return n + 1; }, 0)[1];
    var ready = isLazySettled(component);
    React.useEffect(function () {
      if (ready) return;
      var active = true;
      preloadLazy(component).then(function () { if (active) rerender(); });
      return function () { active = false; };
    }, [component, ready]);
    return ready;
  }

  /* ---- Measurement ---- */
  var t0 = 0;
  var run = 0;
  var times = {};
  function now() { return Math.round(performance.now() - t0); }

  function setBar(lane) {
    var t = times[lane];
    var ph = document.getElementById(lane + "-bar-ph");
    var ok = document.getElementById(lane + "-bar-ok");
    var mark = document.getElementById(lane + "-mark");
    var end = t.ok != null ? t.ok : now();
    if (t.ph != null) { ph.style.setProperty("--from", t.ph); ph.style.setProperty("--to", Math.max(t.ph, end)); }
    if (t.ok != null) { ok.style.setProperty("--from", t.ok); ok.style.setProperty("--to", 600); }
    if (t.code != null) mark.style.setProperty("--at", t.code);
  }

  function report(lane, kind, runId) {
    if (runId !== run) return;
    var t = times[lane];
    if (t[kind] != null) return;
    t[kind] = now();
    document.getElementById(lane + "-" + kind).textContent = t[kind] + " ms";
    setBar(lane);
    if (times.a.ok != null && times.b.ok != null) {
      statusEl.textContent = "After the code was ready: “before” waited " + (times.a.ok - times.a.code) + " ms, “after” waited " + (times.b.ok - times.b.code) + " ms.";
    }
  }

  /* ---- Components ---- */
  function Placeholder(props) {
    React.useLayoutEffect(function () { report(props.lane, "ph", props.run); }, []);
    return h("div", { className: "demo-ph" }, "loading widget…");
  }

  function DemoWidget(props) {
    React.useLayoutEffect(function () { report(props.lane, "ok", props.run); }, []);
    return h("div", { className: "demo-ok" }, "⏰ Clock widget");
  }

  function makeLazy(lane, delay, runId) {
    return React.lazy(function () {
      return new Promise(function (resolve) {
        setTimeout(function () {
          report(lane, "code", runId);
          resolve({ default: DemoWidget });
        }, delay);
      });
    });
  }

  function SuspendingLane(props) {
    return h(React.Suspense, { fallback: h(Placeholder, { lane: "a", run: props.run }) },
      h(props.Comp, { lane: "a", run: props.run }));
  }

  function GatedLane(props) {
    var ready = useLazyReady(props.Comp);
    return h(React.Suspense, { fallback: h(Placeholder, { lane: "b", run: props.run }) },
      ready ? h(props.Comp, { lane: "b", run: props.run }) : h(Placeholder, { lane: "b", run: props.run }));
  }

  var rootA = ReactDOMClient.createRoot(document.getElementById("stage-a"));
  var rootB = ReactDOMClient.createRoot(document.getElementById("stage-b"));

  function reset(lane) {
    times[lane] = { code: null, ph: null, ok: null };
    ["code", "ph", "ok"].forEach(function (k) { document.getElementById(lane + "-" + k).textContent = "…"; });
    ["-bar-ph", "-bar-ok"].forEach(function (s) {
      var el = document.getElementById(lane + s);
      el.style.setProperty("--from", 0); el.style.setProperty("--to", 0);
    });
    document.getElementById(lane + "-mark").style.setProperty("--at", -10);
  }

  runBtn.addEventListener("click", function () {
    run += 1;
    var delay = Number(delayEl.value);
    reset("a"); reset("b");
    statusEl.textContent = "Running…";
    t0 = performance.now();
    rootA.render(h(SuspendingLane, { key: run, run: run, Comp: makeLazy("a", delay, run) }));
    rootB.render(h(GatedLane, { key: run, run: run, Comp: makeLazy("b", delay, run) }));
  });

  runBtn.disabled = false;
  statusEl.textContent = "React " + React.version + " ready. Pick a load time and press Run.";

  // ?autorun runs the demo once on load (handy for checks and screenshots).
  if (/[?&]autorun\b/.test(location.search)) runBtn.click();
})();
