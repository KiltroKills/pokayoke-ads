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
| PKY-0013 | "No exploits in my repo. Make no mistakes." over a worker whose harness is clipped to a hook taped to the wall, the hook circled (meme bank MEME-54) | [`ads/PKY-0013/`](ads/PKY-0013/) |
| PKY-0011 | Terminator 2 minigun still, the T-800 labelled pokayoke. Bottom text "Have them on your side." (MEME-56; film still, not for paid ads unless licensed) | [`ads/PKY-0011/`](ads/PKY-0011/) |
| PKY-0010 | Terminator 2 motorcycle still, the T-800 labelled pokayoke and the boy labelled your repo. Bottom text "Have them on your side." (MEME-55; film still, not for paid ads unless licensed) | [`ads/PKY-0010/`](ads/PKY-0010/) |
| PKY-0009 | "Found. Verified. Disclosed." over the pokayoke.sh finding strip stood up as a list: score chip, severity, repo and advisory ID for five findings (seven in 9:16) from its public disclosure record | [`ads/PKY-0009/`](ads/PKY-0009/) |
| PKY-0008 | The "Paste into your agent" card from pokayoke.sh in its dark theme: the line to paste and the blue Copy button | [`ads/PKY-0008/`](ads/PKY-0008/) |
| PKY-0007 | The pokayoke.sh hero: "Find exploits before attackers do." and its three blue ticks (GitHub App, proven or not, private fix) | [`ads/PKY-0007/`](ads/PKY-0007/) |
| PKY-0006 | Flex Tape meme with the bottom text, in quotes, "Flag critical security issues. Make no mistakes." (meme bank MEME-12; `captioned.png` is the meme alone) | [`ads/PKY-0006/`](ads/PKY-0006/) |
| PKY-0005 | "Who's next?" Grim reaper doors meme: GitHub and Meta already hit, the last door is YOUR REPO ([TechCrunch](https://techcrunch.com/2026/05/20/github-says-hackers-stole-data-from-thousands-of-internal-repositories/), [SecurityWeek](https://www.securityweek.com/meta-says-hackers-took-code-personal-data-of-1500-in-github-breach/)) | [`ads/PKY-0005/`](ads/PKY-0005/) |
| PKY-0001 | Link your repo, scan for vulnerabilities, get one clear critical count | [`ads/PKY-0001/`](ads/PKY-0001/) |

IDs are never reused: PKY-0002 to PKY-0004 and PKY-0012 were published briefly and withdrawn.

Each ad folder holds its source (`ad.html`) and one PNG per ratio: `16x9.png` (1920x1080), `4x5.png` (1080x1350),
`9x16.png` (1080x1920).

## Make or change an ad

1. Copy `ads/PKY-0001/` to the next unused ID (one past the highest folder in `ads/`) and edit its `ad.html`. One template serves all three
   ratios through `html[data-ratio]`.
2. `npm install`, then `npm run render` (or `npm run render -- PKY-00NN` for one ad). It captures every ratio at 2x with the
   installed Google Chrome (`PW_CHANNEL=chromium` uses Playwright's own build) and exits non-zero if any block
   overflows or overlaps another.
3. Add it to the top of `ads/manifest.js` (ID and alt text); the gallery shows every entry in that order.

Brand colors (with the site's severity chips and its dark theme, `--color-band-*`), type and radii live in
`brand/tokens.css`; the mark is `brand/pokayoke-mark.svg`, both taken from
pokayoke.sh.

## Meme bank

**Page:** https://kiltrokills.github.io/pokayoke-ads/memes.html (linked as "Meme bank" in the viewer's top bar).
It lists meme formats that could become pokayoke ads, where someone has little protection or does something stupid,
in four kinds: little protection, doing something stupid, getting owned, and the pokayoke way. Each meme shows its
blank template, why it fits, the caption for each panel that turns it into a pokayoke ad, an ad line, and an image
rights label:

- **Free to recreate:** the joke is a scene anyone can shoot or draw.
- **Redraw or license:** the image belongs to a photographer, artist, studio or real person. License stock photos;
  redraw the layout with our own characters.
- **Ask first or skip:** the character is the joke and its owner enforces. Not for paid ads unless the owner agrees.

Link one kind with `memes.html?kind=stupid` (`protection`, `stupid`, `owned`, `better`) and one meme with
`memes.html#MEME-14`. To make a meme into an ad, build it as the next `PKY-` ID and set `ad: 'PKY-000N'` on its
entry so the page links to it.

Where a post in the same format did well with developers, the entry's `proof` records its upvotes and link, and
the page shows it as evidence. The screenshot formats developers upvoted most in 2026 (a junior asking a senior,
code that ships past its own warnings, a bot that hands over its `.env`) are rebuilt as our own mock-ups in
`memes/formats/formats.html`, with made-up names and masked keys, so their rights label is "Free to recreate".

To add a meme, add an entry to `memes/manifest.js` (its imgflip template ID, captions and rights), then run
`npm run memes`. It saves the blank template as `memes/img/<slug>.webp` (at most 480x720, needs ImageMagick) and
writes every image's size to `memes/sizes.js`; `npm run memes -- --force` downloads them all again. For a format we
rebuild ourselves, add a `.card` with the slug as its `id` to `memes/formats/formats.html`, leave out `imgflip`,
and run `npm run meme-formats` before `npm run memes`. A still that is on neither (MEME-54 and MEME-55, supplied by the user) is
saved by hand as `memes/img/<slug>.webp`, at most 480x720, with no `imgflip` on its entry.
