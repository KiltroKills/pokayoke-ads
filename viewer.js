// Ad gallery: shows every ad in ads/manifest.js (newest first), each with its ID and a Download link.
// The ratio switch applies to all ads; ?ratio=4x5 links a frame, #PKY-0001 links one ad.
// Images live at ads/<id>/<ratio>.png.
const RATIOS = { '16x9': [1920, 1080], '4x5': [1080, 1350], '9x16': [1080, 1920] };
const LABELS = { '16x9': '16:9', '4x5': '4:5', '9x16': '9:16' };
const ADS = window.POKAYOKE_ADS ?? [];
const DOWNLOAD_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 15V3m9 12v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10l5 5l5-5"/></g></svg>';

const params = new URLSearchParams(location.search);
let ratio = RATIOS[params.get('ratio')] ? params.get('ratio') : '16x9';

const gallery = document.getElementById('gallery');
const empty = document.getElementById('empty');
const buttons = [...document.querySelectorAll('.ratios button')];

function buildItem(ad, index) {
  const li = document.createElement('li');
  li.className = 'ad';
  li.id = ad.id;

  const img = document.createElement('img');
  img.alt = ad.alt ?? `pokayoke ad ${ad.id}`;
  img.decoding = 'async';
  img.loading = index < 2 ? 'eager' : 'lazy';

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

  li.append(img, missing, meta);

  img.addEventListener('error', () => {
    img.hidden = true;
    missing.hidden = false;
    link.setAttribute('aria-disabled', 'true');
    link.removeAttribute('href');
  });
  return { ad, li, img, missing, link };
}

const items = ADS.map(buildItem);
gallery.replaceChildren(...items.map((it) => it.li));
empty.hidden = items.length > 0;

function render() {
  const [width, height] = RATIOS[ratio];
  for (const { ad, img, missing, link } of items) {
    const src = `ads/${ad.id}/${ratio}.png`;
    img.hidden = false;
    missing.hidden = true;
    missing.textContent = `${ad.id} has no ${LABELS[ratio]} version yet.`;
    link.removeAttribute('aria-disabled');
    img.width = width;
    img.height = height;
    img.src = src;
    link.href = src;
    link.download = `pokayoke-${ad.id}-${ratio}.png`;
    link.setAttribute('aria-label', `Download ${ad.id} ${LABELS[ratio]}`);
  }
  document.body.dataset.ratio = ratio;
  for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.ratio === ratio));
}

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
