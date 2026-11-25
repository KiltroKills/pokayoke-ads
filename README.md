# pokayoke ads

Ad creatives for [pokayoke](https://pokayoke.sh) by EZO Labs Security, and the public page that shows them.

**Viewer:** https://kiltrokills.github.io/pokayoke-ads/ (GitHub Pages on the mirror `KiltroKills/pokayoke-ads`).
It shows every ad, newest first, each with its ID and a Download button, and a 16:9 / 4:5 / 9:16 switch in the top
right that changes all of them. Link a frame and an ad with `?ratio=9x16#PKY-0001`.

`singularitystudiosdev/pokayoke-ads` is the main copy. GitHub has flagged that account (Actions off, repos hidden
from the public), so Pages publishes from the mirror; once the flag is lifted the same workflow also serves
https://singularitystudiosdev.github.io/pokayoke-ads/. Both repos are public: anything pushed to `main` is published.

## Publish

Push `main` to both remotes; `.github/workflows/pages.yml` deploys on every push.

```sh
git push origin main
git push kiltro main
```

The `kiltro` remote signs in as the KiltroKills account through `gh`, without storing a token. Set it up once per clone:

```sh
git remote add kiltro https://KiltroKills@github.com/KiltroKills/pokayoke-ads.git
git config credential.https://KiltroKills@github.com.helper \
  '!f() { test "$1" = get && echo username=KiltroKills && echo "password=$(gh auth token --user KiltroKills)"; }; f'
```

## Ads

| ID | Message | Files |
|---|---|---|
| PKY-0005 | "Who's next?" Grim reaper doors meme: GitHub and Meta already hit, the last door is YOUR REPO ([TechCrunch](https://techcrunch.com/2026/05/20/github-says-hackers-stole-data-from-thousands-of-internal-repositories/), [SecurityWeek](https://www.securityweek.com/meta-says-hackers-took-code-personal-data-of-1500-in-github-breach/)) | [`ads/PKY-0005/`](ads/PKY-0005/) |
| PKY-0001 | Link your repo, scan for vulnerabilities, get one clear critical count | [`ads/PKY-0001/`](ads/PKY-0001/) |

IDs are never reused: PKY-0002 to PKY-0004 were published briefly and withdrawn.

Each ad folder holds its source (`ad.html`) and one PNG per ratio: `16x9.png` (1920x1080), `4x5.png` (1080x1350),
`9x16.png` (1080x1920).

## Make or change an ad

1. Copy `ads/PKY-0001/` to the next unused ID (`ads/PKY-0006/`) and edit its `ad.html`. One template serves all three
   ratios through `html[data-ratio]`.
2. `npm install`, then `npm run render` (or `npm run render -- PKY-0006`). It captures every ratio at 2x with the
   installed Google Chrome (`PW_CHANNEL=chromium` uses Playwright's own build) and exits non-zero if any block
   overflows or overlaps another.
3. Add it to the top of `ads/manifest.js` (ID and alt text); the gallery shows every entry in that order.

Brand colors, type and radii live in `brand/tokens.css`; the mark is `brand/pokayoke-mark.svg`, both taken from
pokayoke.sh.
