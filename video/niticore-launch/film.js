// Niticore — "The governed loop". A pure function of time: window.seek(t) paints frame t.
// Timing is in beats (u) on the measured 128 bpm grid; docs/shotlist.md is the plan this follows.
// Every product screen is a real screenshot (assets/app/*, assets/shots/*); the cursor, typing,
// ticks and highlights are interactions drawn over them, never invented screens.
import * as M from './lib/motion.js';

const { W, H, FORMAT, E, prog, lerp, clamp, springU, springKeys, SPRING, kf, wobble, font, layout, fitSize, text, fill, rrect, cover, hash01, bump } = M;
const P = FORMAT.portrait;
const S = FORMAT.safe;

// ---------------------------------------------------------------- brand (src/app/globals.css)
const C = {
  canvas: '#06011F', surface: '#0C062B', raised: '#140D3D', ink700: '#1D1552',
  fg: '#F2F0FB', muted: '#CBC6E4', subtle: '#A6A1C4',
  accent: '#4AE057', violet: '#A98BFF', violetSoft: '#C9B8FF',
};
const TONE = {
  blue: ['#1A1260', '#2F2A8C'], violet: ['#4A33B8', '#7654E0'], green: ['#0F4A1D', '#1F8A31'],
};
const DISPLAY = 'Display', UI = 'UI';
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

// ---------------------------------------------------------------- the wordmark (assets/logo/logo_img.svg)
const LOGO = {
  w: 156, h: 38, base: 37.14,
  sparkles: [
    { cx: 28.1, cy: 7.38, d: 'M27.1264 4.58673C27.3281 3.52776 28.8318 3.49353 29.0815 4.54222L29.2846 5.39508C29.3727 5.76547 29.6636 6.05365 30.0348 6.13838L31.252 6.41621C32.3121 6.65819 32.2788 8.17953 31.2091 8.37487L30.0782 8.58138C29.6842 8.65333 29.3711 8.95339 29.2826 9.34397L29.0842 10.219C28.8434 11.2808 27.3193 11.2476 27.125 10.1763L26.9817 9.3863C26.9069 8.97397 26.5829 8.652 26.1701 8.57977L25.0056 8.37599C23.9255 8.18697 23.8931 6.64838 24.9643 6.41406L26.2121 6.14111C26.6033 6.05553 26.9058 5.74476 26.9807 5.35132L27.1264 4.58673Z' },
    { cx: 56.06, cy: 7.38, d: 'M55.087 4.58673C55.2888 3.52776 56.7925 3.49353 57.0422 4.54222L57.2453 5.39508C57.3334 5.76547 57.6243 6.05365 57.9955 6.13838L59.2127 6.41621C60.2728 6.65819 60.2395 8.17953 59.1698 8.37487L58.0389 8.58138C57.6449 8.65333 57.3318 8.95339 57.2433 9.34397L57.0448 10.219C56.8041 11.2808 55.28 11.2476 55.0857 10.1763L54.9423 9.3863C54.8675 8.97397 54.5436 8.652 54.1308 8.57977L52.9663 8.37599C51.8862 8.18697 51.8538 6.64838 52.925 6.41406L54.1728 6.14111C54.564 6.05553 54.8665 5.74476 54.9414 5.35132L55.087 4.58673Z' },
  ],
  // left to right: n i t i c o r e
  letters: [
    { cx: 10.5, d: 'M0 37.14V14.208H5.88V18.744L5.544 17.736C6.076 16.364 6.93 15.356 8.106 14.712C9.31 14.04 10.71 13.704 12.306 13.704C14.042 13.704 15.554 14.068 16.842 14.796C18.158 15.524 19.18 16.546 19.908 17.862C20.636 19.15 21 20.662 21 22.398V37.14H14.7V23.742C14.7 22.846 14.518 22.076 14.154 21.432C13.818 20.788 13.328 20.284 12.684 19.92C12.068 19.556 11.34 19.374 10.5 19.374C9.688 19.374 8.96 19.556 8.316 19.92C7.672 20.284 7.168 20.788 6.804 21.432C6.468 22.076 6.3 22.846 6.3 23.742V37.14H0Z' },
    { cx: 28.3, d: 'M25.1426 37.14V14.208H31.4426V37.14H25.1426Z' },
    { cx: 42.3, d: 'M47.0987 37.392C44.3267 37.392 42.1707 36.65 40.6307 35.166C39.1187 33.654 38.3627 31.554 38.3627 28.866V19.668H34.4987V14.208H34.7087C35.8847 14.208 36.7807 13.914 37.3967 13.326C38.0407 12.738 38.3627 11.856 38.3627 10.68V9H44.6627V14.208H50.0387V19.668H44.6627V28.446C44.6627 29.23 44.8027 29.888 45.0827 30.42C45.3627 30.924 45.7967 31.302 46.3847 31.554C46.9727 31.806 47.7007 31.932 48.5687 31.932C48.7647 31.932 48.9887 31.918 49.2407 31.89C49.4927 31.862 49.7587 31.834 50.0387 31.806V37.14C49.6187 37.196 49.1427 37.252 48.6107 37.308C48.0787 37.364 47.5747 37.392 47.0987 37.392Z' },
    { cx: 56.9, d: 'M53.7305 37.14V14.208H60.0305V37.14H53.7305Z' },
    { cx: 75.2, d: 'M75.8966 37.644C73.6006 37.644 71.5286 37.126 69.6806 36.09C67.8606 35.026 66.4046 33.584 65.3126 31.764C64.2486 29.944 63.7166 27.9 63.7166 25.632C63.7166 23.364 64.2486 21.334 65.3126 19.542C66.3766 17.722 67.8326 16.294 69.6806 15.258C71.5286 14.222 73.6006 13.704 75.8966 13.704C77.6046 13.704 79.1866 13.998 80.6426 14.586C82.0986 15.174 83.3446 16 84.3806 17.064C85.4166 18.1 86.1586 19.332 86.6066 20.76L81.1466 23.112C80.7546 21.964 80.0826 21.054 79.1306 20.382C78.2066 19.71 77.1286 19.374 75.8966 19.374C74.8046 19.374 73.8246 19.64 72.9566 20.172C72.1166 20.704 71.4446 21.446 70.9406 22.398C70.4646 23.35 70.2266 24.442 70.2266 25.674C70.2266 26.906 70.4646 27.998 70.9406 28.95C71.4446 29.902 72.1166 30.644 72.9566 31.176C73.8246 31.708 74.8046 31.974 75.8966 31.974C77.1566 31.974 78.2486 31.638 79.1726 30.966C80.0966 30.294 80.7546 29.384 81.1466 28.236L86.6066 30.63C86.1866 31.974 85.4586 33.178 84.4226 34.242C83.3866 35.306 82.1406 36.146 80.6846 36.762C79.2286 37.35 77.6326 37.644 75.8966 37.644Z' },
    { cx: 101.7, d: 'M101.698 37.644C99.4304 37.644 97.3584 37.126 95.4824 36.09C93.6344 35.054 92.1504 33.64 91.0304 31.848C89.9384 30.028 89.3924 27.97 89.3924 25.674C89.3924 23.35 89.9384 21.292 91.0304 19.5C92.1504 17.708 93.6344 16.294 95.4824 15.258C97.3584 14.222 99.4304 13.704 101.698 13.704C103.966 13.704 106.024 14.222 107.872 15.258C109.72 16.294 111.19 17.708 112.282 19.5C113.402 21.292 113.962 23.35 113.962 25.674C113.962 27.97 113.402 30.028 112.282 31.848C111.19 33.64 109.72 35.054 107.872 36.09C106.024 37.126 103.966 37.644 101.698 37.644ZM101.698 31.974C102.846 31.974 103.84 31.708 104.68 31.176C105.548 30.644 106.22 29.902 106.696 28.95C107.2 27.998 107.452 26.906 107.452 25.674C107.452 24.442 107.2 23.364 106.696 22.44C106.22 21.488 105.548 20.746 104.68 20.214C103.84 19.654 102.846 19.374 101.698 19.374C100.55 19.374 99.5424 19.654 98.6744 20.214C97.8064 20.746 97.1204 21.488 96.6164 22.44C96.1404 23.364 95.9024 24.442 95.9024 25.674C95.9024 26.906 96.1404 27.998 96.6164 28.95C97.1204 29.902 97.8064 30.644 98.6744 31.176C99.5424 31.708 100.55 31.974 101.698 31.974Z' },
    { cx: 124.4, d: 'M117.674 37.14V14.208H123.554V19.71L123.134 18.912C123.638 16.98 124.464 15.678 125.612 15.006C126.788 14.306 128.174 13.956 129.77 13.956H131.114V19.416H129.14C127.6 19.416 126.354 19.892 125.402 20.844C124.45 21.768 123.974 23.084 123.974 24.792V37.14H117.674Z' },
    { cx: 144.4, d: 'M144.921 37.644C142.485 37.644 140.371 37.112 138.579 36.048C136.787 34.956 135.401 33.5 134.421 31.68C133.441 29.86 132.951 27.844 132.951 25.632C132.951 23.336 133.455 21.292 134.463 19.5C135.499 17.708 136.885 16.294 138.621 15.258C140.357 14.222 142.317 13.704 144.501 13.704C146.321 13.704 147.931 13.998 149.331 14.586C150.731 15.146 151.907 15.944 152.859 16.98C153.839 18.016 154.581 19.22 155.085 20.592C155.589 21.936 155.841 23.406 155.841 25.002C155.841 25.45 155.813 25.898 155.757 26.346C155.729 26.766 155.659 27.13 155.547 27.438H138.369V22.818H151.977L148.995 25.002C149.275 23.798 149.261 22.734 148.953 21.81C148.645 20.858 148.099 20.116 147.315 19.584C146.559 19.024 145.621 18.744 144.501 18.744C143.409 18.744 142.471 19.01 141.687 19.542C140.903 20.074 140.315 20.858 139.923 21.894C139.531 22.93 139.377 24.19 139.461 25.674C139.349 26.962 139.503 28.096 139.923 29.076C140.343 30.056 140.987 30.826 141.855 31.386C142.723 31.918 143.773 32.184 145.005 32.184C146.125 32.184 147.077 31.96 147.861 31.512C148.673 31.064 149.303 30.448 149.751 29.664L154.791 32.058C154.343 33.178 153.629 34.158 152.649 34.998C151.697 35.838 150.563 36.496 149.247 36.972C147.931 37.42 146.489 37.644 144.921 37.644Z' },
  ],
};
let PATHS = null;   // Path2D objects, built once (Path2D needs the DOM)
const buildPaths = () => {
  PATHS = { letters: LOGO.letters.map((l) => new Path2D(l.d)), sparkles: LOGO.sparkles.map((s) => new Path2D(s.d)) };
};
// one sparkle centred on (x, y), r = its half-size in px
function sparkle(ctx, x, y, r, color, rot = 0) {
  if (r <= 0.01) return;
  const s = LOGO.sparkles[0], k = r / 3.6;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.translate(-s.cx, -s.cy);
  ctx.fillStyle = color; ctx.fill(PATHS.sparkles[0]); ctx.restore();
}
function sparklePath(ctx, x, y, r, rot = 0) {   // the sparkle as a clip path in screen space
  const s = LOGO.sparkles[0], k = r / 3.6;
  const m = new DOMMatrix().translate(x, y).rotate((rot * 180) / Math.PI).scale(k, k).translate(-s.cx, -s.cy);
  const p = new Path2D(); p.addPath(PATHS.sparkles[0], m); return p;
}

// ---------------------------------------------------------------- copy (the site's own words)
const STAGES = [
  { word: 'Discover', lead: 'Eliminate shadow AI across every team, tool, and vendor.' },
  { word: 'Classify', lead: 'Instant risk tiering the moment a new system enters your stack.' },
  { word: 'Assess', lead: 'Quantified risk scoring across every dimension that matters.' },
  { word: 'Govern', lead: 'Unified controls that satisfy every applicable framework at once.' },
  { word: 'Evidence', lead: 'File once, satisfy everywhere.' },
  { word: 'Monitor', lead: 'Continuous surveillance runs long after a model ships.' },
  { word: 'Improve', lead: 'Prioritised gap closures your board can see.' },
];
const AGENTS = [
  { title: 'Agent Identity', body: 'Cryptographic agent ID, verified owner, and delegated role for every autonomous system.', tone: 'blue' },
  { title: 'Autonomy Scope', body: 'Explicit execution boundaries and pre-authorised budgets, set before an agent runs.', tone: 'violet' },
  { title: 'Tools & API Access', body: 'Fine-grained endpoint permissions — an agent only ever reaches what it’s scoped to reach.', tone: 'green' },
  { title: 'Hard Guardrails', body: 'Constraints hardcoded into the agent, not the prompt.', tone: 'blue' },
  { title: 'Human-in-the-Loop', body: 'Escalation gates route irreversible actions to a human for confirmation before they execute.', tone: 'violet' },
  { title: 'Runtime Telemetry', body: 'Live execution logs surface behavioural drift instantly, with an instant kill-switch.', tone: 'green' },
];
const FRAMEWORK_CHIPS = ['EU AI Act', 'ISO/IEC 42001', 'NIST AI RMF', 'GDPR', 'ISO/IEC 27001'];
const TYPED = 'Clinical Decision Copilot';   // the wizard's own placeholder example

