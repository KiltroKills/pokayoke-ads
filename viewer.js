// Ad viewer: ?id=PKY-0001&ratio=4x5 picks the ad and frame; images live at ads/<id>/<ratio>.png.
// The ad list comes from ads/manifest.js (newest first); the first entry opens by default.
const RATIOS = { '16x9': [1920, 1080], '4x5': [1080, 1350], '9x16': [1080, 1920] };
const ADS = window.POKAYOKE_ADS ?? [];
const LATEST = ADS[0]?.id;

const params = new URLSearchParams(location.search);
const askedId = params.get('id');
let id = askedId && /^[A-Z]{3}-\d{4}$/.test(askedId) ? askedId : LATEST;
let ratio = RATIOS[params.get('ratio')] ? params.get('ratio') : '16x9';

const img = document.getElementById('ad');
const download = document.getElementById('download');
const select = document.getElementById('ad-select');
const missing = document.getElementById('missing');
const buttons = [...document.querySelectorAll('.ratios button')];

select.replaceChildren(...ADS.map((ad) => new Option(ad.id, ad.id)));
// An ID that is not in the list still gets an option, so the picker shows what the URL asked for.
if (id && !ADS.some((ad) => ad.id === id)) select.prepend(new Option(id, id));

function syncUrl() {
  const next = new URLSearchParams();
  if (id !== LATEST) next.set('id', id);
  if (ratio !== '16x9') next.set('ratio', ratio);
  const query = next.toString();
  history.replaceState(null, '', query ? `?${query}` : location.pathname);
}

function render() {
  const [width, height] = RATIOS[ratio];
  const src = `ads/${id}/${ratio}.png`;
  img.width = width;
  img.height = height;
  img.src = src;
  img.alt = ADS.find((ad) => ad.id === id)?.alt ?? `pokayoke ad ${id}`;
  download.href = src;
  download.download = `pokayoke-${id}-${ratio}.png`;
  select.value = id;
  document.title = `pokayoke ad ${id}`;
  document.body.dataset.ratio = ratio;
  for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.ratio === ratio));
}

select.addEventListener('change', () => {
  id = select.value;
  syncUrl();
  render();
});

for (const b of buttons) {
  b.addEventListener('click', () => {
    ratio = b.dataset.ratio;
    syncUrl();
    render();
  });
}

img.addEventListener('error', () => {
  img.hidden = true;
  missing.hidden = false;
  download.setAttribute('aria-disabled', 'true');
  download.removeAttribute('href');
});
img.addEventListener('load', () => {
  img.hidden = false;
  missing.hidden = true;
  download.removeAttribute('aria-disabled');
});

render();
