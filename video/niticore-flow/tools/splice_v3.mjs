// v3 delivery: the approved v2.1 picture for frames 0..FROM-1, the v3 render (frames_v3/) from FROM on,
// encoded once with render.mjs's settings, then muxed with the v3 mix. Run from video/:
//   node niticore-flow/tools/splice_v3.mjs [--format 16x9] [--from 6000]
//   node niticore-flow/tools/splice_v3.mjs --swap frames_oct7:9720:10240 --name oct7    (another day's clock)
// -> out/niticore-flow/video_<format>[_<name>].mp4 and final[_<format>][_<name>].mp4
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const FORMAT = opt('format', '16x9'), FROM = Number(opt('from', 6000)), FPS = 60, NAME = opt('name', '');
const SUF = FORMAT === '16x9' ? '' : `_${FORMAT}`, TAG = NAME ? `_${NAME}` : '';
const ROOT = process.cwd(), OUT = path.join(ROOT, 'out', 'niticore-flow');
const FF = fs.existsSync(path.join(ROOT, 'bin', 'ffmpeg.exe')) ? path.join(ROOT, 'bin', 'ffmpeg.exe') : 'ffmpeg';
const CFG = JSON.parse(fs.readFileSync(path.join(ROOT, 'niticore-flow', 'film.json'), 'utf8'));
const N = Math.round(CFG.duration * FPS);
const OLD = path.join(OUT, 'v2.1', `final${SUF}_v2.1.mp4`), MAIN = path.join(OUT, `frames_v3${SUF}`);
// the picture as [dir, first, end) runs of PNG frames after the v2.1 part
let runs = [[MAIN, FROM, N]];
if (opt('swap', null)) {
  const [d, a, b] = opt('swap').split(':'); const s0 = Number(a), s1 = Number(b);
  runs = [[MAIN, FROM, s0], [path.join(OUT, d), s0, s1], [MAIN, s1, N]];
}
const missing = []; runs.forEach(([d, a, b]) => { for (let i = a; i < b; i++) if (!fs.existsSync(path.join(d, `${String(i).padStart(5, '0')}.png`))) missing.push(`${path.basename(d)}/${i}`); });
if (missing.length) { console.error(`${missing.length} frames missing, first ${missing[0]}`); process.exit(1); }
const ff = (argv) => { const r = spawnSync(FF, ['-hide_banner', '-loglevel', 'error', '-stats', '-y', ...argv], { stdio: 'inherit' }); if (r.status !== 0) throw new Error('ffmpeg failed'); };
const video = path.join(OUT, `video_${FORMAT}${TAG}.mp4`), final = path.join(OUT, `final${SUF}${TAG}.mp4`);
const enc = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv'];
const inputs = ['-i', OLD], chains = [`[0:v]trim=end_frame=${FROM},setpts=PTS-STARTPTS,format=yuv420p[p0]`];
runs.forEach(([d, a, b], k) => {
  inputs.push('-framerate', String(FPS), '-start_number', String(a), '-i', path.join(d, '%05d.png'));
  chains.push(`[${k + 1}:v]trim=end_frame=${b - a},scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,setpts=PTS-STARTPTS[p${k + 1}]`);
});
const graph = `${chains.join(';')};${runs.map((_, k) => `[p${k}]`).join('')}[p${runs.length}]concat=n=${runs.length + 1}:v=1:a=0,fps=${FPS}[v]`;
console.log(`splice: v2.1 frames 0-${FROM - 1} + ${runs.map(([d, a, b]) => `${path.basename(d)} ${a}-${b - 1}`).join(' + ')} -> ${path.relative(ROOT, video)}`);
ff([...inputs, '-filter_complex', graph, '-map', '[v]', ...enc, '-an', '-frames:v', String(N), '-movflags', '+faststart', video]);
ff(['-i', video, '-i', path.join(ROOT, 'niticore-flow', 'audio', 'mix.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-t', String(CFG.duration), '-movflags', '+faststart', final]);
console.log(`-> ${path.relative(ROOT, final)}`);
