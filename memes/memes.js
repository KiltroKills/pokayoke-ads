// Meme bank (memes.html): lists every meme in memes/manifest.js, grouped by kind, top picks first.
// ?kind=stupid shows one kind; #MEME-07 links one meme. Images live at memes/img/<slug>.webp.
const MEMES = window.POKAYOKE_MEMES ?? [];
const KINDS = window.POKAYOKE_MEME_CATEGORIES ?? [];
const RIGHTS = window.POKAYOKE_MEME_RIGHTS ?? {};
const SIZES = window.POKAYOKE_MEME_SIZES ?? {};

const list = document.getElementById('memes');
const empty = document.getElementById('empty');
const filters = document.getElementById('filters');
const key = document.getElementById('rights-key');
const lede = document.getElementById('lede');

const kindLabel = Object.fromEntries(KINDS.map((k) => [k.id, k.label]));
const kindOrder = Object.fromEntries(KINDS.map((k, i) => [k.id, i]));
const ordered = MEMES.map((m, i) => ({ m, i }))
  .sort((a, b) => (kindOrder[a.m.category] ?? 99) - (kindOrder[b.m.category] ?? 99) || Number(!!b.m.pick) - Number(!!a.m.pick) || a.i - b.i)
  .map(({ m }) => m);

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  node.append(...children.filter(Boolean));
  return node;
}

lede.textContent = `${MEMES.length} ${lede.textContent.charAt(0).toLowerCase()}${lede.textContent.slice(1)}`;

for (const [id, r] of Object.entries(RIGHTS)) {
  key.append(el('div', { 'data-rights': id }, el('dt', {}, el('span', { class: 'dot', 'aria-hidden': 'true' }), r.label), el('dd', { text: r.note })));
}

function buildMeme(meme, index) {
  const [w, h] = SIZES[meme.slug] ?? [480, 480];
  const img = el('img', {
    src: `memes/img/${meme.slug}.webp`,
    alt: meme.alt ?? `Blank template: ${meme.name}`,
    width: String(w),
    height: String(h),
    decoding: 'async',
    loading: index < 3 ? 'eager' : 'lazy',
  });

  const tags = el('ul', { class: 'tags', 'aria-label': 'Kind and angle' },
    el('li', { text: kindLabel[meme.category] ?? meme.category }),
    el('li', { text: meme.angle }),
    meme.pick ? el('li', { class: 'pick', text: 'Top pick' }) : null,
  );

  const panels = el('dl', { class: 'panels', 'aria-label': 'Captions for the ad' },
    ...meme.panels.map(([where, text]) => el('div', {}, el('dt', { text: where }), el('dd', { text }))),
  );

  const rights = RIGHTS[meme.rights] ?? { label: meme.rights };
  const proof = meme.proof
    ? el('p', { class: 'proof' },
        el('strong', { text: 'Evidence. ' }),
        `${meme.proof.points.toLocaleString('en-US')} upvotes on `,
        el('a', { href: meme.proof.url, text: 'a r/ProgrammerHumor post' }),
        ` in ${meme.proof.what} (posted ${meme.proof.posted}, counted ${meme.proof.counted}).`,
      )
    : null;
  const links = el('p', { class: 'links' },
    meme.imgflip ? el('a', { href: `https://imgflip.com/memegenerator/${meme.imgflip}`, text: 'Blank template on imgflip' }) : null,
    meme.ad ? el('a', { href: `./#${meme.ad}`, text: `Made into ${meme.ad}` }) : null,
  );

  const body = el('div', { class: 'meme-body' },
    el('div', { class: 'meme-head' }, el('h2', { text: meme.name }), el('code', { class: 'meme-id', text: meme.id })),
    tags,
    el('p', { class: 'fit', text: meme.fit }),
    panels,
    el('p', { class: 'line' }, el('span', { class: 'label', text: 'Ad line' }), el('span', { text: meme.line })),
    el('p', { class: 'rights', 'data-rights': meme.rights },
      el('span', { class: 'dot', 'aria-hidden': 'true' }),
      el('span', {}, el('strong', { text: `${rights.label}. ` }), meme.rightsNote ?? ''),
    ),
    proof,
    links.childElementCount ? links : null,
  );

  return el('li', { class: 'meme', id: meme.id, 'data-kind': meme.category }, el('div', { class: 'thumb' }, img), body);
}

const items = ordered.map(buildMeme);
list.replaceChildren(...items);
empty.hidden = items.length > 0;
filters.hidden = items.length === 0;

const params = new URLSearchParams(location.search);
let kind = kindLabel[params.get('kind')] ? params.get('kind') : 'all';

const buttons = [{ id: 'all', label: 'All' }, ...KINDS].map((k) => {
  const count = k.id === 'all' ? MEMES.length : MEMES.filter((m) => m.category === k.id).length;
  const b = el('button', { type: 'button', 'data-kind': k.id, 'aria-pressed': 'false' }, k.label, el('span', { class: 'count', text: String(count) }));
  b.addEventListener('click', () => {
    kind = k.id;
    const query = kind === 'all' ? '' : `?kind=${kind}`;
    history.replaceState(null, '', `${location.pathname}${query}${location.hash}`);
    render();
  });
  return b;
});
filters.replaceChildren(...buttons);

function render() {
  for (const li of items) li.hidden = kind !== 'all' && li.dataset.kind !== kind;
  for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.kind === kind));
}

// A link to one meme shows it even when another kind is selected.
const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
if (target && kind !== 'all' && target.dataset.kind !== kind) kind = 'all';
render();
// The list is built after load, so the browser cannot jump to #MEME-07 by itself.
target?.scrollIntoView();
