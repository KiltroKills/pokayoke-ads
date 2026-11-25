// Render each ad template (ads/<id>/ad.html) to PNG in every ratio.
// Usage: npm run render [-- PKY-0001 ...]   (default: every ad folder with an ad.html)
// Uses the installed Google Chrome; set PW_CHANNEL=chromium to use Playwright's own build.
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const adsDir = path.join(root, 'ads');

// CSS frame size per ratio; captured at 2x for 1920x1080, 1080x1350, 1080x1920.
const RATIOS = {
  '16x9': [960, 540],
  '4x5': [540, 675],
  '9x16': [540, 960],
};
const SCALE = 2;

const requested = process.argv.slice(2);
const ids = requested.length
  ? requested
  : fs.readdirSync(adsDir).filter((d) => fs.existsSync(path.join(adsDir, d, 'ad.html')));

const channel = process.env.PW_CHANNEL ?? 'chrome';
const browser = await chromium.launch(channel === 'chromium' ? {} : { channel });
let failed = false;

for (const id of ids) {
  const template = path.join(adsDir, id, 'ad.html');
  if (!fs.existsSync(template)) {
    console.error(`${id}: no ${path.relative(root, template)}`);
    failed = true;
    continue;
  }
  for (const [ratio, [width, height]] of Object.entries(RATIOS)) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: SCALE });
    const url = pathToFileURL(template);
    url.searchParams.set('ratio', ratio);
    await page.goto(url.href);
    await page.evaluate(() => document.fonts.ready);

    // A clipped frame is a broken ad: refuse to write it.
    const clipped = await page.evaluate(() => {
      const frame = document.querySelector('.ad');
      const out = [];
      if (frame.scrollHeight > frame.clientHeight + 1) out.push(`height ${frame.scrollHeight} > ${frame.clientHeight}`);
      if (frame.scrollWidth > frame.clientWidth + 1) out.push(`width ${frame.scrollWidth} > ${frame.clientWidth}`);
      // Top-level blocks (lockup, pitch, steps, cta) must not spill past their area or overlap.
      // 4px of slack: an 800-weight headline at line-height 1.04 overhangs its line box by ~3px.
      const blocks = [...frame.children];
      for (const el of blocks) {
        if (el.scrollHeight > el.clientHeight + 4) out.push(`.${el.className} spills ${el.scrollHeight - el.clientHeight}px`);
      }
      const boxes = blocks.map((el) => [el.className, el.getBoundingClientRect()]);
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const [a, ra] = boxes[i];
          const [b, rb] = boxes[j];
          if (ra.left < rb.right && rb.left < ra.right && ra.top < rb.bottom && rb.top < ra.bottom) out.push(`.${a} overlaps .${b}`);
        }
      }
      for (const el of frame.querySelectorAll('*')) {
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible' && el.clientWidth > 0) {
          out.push(`<${el.tagName.toLowerCase()} class="${el.className.baseVal ?? el.className}"> overflows`);
        }
      }
      return out;
    });
    if (clipped.length) {
      console.error(`${id} ${ratio}: content does not fit the frame: ${clipped.join('; ')}`);
      failed = true;
    }

    const out = path.join(adsDir, id, `${ratio}.png`);
    await page.screenshot({ path: out });
    console.log(`${path.relative(root, out)}  ${width * SCALE}x${height * SCALE}`);
    await page.close();
  }
}

await browser.close();
process.exit(failed ? 1 : 0);