// ---------------------------------------------------------------- hits: [beat, label, sfx, opts]
const HITS = [
  [0, 'Move', 'impact'],
  [0.5, 'fast', 'click'], [1, 'with', 'click'], [1.5, 'AI.', 'click', { gain: 0.4 }],
  [4, 'brake: Govern it with confidence', 'thud', { pitch: 70, to: 40 }],
  [6, 'swash draws', 'whoosh', { len: 0.55, from: 900, to: 3600 }],
  [7.75, 'headline collapses', 'whoosh', { len: 0.35, from: 3000, to: 500 }],
  [8, 'wordmark lands', 'thud'],
  [8.5, 'sparkles', 'bell', { pitch: 'D6' }],
  [9, 'tagline', 'tick'],
  [12, 'dive: network', 'impact'],
  [12.5, 'node Models', 'blip', { pitch: 'D5' }], [13, 'node Datasets', 'blip', { pitch: 'F5' }],
  [13.5, 'node Agents', 'blip', { pitch: 'A5' }], [14, 'node Teams', 'blip', { pitch: 'C6' }],
  [14.5, 'node Tools', 'blip', { pitch: 'D6' }], [15, 'node Vendors', 'blip', { pitch: 'F6' }],
  [15.75, 'node opens into the wizard', 'whoosh', { len: 0.4, from: 500, to: 2600 }],
  [16.25, 'click name field', 'click'],
  [16.45, 'typing', 'type', { n: 24, len: 0.5 }],
  [18, 'push to classification', 'whoosh', { len: 0.45, from: 700, to: 2400 }],
  [19, 'EU AI Act', 'pop', { pitch: 'D5' }], [19.5, 'ISO 42001', 'pop', { pitch: 'E5' }],
  [20, 'NIST AI RMF', 'pop', { pitch: 'F5' }], [20.5, 'GDPR', 'pop', { pitch: 'G5' }],
  [21, 'UAE PDPL', 'pop', { pitch: 'A5' }], [21.5, 'ADGM', 'pop', { pitch: 'C6' }],
  [22, 'Saudi PDPL', 'pop', { pitch: 'D6' }],
  [24, 'risk score macro', 'thud'],
  [25.5, 'scan beam', 'whoosh', { len: 1.1, from: 300, to: 1800 }],
  [27, 'pull back to register', 'whoosh', { len: 0.4, from: 2400, to: 600 }],
  [29.75, 'whip pan', 'whoosh', { len: 0.35, from: 3200, to: 700 }],
  [31, 'tick control 1', 'tick'], [31.5, 'tick control 2', 'tick'], [32, 'tick control 3', 'tick'],
  [33.5, 'Next: Configure', 'click'],
  [35.25, 'sheet tilts away', 'whoosh', { len: 0.4 }],
  [37, 'Upload', 'click'],
  [37.5, 'evidence lifts', 'pop', { pitch: 'A5', to: 'A6' }],
  [38, 'EU AI Act', 'blip', { pitch: 'D6' }], [38.25, 'ISO 42001', 'blip', { pitch: 'E6' }],
  [38.5, 'NIST', 'blip', { pitch: 'F6' }], [38.75, 'GDPR', 'blip', { pitch: 'A6' }],
  [39, 'ISO 27001', 'blip', { pitch: 'C7' }],
  [40, '5x lands', 'thud'],
  [42, 'monitor drops in', 'whoosh', { len: 0.4, from: 600, to: 2600 }],
  [44, 'telemetry crest', 'bell', { pitch: 'A5' }],
  [47, 'pan to improve', 'whoosh', { len: 0.4, from: 2600, to: 700 }],
  [48, 'action 1', 'tick'], [48.5, 'action 2', 'tick'], [49, 'action 3', 'tick'],
  [50, 'loop words', 'blip', { pitch: 'D6' }],
  [51.75, 'loop closes', 'bell', { pitch: 'D6' }],
  [52, 'agents', 'sub', { len: 1.2 }],
  [54, 'circle drawn', 'whoosh', { len: 0.6, from: 800, to: 3200 }],
  [56, 'Agent Identity', 'thud'], [58, 'Autonomy Scope', 'thud'], [60, 'Tools & API Access', 'thud'],
  [62, 'Hard Guardrails', 'thud'], [64, 'Human-in-the-Loop', 'thud'], [66, 'Runtime Telemetry', 'thud'],
  [56.75, 'identity verified', 'blip', { pitch: 'A5' }],
  [62.75, 'guardrail deflects', 'tok', { pitch: 'D5' }],
  [64.9, 'human approves', 'blip', { pitch: 'D6' }],
  [67.25, 'kill-switch', 'click'],
  [68, 'Continuous visibility', 'click'], [69, 'Risk intelligence', 'click'],
  [70, 'Reusable evidence', 'click'], [71, 'Agent guardrails', 'click'],
  [72, 'wordmark', 'impact'],
  [73, 'sparkle 1', 'bell', { pitch: 'D6', gain: 0.7 }], [73.5, 'sparkle 2', 'bell', { pitch: 'A6', gain: 0.7 }],
  [74, 'tagline', 'blip', { pitch: 'A5', gain: 0.5 }], [74.5, 'url', 'blip', { pitch: 'D6', gain: 0.6 }],
];

