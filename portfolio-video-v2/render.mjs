// render.mjs: renders studio.html in headless Chrome.
//   node render.mjs --sheet=1,5,9 [--cols=3] [--w=640] --out=out/check/a.jpg     contact sheet of chosen times
//   node render.mjs --strip=7.8:8.4 [--cols=6] [--w=320] --out=out/check/s.jpg    every frame in a stretch
//   node render.mjs --frames [--range=0:30] [--workers=3]                         JPEG frames → out/frames (resumable)
//   node render.mjs --audio                                                       score + foley → out/audio/*.wav
//   node render.mjs --encode                                                      frames + mix → out/portfolio_v2.mp4
// --chrome=<path> or CHROME_PATH picks the browser (default: Playwright's Chromium).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, statSync, renameSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const FPS = 30, DUR = 30, FRAMES = 'out/frames';
const run = (cmd, a) => new Promise((ok, bad) => { const p = spawn(cmd, a, { stdio: 'inherit' }); p.on('close', c => c ? bad(new Error(cmd + ' exited ' + c)) : ok()); });

if (args.encode) {
  // loudness-normalise the mix to -14 LUFS (single-pass loudnorm), then mux with the frames
  mkdirSync('out', { recursive: true });
  const out = args.out || 'out/portfolio_v2.mp4';
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${FRAMES}/f%05d.jpg`, '-i', 'out/audio/mix.wav',
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(args.crf || 20), '-pix_fmt', 'yuv420p',
    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-t', String(DUR), '-movflags', '+faststart', out]);
  console.log('wrote ' + out);
  process.exit(0);
}

const CHROME = [args.chrome, process.env.CHROME_PATH, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(p => p && existsSync(p));
if (!CHROME) { console.error('Chrome not found: pass --chrome=<path>'); process.exit(1); }
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 0,
  args: ['--no-sandbox', '--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required', '--window-size=1920,1080'] });
async function openPage(tag = '') {
  const page = await browser.newPage();
  page.on('console', m => { if (['error', 'warn'].includes(m.type())) console.log(`[page${tag}]`, m.text()); });
  page.on('pageerror', e => console.log(`[page error${tag}]`, e.message));
  await page.goto(pathToFileURL(resolve('studio.html')).href + '?render', { waitUntil: 'load', timeout: 0 });
  await page.waitForFunction('window.ready === true', { timeout: 0 });
  return page;
}
const b64 = url => Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');

if (args.sheet || args.strip) {
  const page = await openPage(), out = args.out || 'out/check/sheet.jpg'; mkdirSync(dirname(out), { recursive: true });
  let ts; if (args.strip) { const [a, b] = String(args.strip).split(':').map(Number); ts = []; for (let i = Math.round(a * FPS); i <= Math.round(b * FPS); i++) ts.push(i / FPS); }
  else ts = String(args.sheet).split(',').map(Number);
  const cols = +(args.cols || (args.strip ? 6 : 3)), w = +(args.w || (args.strip ? 320 : 640));
  const { url, ms } = await page.evaluate(async (ts, cols, w) => {
    const h = Math.round(w * 9 / 16), sc = document.createElement('canvas'); sc.width = cols * w; sc.height = Math.ceil(ts.length / cols) * h;
    const c = sc.getContext('2d'), ms = [];
    ts.forEach((t, i) => { const a = performance.now(); renderFrame(t); ms.push(Math.round(performance.now() - a));
      const x = (i % cols) * w, y = Math.floor(i / cols) * h; c.drawImage(OUT, x, y, w, h);
      c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(x, y, 70, 20); c.fillStyle = '#fff'; c.font = '13px sans-serif'; c.fillText(t.toFixed(2) + 's', x + 5, y + 15); });
    return { url: sc.toDataURL('image/jpeg', .9), ms };
  }, ts, cols, w);
  writeFileSync(out, b64(url)); console.log(`${out} (${ts.length} frames) ms/frame: ${ms.join(' ')}`);
} else if (args.frames) {
  const [a, b] = args.range ? String(args.range).split(':').map(Number) : [0, DUR], workers = +(args.workers || 3);
  mkdirSync(FRAMES, { recursive: true });
  const todo = []; for (let i = Math.round(a * FPS); i < Math.min(DUR * FPS, Math.round(b * FPS)); i++) { const f = `${FRAMES}/f${String(i).padStart(5, '0')}.jpg`; if (!existsSync(f) || statSync(f).size < 1000) todo.push(i); }
  console.log(`${todo.length} frames to render, ${workers} workers`);
  let next = 0, done = 0; const t0 = Date.now();
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const page = await openPage('#' + w);
    while (next < todo.length) {
      const i = todo[next++], f = `${FRAMES}/f${String(i).padStart(5, '0')}.jpg`;
      writeFileSync(f + '.tmp', b64(await page.evaluate(t => window.renderAt(t), i / FPS))); renameSync(f + '.tmp', f);
      if (++done % 60 === 0 || done === todo.length) console.log(`frame ${done}/${todo.length}  ${((Date.now() - t0) / done).toFixed(0)} ms/frame`);
    }
  }));
} else if (args.audio) {
  // the score and foley are synthesised offline (Tone.Offline) in the page; stems come back as 16-bit WAVs
  const page = await openPage(); mkdirSync('out/audio', { recursive: true });
  const stems = await page.evaluate(() => renderStems());   // { music, sfx, mix }: base64 WAVs
  for (const k in stems) { writeFileSync(`out/audio/${k}.wav`, Buffer.from(stems[k], 'base64')); console.log(`out/audio/${k}.wav`); }
  const cues = await page.evaluate(() => CUES.map(c => ({ t: c.t, kind: c.kind })));
  writeFileSync('out/audio/cues.json', JSON.stringify(cues, null, 1)); console.log(`out/audio/cues.json (${cues.length} cues)`);
} else console.log('nothing to do: see the usage notes at the top of render.mjs');
await browser.close();
