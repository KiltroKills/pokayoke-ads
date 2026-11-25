// Ad viewer: ?id=PKY-0001&ratio=4x5 picks the ad and frame; images live at ads/<id>/<ratio>.png.
const RATIOS = { '16x9': [1920, 1080], '4x5': [1080, 1350], '9x16': [1080, 1920] };
const DEFAULT_ID = 'PKY-0001';

const params = new URLSearchParams(location.search);
const askedId = params.get('id');
const id = askedId && /^[A-Z]{3}-\d{4}$/.test(askedId) ? askedId : DEFAULT_ID;
let ratio = RATIOS[params.get('ratio')] ? params.get('ratio') : '16x9';

const img = document.getElementById('ad');
const download = document.getElementById('download');
const idLabel = document.getElementById('ad-id');
const missing = document.getElementById('missing');
const buttons = [...document.querySelectorAll('.ratios button')];

function render() {
  const [width, height] = RATIOS[ratio];
  const src = `ads/${id}/${ratio}.png`;
  img.width = width;
  img.height = height;
  img.src = src;
  download.href = src;
  download.download = `pokayoke-${id}-${ratio}.png`;
  idLabel.textContent = id;
  document.title = `pokayoke ad ${id}`;
  document.body.dataset.ratio = ratio;
  for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.ratio === ratio));
}

for (const b of buttons) {
  b.addEventListener('click', () => {
    ratio = b.dataset.ratio;
    const next = new URLSearchParams(location.search);
    next.set('ratio', ratio);
    if (id !== DEFAULT_ID) next.set('id', id);
    history.replaceState(null, '', `?${next}`);
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
