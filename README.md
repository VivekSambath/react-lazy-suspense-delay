# React.lazy, Suspense & the Hidden 300 ms Delay: Slides

A 13-slide, picture-book style deck in plain HTML and CSS (dark gray theme) that walks through
[Matthew Wong's article](https://tabwidgets.com/blog/react-lazy-suspense-delay) on why
`React.lazy` + `Suspense` added a ~300 ms delay to a new-tab dashboard, and how the
team fixed it. It covers the profiling, React's reveal throttle, both fixes, the results
and the lessons, using a simple restaurant analogy, diagrams, code samples and a live React 19 demo.

## View

Open `index.html` in a browser, or serve the folder with any static server
(for example `npx serve .`).

| Key | Action |
| --- | --- |
| `→` / `Space` / `PageDown` | Next slide |
| `←` / `Shift+Space` / `PageUp` | Previous slide |
| `Home` / `End` | First / last slide |
| `F` | Toggle fullscreen |

Swipe left or right on touch screens.

## Structure

```
index.html          Slide 1 (cover)
slides/             Slides 2–13, one page each
assets/style.css    Theme, layout, diagrams, transitions
assets/deck.js      Navigation, progress bar, code highlighting, timeline replay
assets/demo.js      Live demo on slide 6 (loads React 19 from esm.sh; needs internet)
assets/og-image.png Social preview image (1200×630)
samples/            The code samples as standalone .ts/.tsx files
```

To add or reorder slides, update the `SLIDES` list in `assets/deck.js` and the
`data-slide` number on each page's `<body>`.

## Publish on GitHub Pages

Live at **https://viveksambath.github.io/react-lazy-suspense-delay/**

1. Push this folder to the public repository `react-lazy-suspense-delay`.
2. In the repository, go to **Settings → Pages**, choose **Deploy from a branch**,
   then select `main` and `/ (root)`.

The site URL is set in the canonical and Open Graph tags, `sitemap.xml` and `robots.txt`.
If you fork or rename the repository, find and replace
`viveksambath.github.io/react-lazy-suspense-delay` in those files.

## Credits

Content is based on
[“React.lazy, Suspense and the Hidden 300 ms Delay”](https://tabwidgets.com/blog/react-lazy-suspense-delay)
by Matthew Wong (Tab Widgets, 29 October 2026). The code samples are reconstructed from
the article's descriptions and aren't verbatim copies. Snippets marked *illustrative*
were added to explain a point.