// ---------------------------------------------------------------- small helpers
const ease = (u, a, b, fn = E.inOutCubic) => fn(prog(u, a, b));
function wrap(ctx, str, f, maxW) {
  ctx.font = f;
  const out = []; let line = '';
  for (const w of str.split(' ')) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
  }
  if (line) out.push(line);
  return out;
}
// a line that rises out of a mask under its baseline (k 0..1)
function riseText(ctx, str, x, y, f, size, color, k, align = 'left') {
  if (k <= 0) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(-1e4, y - size * 1.15, 2e4, size * 1.45); ctx.clip();
  text(ctx, str, x, y + (1 - k) * size * 1.3, f, color, align);
  ctx.restore();
}
function strokeProgress(ctx, pts, p) {   // draw a polyline up to fraction p of its length
  if (p <= 0) return;
  let total = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
  let left = total * clamp(p);
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length && left > 0; i++) {
    const f = Math.min(1, left / seg[i - 1]);
    ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f));
    left -= seg[i - 1];
  }
  ctx.stroke();
}
function quadPts(a, c, b, n = 24) {
  const o = [];
  for (let i = 0; i <= n; i++) { const t = i / n; o.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]); }
  return o;
}
function catmull(pts, n = 16) {
  const o = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t;
      o.push([0, 1].map((k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  o.push(pts[pts.length - 1]);
  return o;
}

// ---------------------------------------------------------------- background: canvas + the site's grid
const CELL = P ? 54 : 60;
let NOBG = false;   // set while an incoming scene paints over the outgoing one
function backdrop(ctx, u, { grid = 1, gx = 0, gy = 0, vReveal = 1, hReveal = 1, aura = 1, focus = [W * 0.6, H * 0.45] } = {}) {
  if (NOBG) return;
  fill(ctx, C.canvas);
  if (aura > 0) {   // two slow violet/ink pools of light: depth, never on UI
    const ax = W * (0.7 + 0.08 * Math.sin(u * 0.11)), ay = H * (0.3 + 0.06 * Math.cos(u * 0.13));
    let g = ctx.createRadialGradient(ax, ay, 0, ax, ay, Math.max(W, H) * 0.6);
    g.addColorStop(0, rgba('#2A2170', 0.55 * aura)); g.addColorStop(1, rgba('#06011F', 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const bx = W * (0.15 + 0.05 * Math.cos(u * 0.09)), by = H * 0.9;
    g = ctx.createRadialGradient(bx, by, 0, bx, by, Math.max(W, H) * 0.45);
    g.addColorStop(0, rgba('#6D4AD6', 0.12 * aura)); g.addColorStop(1, rgba('#06011F', 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  if (grid > 0) {
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(255,255,255,${0.085 * grid * hReveal})`;
    ctx.beginPath();
    const y0 = ((gy % CELL) + CELL) % CELL;
    for (let y = y0; y < H; y += CELL) { ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(W, Math.round(y) + 0.5); }
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${0.085 * grid})`;
    ctx.beginPath();
    const x0 = ((gx % CELL) + CELL) % CELL;
    for (let x = x0; x < W; x += CELL) {
      const d = Math.abs(x - W / 2) / (W / 2);           // vertical lines grow from the centre outwards
      const k = clamp((vReveal * 1.6 - d * 0.6));
      if (k <= 0) continue;
      const half = (H / 2) * E.outCubic(k);
      ctx.moveTo(Math.round(x) + 0.5, H / 2 - half); ctx.lineTo(Math.round(x) + 0.5, H / 2 + half);
    }
    ctx.stroke();
    // the site's radial mask
    const [fx, fy] = focus;
    const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, Math.max(W, H) * 0.72);
    g.addColorStop(0, 'rgba(6,1,31,0)'); g.addColorStop(0.4, 'rgba(6,1,31,0.15)'); g.addColorStop(1, 'rgba(6,1,31,1)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- product windows (real screenshots)
// A window is a screen rect R holding a screenshot under a camera {fx, fy, s}: image point (fx, fy)
// sits at the rect's centre at s screen px per image px. Framed in the site's bezel.
const toScreen = (R, cam, ix, iy) => [R.x + R.w / 2 + (ix - cam.fx) * cam.s, R.y + R.h / 2 + (iy - cam.fy) * cam.s];
function windowFrame(ctx, R, img, cam, { alpha = 1, bezel = true, radius = 18, bg = '#FFFFFF', overlay = null } = {}) {
  if (alpha <= 0 || R.w < 2 || R.h < 2) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (bezel) {
    const p = 9;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 30;
    rrect(ctx, R.x - p, R.y - p, R.w + 2 * p, R.h + 2 * p, radius + p);
    ctx.fillStyle = 'rgba(20,13,61,0.9)'; ctx.fill();
    ctx.restore();
    rrect(ctx, R.x - p, R.y - p, R.w + 2 * p, R.h + 2 * p, radius + p);
    ctx.fillStyle = 'rgba(255,255,255,0.035)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.2; ctx.stroke();
  }
  rrect(ctx, R.x, R.y, R.w, R.h, radius); ctx.clip();
  ctx.fillStyle = bg; ctx.fillRect(R.x, R.y, R.w, R.h);
  ctx.save();
  ctx.translate(R.x + R.w / 2, R.y + R.h / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.fx, -cam.fy);
  ctx.imageSmoothingQuality = 'high';
  if (img) ctx.drawImage(img, 0, 0);
  if (overlay) overlay(ctx);          // drawn in image coordinates: interactions on the real UI
  ctx.restore();
  ctx.restore();
}
function camAt(u, keys, cfg = SPRING.gentle) {
  const v = springKeys(u, keys.map(([b, c]) => [b, [c.fx, c.fy, Math.log(c.s)]]), cfg);
  return { fx: v[0], fy: v[1], s: Math.exp(v[2]) };
}
// the pointer, in screen space
function cursor(ctx, x, y, press = 0, alpha = 1) {
  if (alpha <= 0) return;
  const k = (P ? 1.9 : 1.6) * (1 - 0.18 * press);
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(k, k);
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, 21); ctx.lineTo(5, 16.4); ctx.lineTo(8.6, 24.6); ctx.lineTo(12, 23.1);
  ctx.lineTo(8.5, 15.2); ctx.lineTo(15, 15.2); ctx.closePath();
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#0C062B'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineJoin = 'round'; ctx.lineWidth = 1.6; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
  ctx.restore();
}
function clickRing(ctx, x, y, u, u0) {
  const k = prog(u, u0, u0 + 0.7);
  if (k <= 0 || k >= 1) return;
  const e = E.outCubic(k);
  ctx.save();
  ctx.strokeStyle = rgba(C.violet, (1 - k) * 0.9); ctx.lineWidth = (P ? 4 : 3.5) * (1 - k) + 1;
  ctx.beginPath(); ctx.arc(x, y, 8 + e * (P ? 52 : 44), 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}
// cursor path: keys [[u, [ix, iy]]] in image space, eased with a slight arc; returns screen pos
function cursorPath(u, keys) {
  if (u <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (u <= keys[i][0]) {
      const [a, pa] = keys[i - 1], [b, pb] = keys[i];
      const t = E.inOutCubic(prog(u, a, b));
      const arc = Math.sin(t * Math.PI) * 0.12;
      const dx = pb[0] - pa[0], dy = pb[1] - pa[1];
      return [pa[0] + dx * t - dy * arc, pa[1] + dy * t + dx * arc];
    }
  }
  return keys[keys.length - 1][1];
}

// ---------------------------------------------------------------- stage titles (01 Discover ...)
const TITLE = {
  size: P ? 150 : 132, lead: P ? 54 : 48, num: P ? 30 : 28,
};
function stageTitle(ctx, u, i, u0, u1, x, y, maxW, { align = 'left', leadX = null } = {}) {
  const st = STAGES[i];
  const out = E.inCubic(prog(u, u1 - 0.4, u1));
  if (u < u0 - 0.1 || out >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - out;
  ctx.translate(0, -out * 70);
  // number + violet hairline
  const nk = E.outQuint(prog(u, u0, u0 + 0.5));
  const nf = font(TITLE.num, 700, UI);
  ctx.globalAlpha *= nk;
  text(ctx, `0${i + 1}`, x, y - TITLE.size - 24, nf, C.violet, 'left', 3);
  ctx.strokeStyle = rgba(C.violet, 0.8); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x + TITLE.num * 1.6, y - TITLE.size - 33); ctx.lineTo(x + TITLE.num * 1.6 + 70 * nk, y - TITLE.size - 33); ctx.stroke();
  ctx.globalAlpha = 1 - out;
  // the word, per glyph out of a mask
  const f = font(TITLE.size, 600, DISPLAY);
  const L = layout(ctx, st.word, f, -0.035 * TITLE.size);
  ctx.save();
  ctx.beginPath(); ctx.rect(-1e4, y - TITLE.size * 1.1, 2e4, TITLE.size * 1.42); ctx.clip();
  L.glyphs.forEach((g, j) => {
    const k = springU(u, u0 + 0.05 + j * 0.035, SPRING.snappy);
    if (k <= 0) return;
    M.glyph(ctx, g.ch, x + g.cx, y + (1 - k) * TITLE.size * 1.25, f, C.fg);
  });
  ctx.restore();
  // lead, line by line
  const lf = font(TITLE.lead, 500, UI);
  wrap(ctx, st.lead, lf, maxW).forEach((ln, j) => {
    const k = E.outQuint(prog(u, u0 + 0.4 + j * 0.12, u0 + 1.0 + j * 0.12));
    if (leadX !== null) riseText(ctx, ln, leadX, y - TITLE.size * 0.62 + TITLE.lead * 1.3 * (j + 1), lf, TITLE.lead, C.muted, k, align);
    else riseText(ctx, ln, x, y + 30 + TITLE.lead * 1.35 * (j + 1), lf, TITLE.lead, C.muted, k, align);
  });
  ctx.restore();
}

// layout regions
const COL = P ? { x: S.x, y: S.y + 260, w: S.w } : { x: 110, y: 470, w: 600 };      // stage text column (baseline of the word)
const WR = P ? { x: S.x, y: 760, w: S.w, h: 720 } : { x: 790, y: 120, w: 1034, h: 840 };   // product window, right
const WRL = P ? WR : { x: 96, y: 120, w: 1060, h: 840 };                                  // product window, left
const COLR = P ? COL : { x: 1250, y: 470, w: 580 };

// ================================================================= S1-2 hook (u 0..8)
const LANES = (() => {
  const rows = Math.floor(H / CELL);
  const out = [];
  for (let r = 1; r < rows; r++) {
    const n = 1 + Math.floor(hash01(r, 7) * 2.2);
    for (let j = 0; j < n; j++) {
      const h = hash01(r * 13 + j, 11);
      out.push({
        y: r * CELL + 0.5, off: hash01(r * 7 + j, 3), len: 160 + 620 * hash01(r * 5 + j, 5),
        sp: 0.65 + 0.8 * hash01(r * 3 + j, 9), w: 2 + 4 * hash01(r + j * 17, 2),
        col: h < 0.28 ? C.accent : h < 0.66 ? C.violet : C.fg, a: 0.5 + 0.5 * hash01(r * 11 + j, 4),
      });
    }
  }
  return out;
})();
function travel(u) {   // lane distance: full speed, then a hard brake at beat 4
  const V = P ? 2600 : 3400, tau = 0.2;
  if (u < 4) return V * u;
  return V * 4 + V * tau * (1 - Math.exp(-(u - 4) / tau));
}
function sceneHook(ctx, u) {
  const vR = ease(u, 4.3, 5.6, E.outCubic), hR = ease(u, 3.9, 4.6);
  backdrop(ctx, u, { grid: 1, vReveal: vR, hReveal: hR, aura: 0.3 + 0.7 * ease(u, 4, 6), focus: [W * 0.45, H * 0.5] });
  // speed lanes
  const fade = 1 - ease(u, 4.1, 5.4, E.outCubic);
  if (fade > 0) {
    const span = W + 1200, d = travel(u);
    ctx.save();
    ctx.lineCap = 'round';
    for (const l of LANES) {
      const xh = W + 300 - (((d * l.sp + l.off * span) % span) + span) % span;   // head moves right -> left
      const g = ctx.createLinearGradient(xh, 0, xh + l.len, 0);
      g.addColorStop(0, rgba(l.col, l.a * fade)); g.addColorStop(1, rgba(l.col, 0));
      ctx.strokeStyle = g; ctx.lineWidth = l.w;
      ctx.beginPath(); ctx.moveTo(xh, l.y); ctx.lineTo(xh + l.len, l.y); ctx.stroke();
    }
    ctx.restore();
  }
  // headline: a slow push while the lanes race, a hard shake on the brake
  const push = 1 + 0.05 * E.inQuad(prog(u, 0, 4)) * (1 - springU(u, 4, SPRING.snappy));
  ctx.translate(W / 2, H / 2); ctx.scale(push, push); ctx.translate(-W / 2, -H / 2);
  M.shake(ctx, u, 4, P ? 14 : 18, 5, 0.14);
  const t1 = 'Move fast with AI.', t2 = 'Govern it with confidence.';
  const exitK = E.inBack(prog(u, 7.45, 7.95), 1.6);
  const cx = P ? W / 2 : W * 0.5, cy = P ? H * 0.47 : H * 0.5;
  ctx.save();
  if (exitK > 0) {   // collapse towards the point where the wordmark's sparkle will land
    const sc = Math.max(0.001, 1 - exitK);
    ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
    ctx.globalAlpha = clamp(1 - exitK * 1.2);
  }
  if (!P) {
    const s1 = fitSize(ctx, t1, 600, DISPLAY, S.w * 0.94, 250, -0.03);
    const s2 = fitSize(ctx, t2, 600, DISPLAY, S.w * 0.94, 168, -0.03);
    const f1 = font(s1, 600, DISPLAY), f2 = font(s2, 600, DISPLAY);
    const L1 = layout(ctx, t1, f1, -0.03 * s1), L2 = layout(ctx, t2, f2, -0.03 * s2);
    const x0 = S.x + 20;
    // line 1: words slam in from the right on half beats; at the brake it shrinks and steps up
    const shrink = springU(u, 3.82, SPRING.snappy);
    const sc1 = lerp(1, s2 / s1, shrink);
    const y1 = lerp(H * 0.5 + s1 * 0.35, H * 0.5 - s2 * 0.18, shrink);
    const starts = [-0.12, 0.5, 1.0, 1.5];
    let w = 0;
    ctx.save(); ctx.translate(x0, y1); ctx.scale(sc1, sc1);
    L1.glyphs.forEach((g) => {
      if (g.ch === ' ') { w++; return; }
      const k = springU(u, starts[w], { stiffness: 420, damping: 26 });
      if (k <= 0) return;
      const col = lerp(0, 1, shrink) > 0.5 ? C.fg : C.fg;
      M.glyph(ctx, g.ch, g.cx + (1 - k) * 900, 0, f1, col, 1, 1, 0, (1 - k) * 0.45);
    });
    ctx.restore();
    // line 2: slams in at the brake and leans forward like it hit the brakes
    const y2 = H * 0.5 - s2 * 0.18 + s2 * 1.12;
    const k2 = springU(u, 3.86, { stiffness: 520, damping: 30 });
    if (k2 > 0) {
      const lean = (1 - k2) * 0.5 - 0.16 * wobble(u - 4.05, 1.5, 4.5);
      const ci = t2.indexOf('confidence');
      L2.glyphs.forEach((g, j) => {
        const lag = j * 0.012;
        const kj = springU(u, 3.86 + lag, { stiffness: 520, damping: 30 });
        M.glyph(ctx, g.ch, x0 + g.cx + (1 - kj) * W * 0.9, y2, f2, j >= ci ? C.accent : C.fg, 1, 1, 0, lean);
      });
      // the hero's violet double swash under "confidence."
      const xa = x0 + L2.glyphs[ci].x, xb = x0 + L2.width;
      swash(ctx, xa, xb, y2 + s2 * 0.2, s2, prog(u, 5.6, 6.6));
    }
  } else {
    const words1 = ['Move', 'fast', 'with', 'AI.'];
    const s1 = fitSize(ctx, 'Move', 600, DISPLAY, S.w * 0.9, 260, -0.03);
    const f1 = font(s1, 600, DISPLAY);
    const starts = [-0.12, 0.5, 1.0, 1.5];
    const out1 = E.inBack(prog(u, 3.7, 4.0), 1.4);
    words1.forEach((wd, i) => {
      const L = layout(ctx, wd, f1, -0.03 * s1);
      const y = S.y + 300 + s1 * (i + 1) * 0.98 - out1 * H;
      L.glyphs.forEach((g) => {
        const k = springU(u, starts[i], { stiffness: 420, damping: 26 });
        if (k <= 0) return;
        M.glyph(ctx, g.ch, S.x + g.cx + (1 - k) * 900, y, f1, C.fg, 1, 1, 0, (1 - k) * 0.45);
      });
    });
    const rows = ['Govern it', 'with', 'confidence.'];
    const s2 = fitSize(ctx, 'confidence.', 600, DISPLAY, S.w * 0.98, 230, -0.03);
    const f2 = font(s2, 600, DISPLAY);
    let ystart = S.y + 520;
    rows.forEach((r, i) => {
      const L = layout(ctx, r, f2, -0.03 * s2);
      const y = ystart + s2 * 1.02 * (i + 1);
      const lean = 0.5 - 0.16 * wobble(u - 4.05, 1.5, 4.5);
      L.glyphs.forEach((g, j) => {
        const kj = springU(u, 3.86 + i * 0.06 + j * 0.012, { stiffness: 520, damping: 30 });
        if (kj <= 0) return;
        M.glyph(ctx, g.ch, S.x + g.cx + (1 - kj) * W, y, f2, i === 2 ? C.accent : C.fg, 1, 1, 0, (1 - kj) * 0.5 - 0.16 * wobble(u - 4.05, 1.5, 4.5));
      });
      if (i === 2) swash(ctx, S.x, S.x + L.width, y + s2 * 0.2, s2, prog(u, 5.6, 6.6));
    });
  }
  ctx.restore();
}
function swash(ctx, xa, xb, y, size, p) {
  if (p <= 0) return;
  const w = xb - xa;
  const a = quadPts([xa - w * 0.02, y + size * 0.02], [xa + w * 0.5, y - size * 0.06], [xb - w * 0.18, y - size * 0.03]);
  const b = quadPts([xb - w * 0.18, y - size * 0.03], [xa + w * 0.4, y + size * 0.06], [xa + w * 0.24, y + size * 0.13]);
  const c = quadPts([xa + w * 0.24, y + size * 0.13], [xa + w * 0.6, y + size * 0.12], [xb - w * 0.02, y + size * 0.17]);
  ctx.save();
  ctx.strokeStyle = C.violet; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, size * 0.045);
  strokeProgress(ctx, [...a, ...b.slice(1), ...c.slice(1)], E.inOutCubic(p));
  ctx.restore();
}

// ================================================================= S3 brand drop (u 7.6..12)
const NETC = P ? [W / 2, H * 0.6] : [W * 0.64, H * 0.5];
function brandLayout() {
  const lw = P ? 780 : 820;
  const k = lw / LOGO.w;
  // place the logo so its second sparkle sits on the network centre: the dive lands there
  const sp = LOGO.sparkles[1];
  const lx = P ? (W - lw) / 2 : W * 0.5 - lw * 0.5, ly = P ? H * 0.42 - 20 * k : H * 0.44 - 20 * k;
  return { k, lx, ly, sx: lx + sp.cx * k, sy: ly + sp.cy * k };
}
function drawWordmarkLetters(ctx, B, u, mode) {
  LOGO.letters.forEach((l, i) => {
    let dy = 0, sc = 1, a = 1;
    if (mode === 'drop') {
      const k = springU(u, 7.72 + i * 0.045, { stiffness: 340, damping: 17 });
      if (k <= 0) return;
      dy = (1 - k) * -26; sc = 1; a = clamp(k * 3);
    }
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(B.lx, B.ly); ctx.scale(B.k, B.k);
    ctx.translate(l.cx, LOGO.base + dy); ctx.scale(sc, sc); ctx.translate(-l.cx, -LOGO.base);
    ctx.fillStyle = C.accent; ctx.fill(PATHS.letters[i]);
    ctx.restore();
  });
}
function sceneBrand(ctx, u) {
  const B = brandLayout();
  const dive = E.inCubic(prog(u, 10.9, 12));
  const zoom = Math.exp(Math.log(420) * E.inQuad(prog(u, 10.9, 12)));
  const am = E.inOutCubic(prog(u, 10.9, 11.6)), [ax, ay] = [lerp(B.sx, NETC[0], am), lerp(B.sy, NETC[1], am)];
  backdrop(ctx, u, { grid: 1, gx: -(ax - B.sx) * 0.3, gy: -(ay - B.sy) * 0.3, focus: [B.sx, B.sy] });
  ctx.save();
  // zoom about the sparkle
  ctx.translate(ax, ay); ctx.scale(zoom, zoom); ctx.translate(-B.sx, -B.sy);
  ctx.globalAlpha = 1 - ease(u, 11.1, 11.55);
  drawWordmarkLetters(ctx, B, u, 'drop');
  // first sparkle (white) pops in; the second becomes the door into the network
  const sk1 = springU(u, 8.45, SPRING.bouncy), sk2 = springU(u, 8.55, SPRING.bouncy);
  const s1 = LOGO.sparkles[0];
  sparkle(ctx, B.lx + s1.cx * B.k, B.ly + s1.cy * B.k, 3.6 * B.k * sk1, '#FFFFFF', (1 - sk1) * 1.6);
  // tagline
  const tf = font(P ? 50 : 44, 500, UI);
  const tag = 'The operating layer for governed AI.';
  const words = tag.split(' ');
  let tx = B.lx + 6;
  const ty = B.ly + 48 * B.k + 70;
  ctx.font = tf;
  if (P) {
    const lines = ['The operating layer', 'for governed AI.'];
    lines.forEach((ln, j) => riseText(ctx, ln, W / 2, ty + j * 66, tf, 50, j === 1 ? C.fg : C.muted, E.outQuint(prog(u, 9 + j * 0.3, 9.6 + j * 0.3)), 'center'));
  } else {
    words.forEach((wd, j) => {
      const k = E.outQuint(prog(u, 9 + j * 0.12, 9.55 + j * 0.12));
      riseText(ctx, wd, tx, ty, tf, 44, j >= 4 ? C.fg : C.muted, k);
      tx += ctx.measureText(wd + ' ').width;
    });
  }
  ctx.restore();
  // the door: second sparkle, white until it opens onto the network
  const sp = LOGO.sparkles[1];
  const r = 3.6 * B.k * sk2 * zoom;
  const open = ease(u, 11.15, 11.6, E.inOutSine);
  const sx = ax, sy = ay;
  const rot = (1 - sk2) * 1.6 + dive * 0.5;
  if (open > 0) {
    ctx.save();
    ctx.clip(sparklePath(ctx, sx, sy, r, rot));
    sceneDiscover(ctx, u, { inside: true });
    ctx.fillStyle = `rgba(255,255,255,${1 - open})`; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // a bright rim so the door reads as a portal
    ctx.save();
    ctx.strokeStyle = `rgba(255,255,255,${0.95 * (1 - ease(u, 11.75, 12))})`;
    ctx.lineWidth = 3 + 6 * open; ctx.lineJoin = 'round';
    ctx.shadowColor = C.violet; ctx.shadowBlur = 30;
    ctx.stroke(sparklePath(ctx, sx, sy, r, rot));
    ctx.restore();
  } else sparkle(ctx, sx, sy, r, '#FFFFFF', rot);
}

// ================================================================= S4-5 Discover (u 12..18)
const NODES = (() => {
  const labels = ['Models', 'Datasets', 'Agents', 'Teams', 'Tools', 'Vendors'];
  const R = P ? 300 : 330;
  const out = labels.map((lb, i) => ({
    label: lb, th: -Math.PI / 2 + (i / labels.length) * Math.PI * 2 + 0.25, r: R * (0.9 + 0.2 * hash01(i, 21)), t: 12.5 + i * 0.5, big: true,
  }));
  for (let i = 0; i < 22; i++) {
    out.push({ th: hash01(i, 31) * Math.PI * 2, r: (P ? 150 : 160) + (P ? 300 : 330) * hash01(i, 33) ** 0.7, t: 12 + 3.2 * hash01(i, 35), big: false, link: Math.floor(hash01(i, 37) * 6) });
  }
  return out;
})();
function nodePos(n, u) {
  const k = springU(u, n.t, SPRING.snappy);
  const orbit = 0.045 * (u - 12);
  const r = lerp(n.r * 3.2, n.r, k);
  const th = n.th + orbit + (1 - k) * 0.6;
  return { x: NETC[0] + Math.cos(th) * r, y: NETC[1] + Math.sin(th) * r * 0.9, k };
}
function sceneDiscover(ctx, u, { inside = false } = {}) {
  const toWin = ease(u, 15.4, 16.0);
  backdrop(ctx, u, { grid: 1, focus: NETC });
  ctx.save();
  const netA = 1 - ease(u, 15.5, 16.1);
  const sc = 1 + 0.25 * ease(u, 15.4, 16.2, E.inCubic);
  ctx.translate(NETC[0], NETC[1]); ctx.scale(sc, sc); ctx.translate(-NETC[0], -NETC[1]);
  ctx.globalAlpha = netA;
  // rings
  [150, 300, 450].forEach((r, i) => {
    const p = ease(u, 11.6 + i * 0.25, 12.8 + i * 0.25, E.outCubic);
    if (p <= 0) return;
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(NETC[0], NETC[1], r * (P ? 0.95 : 1), r * 0.9 * (P ? 0.95 : 1), 0, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke();
  });
  const pos = NODES.map((n) => nodePos(n, u));
  // links + data pulses flowing to the system of record
  NODES.forEach((n, i) => {
    const p = pos[i];
    if (p.k <= 0) return;
    const lp = ease(u, n.t + 0.15, n.t + 0.7, E.outCubic);
    const tgt = n.big ? { x: NETC[0], y: NETC[1] } : pos[n.link];
    if (!n.big && pos[n.link].k <= 0.05) return;
    ctx.strokeStyle = n.big ? 'rgba(169,139,255,0.45)' : 'rgba(255,255,255,0.12)';
    ctx.lineWidth = n.big ? 1.6 : 1;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(lerp(p.x, tgt.x, lp), lerp(p.y, tgt.y, lp)); ctx.stroke();
    if (n.big && lp >= 1) {
      for (let q = 0; q < 2; q++) {
        const f = ((u - n.t) * 0.9 + q * 0.5) % 1;
        ctx.fillStyle = rgba(C.accent, 0.9 * Math.sin(f * Math.PI));
        ctx.beginPath(); ctx.arc(lerp(p.x, tgt.x, f), lerp(p.y, tgt.y, f), 3.2, 0, Math.PI * 2); ctx.fill();
      }
    }
  });
  // nodes
  NODES.forEach((n, i) => {
    const p = pos[i];
    if (p.k <= 0) return;
    const a = clamp(p.k * 2);
    if (n.big) {
      const pulse = bump(u, n.t + 0.05, 0.35);
      ctx.fillStyle = C.canvas; ctx.strokeStyle = rgba(C.accent, a); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, 9 + pulse * 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (pulse > 0) { ctx.strokeStyle = rgba(C.accent, 0.5 * pulse); ctx.beginPath(); ctx.arc(p.x, p.y, 9 + (1 - pulse) * 30, 0, Math.PI * 2); ctx.stroke(); }
      const lk = E.outQuint(prog(u, n.t + 0.1, n.t + 0.5));
      const right = p.x >= NETC[0] - 10;
      ctx.globalAlpha = netA * lk;
      text(ctx, n.label, p.x + (right ? 20 : -20) + (1 - lk) * (right ? -14 : 14), p.y + 9, font(P ? 30 : 26, 600, UI), C.fg, right ? 'left' : 'right');
      ctx.globalAlpha = netA;
    } else {
      ctx.fillStyle = `rgba(255,255,255,${0.55 * a})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2); ctx.fill();
    }
  });
  ctx.restore();
  // centre: the system of record tile (logo n + sparkle), which opens into the wizard window
  const T = 92;
  const rect = {
    x: lerp(NETC[0] - T / 2, WR.x, toWin), y: lerp(NETC[1] - T / 2, WR.y, toWin),
    w: lerp(T, WR.w, toWin), h: lerp(T, WR.h, toWin),
  };
  const pulse = Math.max(...NODES.filter((n) => n.big).map((n) => bump(u, n.t + 0.55, 0.3)));
  ctx.save();
  if (toWin < 1) {
    rrect(ctx, rect.x - pulse * 4, rect.y - pulse * 4, rect.w + pulse * 8, rect.h + pulse * 8, lerp(22, 18, toWin));
    ctx.fillStyle = C.raised; ctx.fill();
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.stroke();
    const k = (T * 0.5) / 23 * (1 - toWin * 0.8);
    ctx.globalAlpha = 1 - toWin;
    ctx.save(); ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2); ctx.scale(k, k); ctx.translate(-10.5, -25.6);
    ctx.fillStyle = C.accent; ctx.fill(PATHS.letters[0]); ctx.restore();
    sparkle(ctx, rect.x + rect.w / 2 + 16, rect.y + rect.h / 2 - 22, 7, '#FFFFFF');
  }
  ctx.restore();
  if (!inside) {
    if (toWin > 0) sceneWizard(ctx, u, rect, toWin);
    stageTitle(ctx, u, 0, 12.2, 18, COL.x, COL.y, COL.w);
  }
}
// the wizard: register a system (assets/app/new_usecase.png)
let PATCH = {};   // colours sampled from the real screenshots in init(), for in-UI updates
function sceneWizard(ctx, u, rect, k = 1) {
  const img = IMGS.wizard;
  const cam = wizardCam(u);
  windowFrame(ctx, rect, img, cam, { alpha: clamp(k * 3), overlay: wizardOverlay(u) });
  if (k >= 1) {
    const ck = [[15.9, [1500, 980]], [16.2, [640, 322]], [17.6, [720, 360]]];
    const [ix, iy] = cursorPath(u, ck);
    const [x, y] = toScreen(rect, cam, ix, iy);
    clickRing(ctx, x, y, u, 16.25);
    cursor(ctx, x, y, bump(u, 16.3, 0.12), ease(u, 15.9, 16.05) * (1 - ease(u, 17.15, 17.45)));
  }
}
function wizardCam(u) {
  const c0 = P ? { fx: 640, fy: 360, s: 1.25 } : { fx: 660, fy: 380, s: 1.2 };
  const c1 = P ? { fx: 1530, fy: 330, s: 1.25 } : { fx: 1490, fy: 330, s: 1.2 };
  const push = { fx: 1540, fy: 250, s: P ? 2.0 : 2.4 };
  const tile = { fx: 1525, fy: 240, s: TILE.w / 400 };
  return camAt(u, [[15.4, c0], [17.2, c1], [18, push], [18.7, tile]]);
}
function wizardOverlay(u) {
  const typed = TYPED.slice(0, Math.floor(TYPED.length * prog(u, 16.4, 17.45)));
  const caret = u >= 16.25 && u < 18 && (u < 17.45 || (u * 2) % 1 < 0.5);
  return (c) => {
      // the name field: the placeholder clears on focus, then the name types in
      if (u >= 16.25 && u < 18.4) {
        c.fillStyle = PATCH.field || '#FFFFFF'; c.fillRect(296, 304, 700, 33);
        c.font = font(19, 500, UI); c.fillStyle = '#111827'; c.textAlign = 'left';
        c.fillText(typed, 304, 327);
        if (caret) { const w = c.measureText(typed).width; c.fillStyle = '#111827'; c.fillRect(305 + w, 309, 2, 24); }
        // focus ring on the field
        c.strokeStyle = '#2E6B3A'; c.lineWidth = 2; rrect(c, 285, 297, 1014, 46, 8); c.stroke();
      }
      // the system profile updates as you type (the product's own live preview)
      if (typed.length) {
        c.fillStyle = PATCH.panel || '#FFFFFF'; c.fillRect(1352, 214, 330, 36);
        c.font = font(22, 700, UI); c.fillStyle = '#111827'; c.fillText(typed, 1357, 240);
      }
  };
}

// ================================================================= S6 Classify (u 18..24)
// framework cards cropped from the site's "Every framework satisfied." section (2850 x 1394)
const CARDS = [
  { name: 'EU AI Act', r: [30, 320, 636, 380] }, { name: 'ISO/IEC 42001', r: [702, 320, 636, 380] },
  { name: 'NIST AI RMF', r: [1374, 320, 636, 380] }, { name: 'GDPR', r: [2046, 320, 636, 380] },
  { name: 'UAE PDPL', r: [646, 752, 636, 380] }, { name: 'ADGM DPR 2021', r: [1318, 752, 636, 380] },
  { name: 'Saudi PDPL', r: [1990, 752, 636, 380] },
];
function cardSlots() {
  if (P) {
    const w = 450, h = 210, g = 18, x0 = S.x + (S.w - 2 * w - g) / 2;
    return CARDS.slice(0, 6).map((_, i) => ({ x: x0 + (i % 2) * (w + g), y: 960 + Math.floor(i / 2) * (h + g), w, h }));
  }
  const w = 250, h = 150, g = 20;
  const top = [0, 1, 2, 3].map((i) => ({ x: 790 + i * (w + g), y: 170, w, h }));
  const bot = [0, 1, 2].map((i) => ({ x: 790 + (w + g) / 2 + i * (w + g), y: 760, w, h }));
  return [...top, ...bot];
}
const TILE = P ? { x: S.x + 118, y: 745, w: 700, h: 160 } : { x: 1050, y: 465, w: 520, h: 150 };
function sceneClassify(ctx, u) {
  backdrop(ctx, u, { grid: 1, focus: NETC });
  const img = IMGS.wizard;
  // the wizard pushes into its own System Profile, then shrinks into the system tile
  const shrink = ease(u, 18.7, 19.25);
  const R = {
    x: lerp(WR.x, TILE.x, shrink), y: lerp(WR.y, TILE.y, shrink),
    w: lerp(WR.w, TILE.w, shrink), h: lerp(WR.h, TILE.h, shrink),
  };
  const cam = wizardCam(u);
  const slots = cardSlots();
  const flip = (i) => ease(u, 23.45 + i * 0.04, 23.8 + i * 0.04, E.inCubic);
  // after the deal the camera pushes in on the top row so the frameworks read (title has left)
  const zk = P ? 0 : springKeys(u, [[22.2, 0], [22.4, 1]], SPRING.gentle) * (1 - ease(u, 23.3, 23.65));
  const ZB = [1310, 245], ZA = [lerp(ZB[0], 960, zk), lerp(ZB[1], 430, zk)], zs = lerp(1, 1.68, zk);
  ctx.save();
  ctx.translate(ZA[0], ZA[1]); ctx.scale(zs, zs); ctx.translate(-ZB[0], -ZB[1]);
  // mapping lines from the system to each framework
  slots.forEach((sl, i) => {
    const t0 = 19 + i * 0.5;
    const lp = ease(u, t0 + 0.1, t0 + 0.55, E.outCubic) * (1 - flip(i));
    if (lp <= 0) return;
    const ax = TILE.x + TILE.w / 2, ay = TILE.y + TILE.h / 2;
    const bx = sl.x + sl.w / 2, by = sl.y + (sl.y < TILE.y ? sl.h : 0);
    ctx.save();
    ctx.strokeStyle = rgba(C.violet, 0.6); ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -u * 30;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lerp(ax, bx, lp), lerp(ay, by, lp)); ctx.stroke();
    ctx.restore();
  });
  const tileOut = ease(u, 23.5, 23.95, E.inBack);
  ctx.save();
  if (tileOut > 0) { const cx = R.x + R.w / 2, cy = R.y + R.h / 2, s = 1 - tileOut; ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); }
  windowFrame(ctx, R, img, cam, { overlay: wizardOverlay(u) });
  ctx.restore();
  // cards deal in on eighths
  slots.forEach((sl, i) => {
    const t0 = 19 + i * 0.5;
    const k = springU(u, t0 - 0.18, { stiffness: 300, damping: 20 });
    if (k <= 0) return;
    const fk = flip(i);
    if (fk >= 1) return;
    const cx = sl.x + sl.w / 2, cy = sl.y + sl.h / 2;
    ctx.save();
    ctx.translate(lerp(W * 0.85, cx, k), lerp(H + 300, cy, k));
    ctx.rotate((1 - k) * 0.5);
    ctx.scale(1 - fk, 1);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
    rrect(ctx, -sl.w / 2, -sl.h / 2, sl.w, sl.h, 16); ctx.fillStyle = C.surface; ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.save(); rrect(ctx, -sl.w / 2, -sl.h / 2, sl.w, sl.h, 16); ctx.clip();
    const [sx, sy, sw, sh] = CARDS[i].r;
    const ar = sl.w / sl.h, sh2 = Math.min(sh, sw / ar);
    ctx.drawImage(IMGS.frameworks, sx, sy, sw, sh2, -sl.w / 2, -sl.h / 2, sl.w, sl.h);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1.2; rrect(ctx, -sl.w / 2, -sl.h / 2, sl.w, sl.h, 16); ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
  stageTitle(ctx, u, 1, 18.1, P ? 24 : 22.3, COL.x, COL.y, COL.w);
}

// ================================================================= S7 Assess (u 24..30)
const WRA = P ? { x: S.x, y: S.y + 20, w: S.w, h: 800 } : { x: 96, y: 70, w: 1728, h: 940 };
function sceneAssess(ctx, u) {
  backdrop(ctx, u, { grid: 1, focus: [W * 0.5, H * 0.5] });
  const img = IMGS.risk;
  const enter = springU(u, 23.9, { stiffness: 260, damping: 24 });
  const exit = ease(u, 29.4, 29.9, E.inCubic);
  const cam = camAt(u, P
    ? [[23.9, { fx: 450, fy: 150, s: 2.4 }], [26.9, { fx: 450, fy: 150, s: 2.4 }], [27.1, { fx: 820, fy: 400, s: WRA.w / 1000 }], [28.4, { fx: 820, fy: 650, s: WRA.w / 940 }], [29.55, { fx: 420, fy: 650, s: WRA.w / 940 }]]
    : [[23.9, { fx: 450, fy: 150, s: 3.0 }], [26.9, { fx: 450, fy: 150, s: 3.0 }], [27.1, { fx: 1000, fy: 420, s: WRA.w / 2000 }], [28.4, { fx: 820, fy: 600, s: 1.45 }], [29.55, { fx: 380, fy: 600, s: 1.45 }]],
  { stiffness: 140, damping: 22 });
  const R = { ...WRA, x: WRA.x + exit * W * 1.1 };
  ctx.save();
  const sc = lerp(1.12, 1, enter);
  ctx.translate(W / 2, H / 2); ctx.scale(sc, sc); ctx.translate(-W / 2, -H / 2);
  windowFrame(ctx, R, img, cam, {
    alpha: clamp(enter * 2.5),
    overlay: (c) => {
      // the scan: a violet beam sweeps the score while the risk engine "reads" it
      const p = ease(u, 25.0, 26.6, E.inOutSine);
      if (p > 0 && p < 1) {
        const y = lerp(40, 460, p);
        const g = c.createLinearGradient(0, y - 120, 0, y);
        g.addColorStop(0, 'rgba(169,139,255,0)'); g.addColorStop(1, 'rgba(169,139,255,0.22)');
        c.fillStyle = g; c.fillRect(0, y - 120, 2000, 120);
        c.fillStyle = C.violet; c.fillRect(0, y - 1.5, 2000, 3);
      }
    },
  });
  ctx.restore();
  // stage text rides a card-violet panel that slides over the window
  const pk = springU(u, 24.4, SPRING.snappy);
  const PR = P ? { x: S.x, y: WRA.y + WRA.h + 40, w: S.w, h: 420 } : { x: 150, y: 560, w: 660, h: 420 };
  const px = PR.x - (1 - pk) * (PR.w + 200) + exit * W * 1.1;
  if (pk > 0) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
    const g = ctx.createLinearGradient(px, PR.y, px + PR.w, PR.y + PR.h);
    g.addColorStop(0, TONE.violet[0]); g.addColorStop(1, TONE.violet[1]);
    rrect(ctx, px, PR.y, PR.w, PR.h, 22); ctx.fillStyle = g; ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.beginPath(); rrect(ctx, px, PR.y, PR.w, PR.h, 22); ctx.clip();
    stageTitle(ctx, u, 2, 24.5, 30.6, px + 48, PR.y + (P ? 185 : 192), PR.w - 96);
    ctx.restore();
  }
}

// ================================================================= S8 Govern (u 30..36)
function sceneGovern(ctx, u) {
  backdrop(ctx, u, { grid: 1, focus: [W * 0.35, H * 0.5] });
  const img = IMGS.controls;
  const enter = springU(u, 29.75, { stiffness: 170, damping: 22 });
  const out = ease(u, 35.0, 35.8, E.inCubic);
  const R = WRL;
  const cam = camAt(u, P
    ? [[29.75, { fx: 640, fy: 400, s: 1.3 }], [32.4, { fx: 1250, fy: 700, s: 0.7 }]]
    : [[29.75, { fx: 660, fy: 420, s: 1.25 }], [32.4, { fx: 1250, fy: 640, s: 0.72 }]]);
  const ticks = [31, 31.5, 32], rows = [300, 400, 499];
  const n = ticks.filter((t) => u >= t).length;
  ctx.save();
  const cx = R.x + R.w / 2, cy = R.y + R.h / 2;
  ctx.translate(cx + (1 - enter) * -W * 0.8 - out * 260, cy + out * 40);
  ctx.rotate(out * -0.09); ctx.scale(1 - out * 0.12, 1 - out * 0.12);
  ctx.translate(-cx, -cy);
  windowFrame(ctx, R, img, cam, {
    alpha: 1 - out,
    overlay: (c) => {
      ticks.forEach((t, i) => {
        const k = springU(u, t, SPRING.bouncy);
        if (k <= 0) return;
        const x = 470, y = rows[i];
        c.save(); c.translate(x, y); c.scale(k, k);
        rrect(c, -12, -12, 24, 24, 5); c.fillStyle = '#2E6B3A'; c.fill();
        c.strokeStyle = '#FFFFFF'; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath(); c.moveTo(-6, 0); c.lineTo(-1.5, 5); c.lineTo(7, -5); c.stroke();
        c.restore();
        // the row highlights as it's selected
        c.fillStyle = 'rgba(46,107,58,0.06)'; c.fillRect(436, y - 48, 1432, 98);
      });
      // the Recommended counter follows the ticks
      if (n > 0 && PATCH.counterBg) {
        c.fillStyle = PATCH.counterBg; c.fillRect(1730, 214, 120, 24);
        c.font = font(14.5, 700, UI); c.fillStyle = '#374151'; c.textAlign = 'right';
        c.fillText(`${n} of 15 selected`, 1845, 231);
        c.textAlign = 'left';
      }
      const pr = bump(u, 33.6, 0.18);
      if (pr > 0) { rrect(c, 1724, 872, 170, 43, 7); c.fillStyle = `rgba(0,0,0,${0.28 * pr})`; c.fill(); }
    },
  });
  if (out < 0.3) {
    const ck = [[30.3, [1500, 820]], [30.9, [478, 306]], [31.4, [478, 406]], [31.9, [478, 505]], [32.5, [700, 620]], [33.4, [1790, 896]], [34.6, [1700, 760]]];
    const [ix, iy] = cursorPath(u, ck);
    const [x, y] = toScreen(R, cam, ix, iy);
    ticks.forEach((t) => clickRing(ctx, x, y, u, t));
    clickRing(ctx, x, y, u, 33.5);
    const press = Math.max(...ticks.map((t) => bump(u, t + 0.04, 0.1)), bump(u, 33.55, 0.12));
    cursor(ctx, x, y, press, ease(u, 30.2, 30.5) * (1 - ease(u, 34.6, 35)));
  }
  ctx.restore();
  stageTitle(ctx, u, 3, 30.2, 35.8, COLR.x, COLR.y, COLR.w);
}

// ================================================================= S9 Evidence (u 36..42)
function sceneEvidence(ctx, u) {
  backdrop(ctx, u, { grid: 1, focus: [W * 0.6, H * 0.5] });
  const img = IMGS.policy;
  const enter = springU(u, 35.55, { stiffness: 170, damping: 22 });
  const dim = ease(u, 37.4, 38.0);
  const out = ease(u, 41.55, 42.0, E.inCubic);
  const R = WR;
  const cam = camAt(u, P
    ? [[35.55, { fx: 800, fy: 600, s: 1.0 }], [36.4, { fx: 1600, fy: 560, s: 1.4 }]]
    : [[35.55, { fx: 900, fy: 600, s: 0.95 }], [36.4, { fx: 1560, fy: 560, s: 1.3 }]]);
  ctx.save();
  const cx = R.x + R.w / 2, cy = R.y + R.h / 2;
  const sc = 1 - dim * 0.08;
  ctx.translate(cx + (1 - enter) * W * 0.8, cy - out * H);
  ctx.scale(sc, sc); ctx.translate(-cx, -cy);
  windowFrame(ctx, R, img, cam, {
    alpha: 1 - dim * 0.72 - (P ? 0.16 * springU(u, 39.7, SPRING.gentle) : 0),
    overlay: (c) => {
      const pr = bump(u, 37.05, 0.16);
      if (pr > 0) { rrect(c, 1642, 520, 116, 39, 7); c.fillStyle = `rgba(0,0,0,${0.12 * pr})`; c.fill(); }
    },
  });
  // cursor clicks Upload on the first control
  const up = toScreen(R, cam, 1700, 539);
  const ck = [[36.1, [1900, 900]], [36.9, [1690, 545]], [38, [1640, 600]]];
  const [ix, iy] = cursorPath(u, ck);
  const [x, y] = toScreen(R, cam, ix, iy);
  clickRing(ctx, x, y, u, 37);
  cursor(ctx, x, y, bump(u, 37.05, 0.12), ease(u, 36.05, 36.3) * (1 - ease(u, 37.4, 37.7)));
  ctx.restore();
  // the evidence lifts out of the button and files once into every framework
  const CH = P ? [W / 2, WR.y + 80] : [R.x + R.w * 0.36, R.y + R.h * 0.5];
  const lift = springU(u, 37.3, { stiffness: 220, damping: 20 });
  if (lift > 0 && out < 1) {
    const ex = lerp(up[0], CH[0], lift), ey = lerp(up[1], CH[1], lift) - Math.sin(Math.PI * clamp(lift)) * 80;
    ctx.save();
    ctx.globalAlpha = 1 - out;
    // fan to the frameworks
    FRAMEWORK_CHIPS.forEach((name, i) => {
      const k = springU(u, 37.85 + i * 0.25, SPRING.bouncy);
      if (k <= 0) return;
      const a = (P ? Math.PI / 2 : 0) + (i - 2) * (P ? 0.42 : 0.36);
      const rx = P ? 300 : 430, ry = P ? 380 : 320;
      const tx = P ? W / 2 + (i % 2 ? 190 : -190) : CH[0] + Math.cos(a) * rx;
      const ty = P ? CH[1] + 150 + i * 74 : CH[1] + Math.sin(a) * ry;
      const fx = lerp(ex, tx, k), fy = lerp(ey, ty, k);
      ctx.strokeStyle = rgba(C.violet, 0.55); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(fx, fy); ctx.stroke();
      const f = font(P ? 32 : 28, 600, UI);
      ctx.font = f; const tw = ctx.measureText(name).width;
      const pw = tw + 48, ph = P ? 64 : 56;
      ctx.save(); ctx.translate(fx, fy); ctx.scale(k, k);
      rrect(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2); ctx.fillStyle = C.raised; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.2; ctx.stroke();
      text(ctx, name, 0, (P ? 11 : 10), f, C.fg, 'center');
      ctx.restore();
    });
    // the evidence chip
    const cw = P ? 330 : 300, chh = P ? 96 : 86;
    ctx.save(); ctx.translate(ex, ey); ctx.rotate((1 - lift) * -0.3);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    const g = ctx.createLinearGradient(-cw / 2, -chh / 2, cw / 2, chh / 2);
    g.addColorStop(0, TONE.violet[0]); g.addColorStop(1, TONE.violet[1]);
    rrect(ctx, -cw / 2, -chh / 2, cw, chh, 18); ctx.fillStyle = g; ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke();
    // document glyph
    const dx = -cw / 2 + 26, dy = -26;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + 26, dy); ctx.lineTo(dx + 38, dy + 12); ctx.lineTo(dx + 38, dy + 52); ctx.lineTo(dx, dy + 52); ctx.closePath(); ctx.fill();
    ctx.fillStyle = TONE.violet[0];
    for (let q = 0; q < 3; q++) ctx.fillRect(dx + 7, dy + 22 + q * 9, 24 - (q === 2 ? 8 : 0), 3);
    text(ctx, 'Evidence', dx + 58, 11, font(P ? 34 : 30, 600, UI), C.fg);
    ctx.restore();
    ctx.restore();
  }
  // 5x: regulations satisfied per single evidence filing (the site's stat)
  const fk = springU(u, 39.85, { stiffness: 300, damping: 15 });
  if (fk > 0 && out < 1) {
    ctx.save(); ctx.globalAlpha = 1 - out;
    const bx = P ? S.x : COL.x, by = P ? 1470 : 870;
    const f = font(P ? 200 : 190, 600, DISPLAY);
    ctx.save(); ctx.translate(bx, by); ctx.scale(fk, fk);
    text(ctx, '5×', 0, 0, f, C.violet, 'left', -6);
    ctx.restore();
    ctx.font = f; const w = ctx.measureText('5×').width;
    const lf = font(P ? 40 : 34, 500, UI);
    const lk = E.outQuint(prog(u, 40.2, 40.8));
    riseText(ctx, 'Regulations satisfied per', bx + w + 30, by - (P ? 90 : 80), lf, P ? 40 : 34, C.muted, lk);
    riseText(ctx, 'single evidence filing', bx + w + 30, by - (P ? 40 : 34), lf, P ? 40 : 34, C.muted, lk);
    ctx.restore();
  }
  stageTitle(ctx, u, 4, 36.15, 42, COL.x, P ? COL.y : 400, COL.w);
}

// ================================================================= S10 Monitor (u 42..47)
const WRM = P ? { x: S.x, y: S.y + 20, w: S.w, h: 820 } : { x: 96, y: 66, w: 1728, h: 700 };
const CHART = [[353, 1013], [475, 1013], [597, 1013], [720, 908], [842, 1003], [965, 1013], [1087, 1013]];
const CHART_PTS = catmull(CHART, 24);
function sceneMonitor(ctx, u) {
  backdrop(ctx, u, { grid: 1, focus: [W * 0.5, H * 0.4] });
  const img = IMGS.dash;
  const enter = springU(u, 41.7, { stiffness: 200, damping: 22 });
  const out = ease(u, 46.6, 47.15, E.inCubic);
  const cam = camAt(u, P
    ? [[41.7, { fx: 700, fy: 175, s: 1.0 }], [42.9, { fx: 720, fy: 910, s: 1.3 }], [45.4, { fx: 1560, fy: 440, s: 1.1 }]]
    : [[41.7, { fx: 1140, fy: 170, s: WRM.w / 1720 }], [42.9, { fx: 720, fy: 905, s: 1.5 }], [45.4, { fx: 1560, fy: 430, s: 1.2 }]]);
  const R = { ...WRM, x: WRM.x - out * W * 1.1, y: WRM.y - (1 - enter) * H };
  windowFrame(ctx, R, img, cam, {
    overlay: (c) => {
      const p = E.inOutSine(prog(u, 43, 45));
      if (p <= 0) return;
      const n = Math.max(2, Math.floor(CHART_PTS.length * p));
      const pts = CHART_PTS.slice(0, n);
      c.save();
      c.strokeStyle = C.accent; c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      const [hx, hy] = pts[pts.length - 1];
      if (p < 1) {
        c.fillStyle = C.accent; c.beginPath(); c.arc(hx, hy, 9, 0, Math.PI * 2); c.fill();
        c.strokeStyle = rgba(C.accent, 0.4); c.lineWidth = 3; c.beginPath(); c.arc(hx, hy, 18, 0, Math.PI * 2); c.stroke();
      }
      // crest ping on the busiest day
      const pk = prog(u, 44, 44.9);
      if (pk > 0 && pk < 1) {
        c.strokeStyle = rgba(C.accent, 1 - pk); c.lineWidth = 4;
        c.beginPath(); c.arc(720, 908, 12 + E.outCubic(pk) * 60, 0, Math.PI * 2); c.stroke();
      }
      c.restore();
    },
  });
  // title along the bottom on landscape (a different composition from the other stages)
  if (P) stageTitle(ctx, u, 5, 42.2, 47, COL.x, WRM.y + WRM.h + 240, COL.w);
  else stageTitle(ctx, u, 5, 42.2, 47, 110, 950, 1680);
}

// ================================================================= S11 Improve + the loop (u 47..52)
function sceneImprove(ctx, u) {
  backdrop(ctx, u, { grid: 1, focus: [W / 2, H / 2] });
  const img = IMGS.risk;
  const enter = springU(u, 46.75, { stiffness: 200, damping: 24 });
  const away = ease(u, 49.35, 49.95, E.inCubic);
  const cam = P ? { fx: 1650, fy: 450, s: WR.w / 620 } : { fx: 1500, fy: 455, s: 1.75 };
  const R = P ? WR : { x: 96, y: 330, w: 1728, h: 680 };
  ctx.save();
  const cx = R.x + R.w / 2, cy = R.y + R.h / 2;
  ctx.translate(cx + (P ? (1 - enter) * W : 0), cy + (P ? 0 : (1 - enter) * H));
  const sc = 1 - away * 0.6; ctx.scale(sc, sc);
  ctx.translate(-cx, -cy);
  windowFrame(ctx, R, img, cam, {
    alpha: 1 - away,
    overlay: (c) => {
      [[48, 322], [48.5, 426], [49, 530]].forEach(([t, y]) => {
        const p = ease(u, t - 0.05, t + 0.3, E.outCubic);
        if (p <= 0) return;
        const pts = [];
        for (let i = 0; i <= 40; i++) {   // a hand-drawn marker loop round the action
          const a = -Math.PI * 0.9 + (i / 40) * Math.PI * 2.1;
          pts.push([1655 + Math.cos(a) * 292 + Math.sin(i * 0.7) * 3, y + 47 + Math.sin(a) * 58]);
        }
        c.strokeStyle = C.violet; c.lineWidth = 4.5; c.lineCap = 'round';
        c.globalAlpha = u > t + 0.45 ? 0.55 : 1;
        strokeProgress(c, pts, p);
        c.globalAlpha = 1;
      });
    },
  });
  ctx.restore();
  if (P) stageTitle(ctx, u, 6, 47.1, 49.8, COL.x, COL.y, COL.w);
  else stageTitle(ctx, u, 6, 47.1, 49.8, 110, 250, 1000, { leadX: 800 });
  // the seven stages snap onto a ring that closes: Improve feeds Discover
  if (u >= 49.6) {
    const RC = [W / 2, P ? H * 0.47 : H / 2];
    const rx = P ? 360 : 560, ry = P ? 470 : 340;
    const col = E.inBack(prog(u, 51.7, 52), 1.4);
    const rot = 0.03 * (u - 50);
    ctx.save();
    ctx.translate(RC[0], RC[1]); const cs = 1 - col; ctx.scale(cs, cs); ctx.translate(-RC[0], -RC[1]);
    const rp = ease(u, 50, 51.7);
    if (rp > 0) {
      const pts = [];
      for (let i = 0; i <= 120; i++) { const a = -Math.PI / 2 + rot + (i / 120) * Math.PI * 2; pts.push([RC[0] + Math.cos(a) * rx, RC[1] + Math.sin(a) * ry]); }
      ctx.strokeStyle = C.violet; ctx.lineWidth = 3; ctx.lineCap = 'round';
      strokeProgress(ctx, pts, rp);
    }
    const f = font(P ? 50 : 52, 600, DISPLAY);
    STAGES.forEach((st, i) => {
      const k = springU(u, 49.7 + i * 0.22, SPRING.snappy);
      if (k <= 0) return;
      const a = -Math.PI / 2 + rot + (i / 7) * Math.PI * 2;
      const rr = lerp(1.5, 1, k), x = RC[0] + Math.cos(a) * rx * rr, y = RC[1] + Math.sin(a) * ry * rr;
      ctx.font = f; const tw = ctx.measureText(st.word).width;
      ctx.fillStyle = C.canvas; ctx.fillRect(x - tw / 2 - 18, y - 46, tw + 36, 66);
      const closed = i === 0 ? bump(u, 51.8, 0.5) : 0;
      text(ctx, st.word, x, y + 14, f, closed > 0.05 ? C.accent : C.fg, 'center');
    });
    const lf = font(P ? 44 : 40, 500, UI);
    const lk = E.outQuint(prog(u, 50.4, 51));
    riseText(ctx, 'A closed loop,', RC[0], RC[1] - 8, lf, 40, C.muted, lk, 'center');
    riseText(ctx, 'not a one-time checkpoint.', RC[0], RC[1] + 48, lf, 40, C.muted, lk, 'center');
    ctx.restore();
  }
}

// ================================================================= S12 agents headline (u 52..56)
function sceneAgentsHead(ctx, u) {
  backdrop(ctx, u, { grid: 0.8, aura: 0.6, focus: [W * 0.4, H * 0.5] });
  const out = ease(u, 55.55, 56.0, E.inCubic);
  const lines = P ? [['AI', 'agents'], ['don’t', 'just'], ['predict.'], ['They', 'take'], ['action.']]
    : [['AI', 'agents', 'don’t', 'just'], ['predict.', 'They', 'take', 'action.']];
  const times = [52.2, 52.45, 52.7, 52.95, 53.4, 54.0, 54.25, 54.5];
  const size = P ? fitSize(ctx, 'don’t just', 600, DISPLAY, S.w * 0.92, 168, -0.03) : fitSize(ctx, 'predict. They take action.', 600, DISPLAY, S.w * 0.9, 170, -0.03) * 0.97;
  const f = font(size, 600, DISPLAY);
  const x0 = S.x + 20;
  const y0 = P ? S.y + 330 : H * 0.5 - size * 0.25;
  ctx.save();
  ctx.translate(0, -out * H * 0.7);
  let wi = 0, circ = null;
  lines.forEach((ln, li) => {
    let x = x0;
    const y = y0 + li * size * 1.06;
    ln.forEach((wd) => {
      const k = springU(u, times[wi], SPRING.snappy);
      ctx.font = f; const w = ctx.measureText(wd).width;
      if (k > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(x - 20, y - size * 1.05, w + 60, size * 1.4); ctx.clip();
        text(ctx, wd, x, y + (1 - k) * size * 1.2, f, wd === 'action.' ? C.accent : C.fg, 'left', -0.03 * size);
        ctx.restore();
      }
      if (wd === 'agents') circ = { x0: x0 - 30, x1: x + w + 30, y: y - size * 0.36, h: size * 0.62 };
      x += w + size * 0.24;
      wi++;
    });
  });
  // the site's violet hand-drawn circle round "AI agents"
  if (circ) {
    const p = ease(u, 53.5, 54.3, E.inOutCubic);
    const cxm = (circ.x0 + circ.x1) / 2, rx = (circ.x1 - circ.x0) / 2, ry = circ.h;
    const pts = [];
    for (let i = 0; i <= 80; i++) { const a = Math.PI * 0.95 + (i / 80) * Math.PI * 2.15; pts.push([cxm + Math.cos(a) * rx * (1 + 0.03 * Math.sin(a * 3)), circ.y + Math.sin(a) * ry * (i > 60 ? 1.08 : 1)]); }
    ctx.strokeStyle = C.violet; ctx.lineWidth = Math.max(4, size * 0.03); ctx.lineCap = 'round';
    strokeProgress(ctx, pts, p);
  }
  ctx.restore();
}

// ================================================================= S13 agent guardrails stack (u 56..68)
const CARD = P ? { w: S.w, h: 1080, cx: W / 2, cy: S.y + 40 + 540 } : { w: 1280, h: 640, cx: W / 2, cy: H * 0.55 };
function sceneAgentStack(ctx, u) {
  backdrop(ctx, u, { grid: 1, aura: 0.8, focus: [W / 2, H * 0.55] });
  const out = ease(u, 67.6, 68.0, E.inCubic);
  const starts = AGENTS.map((_, i) => 56 + i * 2);
  for (let i = 0; i < AGENTS.length; i++) {
    const t0 = starts[i];
    const k = springU(u, t0 - 0.16, { stiffness: 280, damping: 22 });
    if (k <= 0) continue;
    let d = 0;
    for (let j = i + 1; j < AGENTS.length; j++) d += springU(u, starts[j] - 0.16, SPRING.snappy);
    if (d > 3.2) continue;
    const sc = 1 - 0.06 * d, dy = -d * (P ? 52 : 46);
    ctx.save();
    ctx.translate(CARD.cx, CARD.cy + dy + (1 - k) * H * 0.95 - out * (i + 1) * 120);
    ctx.rotate((1 - k) * 0.08 + out * (i % 2 ? 0.1 : -0.1));
    ctx.scale(sc, sc);
    ctx.globalAlpha = 1 - out;
    agentCard(ctx, AGENTS[i], i, u - t0, d);
    ctx.restore();
  }
}
function agentCard(ctx, a, i, tau, depth) {
  const { w, h } = CARD;
  const x = -w / 2, y = -h / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 26;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, TONE[a.tone][0]); g.addColorStop(1, TONE[a.tone][1]);
  rrect(ctx, x, y, w, h, 24); ctx.fillStyle = g; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.save(); rrect(ctx, x, y, w, h, 24); ctx.clip();
  // copy
  const pad = P ? 60 : 64;
  const ts = Math.min(P ? 86 : 74, fitSize(ctx, a.title, 600, DISPLAY, P ? w - 2 * pad : 560, 86));
  const tf = font(ts, 600, DISPLAY), bf = font(P ? 44 : 36, 500, UI);
  const tk = E.outQuint(clamp((tau + 0.2) / 0.6));
  riseText(ctx, a.title, x + pad, y + pad + (P ? 86 : 74), tf, ts, C.fg, tk);
  wrap(ctx, a.body, bf, P ? w - 2 * pad : 520).forEach((ln, j) => {
    const k = E.outQuint(clamp((tau + 0.05 - j * 0.08) / 0.6));
    riseText(ctx, ln, x + pad, y + pad + (P ? 86 : 74) + 66 + j * (P ? 58 : 49), bf, P ? 44 : 36, 'rgba(242,240,251,0.85)', k);
  });
  // demo panel
  const D = P ? { x: x + pad, y: y + 470, w: w - 2 * pad, h: h - 470 - pad } : { x: x + 660, y: y + 48, w: w - 660 - 48, h: h - 96 };
  rrect(ctx, D.x, D.y, D.w, D.h, 18); ctx.fillStyle = 'rgba(6,1,31,0.38)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.stroke();
  ctx.save(); rrect(ctx, D.x, D.y, D.w, D.h, 18); ctx.clip();
  DEMOS[i](ctx, D, tau);
  ctx.restore();
  ctx.restore();
  if (depth > 0) { rrect(ctx, x, y, w, h, 24); ctx.fillStyle = `rgba(6,1,31,${Math.min(0.75, 0.3 * depth)})`; ctx.fill(); }
  ctx.restore();
}
// six micro-demos, pure shapes, each a function of the card's local time (beats)
const DEMOS = [
  // identity: an agent badge, its ID ring locks, owner verified
  (ctx, D, t) => {
    const cx = D.x + D.w / 2, cy = D.y + D.h / 2, r = Math.min(D.w, D.h) * 0.26;
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2;
    for (let q = 1; q <= 3; q++) { ctx.beginPath(); ctx.arc(cx, cy, r + q * 26, 0, Math.PI * 2); ctx.stroke(); }
    const lock = ease(t, 0.1, 0.75, E.outCubic);
    ctx.strokeStyle = C.fg; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let s = 0; s < 6; s++) {
      const a0 = s * (Math.PI / 3) + (1 - lock) * 2.5 + t * 0.15;
      ctx.beginPath(); ctx.arc(cx, cy, r + 26, a0, a0 + Math.PI / 3 * (0.55 + 0.4 * lock)); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(242,240,251,0.12)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.fg;
    ctx.beginPath(); ctx.arc(cx, cy - r * 0.22, r * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.48, r * 0.52, r * 0.32, 0, Math.PI, 0); ctx.fill();
    const ck = springU(t, 0.75, SPRING.bouncy);
    if (ck > 0) {
      const bx = cx + r * 0.75, by = cy + r * 0.62;
      ctx.save(); ctx.translate(bx, by); ctx.scale(ck, ck);
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.canvas; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-3, 8); ctx.lineTo(11, -8); ctx.stroke();
      ctx.restore();
    }
  },
  // autonomy scope: a dashed boundary; the agent roams inside, a budget bar fills to its cap
  (ctx, D, t) => {
    const B = { x: D.x + D.w * 0.14, y: D.y + D.h * 0.14, w: D.w * 0.72, h: D.h * 0.54 };
    const bk = ease(t, 0, 0.45, E.outCubic);
    ctx.save(); ctx.strokeStyle = rgba(C.fg, 0.8); ctx.lineWidth = 3; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 40;
    rrect(ctx, B.x + (1 - bk) * B.w / 2, B.y + (1 - bk) * B.h / 2, B.w * bk, B.h * bk, 14); ctx.stroke(); ctx.restore();
    const trail = [];
    for (let q = 0; q < 26; q++) {
      const tt = t * 1.4 - q * 0.03;
      trail.push([B.x + B.w * (0.5 + 0.42 * Math.sin(tt * 2.1 + 0.4)), B.y + B.h * (0.5 + 0.4 * Math.sin(tt * 3.3))]);
    }
    trail.forEach(([px, py], q) => { ctx.fillStyle = rgba(C.fg, 0.5 * (1 - q / 26)); ctx.beginPath(); ctx.arc(px, py, 7 * (1 - q / 30), 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = C.fg; ctx.beginPath(); ctx.arc(trail[0][0], trail[0][1], 11, 0, Math.PI * 2); ctx.fill();
    const by = B.y + B.h + D.h * 0.12, bw = B.w;
    rrect(ctx, B.x, by, bw, 18, 9); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
    const fillk = 0.72 * ease(t, 0.2, 1.4, E.outCubic);
    rrect(ctx, B.x, by, bw * fillk, 18, 9); ctx.fillStyle = C.fg; ctx.fill();
    ctx.fillStyle = C.violetSoft; ctx.fillRect(B.x + bw * 0.72 - 2, by - 10, 4, 38);
  },
  // tools & API access: the agent reaches two scoped endpoints; the third is locked
  (ctx, D, t) => {
    const ax = D.x + D.w * 0.2, ay = D.y + D.h / 2;
    const eps = [0.22, 0.5, 0.78].map((f) => [D.x + D.w * 0.78, D.y + D.h * f]);
    eps.forEach(([ex, ey], i) => {
      const p = ease(t, 0.1 + i * 0.18, 0.6 + i * 0.18, E.outCubic);
      const locked = i === 2;
      const stop = locked ? 0.62 : 1;
      ctx.strokeStyle = locked ? rgba(C.fg, 0.35) : C.fg; ctx.lineWidth = 3.5;
      ctx.setLineDash(locked ? [8, 8] : []);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lerp(ax, ex, p * stop), lerp(ay, ey, p * stop)); ctx.stroke();
      ctx.setLineDash([]);
      rrect(ctx, ex - 10, ey - 30, 120, 60, 30); ctx.fillStyle = locked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.5; ctx.stroke();
      for (let q = 0; q < 3; q++) { ctx.fillStyle = rgba(C.fg, locked ? 0.3 : 0.8); ctx.fillRect(ex + 14 + q * 28, ey - 4, 18, 8); }
      if (locked && p > 0.95) {   // the lock
        const k = springU(t, 0.9, SPRING.bouncy);
        const lx = lerp(ax, ex, 0.62) + 8, ly = lerp(ay, ey, 0.62);
        ctx.save(); ctx.translate(lx, ly); ctx.scale(k, k);
        ctx.strokeStyle = C.violetSoft; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -10, 11, Math.PI, 0); ctx.stroke();
        rrect(ctx, -18, -10, 36, 30, 6); ctx.fillStyle = C.violetSoft; ctx.fill();
        ctx.restore();
      }
    });
    ctx.fillStyle = C.fg; ctx.beginPath(); ctx.arc(ax, ay, 22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ax, ay, 34 + 4 * Math.sin(t * 6), 0, Math.PI * 2); ctx.stroke();
  },
  // hard guardrails: the agent heads for the edge and is deflected by a wall it can't argue with
  (ctx, D, t) => {
    const wx = D.x + D.w * 0.74;
    const wk = ease(t, 0, 0.35, E.outCubic);
    rrect(ctx, wx, D.y + D.h * (0.5 - 0.4 * wk), 16, D.h * 0.8 * wk, 8); ctx.fillStyle = C.violetSoft; ctx.fill();
    const hit = 0.75;
    const sx = D.x + D.w * 0.1, sy = D.y + D.h * 0.78, hx = wx - 14, hy = D.y + D.h * 0.42;
    const ex = D.x + D.w * 0.3, ey = D.y + D.h * 0.12;
    const pt = (q) => (q < hit ? [lerp(sx, hx, q / hit), lerp(sy, hy, q / hit)] : [lerp(hx, ex, (q - hit) / (1.6 - hit)), lerp(hy, ey, E.outQuad((q - hit) / (1.6 - hit)))]);
    const q0 = clamp(t, 0, 1.6);
    const pts = []; for (let q = Math.max(0, q0 - 0.5); q <= q0; q += 0.02) pts.push(pt(q));
    ctx.strokeStyle = rgba(C.fg, 0.5); ctx.lineWidth = 3; ctx.setLineDash([2, 10]); ctx.lineCap = 'round';
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.setLineDash([]);
    const [px, py] = pt(q0);
    ctx.fillStyle = C.fg; ctx.beginPath(); ctx.arc(px, py, 14, 0, Math.PI * 2); ctx.fill();
    const sp = prog(t, hit, hit + 0.6);
    if (sp > 0 && sp < 1) {
      ctx.strokeStyle = rgba(C.violetSoft, 1 - sp); ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(hx + 8, hy, 14 + 60 * E.outCubic(sp), Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
    }
  },
  // human-in-the-loop: an irreversible action waits at the gate until a person confirms
  (ctx, D, t) => {
    const y = D.y + D.h * 0.62, gx = D.x + D.w * 0.62;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(D.x + 40, y); ctx.lineTo(D.x + D.w - 40, y); ctx.stroke();
    const open = ease(t, 0.9, 1.15, E.outCubic);
    const ax = t < 0.7 ? lerp(D.x + 60, gx - 40, E.outCubic(prog(t, 0, 0.7))) : lerp(gx - 40, D.x + D.w - 70, E.inOutCubic(prog(t, 1.05, 1.9)));
    ctx.fillStyle = C.fg; ctx.beginPath(); ctx.arc(ax, y, 16, 0, Math.PI * 2); ctx.fill();
    // gate
    ctx.save(); ctx.translate(gx, y); ctx.rotate(-open * Math.PI / 2);
    rrect(ctx, -6, -110, 12, 110, 6); ctx.fillStyle = open > 0.5 ? C.accent : C.violetSoft; ctx.fill();
    ctx.restore();
    // the person
    const hx = gx, hy = D.y + D.h * 0.2;
    const lit = ease(t, 0.65, 0.85);
    ctx.fillStyle = rgba(C.fg, 0.35 + 0.65 * lit);
    ctx.beginPath(); ctx.arc(hx, hy, 22, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hx, hy + 52, 38, 24, 0, Math.PI, 0); ctx.fill();
    const pulse = prog(t, 0.85, 1.5);
    if (pulse > 0 && pulse < 1) { ctx.strokeStyle = rgba(C.fg, 1 - pulse); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx, hy + 18, 50 + pulse * 40, 0, Math.PI * 2); ctx.stroke(); }
  },
  // runtime telemetry: live execution log + drift line; the kill-switch stops it dead
  (ctx, D, t) => {
    const kill = 1.25;
    const tl = Math.min(t, kill);
    const rows = 7, rh = (D.h * 0.55) / rows;
    for (let r = 0; r < rows; r++) {
      const id = Math.floor(tl * 6) + r;
      const y = D.y + 30 + r * rh - ((tl * 6) % 1) * rh;
      if (y < D.y + 10) continue;
      const w = (0.35 + 0.55 * hash01(id, 41)) * (D.w - 80);
      ctx.fillStyle = rgba(C.fg, 0.18 + 0.4 * hash01(id, 43));
      rrect(ctx, D.x + 40, y, w, rh * 0.42, 4); ctx.fill();
    }
    const cy = D.y + D.h * 0.72;
    ctx.strokeStyle = C.fg; ctx.lineWidth = 3; ctx.beginPath();
    for (let q = 0; q <= 60; q++) {
      const x = D.x + 40 + (q / 60) * (D.w * 0.62);
      const drift = q > 40 ? (q - 40) * 1.6 * clamp(tl / kill) : 0;
      const y = cy - 18 * Math.sin(q * 0.5 + tl * 5) * 0.6 - drift;
      q ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    // the switch
    const on = 1 - ease(t, kill, kill + 0.2, E.outCubic);
    const sx = D.x + D.w - 170, sy = cy - 32;
    rrect(ctx, sx, sy, 120, 64, 32); ctx.fillStyle = on > 0.5 ? 'rgba(255,255,255,0.25)' : rgba('#FF6B7A', 0.9); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(sx + lerp(32, 88, on), sy + 32, 24, 0, Math.PI * 2); ctx.fill();
  },
];

// ================================================================= S14 the promise (u 68..72)
const PROMISE = [
  { pre: 'Continuous ', key: 'visibility.', img: 'dash', fx: 0.6, fy: 0.3 },
  { pre: 'Risk ', key: 'intelligence.', img: 'riskdash', fx: 0.5, fy: 0.4 },
  { pre: 'Reusable ', key: 'evidence.', img: 'policy', fx: 0.5, fy: 0.5 },
  { pre: 'Agent ', key: 'guardrails.', img: 'agents', fx: 0.5, fy: 0.2 },
];
function scenePromise(ctx, u) {
  const i = clamp(Math.floor(u - 68), 0, 3);
  const pr = PROMISE[i];
  const lt = u - (68 + i);
  const suck = E.inExpo(prog(u, 71.55, 72));
  fill(ctx, C.canvas);
  ctx.save();
  const sc = Math.max(0.001, 1 - suck);
  ctx.translate(W / 2, H / 2); ctx.scale(sc, sc); ctx.translate(-W / 2, -H / 2);
  const img = IMGS[pr.img];
  if (img) cover(ctx, img, 0, 0, W, H, { fx: pr.fx, fy: pr.fy, zoom: 1.12 + 0.07 * lt });
  ctx.fillStyle = 'rgba(6,1,31,0.8)'; ctx.fillRect(0, 0, W, H);
  backdropGridOnly(ctx, 0.6);
  const str = pr.pre + pr.key;
  const size = P ? fitSize(ctx, 'intelligence.', 600, DISPLAY, S.w * 0.98, 210, -0.03) : fitSize(ctx, 'Continuous visibility.', 600, DISPLAY, S.w * 0.92, 168, -0.03);
  const f = font(size, 600, DISPLAY);
  const x0 = S.x + 20;
  if (P) {
    const words = [pr.pre.trim(), pr.key];
    words.forEach((wd, j) => {
      const L = layout(ctx, wd, f, -0.03 * size);
      const y = H * 0.45 + j * size * 1.05;
      L.glyphs.forEach((g, q) => {
        const k = springU(u, 68 + i - 0.1 + j * 0.06 + q * 0.01, { stiffness: 480, damping: 28 });
        if (k <= 0) return;
        M.glyph(ctx, g.ch, x0 + g.cx + (1 - k) * 700, y, f, j === 1 ? C.accent : C.fg, 1, 1, 0, (1 - k) * 0.4);
      });
    });
  } else {
    const L = layout(ctx, str, f, -0.03 * size);
    const y = H * 0.5 + size * 0.35;
    L.glyphs.forEach((g, q) => {
      const k = springU(u, 68 + i - 0.1 + q * 0.008, { stiffness: 480, damping: 28 });
      if (k <= 0) return;
      M.glyph(ctx, g.ch, x0 + g.cx + (1 - k) * 800, y, f, q >= pr.pre.length ? C.accent : C.fg, 1, 1, 0, (1 - k) * 0.4);
    });
  }
  ctx.restore();
}
function backdropGridOnly(ctx, a) {
  ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.06 * a})`; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = 0; x < W; x += CELL) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
  for (let y = 0; y < H; y += CELL) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
  ctx.stroke(); ctx.restore();
}

// ================================================================= S15 end card (u 72..80)
function sceneEnd(ctx, u) {
  const push = 1 + 0.025 * ease(u, 72, 80, E.outCubic);
  backdrop(ctx, u, { grid: 1, aura: 0.9, gy: (u - 72) * 4, focus: [W / 2, H * 0.45] });
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(push, push); ctx.translate(-W / 2, -H / 2);
  const lw = P ? 840 : 1000, k = lw / LOGO.w;
  const lx = (W - lw) / 2, ly = P ? H * 0.4 - 25 * k : H * 0.42 - 25 * k;
  // letters rise out of a mask on the baseline, overlapping
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, ly + (LOGO.base + 1) * k); ctx.clip();
  LOGO.letters.forEach((l, i) => {
    const kk = springU(u, 71.9 + i * 0.07, { stiffness: 260, damping: 18 });
    if (kk <= 0) return;
    ctx.save(); ctx.translate(lx, ly + (1 - kk) * 34 * k); ctx.scale(k, k);
    ctx.fillStyle = C.accent; ctx.fill(PATHS.letters[i]); ctx.restore();
  });
  ctx.restore();
  LOGO.sparkles.forEach((s, i) => {
    const t0 = 73 + i * 0.5;
    const kk = springU(u, t0 - 0.05, SPRING.bouncy);
    if (kk <= 0) return;
    const tw = 1 + 0.08 * Math.sin((u - t0) * 2.4 + i);
    sparkle(ctx, lx + s.cx * k, ly + s.cy * k, 3.6 * k * kk * tw, '#FFFFFF', (1 - kk) * 1.8);
    const ring = prog(u, t0, t0 + 0.8);
    if (ring > 0 && ring < 1) {
      ctx.strokeStyle = rgba('#FFFFFF', 0.6 * (1 - ring)); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(lx + s.cx * k, ly + s.cy * k, 3.6 * k + E.outCubic(ring) * 60, 0, Math.PI * 2); ctx.stroke();
    }
  });
  const tf = font(P ? 52 : 50, 500, UI);
  const ty = ly + 40 * k + (P ? 120 : 110);
  if (P) {
    riseText(ctx, 'The operating layer', W / 2, ty, tf, 52, C.fg, E.outQuint(prog(u, 74, 74.6)), 'center');
    riseText(ctx, 'for governed AI.', W / 2, ty + 70, tf, 52, C.fg, E.outQuint(prog(u, 74.15, 74.75)), 'center');
  } else riseText(ctx, 'The operating layer for governed AI.', W / 2, ty, tf, 50, C.fg, E.outQuint(prog(u, 74, 74.6)), 'center');
  const uf = font(P ? 40 : 36, 600, UI);
  riseText(ctx, 'niticore.vercel.app', W / 2, ty + (P ? 170 : 90), uf, 40, C.accent, E.outQuint(prog(u, 74.5, 75.1)), 'center');
  ctx.restore();
  // the hero's violet doodles draw in at the edges
  const dp = ease(u, 74.2, 76.2, E.inOutCubic);
  if (dp > 0) {
    ctx.save(); ctx.strokeStyle = C.violet; ctx.lineWidth = P ? 5 : 4.5; ctx.lineCap = 'round';
    const pts = [];
    const ox = P ? -40 : -30, oy = H - (P ? 520 : 330);
    for (let q = 0; q <= 140; q++) {
      const s = q / 140, a = s * Math.PI * 4.2;
      pts.push([ox + s * (P ? 380 : 340) + Math.cos(a) * 70 * (0.6 + s), oy + Math.sin(a) * 60 * (0.6 + s) + s * 40]);
    }
    strokeProgress(ctx, pts, dp);
    const arc = quadPts([W - (P ? 260 : 300), P ? 300 : 120], [W - 40, P ? 340 : 160], [W - 10, P ? 620 : 460], 30);
    strokeProgress(ctx, arc, dp);
    ctx.restore();
    sparkleOutline(ctx, P ? W - 150 : W - 230, P ? 1180 : H * 0.36, (P ? 56 : 62) * E.outBack(prog(u, 74.6, 75.3)), u);
  }
}
function sparkleOutline(ctx, x, y, r, u) {   // the hero's outlined violet star
  if (r <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.08 * Math.sin(u * 0.6));
  ctx.strokeStyle = C.violet; ctx.lineWidth = 4; ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 - Math.PI / 2, b = a + Math.PI / 2;
    const p = [Math.cos(a) * r, Math.sin(a) * r], q = [Math.cos(b) * r, Math.sin(b) * r];
    if (i === 0) ctx.moveTo(p[0], p[1]);
    ctx.quadraticCurveTo(Math.cos(a + Math.PI / 4) * r * 0.16, Math.sin(a + Math.PI / 4) * r * 0.16, q[0], q[1]);
  }
  ctx.closePath(); ctx.stroke(); ctx.restore();
}

// ================================================================= harness
let IMGS = {};
M.film({
  fonts: [font(100, 600, DISPLAY), font(40, 500, UI), font(40, 600, UI), font(40, 700, UI)],
  images: {
    wizard: 'assets/app/new_usecase.png', risk: 'assets/app/risk_usecase.png', controls: 'assets/app/assign_controls.png',
    policy: 'assets/app/policy_manager.png', dash: 'assets/app/dashboard.png', riskdash: 'assets/app/risk_dashboard.png',
    frameworks: 'assets/shots/section_02_one-governance-action-every-framework-sa.png',
    agents: 'assets/shots/section_06_ai-agents-don-t-just-predict-they-take-a.png',
  },
  hits: HITS,
  init(ctx, IMG) {
    IMGS = IMG;
    buildPaths();
    // sample the real UI's own colours where we update it in place
    const cv = document.createElement('canvas'); cv.width = 4; cv.height = 4;
    const c = cv.getContext('2d', { willReadFrequently: true });
    const at = (img, x, y) => { c.clearRect(0, 0, 4, 4); c.drawImage(img, x, y, 1, 1, 0, 0, 1, 1); const d = c.getImageData(0, 0, 1, 1).data; return `rgb(${d[0]},${d[1]},${d[2]})`; };
    if (IMG.controls) PATCH.counterBg = at(IMG.controls, 1725, 214);
    if (IMG.wizard) { PATCH.panel = at(IMG.wizard, 1690, 232); PATCH.field = at(IMG.wizard, 900, 320); }
  },
  draw(ctx, u) {
    if (!PATHS) buildPaths();
    const over = (a, b) => { a(ctx, u); NOBG = true; b(ctx, u); NOBG = false; };
    if (u < 7.6) sceneHook(ctx, u);
    else if (u < 8) over(sceneHook, (c, v) => drawWordmarkLetters(c, brandLayout(), v, 'drop'));
    else if (u < 12) sceneBrand(ctx, u);
    else if (u < 18) sceneDiscover(ctx, u);
    else if (u < 23.9) sceneClassify(ctx, u);
    else if (u < 24) over(sceneClassify, sceneAssess);
    else if (u < 29.7) sceneAssess(ctx, u);
    else if (u < 29.9) over(sceneAssess, sceneGovern);
    else if (u < 35.0) sceneGovern(ctx, u);
    else if (u < 35.8) over(sceneGovern, sceneEvidence);
    else if (u < 41.6) sceneEvidence(ctx, u);
    else if (u < 42) over(sceneEvidence, sceneMonitor);
    else if (u < 46.6) sceneMonitor(ctx, u);
    else if (u < 47.15) over(sceneMonitor, sceneImprove);
    else if (u < 52) sceneImprove(ctx, u);
    else if (u < 55.6) sceneAgentsHead(ctx, u);
    else if (u < 56) over(sceneAgentsHead, sceneAgentStack);
    else if (u < 68) sceneAgentStack(ctx, u);
    else if (u < 72) scenePromise(ctx, u);
    else sceneEnd(ctx, u);
  },
});
