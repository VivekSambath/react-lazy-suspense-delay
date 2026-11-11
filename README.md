# React.lazy() + Suspense: the hidden 300 ms delay

Slides for React developers, based on
[“React.lazy, Suspense and the Hidden 300 ms Delay”](https://tabwidgets.com/blog/react-lazy-suspense-delay)
by Matthew Wong (Tab Widgets, 29 October 2026).

**Live:** https://viveksambath.github.io/react-lazy-suspense-delay/

## What's here

| Path | What it is |
| --- | --- |
| `index.html` | The presentation: 8 slides in one self-contained file (HTML, CSS, vanilla JS, no libraries) |
| `demo/` | Built React 19 demo app (served at `/demo/`) |
| `demo-app/` | Source of the demo app (Vite + React 19.1 + TypeScript) |
| `assets/` | Favicon and social preview image |

## Slides

1. Introduction · 2. Normal import vs lazy import · 3. What is Suspense? ·
4. Understand the delay · 5. Interactive demo (simulation) · 6. Suspense + `useTransition` ·
7. Common mistakes · 8. Recap with an interview answer

Keys: `←` `→` / `Space` to move, `Home` / `End` for first and last. On touch screens, swipe.
Every slide has its own link (`#1` … `#8`).

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
