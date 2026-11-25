// Capture each screenshot-style meme format we built ourselves (memes/formats/formats.html, one .card per format)
// as memes/img/<card id>.webp, 480px wide. Run `npm run memes` afterwards to record the sizes.
// Usage: npm run meme-formats   (uses the installed Google Chrome; PW_CHANNEL=chromium for Playwright's own)
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const channel = process.env.PW_CHANNEL ?? 'chrome';
const browser = await chromium.launch(channel === 'chromium' ? {} : { channel });
const page = await browser.newPage({ viewport: { width: 560, height: 800 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(root, 'memes', 'formats', 'formats.html')).href);
await page.evaluate(() => document.fonts.ready);

for (const card of await page.locator('.card').all()) {
  const id = await card.getAttribute('id');
  const out = path.join(root, 'memes', 'img', `${id}.webp`);
  execFileSync('magick', ['-', '-strip', '-quality', '86', `webp:${out}`], { input: await card.screenshot() });
  console.log(`saved  ${path.relative(root, out)}`);
}
await browser.close();
