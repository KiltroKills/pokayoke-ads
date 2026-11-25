# pokayoke ads

Ad creatives for [pokayoke](https://pokayoke.sh) by EZO Labs Security, and the public page that shows them.

**Viewer:** https://singularitystudiosdev.github.io/pokayoke-ads/ (GitHub Pages, served from `main`).
It shows one ad, its ID, a Download button and a 16:9 / 4:5 / 9:16 switch. Link a specific ad and frame with
`?id=PKY-0001&ratio=9x16`.

This repo is public: anything pushed to `main` is published.

## Ads

| ID | Message | Files |
|---|---|---|
| PKY-0001 | Link your repo, scan for vulnerabilities, get one clear critical count | [`ads/PKY-0001/`](ads/PKY-0001/) |

Each ad folder holds its source (`ad.html`) and one PNG per ratio: `16x9.png` (1920x1080), `4x5.png` (1080x1350),
`9x16.png` (1080x1920).

## Make or change an ad

1. Copy `ads/PKY-0001/` to the next ID (`ads/PKY-0002/`) and edit its `ad.html`. One template serves all three
   ratios through `html[data-ratio]`.
2. `npm install`, then `npm run render` (or `npm run render -- PKY-0002`). It captures every ratio at 2x with the
   installed Google Chrome (`PW_CHANNEL=chromium` uses Playwright's own build) and exits non-zero if any block
   overflows or overlaps another.
3. To show the new ad by default, set `DEFAULT_ID` in `viewer.js` and the ID, image paths and alt text in `index.html`.

Brand colors, type and radii live in `brand/tokens.css`; the mark is `brand/pokayoke-mark.svg`, both taken from
pokayoke.sh.
