# React.lazy() + Suspense: the hidden 300 ms delay

Slides for React developers, based on
[“React.lazy, Suspense and the Hidden 300 ms Delay”](https://tabwidgets.com/blog/react-lazy-suspense-delay)
by Matthew Wong (Tab Widgets, 29 October 2026).

**Live:** https://viveksambath.github.io/react-lazy-suspense-delay/

## What's here

| Path | What it is |
| --- | --- |
| `index.html` | The presentation: 13 slides with animated diagrams, in one self-contained file (HTML, CSS, vanilla JS, no libraries) |
| `react-lazy-sample/` | Standalone sample project with each pattern and the article's fixes (run it locally for live demos) |
| `demo/` | Built React 19 demo app (served at `/demo/`) |
| `demo-app/` | Source of the demo app (Vite + React 19.1 + TypeScript) |
| `assets/` | Favicon and social preview image |

## Slides

The deck follows the article step by step, using Tab Widgets (a new-tab extension for Chrome and Edge) as the running example.

1. Introduction · 2. The app: Tab Widgets · 3. `lazy()` splits the code · 4. Suspense shows a fallback ·
5. How a new tab loads · 6. First guess: the bundle · 7. The idle gap · 8. React's 300 ms throttle ·
9. Fix #1: preload before render · 10. Fix #2: don't suspend · 11. Before vs after (animated) ·
12. Results · 13. Takeaways and an interview answer

Slides 2, 7, 8 and 11 have slow-motion timeline animations with a **Replay** button.

Keys: `←` `→` / `Space` to move, `Home` / `End` for first and last. On touch screens, swipe.
Every slide has its own link (`#1` … `#13`).

## Demo app

Four approaches side by side: **Before** (`React.lazy` + `Suspense`), **Fix #1** (preload, wait up to
100 ms), **Fix #2** (gate instead of suspend), **Alternative** (own component cache). The timeline
shows when each widget's code was ready and when it actually appeared.

```sh
cd demo-app
npm install
npm run dev      # local development
npm run build    # rebuilds ../demo for GitHub Pages
```

Deep links: `demo/?mode=suspend`, `?mode=preload`, `?mode=gate`, `?mode=cache`.

## Publish on GitHub Pages

In the repository, go to **Settings → Pages**, choose **Deploy from a branch**, and select `main` and `/ (root)`.
