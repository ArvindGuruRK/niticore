// Render part of the film: stills, a strip, or a frame range, optionally on the GPU (ANGLE D3D11).
// v3 reuses the approved v2.1 frames for 0-100 s and renders only what follows, then splices.
// Run from video/:
//   node niticore-flow/tools/render_range.mjs --at 172,190.5 [--gpu] [--format 16x9]      stills -> out/niticore-flow/stills/
//   node niticore-flow/tools/render_range.mjs --strip 167:172:8 [--gpu]                   -> out/niticore-flow/strip.png
//   node niticore-flow/tools/render_range.mjs --frames 6000:10875 [--gpu] [--workers 4]   PNGs -> out/niticore-flow/frames_v3/
// Times for --at / --strip are in seconds. Frames are written as %05d.png by absolute frame number.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd(), FILM = 'niticore-flow';
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] !== undefined && !args[i + 1].startsWith('--') ? args[i + 1] : d; };
const FORMAT = opt('format', '16x9'), [W, H] = { '16x9': [1920, 1080], '9x16': [1080, 1920] }[FORMAT], SUF = FORMAT === '16x9' ? '' : `_${FORMAT}`;
const FPS = 60, WORKERS = Number(opt('workers', 4));
const OUT = path.join(ROOT, 'out', FILM);
const FF = fs.existsSync(path.join(ROOT, 'bin', 'ffmpeg.exe')) ? path.join(ROOT, 'bin', 'ffmpeg.exe') : 'ffmpeg';
const req = createRequire(path.join(ROOT, 'noop.js'));
const pw = await import(pathToFileURL(req.resolve('playwright')).href);
const chromium = pw.chromium || pw.default.chromium;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.wav': 'audio/wav' };
const server = await new Promise((resolve) => {
  const s = http.createServer((rq, rs) => {
    const p = path.join(ROOT, decodeURIComponent(new URL(rq.url, 'http://x').pathname));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rs.writeHead(404); rs.end(); return; }
    rs.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' }); fs.createReadStream(p).pipe(rs);
  });
  s.listen(0, '127.0.0.1', () => resolve(s));
});
const EXTRA = opt('query', '') ? `&${opt('query')}` : '';   // e.g. --query countdown_from=2026-10-07T09:00:00%2B04:00
const url = `http://127.0.0.1:${server.address().port}/${FILM}/index.html?render=1&blur=${flag('noblur') ? 0 : 1}&fps=${FPS}&format=${FORMAT}&w=${W}&h=${H}${EXTRA}`;
const launch = ['--font-render-hinting=none', '--disable-lcd-text', ...(flag('gpu') ? ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] : [])];
const browser = await chromium.launch({ args: launch });
async function pages(n) {
  return Promise.all(Array.from({ length: n }, async () => {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.error('[page]', e.message));
    page.on('console', (m) => { if (m.type() === 'error') console.error('[console]', m.text()); });
    await page.goto(url);
    await page.waitForFunction(() => window.filmReady === true, null, { timeout: 180000 });
    return page;
  }));
}
async function run(ps, jobs) {
  let next = 0, done = 0; const t0 = Date.now();
  await Promise.all(ps.map(async (page) => {
    while (next < jobs.length) {
      const job = jobs[next++];
      if (fs.existsSync(job.file) && flag('resume')) { done++; continue; }
      await page.evaluate((t) => window.seek(t), job.t);
      await page.screenshot({ path: job.file, type: 'png' });
      done++;
      if (jobs.length > 40 && done % 60 === 0) process.stdout.write(`\r  ${done}/${jobs.length} frames  ${(done / ((Date.now() - t0) / 1000)).toFixed(2)} fps`);
    }
  }));
  if (jobs.length > 40) process.stdout.write('\n');
}
try {
  if (opt('at', null)) {
    const dir = path.join(OUT, 'stills'); fs.mkdirSync(dir, { recursive: true });
    const jobs = opt('at').split(',').map(Number).map((t) => ({ t: Math.round(t * FPS) / FPS, file: path.join(dir, `t${t.toFixed(3)}${SUF}.png`) }));
    await run(await pages(Math.min(WORKERS, jobs.length)), jobs);
    console.log(jobs.map((j) => path.relative(ROOT, j.file)).join('\n'));
  } else if (opt('strip', null)) {
    const [a, b, n] = opt('strip').split(':').map(Number), dir = path.join(OUT, 'strip');
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const jobs = Array.from({ length: n }, (_, i) => ({ t: Math.round((a + ((b - a) * i) / Math.max(1, n - 1)) * FPS) / FPS, file: path.join(dir, `s${String(i).padStart(3, '0')}.png`) }));
    await run(await pages(Math.min(WORKERS, jobs.length)), jobs);
    const cols = Math.min(n, 4), th = 360, twd = Math.round((th * W) / H / 2) * 2, name = opt('name', 'strip');
    spawnSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '1', '-i', path.join(dir, 's%03d.png'), '-vf', `scale=${twd}:${th}:flags=area,pad=${twd + 8}:${th + 8}:4:4:0x777777,tile=${cols}x${Math.ceil(n / cols)}`, '-frames:v', '1', path.join(OUT, `${name}${SUF}.png`)], { stdio: 'inherit' });
    console.log(`strip ${a}-${b}s x${n}: ${jobs.map((j) => j.t.toFixed(2)).join(' ')} -> out/${FILM}/${name}${SUF}.png`);
  } else if (opt('frames', null)) {
    const [f0, f1] = opt('frames').split(':').map(Number), dir = path.join(OUT, opt('dir', `frames_v3${SUF}`));
    fs.mkdirSync(dir, { recursive: true });
    const jobs = []; for (let i = f0; i < f1; i++) jobs.push({ t: i / FPS, file: path.join(dir, `${String(i).padStart(5, '0')}.png`) });
    console.log(`rendering frames ${f0}-${f1 - 1} (${jobs.length}) ${W}x${H} @ ${FPS}fps, ${WORKERS} workers, ${flag('gpu') ? 'GPU' : 'SwiftShader'}`);
    await run(await pages(WORKERS), jobs);
  }
} finally { await browser.close(); server.close(); }
