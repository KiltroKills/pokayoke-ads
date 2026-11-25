# pokayoke ads

Ad creatives for [pokayoke](https://pokayoke.sh) by EZO Labs Security, and the public page that shows them.

**Viewer:** https://kiltrokills.github.io/pokayoke-ads/ (GitHub Pages on the mirror `KiltroKills/pokayoke-ads`).
It shows one ad, its ID, a Download button and a 16:9 / 4:5 / 9:16 switch. Link a specific ad and frame with
`?id=PKY-0001&ratio=9x16`.

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

| ID | Message | Cited story | Files |
|---|---|---|---|
| PKY-0004 | Hours. That's all attackers needed. | [BleepingComputer, Dec 6, 2025](https://www.bleepingcomputer.com/news/security/react2shell-flaw-exploited-to-breach-30-orgs-77k-ip-addresses-vulnerable/) | [`ads/PKY-0004/`](ads/PKY-0004/) |
| PKY-0003 | The last commit to your repo might not be yours. | [SecurityWeek, Nov 12, 2026](https://www.securityweek.com/attacker-targets-60000-github-repositories-in-credential-theft-campaign/) | [`ads/PKY-0003/`](ads/PKY-0003/) |
| PKY-0002 | Five years in a public repo. Nobody noticed. | [BleepingComputer, Oct 10, 2022](https://www.bleepingcomputer.com/news/security/toyota-discloses-data-leak-after-access-key-exposed-on-github/) | [`ads/PKY-0002/`](ads/PKY-0002/) |
| PKY-0001 | Link your repo, scan for vulnerabilities, get one clear critical count | | [`ads/PKY-0001/`](ads/PKY-0001/) |

Each ad folder holds its source (`ad.html`) and one PNG per ratio: `16x9.png` (1920x1080), `4x5.png` (1080x1350),
`9x16.png` (1080x1920). The fear series (PKY-0002 on) shares `brand/news-ad.css`: a fear line, one cited news story
with its verbatim headline, and the lockup underneath. Each `ad.html` names its source URL in a comment; quote the
headline exactly and keep the summary to what the article says.

## Make or change an ad

1. Copy `ads/PKY-0001/` to the next ID (`ads/PKY-0002/`) and edit its `ad.html`. One template serves all three
   ratios through `html[data-ratio]`.
2. `npm install`, then `npm run render` (or `npm run render -- PKY-0002`). It captures every ratio at 2x with the
   installed Google Chrome (`PW_CHANNEL=chromium` uses Playwright's own build) and exits non-zero if any block
   overflows or overlaps another.
3. Add it to the top of `ads/manifest.js` (ID and alt text). The viewer's Ad ID picker lists that file and opens the
   first entry by default; also point the static fallback in `index.html` at it.

Brand colors, type and radii live in `brand/tokens.css`; the mark is `brand/pokayoke-mark.svg`, both taken from
pokayoke.sh.
