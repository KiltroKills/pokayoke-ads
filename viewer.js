// Ad gallery: shows every ad in ads/manifest.js (newest first), each with its ID and a Download link.
// The ratio switch applies to all ads; ?ratio=4x5 links a frame, #PKY-0001 links one ad.
// Images live at ads/<id>/<ratio>.png. An animated ad (`video: true`) also has ads/<id>/<ratio>.mp4: it plays
// muted and looping while it is on screen, with the PNG as its poster, and Download saves the MP4.
const RATIOS = { '16x9': [1920, 1080], '1x1': [1080, 1080], '4x5': [1080, 1350], '9x16': [1080, 1920] };
const LABELS = { '16x9': '16:9', '1x1': '1:1', '4x5': '4:5', '9x16': '9:16' };
const ADS = window.POKAYOKE_ADS ?? [];
const DOWNLOAD_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 15V3m9 12v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10l5 5l5-5"/></g></svg>';

const params = new URLSearchParams(location.search);
let ratio = RATIOS[params.get('ratio')] ? params.get('ratio') : '16x9';

const gallery = document.getElementById('gallery');
const empty = document.getElementById('empty');
const buttons = [...document.querySelectorAll('.ratios button')];

// Videos play only while on screen. With reduced motion they hold the poster and show controls instead.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const onScreen = new WeakSet();
const watcher = new IntersectionObserver(
  (entries) => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting) {
        onScreen.add(target);
        autoplay(target);
      } else {
        onScreen.delete(target);
        target.pause();
      }
    }
  },
  { threshold: 0.25 },
);
function autoplay(video) {
  if (reduceMotion.matches || !onScreen.has(video)) return;
  video.play().catch(() => {});
}

function buildItem(ad, index) {
  const li = document.createElement('li');
  li.className = 'ad';
  li.id = ad.id;
  const alt = ad.alt ?? `pokayoke ad ${ad.id}`;

  let media;
  if (ad.video) {
    media = document.createElement('video');
    media.muted = true;
    media.defaultMuted = true;
    media.loop = true;
    media.playsInline = true;
    media.preload = 'none';
    media.controls = reduceMotion.matches;
    media.setAttribute('aria-label', alt);
    watcher.observe(media);
  } else {
    media = document.createElement('img');
    media.alt = alt;
    media.decoding = 'async';
    media.loading = index < 2 ? 'eager' : 'lazy';
  }

  const missing = document.createElement('p');
  missing.className = 'ad-missing';
  missing.hidden = true;

  const meta = document.createElement('div');
  meta.className = 'ad-meta';
  const id = document.createElement('code');
  id.className = 'ad-id';
  id.textContent = ad.id;
  const link = document.createElement('a');
  link.className = 'download';
  link.innerHTML = `${DOWNLOAD_ICON}<span>Download</span>`;
  meta.append(id, link);

  li.append(media, missing, meta);

  media.addEventListener('error', () => {
    media.hidden = true;
    missing.hidden = false;
    link.setAttribute('aria-disabled', 'true');
    link.removeAttribute('href');
  });
  return { ad, li, media, missing, link };
}

const items = ADS.map(buildItem);
gallery.replaceChildren(...items.map((it) => it.li));
empty.hidden = items.length > 0;

function render() {
  const [width, height] = RATIOS[ratio];
  for (const { ad, media, missing, link } of items) {
    const still = `ads/${ad.id}/${ratio}.png`;
    const file = ad.video ? `ads/${ad.id}/${ratio}.mp4` : still;
    media.hidden = false;
    missing.hidden = true;
    missing.textContent = `${ad.id} has no ${LABELS[ratio]} version yet.`;
    link.removeAttribute('aria-disabled');
    media.width = width;
    media.height = height;
    if (ad.video) media.poster = still;
    media.src = file;
    if (ad.video) autoplay(media);
    link.href = file;
    link.download = `pokayoke-${ad.id}-${ratio}.${ad.video ? 'mp4' : 'png'}`;
    link.setAttribute('aria-label', `Download ${ad.id} ${LABELS[ratio]}${ad.video ? ' video' : ''}`);
  }
  document.body.dataset.ratio = ratio;
  for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.ratio === ratio));
}

reduceMotion.addEventListener('change', () => {
  for (const { ad, media } of items) {
    if (!ad.video) continue;
    media.controls = reduceMotion.matches;
    if (reduceMotion.matches) media.pause();
    else autoplay(media);
  }
});

for (const b of buttons) {
  b.addEventListener('click', () => {
    ratio = b.dataset.ratio;
    const query = ratio === '16x9' ? '' : `?ratio=${ratio}`;
    history.replaceState(null, '', `${location.pathname}${query}${location.hash}`);
    render();
  });
}

render();
// The gallery is built after load, so the browser cannot jump to #PKY-0001 by itself.
if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
