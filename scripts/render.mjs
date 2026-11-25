// Render each ad template (ads/<id>/ad.html) to PNG in every ratio, and to MP4 when the ad is animated.
// Usage: npm run render [-- PKY-0001 ...]   (default: every ad folder with an ad.html)
// Uses the installed Google Chrome; set PW_CHANNEL=chromium to use Playwright's own build.
// An animated ad (a <video data-poster-time> in .ad) also needs ffmpeg on PATH.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const adsDir = path.join(root, 'ads');

// CSS frame size per ratio; captured at 2x for 1920x1080, 1080x1080, 1080x1350, 1080x1920.
const RATIOS = {
  '16x9': [960, 540],
  '1x1': [540, 540],
  '4x5': [540, 675],
  '9x16': [540, 960],
};
const SCALE = 2;
const FPS = 30; // MP4 frame rate; slower footage repeats frames

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

    // An animated ad holds its footage in <video data-poster-time>: the PNG shows the frame at that second.
    const clip = await page.evaluate(async () => {
      const video = document.querySelector('.ad video[data-poster-time]');
      if (!video) return null;
      video.pause();
      if (video.readyState < 1) await new Promise((r) => video.addEventListener('loadedmetadata', r, { once: true }));
      const seeked = new Promise((r) => video.addEventListener('seeked', r, { once: true }));
      video.currentTime = Number(video.dataset.posterTime);
      await seeked;
      await Promise.race([
        new Promise((r) => video.requestVideoFrameCallback(() => r())),
        new Promise((r) => setTimeout(r, 1000)),
      ]);
      const box = video.getBoundingClientRect();
      return { src: video.currentSrc, box: [box.x, box.y, box.width, box.height] };
    });

    const out = path.join(adsDir, id, `${ratio}.png`);
    await page.screenshot({ path: out });
    console.log(`${path.relative(root, out)}  ${width * SCALE}x${height * SCALE}`);

    // ...and the MP4 is the page with the video hidden, its footage composited back into the video's box.
    if (clip) {
      const [x, y, w, h] = clip.box.map((v) => v * SCALE);
      if (![x, y, w, h].every(Number.isInteger)) {
        console.error(`${id} ${ratio}: the video's box ${clip.box.join(',')} is off the ${SCALE}x pixel grid`);
        failed = true;
      } else {
        const base = path.join(os.tmpdir(), `pokayoke-${id}-${ratio}-base.png`);
        await page.addStyleTag({ content: '.ad video[data-poster-time] { visibility: hidden; }' });
        await page.screenshot({ path: base });
        const mp4 = path.join(adsDir, id, `${ratio}.mp4`);
        // overlay in RGB so an odd x or y is not rounded to the 4:2:0 chroma grid; tagged BT.709 like any HD video.
        const filter =
          `[1:v]fps=${FPS},scale=${w}:${h}:flags=lanczos,setsar=1[clip];` +
          `[0:v][clip]overlay=${x}:${y}:shortest=1:format=rgb,` +
          'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p';
        execFileSync('ffmpeg', [
          '-v', 'error', '-y',
          '-loop', '1', '-framerate', String(FPS), '-i', base,
          '-i', fileURLToPath(clip.src),
          '-filter_complex', filter,
          '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-tune', 'animation',
          '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
          '-movflags', '+faststart', '-an', mp4,
        ], { stdio: ['ignore', 'inherit', 'inherit'] });
        fs.rmSync(base);
        console.log(`${path.relative(root, mp4)}  ${width * SCALE}x${height * SCALE} @ ${FPS}fps`);
      }
    }
    await page.close();
  }
}

await browser.close();
process.exit(failed ? 1 : 0);
