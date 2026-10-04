// Niticore — "AI governance, from policy to proof" (particle cut v2). A pure function of time:
// window.seek(t) paints frame t. 131k GPU particles carry the story from shape to shape (a spark,
// ribbons that speed up, two headlines, the wordmark); a 3D AI-agent avatar acts out the problem;
// then the particles assemble the real Niticore components from the production site's design system
// (bezel, panels, ScoreRing, BarMeter, OrbitSteps, FrameworkCard, card tones, CheckPill, Button,
// LogStream) and pour from one to the next. Components are 2D canvases shown as 3D boards; GL does the
// particles, the avatar meshes, HDR bloom and the composite. Beats on the measured 96 bpm grid; VO in
// audio/vo.json. Sentence case everywhere. Copy and figures from niticore-website-v2 (niticore.ai).
import * as M from './lib/motion.js';

const { W, H, FORMAT, E, prog, lerp, clamp, noise1 } = M;
const P = FORMAT.portrait, S = FORMAT.safe;
const DISPLAY = 'Display', UI = 'UI', MONO = 'Mono';
const QS = new URLSearchParams(location.search);
const FPS = Number(QS.get('fps') || 60), SHUTTER = 0.5;
const MB = QS.get('render') === '1' && QS.get('blur') !== '0' ? 3 : 1;   // GPU motion-blur sub-frames
const N = 1 << 17, TW = 512, RL = N / TW, NEL = 12;
const D0 = 14.84, FOV = P ? 65.8 : 40;   // at D0 one world unit is 100 px, in both formats
const DEG = Math.PI / 180, TAU = Math.PI * 2;

// ---------------------------------------------------------------- design tokens (src/app/globals.css)
const T = {
  canvas: '#06011f', surface: '#0c062b', raised: '#140d3d', fg: '#f2f0fb', muted: '#cbc6e4', subtle: '#a6a1c4',
  accent: '#4ae057', ink: '#06011f', tertiary: '#a98bff', soft: '#c9b8ff',
  line: 'rgba(255,255,255,0.08)', lineStrong: 'rgba(255,255,255,0.16)', warn: '#f5b544', risk: '#ff6b7a',
  blue: ['#1a1260', '#2f2a8c'], violet: ['#4a33b8', '#7654e0'], green: ['#0f4a1d', '#1f8a31'],
  close: '#ff5f57', minimize: '#febc2e', zoom: '#28c840',
};
const hex3 = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const rgba = (h, a) => { const [r, g, b] = hex3(h); return `rgba(${r},${g},${b},${a})`; };
const mixc = (a, b, t) => { const x = hex3(a), y = hex3(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], clamp(t)))).join(',')})`; };
const fgA = (a) => `rgba(242,240,251,${a})`;
const ease = (u, a, b, fn = E.inOutCubic) => fn(prog(u, a, b));
const eo = (u, a, b) => E.outCubic(prog(u, a, b));
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const springB = (u, u0, cfg = { stiffness: 260, damping: 14 }) => (u < u0 ? 0 : M.spring((u - u0) * M.GRID.period, cfg));
// v2.1 timeline: the loop gained 8 beats (at old beat 61) and the frameworks 12 more (at old beat 96).
// Components authored on the old grid are drawn at unsh(u); lists of old beats are mapped with sh().
const sh = (b) => b + (b >= 61 ? 8 : 0) + (b >= 96 ? 12 : 0);
const unsh = (u) => (u < 61 ? u : u < 69 ? 60.999 : u < 104 ? u - 8 : u < 116 ? 95.999 : u - 20);

// ---------------------------------------------------------------- the wordmark (public/logo/niticore.svg)
const LOGO = {
  w: 156, h: 38,
  sparkles: [
    'M27.1264 4.58673C27.3281 3.52776 28.8318 3.49353 29.0815 4.54222L29.2846 5.39508C29.3727 5.76547 29.6636 6.05365 30.0348 6.13838L31.252 6.41621C32.3121 6.65819 32.2788 8.17953 31.2091 8.37487L30.0782 8.58138C29.6842 8.65333 29.3711 8.95339 29.2826 9.34397L29.0842 10.219C28.8434 11.2808 27.3193 11.2476 27.125 10.1763L26.9817 9.3863C26.9069 8.97397 26.5829 8.652 26.1701 8.57977L25.0056 8.37599C23.9255 8.18697 23.8931 6.64838 24.9643 6.41406L26.2121 6.14111C26.6033 6.05553 26.9058 5.74476 26.9807 5.35132L27.1264 4.58673Z',
    'M55.087 4.58673C55.2888 3.52776 56.7925 3.49353 57.0422 4.54222L57.2453 5.39508C57.3334 5.76547 57.6243 6.05365 57.9955 6.13838L59.2127 6.41621C60.2728 6.65819 60.2395 8.17953 59.1698 8.37487L58.0389 8.58138C57.6449 8.65333 57.3318 8.95339 57.2433 9.34397L57.0448 10.219C56.8041 11.2808 55.28 11.2476 55.0857 10.1763L54.9423 9.3863C54.8675 8.97397 54.5436 8.652 54.1308 8.57977L52.9663 8.37599C51.8862 8.18697 51.8538 6.64838 52.925 6.41406L54.1728 6.14111C54.564 6.05553 54.8665 5.74476 54.9414 5.35132L55.087 4.58673Z',
  ],
  letters: [
    'M0 37.14V14.208H5.88V18.744L5.544 17.736C6.076 16.364 6.93 15.356 8.106 14.712C9.31 14.04 10.71 13.704 12.306 13.704C14.042 13.704 15.554 14.068 16.842 14.796C18.158 15.524 19.18 16.546 19.908 17.862C20.636 19.15 21 20.662 21 22.398V37.14H14.7V23.742C14.7 22.846 14.518 22.076 14.154 21.432C13.818 20.788 13.328 20.284 12.684 19.92C12.068 19.556 11.34 19.374 10.5 19.374C9.688 19.374 8.96 19.556 8.316 19.92C7.672 20.284 7.168 20.788 6.804 21.432C6.468 22.076 6.3 22.846 6.3 23.742V37.14H0Z',
    'M25.1426 37.14V14.208H31.4426V37.14H25.1426Z',
    'M47.0987 37.392C44.3267 37.392 42.1707 36.65 40.6307 35.166C39.1187 33.654 38.3627 31.554 38.3627 28.866V19.668H34.4987V14.208H34.7087C35.8847 14.208 36.7807 13.914 37.3967 13.326C38.0407 12.738 38.3627 11.856 38.3627 10.68V9H44.6627V14.208H50.0387V19.668H44.6627V28.446C44.6627 29.23 44.8027 29.888 45.0827 30.42C45.3627 30.924 45.7967 31.302 46.3847 31.554C46.9727 31.806 47.7007 31.932 48.5687 31.932C48.7647 31.932 48.9887 31.918 49.2407 31.89C49.4927 31.862 49.7587 31.834 50.0387 31.806V37.14C49.6187 37.196 49.1427 37.252 48.6107 37.308C48.0787 37.364 47.5747 37.392 47.0987 37.392Z',
    'M53.7305 37.14V14.208H60.0305V37.14H53.7305Z',
    'M75.8966 37.644C73.6006 37.644 71.5286 37.126 69.6806 36.09C67.8606 35.026 66.4046 33.584 65.3126 31.764C64.2486 29.944 63.7166 27.9 63.7166 25.632C63.7166 23.364 64.2486 21.334 65.3126 19.542C66.3766 17.722 67.8326 16.294 69.6806 15.258C71.5286 14.222 73.6006 13.704 75.8966 13.704C77.6046 13.704 79.1866 13.998 80.6426 14.586C82.0986 15.174 83.3446 16 84.3806 17.064C85.4166 18.1 86.1586 19.332 86.6066 20.76L81.1466 23.112C80.7546 21.964 80.0826 21.054 79.1306 20.382C78.2066 19.71 77.1286 19.374 75.8966 19.374C74.8046 19.374 73.8246 19.64 72.9566 20.172C72.1166 20.704 71.4446 21.446 70.9406 22.398C70.4646 23.35 70.2266 24.442 70.2266 25.674C70.2266 26.906 70.4646 27.998 70.9406 28.95C71.4446 29.902 72.1166 30.644 72.9566 31.176C73.8246 31.708 74.8046 31.974 75.8966 31.974C77.1566 31.974 78.2486 31.638 79.1726 30.966C80.0966 30.294 80.7546 29.384 81.1466 28.236L86.6066 30.63C86.1866 31.974 85.4586 33.178 84.4226 34.242C83.3866 35.306 82.1406 36.146 80.6846 36.762C79.2286 37.35 77.6326 37.644 75.8966 37.644Z',
    'M101.698 37.644C99.4304 37.644 97.3584 37.126 95.4824 36.09C93.6344 35.054 92.1504 33.64 91.0304 31.848C89.9384 30.028 89.3924 27.97 89.3924 25.674C89.3924 23.35 89.9384 21.292 91.0304 19.5C92.1504 17.708 93.6344 16.294 95.4824 15.258C97.3584 14.222 99.4304 13.704 101.698 13.704C103.966 13.704 106.024 14.222 107.872 15.258C109.72 16.294 111.19 17.708 112.282 19.5C113.402 21.292 113.962 23.35 113.962 25.674C113.962 27.97 113.402 30.028 112.282 31.848C111.19 33.64 109.72 35.054 107.872 36.09C106.024 37.126 103.966 37.644 101.698 37.644ZM101.698 31.974C102.846 31.974 103.84 31.708 104.68 31.176C105.548 30.644 106.22 29.902 106.696 28.95C107.2 27.998 107.452 26.906 107.452 25.674C107.452 24.442 107.2 23.364 106.696 22.44C106.22 21.488 105.548 20.746 104.68 20.214C103.84 19.654 102.846 19.374 101.698 19.374C100.55 19.374 99.5424 19.654 98.6744 20.214C97.8064 20.746 97.1204 21.488 96.6164 22.44C96.1404 23.364 95.9024 24.442 95.9024 25.674C95.9024 26.906 96.1404 27.998 96.6164 28.95C97.1204 29.902 97.8064 30.644 98.6744 31.176C99.5424 31.708 100.55 31.974 101.698 31.974Z',
    'M117.674 37.14V14.208H123.554V19.71L123.134 18.912C123.638 16.98 124.464 15.678 125.612 15.006C126.788 14.306 128.174 13.956 129.77 13.956H131.114V19.416H129.14C127.6 19.416 126.354 19.892 125.402 20.844C124.45 21.768 123.974 23.084 123.974 24.792V37.14H117.674Z',
    'M144.921 37.644C142.485 37.644 140.371 37.112 138.579 36.048C136.787 34.956 135.401 33.5 134.421 31.68C133.441 29.86 132.951 27.844 132.951 25.632C132.951 23.336 133.455 21.292 134.463 19.5C135.499 17.708 136.885 16.294 138.621 15.258C140.357 14.222 142.317 13.704 144.501 13.704C146.321 13.704 147.931 13.998 149.331 14.586C150.731 15.146 151.907 15.944 152.859 16.98C153.839 18.016 154.581 19.22 155.085 20.592C155.589 21.936 155.841 23.406 155.841 25.002C155.841 25.45 155.813 25.898 155.757 26.346C155.729 26.766 155.659 27.13 155.547 27.438H138.369V22.818H151.977L148.995 25.002C149.275 23.798 149.261 22.734 148.953 21.81C148.645 20.858 148.099 20.116 147.315 19.584C146.559 19.024 145.621 18.744 144.501 18.744C143.409 18.744 142.471 19.01 141.687 19.542C140.903 20.074 140.315 20.858 139.923 21.894C139.531 22.93 139.377 24.19 139.461 25.674C139.349 26.962 139.503 28.096 139.923 29.076C140.343 30.056 140.987 30.826 141.855 31.386C142.723 31.918 143.773 32.184 145.005 32.184C146.125 32.184 147.077 31.96 147.861 31.512C148.673 31.064 149.303 30.448 149.751 29.664L154.791 32.058C154.343 33.178 153.629 34.158 152.649 34.998C151.697 35.838 150.563 36.496 149.247 36.972C147.931 37.42 146.489 37.644 144.921 37.644Z',
  ],
};

// ---------------------------------------------------------------- copy (niticore-website-v2: the production site)
// Platform cockpit: the readiness ring, the four assessment pillars, the attention feed
const DOMAINS = [['Governance', 83], ['Risk Management', 73], ['Transparency', 85], ['Accountability', 70]];
const FEED = [['3', 'high-risk systems without completed FRIA documentation'], ['7', 'scheduled risk assessments due this quarter'],
  ['12', 'controls awaiting validated evidence filings'], ['Jan 2027', 'UAE Federal PDPL deadline for mainland AI systems']];
// the five-stage governance loop (sections/governance-loop.tsx)
const STAGES = [
  ['Discover', 'A registry of your AI systems, models and vendors.'],
  ['Assess', 'Composite risk scoring across every dimension that matters.'],
  ['Govern', 'Unified controls that satisfy every applicable framework at once.'],
  ['Prove', 'File once, satisfy everywhere.'],
  ['Monitor', 'Continuous surveillance runs long after a model ships.'],
];
const STAGE_T = [57.0, 59.2, 61.4, 63.6, 65.86];   // each node lights on its spoken name, with a pause between
const INV = [
  { name: 'Credit decision model', via: 'Found by a code-repo scanner', type: 'Model', icon: 'Cube', t: 63.5 },
  { name: 'Customer support agent', via: 'Found at the API gateway', type: 'Agent', icon: 'Robot', t: 65.1 },
  { name: 'Claims history dataset', via: 'Found by asset registration', type: 'Dataset', icon: 'Database', t: 66.2 },
  { name: 'Marketing copy bot', via: 'Found in a procurement intake form', type: 'Shadow AI', icon: 'Eye', t: 68.8 },
];
const AXES = ['Bias', 'Safety', 'Privacy', 'Hallucination', 'Robustness', 'Drift'], AXV = [78, 52, 66, 84, 58, 62];
// sections/framework-cards.tsx, in the order the voice names them
const FRAMEWORKS = [
  { name: 'EU AI Act', stat: '2024/1689', note: 'Annex III risk classifier and FRIA templates', tone: 'violet', logo: 'eu', t: 90.6 },
  { name: 'ISO/IEC 42001', stat: 'Clauses 4–10', note: 'Clause-by-clause mapping and audit dry-runs', tone: 'blue', logo: 'iso', t: 93.6 },
  { name: 'NIST AI RMF', stat: '4 functions', note: 'Govern, Map, Measure and Manage, cross-mapped to the EU AI Act', tone: 'green', logo: 'nist', t: 97.7 },
  { name: 'UAE PDPL', stat: 'Jan 2027', note: 'Federal deadline. GDPR controls cross-mapped to PDPL articles', tone: 'violet', logo: 'uae', t: 101.45 },
  { name: 'ADGM DPR 2021', stat: 'FSRA', note: 'Algorithmic risk mapping with instant evidence reuse', tone: 'blue', logo: 'adgm', t: 105.0 },
  { name: 'DIFC Regulation 10', stat: 'Jan 2026', note: 'In enforcement. AI Impact Assessment and AI Systems Officer workflows', tone: 'green', logo: 'difc', t: 110.45 },
];
const FILES = ['Declaration of Conformity', 'Technical documentation', 'Approval sign-offs'];
const RUN = [[102.3, 'info', 'agent run started'], [102.6, 'ok', 'agent identity verified · owner and role on record'], [102.9, 'allow', 'tool call · allowed API endpoint'],
  [103.2, 'warn', 'action exceeds pre-approved authority cap'], [103.5, 'escal', 'human confirmation gate · approval required'], [105.3, 'ok', 'execution logged for runtime audit']];
const LEVEL = { info: T.subtle, ok: T.accent, allow: T.accent, warn: T.warn, block: T.risk, escal: T.warn };
// sections/agentic-governance.tsx: six ways governance actually gets enforced
const SIX = [
  { tag: 'Audit', title: 'Tamper-evident audit trail', body: "Every entry's hash incorporates the one before it, checked automatically on a schedule you set.", icon: 'Fingerprint', tone: 'blue' },
  { tag: 'Approvals', title: 'Segregation of duties', body: "An author can't approve their own work, and role conflicts are blocked before they happen.", icon: 'Gauge', tone: 'violet' },
  { tag: 'Sign-off', title: 'AISIA, FRIA & DPIA', body: 'Three real regulatory assessments, each locked to named accountable roles and immutable once signed.', icon: 'Plugs', tone: 'green' },
  { tag: 'Deployment', title: 'Risk-based deployment gate', body: 'A pass, warn or block decision from live risk severity, callable from any CI pipeline.', icon: 'Prohibit', tone: 'blue' },
  { tag: 'Evidence', title: 'Encrypted evidence & retention', body: 'Filed evidence is encrypted, opened through single-use 60-second links, and reviewed on its own retention schedule.', icon: 'HandPalm', tone: 'violet' },
  { tag: 'Mapping', title: 'One control, multiple frameworks', body: 'Select controls are filed once and genuinely satisfy several frameworks at once, not duplicated per framework.', icon: 'Waveform', tone: 'green' },
];
const SIX_ON = [113.6, 119.2, 124.2, 130.7, 135.7, 142.2];   // each mechanism goes live on its line
// the avatar's agents: the six small blobs it buds
const CLONES = [['Model', 'Cube'], ['Agent', 'Robot'], ['Dataset', 'Database'], ['Vendor tool', 'Plugs'], ['Internal app', 'Stack'], ['Embedded API', 'Lightning']].map((kind) => ({ kind }));

// ---------------------------------------------------------------- canvas helpers
let ICONS = {}, IMGS = {};
const p2 = new Map();
const path2 = (d) => { let p = p2.get(d); if (!p) { p = new Path2D(d); p2.set(d, p); } return p; };
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); }
function setFont(g, size, weight, family, ls = 0) { g.font = `${weight} ${size}px ${family}`; g.letterSpacing = `${ls}px`; }
function tx(g, s, x, y, size, weight, family, color, align = 'left', ls = 0) {
  setFont(g, size, weight, family, ls); g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillStyle = color; g.fillText(s, x, y);
}
function tw(g, s, size, weight, family, ls = 0) { setFont(g, size, weight, family, ls); return g.measureText(s).width; }
function wrap(g, s, maxW, size, weight, family, ls = 0) {
  setFont(g, size, weight, family, ls);
  const lines = []; let cur = '';
  for (const w of s.split(' ')) { const t = cur ? `${cur} ${w}` : w; if (cur && g.measureText(t).width > maxW) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}
function icon(g, name, x, y, size, color, weight = 'regular') {
  const ds = ICONS[name]?.[weight] || [];
  g.save(); g.translate(x, y); g.scale(size / 256, size / 256); g.fillStyle = color; ds.forEach((d) => g.fill(path2(d))); g.restore();
}

// ---------------------------------------------------------------- design-system components, drawn in CSS px
// rounded-panel surface with a line-strong hairline and shadow-panel's inset top highlight
function panel(g, x, y, w, h, { fill = T.surface, border = T.lineStrong, r = 20, grad = null } = {}) {
  rr(g, x, y, w, h, r);
  if (grad) { const lg = g.createLinearGradient(x, y, x + w, y + h); lg.addColorStop(0, grad[0]); lg.addColorStop(1, grad[1]); g.fillStyle = lg; } else g.fillStyle = fill;
  g.fill();
  g.save(); rr(g, x, y, w, h, r); g.clip(); g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(x, y, w, 1); g.restore();
  g.lineWidth = 1; g.strokeStyle = border; rr(g, x + 0.5, y + 0.5, w - 1, h - 1, r); g.stroke();
}
// bezel: the machined shell around a feature panel (radius = panel + padding)
function bezel(g, x, y, w, h) {
  rr(g, x, y, w, h, 28); g.fillStyle = 'rgba(255,255,255,0.03)'; g.fill();
  g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,0.1)'; rr(g, x + 0.5, y + 0.5, w - 1, h - 1, 28); g.stroke();
}
// rounded-field row (12px) in raised/60 with a line hairline
function field(g, x, y, w, h, { fill = 'rgba(20,13,61,0.6)', border = T.line } = {}) {
  rr(g, x, y, w, h, 12); g.fillStyle = fill; g.fill(); g.lineWidth = 1; g.strokeStyle = border; rr(g, x + 0.5, y + 0.5, w - 1, h - 1, 12); g.stroke();
}
// ScoreRing: line track, status-coloured arc from 12 o'clock, the number counts up with the sweep
function scoreRing(g, cx, cy, size, value, label, k) {
  const r = size * 0.44, sw = size * 0.06, v = value * k;
  g.lineWidth = sw; g.strokeStyle = T.line; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
  if (v > 0.3) {
    g.strokeStyle = value >= 75 ? T.accent : value >= 50 ? T.warn : T.risk; g.lineCap = 'round';
    g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (v / 100) * Math.PI * 2); g.stroke(); g.lineCap = 'butt';
  }
  const ns = size * 0.3, ls = Math.max(11, size * 0.075), lh = ls * 1.25;
  const lines = wrap(g, label, size * 0.7, ls, 500, UI);
  const total = ns + 4 + lines.length * lh, top = cy - total / 2;
  tx(g, String(Math.round(v)), cx, top + ns * 0.86, ns, 600, DISPLAY, T.fg, 'center', -ns * 0.04);
  lines.forEach((ln, i) => tx(g, ln, cx, top + ns + 4 + ls * 0.98 + i * lh, ls, 500, UI, T.subtle, 'center'));
}
// BarMeter row: label + green count-up, 8px pill track with a green fill
function barRow(g, x, y, w, label, value, k) {
  tx(g, label, x, y + 15, 14, 600, UI, T.fg);
  tx(g, `${Math.round(value * k)}%`, x + w, y + 15, 14, 700, UI, T.accent, 'right');
  rr(g, x, y + 26, w, 8, 4); g.fillStyle = 'rgba(255,255,255,0.07)'; g.fill();
  if (k > 0.01) { rr(g, x, y + 26, (w * value * k) / 100, 8, 4); g.fillStyle = T.accent; g.fill(); }
}
// outline pill (rounded-control): badge-style label
function pill(g, x, y, label, { h = 28, size = 13, color = T.muted, align = 'left', ico = null, icoColor = null } = {}) {
  const iw = ico ? size + 6 : 0, w = tw(g, label, size, 600, UI) + 24 + iw, x0 = align === 'right' ? x - w : x;
  rr(g, x0, y, w, h, h / 2); g.fillStyle = 'rgba(255,255,255,0.04)'; g.fill();
  g.lineWidth = 1; g.strokeStyle = T.lineStrong; rr(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2); g.stroke();
  if (ico) icon(g, ico, x0 + 12, y + (h - size) / 2, size, icoColor || color, 'bold');
  tx(g, label, x0 + 12 + iw, y + h / 2 + size * 0.36, size, 600, UI, color);
  return w;
}
// CheckPill: off = raised fill, empty ring; on = solid green with an ink check
function checkPill(g, x, y, label, k, { align = 'left' } = {}) {
  const w = tw(g, label, 14, 600, UI) + 16 + 16 + 8 + 14, h = 40, x0 = align === 'right' ? x - w : x;
  rr(g, x0, y, w, h, 20); g.fillStyle = mixc(T.raised, T.accent, k); g.fill();
  g.lineWidth = 1; g.strokeStyle = k > 0.5 ? T.accent : T.lineStrong; rr(g, x0 + 0.5, y + 0.5, w - 1, h - 1, 20); g.stroke();
  const ink = mixc(T.muted, T.ink, k), cx = x0 + 14 + 8, cy = y + h / 2;
  if (k < 0.5) { g.globalAlpha *= 0.6; g.lineWidth = 1.5; g.strokeStyle = ink; g.beginPath(); g.arc(cx, cy, 6.25, 0, Math.PI * 2); g.stroke(); g.globalAlpha /= 0.6; }
  else {
    const s = 0.7 + 0.3 * E.outBack(clamp((k - 0.5) * 2));
    g.save(); g.translate(cx, cy); g.scale(s, s); g.translate(-8, -8);
    g.lineWidth = 2.4; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = ink;
    g.beginPath(); g.moveTo(3, 8.5); g.lineTo(6.2, 11.5); g.lineTo(13, 4.5); g.stroke(); g.restore();
  }
  tx(g, label, x0 + 14 + 16 + 8, cy + 5, 14, 600, UI, ink);
  return w;
}
// TickList item: rounded-panel row; the check fills green with a little overshoot
function tickRow(g, x, y, w, h, label, k) {
  panel(g, x, y, w, h, { border: T.line });
  const cx = x + 16 + 18, cy = y + h / 2;
  const s = k > 0 ? 0.6 + 0.4 * E.outBack(clamp(k), 2.4) : 1;
  g.save(); g.translate(cx, cy); g.scale(s, s);
  g.beginPath(); g.arc(0, 0, 17, 0, Math.PI * 2);
  if (k > 0) { g.fillStyle = T.accent; g.fill(); }
  g.lineWidth = 2; g.strokeStyle = k > 0 ? T.accent : T.lineStrong; g.stroke();
  if (k > 0) { g.lineWidth = 2.6; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = T.ink; g.beginPath(); g.moveTo(-6, 0.5); g.lineTo(-2, 4.5); g.lineTo(6.5, -4); g.stroke(); }
  g.restore();
  tx(g, label, x + 16 + 36 + 16, cy + 6, 16, 500, UI, T.fg);
}
// Switch: 48 x 28 pill; raised + subtle thumb when off, green + ink thumb when on
function switchCtl(g, x, y, k) {
  rr(g, x, y, 48, 28, 14); g.fillStyle = mixc(T.raised, T.accent, k); g.fill();
  g.lineWidth = 1; g.strokeStyle = k > 0.5 ? T.accent : T.lineStrong; rr(g, x + 0.5, y + 0.5, 47, 27, 14); g.stroke();
  const cx = x + 3 + 10 + 23 * E.outCubic(clamp(k));
  g.save(); g.shadowColor = 'rgba(2,0,14,0.45)'; g.shadowBlur = 6; g.shadowOffsetY = 2;
  g.beginPath(); g.arc(cx, y + 14, 10, 0, Math.PI * 2); g.fillStyle = mixc(T.subtle, T.ink, k); g.fill(); g.restore();
}
// Button (rounded-control): primary = green with ink text; secondary = glass outline
function button(g, x, y, label, variant, { h = 40, size = 14, press = 0, align = 'left' } = {}) {
  const w = tw(g, label, size, 600, UI) + 36, x0 = align === 'right' ? x - w : x;
  g.save(); const s = 1 - 0.03 * press; g.translate(x0 + w / 2, y + h / 2); g.scale(s, s); g.translate(-(x0 + w / 2), -(y + h / 2));
  if (variant === 'primary') {
    g.save(); g.shadowColor = 'rgba(74,224,87,0.28)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
    rr(g, x0, y, w, h, h / 2); g.fillStyle = mixc(T.accent, '#8df09a', press * 0.6); g.fill(); g.restore();
    g.save(); rr(g, x0, y, w, h, h / 2); g.clip(); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(x0, y, w, 1); g.restore();
    tx(g, label, x0 + w / 2, y + h / 2 + size * 0.36, size, 600, UI, T.ink, 'center');
  } else {
    rr(g, x0, y, w, h, h / 2); g.fillStyle = 'rgba(255,255,255,0.04)'; g.fill();
    g.lineWidth = 1; g.strokeStyle = T.lineStrong; rr(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2); g.stroke();
    tx(g, label, x0 + w / 2, y + h / 2 + size * 0.36, size, 600, UI, T.fg, 'center');
  }
  g.restore();
  return w;
}
// icon tile: violet illustration tint on surfaces, white/15 with a ring on solid cards
function tile(g, x, y, s, name, { fill = 'rgba(169,139,255,0.13)', color = T.tertiary, weight = 'regular', ring = null, r = 12 } = {}) {
  rr(g, x, y, s, s, r); g.fillStyle = fill; g.fill();
  if (ring) { g.lineWidth = 1; g.strokeStyle = ring; rr(g, x + 0.5, y + 0.5, s - 1, s - 1, r); g.stroke(); }
  icon(g, name, x + s * 0.24, y + s * 0.24, s * 0.52, color, weight);
}
// FrameworkCard: card-violet / card-blue, mark + name, the headline figure and its note
function frameworkCard(g, x, y, w, h, grad, img, name, stat, note) {
  panel(g, x, y, w, h, { grad, border: 'rgba(255,255,255,0.1)' });
  if (img) { g.save(); g.shadowColor = 'rgba(255,255,255,0.6)'; g.shadowBlur = 1; const k = Math.min(48 / img.width, 48 / img.height); g.drawImage(img, x + 24 + (48 - img.width * k) / 2, y + 24 + (48 - img.height * k) / 2, img.width * k, img.height * k); g.restore(); }
  tx(g, name, x + 24 + 48 + 12, y + 24 + 30, 18, 600, DISPLAY, T.fg, 'left', -0.27);
  const lines = wrap(g, note, w - 48, 14, 500, UI);
  const ny = y + h - 24 - (lines.length - 1) * 19;
  lines.forEach((ln, i) => tx(g, ln, x + 24, ny + i * 19, 14, 500, UI, fgA(0.9)));
  tx(g, stat, x + 24, ny - 28, 32, 600, DISPLAY, T.fg, 'left', -1.28);
}
// RadarChart: rings + axes in line-strong, the violet shape grows from the centre
function radar(g, cx, cy, R, axes, vals, k, ka) {
  const n = axes.length, pt = (i, v) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + Math.cos(a) * R * v / 100, cy + Math.sin(a) * R * v / 100]; };
  g.save(); g.globalAlpha *= ka; g.lineWidth = 1; g.strokeStyle = T.lineStrong;
  [25, 50, 75, 100].forEach((r) => { g.beginPath(); for (let i = 0; i <= n; i++) { const [x, y] = pt(i % n, r); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); });
  for (let i = 0; i < n; i++) { const [x, y] = pt(i, 100); g.beginPath(); g.moveTo(cx, cy); g.lineTo(x, y); g.stroke(); }
  axes.forEach((a, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n, lx = cx + Math.cos(ang) * (R + 20), ly = cy + Math.sin(ang) * (R + 20) + 5;
    tx(g, a, lx, ly + (Math.sin(ang) < -0.9 ? -4 : Math.sin(ang) > 0.9 ? 8 : 0), 13, 600, UI, T.muted, Math.cos(ang) > 0.3 ? 'left' : Math.cos(ang) < -0.3 ? 'right' : 'center');
  });
  g.restore();
  if (k <= 0) return;
  g.beginPath(); vals.forEach((v, i) => { const [x, y] = pt(i, v * k); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath();
  g.fillStyle = rgba(T.tertiary, 0.22); g.fill(); g.lineWidth = 2; g.lineJoin = 'round'; g.strokeStyle = T.tertiary; g.stroke();
  vals.forEach((v, i) => { const [x, y] = pt(i, v * k); g.beginPath(); g.arc(x, y, 3.6, 0, Math.PI * 2); g.fillStyle = T.tertiary; g.fill(); });
}
// LogStream: macOS terminal, JetBrains Mono, level column in lowercase
function terminal(g, x, y, w, h, u, { title, cwd, command, t0, lines, size = 14 }) {
  rr(g, x, y, w, h, 12); g.fillStyle = T.canvas; g.fill();
  g.save(); rr(g, x, y, w, h, 12); g.clip();
  g.fillStyle = T.surface; g.fillRect(x, y, w, 40);
  [T.close, T.minimize, T.zoom].forEach((c, i) => { g.beginPath(); g.arc(x + 16 + 6 + i * 20, y + 20, 6, 0, Math.PI * 2); g.fillStyle = c; g.fill(); });
  tx(g, title, x + w / 2, y + 25, 13, 600, UI, T.subtle, 'center');
  const lh = size * 1.75, cw = tw(g, 'M', size, 400, MONO), bx = x + 20;
  let by = y + 40 + 20 + size;
  const prompt = (yy) => {
    tx(g, cwd, bx, yy, size, 400, MONO, T.tertiary);
    const px = bx + tw(g, `${cwd} `, size, 400, MONO);
    g.lineWidth = 1.8; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = T.accent;
    g.beginPath(); g.moveTo(px + 1, yy - size * 0.7); g.lineTo(px + cw * 0.62, yy - size * 0.36); g.lineTo(px + 1, yy - size * 0.02); g.stroke();
    return px + cw * 2;
  };
  const blink = (Math.floor((u * M.GRID.period) / 0.525) % 2) === 0;
  const typed = Math.round(clamp((u - t0) / 0.8) * command.length);
  let cx = prompt(by);
  tx(g, command.slice(0, typed), cx, by, size, 400, MONO, T.fg);
  const shown = lines.filter((l) => u >= l[0]);
  if (u < t0 + 1.1 && ((u >= t0 && u <= t0 + 0.8) || blink)) { g.fillStyle = T.fg; g.fillRect(cx + typed * cw, by - size * 0.92, cw * 0.6, size * 1.15); }
  shown.forEach((l) => {
    by += lh;
    tx(g, l[1], bx, by, size, 700, MONO, LEVEL[l[1]]);
    tx(g, l[2], bx + cw * 7, by, size, 400, MONO, T.muted);
  });
  if (shown.length === lines.length) {
    by += lh; const ex = prompt(by);
    if (blink) { g.fillStyle = T.fg; g.fillRect(ex, by - size * 0.92, cw * 0.6, size * 1.15); }
  }
  g.restore();
  g.lineWidth = 1; g.strokeStyle = T.lineStrong; rr(g, x + 0.5, y + 0.5, w - 1, h - 1, 12); g.stroke();
}
// a reveal helper: alpha + rise, the site's Reveal (DIST 28px, out-expo-ish)
function rise(g, k, dist = 18) { g.globalAlpha *= k; g.translate(0, (1 - k) * dist); }
// FrameworkCard (production): card tone, the mark (round seals in a 48 box, wide wordmarks in a 64 x 36
// box), the name, the headline figure and its note
function frameworkCard2(g, x, y, w, h, grad, img, name, stat, note) {
  panel(g, x, y, w, h, { grad, border: 'rgba(255,255,255,0.1)' });
  let mw = 48;
  if (img) {
    const wide = img.width / img.height > 1.6, bw = wide ? 64 : 48, bh = wide ? 34 : 48;
    const k = Math.min(bw / img.width, bh / img.height), iw = img.width * k, ih = img.height * k;
    g.save(); g.shadowColor = 'rgba(255,255,255,0.6)'; g.shadowBlur = 1;
    g.drawImage(img, x + 24 + (bw - iw) / 2, y + 24 + 24 - ih / 2, iw, ih); g.restore();
    mw = bw;
  }
  tx(g, name, x + 24 + mw + 12, y + 24 + 30, 18, 600, DISPLAY, T.fg, 'left', -0.27);
  const lines = wrap(g, note, w - 48, 14, 500, UI);
  const ny = y + h - 24 - (lines.length - 1) * 19;
  lines.forEach((ln, i) => tx(g, ln, x + 24, ny + i * 19, 14, 500, UI, fgA(0.9)));
  tx(g, stat, x + 24, ny - 28, 32, 600, DISPLAY, T.fg, 'left', -1.28);
}
// the card's tag (production: a roomy white/15 pill with a filled icon; sentence case here)
function tagPill(g, x, y, ico, label) {
  const w = tw(g, label, 14, 700, UI) + 12 + 16 + 8 + 16, h = 36;
  rr(g, x, y, w, h, h / 2); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fill();
  icon(g, ico, x + 12, y + 10, 16, T.fg, 'fill');
  tx(g, label, x + 12 + 16 + 8, y + 23, 14, 700, UI, T.fg);
}
// a hash, drawn as a fingerprint of bars rather than invented hex
function hashGlyph(g, x, y, seed, col) {
  const rnd = M.mulberry32(seed);
  let xx = x;
  for (let i = 0; i < 14; i++) { const w = 1 + Math.floor(rnd() * 3); g.fillStyle = col; g.fillRect(xx, y, w, 14); xx += w + 1 + Math.floor(rnd() * 2); }
  return xx - x;
}
function checkMark(g, cx, cy, r, k, fill = T.accent, ink = T.ink) {
  const s = 0.6 + 0.4 * E.outBack(clamp(k), 2.4);
  g.save(); g.translate(cx, cy); g.scale(s, s);
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fillStyle = fill; g.fill();
  g.lineWidth = r * 0.15; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = ink;
  g.beginPath(); g.moveTo(-r * 0.33, r * 0.03); g.lineTo(-r * 0.1, r * 0.26); g.lineTo(r * 0.36, -r * 0.22); g.stroke(); g.restore();
}
// a status word for alerts and verdicts (status colours are for alert text only)
function verdict(g, x, y, label, col, ico, k = 1, align = 'right') {
  if (k <= 0) return;
  const w = tw(g, label, 13, 700, UI) + 24 + 19, h = 30, x0 = align === 'right' ? x - w : x;
  g.save(); g.globalAlpha *= clamp(k); g.translate(x0 + w / 2, y + h / 2); g.scale(0.85 + 0.15 * Math.min(1, k), 0.85 + 0.15 * Math.min(1, k)); g.translate(-(x0 + w / 2), -(y + h / 2));
  rr(g, x0, y, w, h, h / 2); g.fillStyle = 'rgba(255,255,255,0.04)'; g.fill();
  g.lineWidth = 1; g.strokeStyle = T.lineStrong; rr(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2); g.stroke();
  icon(g, ico, x0 + 12, y + 7, 16, col, 'bold');
  tx(g, label, x0 + 12 + 19, y + 20, 13, 700, UI, col);
  g.restore();
}

// ---------------------------------------------------------------- boards: each component is a canvas on a plane
const BOARDS = {};
function board(name, cfg) {
  const fm = P && cfg.p ? { ...cfg, ...cfg.p } : cfg;
  const b = { name, ...fm };
  b.wpx = b.css[0] * b.s; b.hpx = b.css[1] * b.s;
  b.ts = Math.min(2, 2048 / Math.max(b.wpx, b.hpx));
  const y = b.pose.yaw * DEG;
  b.C = b.pose.C; b.R = [Math.cos(y), 0, -Math.sin(y)]; b.N = [Math.sin(y), 0, Math.cos(y)];
  b.X = b.R.map((v) => (v * b.wpx) / 200); b.Y = [0, b.hpx / 200, 0];
  b.anim = b.anim || [[-1, 1000]];
  BOARDS[name] = b;
  return b;
}
const at = (b, x, y) => [0, 1, 2].map((i) => b.C[i] + b.X[i] * ((x / b.css[0]) * 2 - 1) + b.Y[i] * (1 - (2 * y) / b.css[1]));
const vsub = (a, b) => a.map((v, i) => v - b[i]), vadd = (a, b) => a.map((v, i) => v + b[i]), vsc = (a, k) => a.map((v) => v * k);
const vnorm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
const vcross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function poseFor(b, C, yaw) { const y = yaw * DEG, R = [Math.cos(y), 0, -Math.sin(y)]; return { C, yaw, R, N: [Math.sin(y), 0, Math.cos(y)], X: R.map((v) => (v * b.wpx) / 200), Y: [0, b.hpx / 200, 0] }; }
let CPOSE = {};
const poseOf = (b) => b;

// ---- the two opening headlines: words roll up on the voice, the key word in green
function headline(cfg) {
  return {
    css: cfg.css, s: 1, pose: { C: [0, 0, 0], yaw: 0 }, center: true, occ: false, sampleScale: 1, anim: cfg.anim,
    words(g) {   // per-word boxes in css px, for the reveal and for the particles' elements
      const out = [];
      cfg.lines.forEach((ws, li) => {
        const full = ws.join(' '), W0 = tw(g, full, cfg.size, 600, DISPLAY, -cfg.size * 0.035);
        let x = cfg.css[0] / 2 - W0 / 2;
        ws.forEach((w) => {
          const ww = tw(g, w, cfg.size, 600, DISPLAY, -cfg.size * 0.035);
          out.push({ w, x, y: cfg.y[li], ww });
          x += tw(g, `${w} `, cfg.size, 600, DISPLAY, -cfg.size * 0.035);
        });
      });
      return out;
    },
    draw(g, u) {
      this.words(g).forEach((wd, i) => {
        const t = cfg.t[i], k = eo(u, t, t + 0.75);
        if (k <= 0) return;
        g.save(); g.beginPath(); g.rect(wd.x - 20, wd.y - cfg.size * 1.02, wd.ww + 40, cfg.size * 1.32); g.clip();
        g.globalAlpha = k;
        tx(g, wd.w, wd.x, wd.y + (1 - k) * cfg.size * 0.6, cfg.size, 600, DISPLAY, wd.w.startsWith(cfg.key) ? T.accent : T.fg, 'left', -cfg.size * 0.035);
        g.restore();
      });
    },
  };
}
board('claimA', headline(P
  ? { css: [960, 400], lines: [['The', 'world', 'is'], ['accelerating'], ['with', 'AI.']], size: 104, y: [112, 226, 340], t: [1.85, 2.05, 2.4, 2.8, 3.35, 4.1], key: 'accelerating', anim: [[1.5, 5.2]] }
  : { css: [1720, 200], lines: [['The', 'world', 'is', 'accelerating', 'with', 'AI.']], size: 92, y: [130], t: [1.85, 2.05, 2.4, 2.8, 3.35, 4.1], key: 'accelerating', anim: [[1.5, 5.2]] }));
board('claimB', headline(P
  ? { css: [960, 400], lines: [['Now,', 'AI', 'needs'], ['governance', 'built'], ['for', "what's", 'next.']], size: 88, y: [104, 210, 316], t: [6.85, 7.68, 8.0, 8.64, 9.22, 9.85, 10.2, 10.65], key: 'governance', anim: [[6.4, 11.6]] }
  : { css: [1640, 270], lines: [['Now,', 'AI', 'needs', 'governance'], ['built', 'for', "what's", 'next.']], size: 88, y: [104, 214], t: [6.85, 7.68, 8.0, 8.64, 9.22, 9.85, 10.2, 10.65], key: 'governance', anim: [[6.4, 11.6]] }));

// ---- the wordmark: each letter rises out of its particles with a white flash, a light sweep
// crosses it, the two sparkles spin in. Nothing behind it.
const LOGO_ELS = [[0, 13, 22, 25], [24, 13, 8, 25], [34, 8, 17, 30], [53, 13, 8, 25], [63, 13, 24, 25], [89, 13, 25, 25], [117, 13, 15, 25], [132, 13, 24, 25], [23, 2, 38, 10]];
function letterIn(g, u, t, d, col) {
  const k = eo(u, t, t + 0.5); if (k <= 0) return;
  const fl = 1 - eo(u, t + 0.1, t + 1.0);
  g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 5); g.fillStyle = mixc(col, '#ffffff', fl * 0.85); g.fill(path2(d)); g.restore();
}
function sweep(g, u, t0, w, h) {
  const k = prog(u, t0, t0 + 0.9); if (k <= 0 || k >= 1) return;
  g.save(); g.globalCompositeOperation = 'source-atop';
  const x = lerp(-0.25 * w, 1.25 * w, E.inOutCubic(k)), b = w * 0.12;
  const lg = g.createLinearGradient(x - b, 0, x + b, h * 0.4);
  lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,0.8)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = lg; g.fillRect(0, 0, w, h); g.restore();
}
function drawLogo(g, u, t0) {
  LOGO.letters.forEach((d, i) => letterIn(g, u, t0 + i * 0.07, d, T.accent));
  sweep(g, u, t0 + 0.8, 156, 38);
  LOGO.sparkles.forEach((d, i) => {
    const sk = springB(u, t0 + 0.95 + i * 0.25);
    if (sk <= 0) return;
    const cx = i ? 56.06 : 28.1, cy = 7.38;
    g.save(); g.translate(cx, cy); g.rotate((1 - sk) * 2.2); g.scale(sk, sk); g.translate(-cx, -cy); g.fillStyle = '#FFFFFF'; g.fill(path2(d)); g.restore();
  });
}
board('logoA', { css: [156, 38], s: 6.4, p: { s: 4.6 }, pose: { C: [0, 0, 0], yaw: 0 }, center: true, occ: false, sampleScale: 9, els: LOGO_ELS, anim: [[15.4, 19.4]], draw(g, u) { drawLogo(g, u, 15.9); } });

board('cockpit', {
  css: [640, 600], s: 1.3, pose: { C: [0, 0, -46], yaw: 0 },
  els: [[0, 0, 640, 600], [24, 64, 224, 280], [252, 64, 370, 260], [16, 312, 608, 280]],
  anim: [[48.6, 53.6]],
  draw(g, u) {
    g.save(); rise(g, eo(u, 49.3, 50.1), 14); bezel(g, 0, 0, 640, 600); panel(g, 8, 8, 624, 584); g.restore();
    g.save(); g.globalAlpha = eo(u, 49.5, 50.2); tx(g, 'Governance Health', 36, 52, 16, 600, UI, T.fg); tx(g, 'Pillars', 268, 52, 16, 600, UI, T.fg); g.restore();
    g.save(); g.globalAlpha = eo(u, 49.8, 50.4); scoreRing(g, 140, 186, 176, 78, 'Governance Readiness™', E.outCubic(prog(u, 49.9, 51.9))); g.restore();
    DOMAINS.forEach(([l, v], i) => { const t = 50.4 + i * 0.25, ka = eo(u, t, t + 0.5); if (ka <= 0) return; g.save(); g.globalAlpha = ka; barRow(g, 268, 78 + i * 58, 336, l, v, E.outCubic(prog(u, t + 0.1, t + 1.3))); g.restore(); });
    g.save(); g.globalAlpha = eo(u, 51.3, 51.9); tx(g, 'Needs Attention', 36, 334, 16, 600, UI, T.fg); g.restore();
    FEED.forEach(([c, s], i) => {
      const t = 51.5 + i * 0.28, ka = eo(u, t, t + 0.6); if (ka <= 0) return;
      g.save(); rise(g, ka, 10); field(g, 28, 352 + i * 56, 584, 46);
      tx(g, c, 44, 380 + i * 56, 14, 700, UI, T.fg); tx(g, s, 44 + tw(g, `${c} `, 14, 700, UI), 380 + i * 56, 14, 500, UI, T.muted); g.restore();
    });
  },
});

// ---- the five-stage loop, as the production OrbitSteps ring
const LOOP = { cx: 380, c: 320, R: 196 };
function loopStep(u) { let s = 0; for (let i = 1; i < 5; i++) s += ease(u, STAGE_T[i] - 0.45, STAGE_T[i]); return s; }   // stops on Monitor
function loopActive(u) { let a = -1; for (let i = 0; i < 5; i++) if (u >= STAGE_T[i] - 0.05) a = i; return a; }
const nodeXY = (i, rad = LOOP.R) => { const a = -Math.PI / 2 + (i * TAU) / 5; return [LOOP.cx + Math.cos(a) * rad, LOOP.c + Math.sin(a) * rad, a]; };
board('loop', {
  css: [760, 640], s: 1.12, p: { s: 1.1, frame: { ox: 0, oy: 95 } }, pose: { C: [-9, 1, -58], yaw: 16 }, occ: false,
  els: [[0, 0, 580, 580], ...[0, 1, 2, 3, 4].map((i) => { const [x, y] = nodeXY(i); return [x - 60, y - 40, 120, 80]; }), [230, 240, 300, 160]],
  anim: [[54.0, 69.4]],
  draw(g, u) {
    const { cx, c, R } = LOOP, k0 = eo(u, 54.2, 55.2), s = loopStep(u), act = loopActive(u), live = !this.sampling;
    g.save(); g.lineWidth = 2; g.strokeStyle = T.lineStrong; g.beginPath(); g.arc(cx, c, R, -Math.PI / 2, -Math.PI / 2 + TAU * E.inOutCubic(k0)); g.stroke(); g.restore();
    if (live && s > 0.002) { g.lineWidth = 3; g.lineCap = 'round'; g.strokeStyle = T.accent; g.beginPath(); g.arc(cx, c, R, -Math.PI / 2, -Math.PI / 2 + (s / 5) * TAU); g.stroke(); g.lineCap = 'butt'; }
    const ck = eo(u, 56.3, 56.9);
    if (live && ck > 0) {
      const a = -Math.PI / 2 + (s / 5) * TAU, x = cx + Math.cos(a) * R, y = c + Math.sin(a) * R;
      g.save(); g.globalAlpha = ck; g.fillStyle = rgba(T.accent, 0.18); g.beginPath(); g.arc(x, y, 16, 0, TAU); g.fill();
      g.fillStyle = T.accent; g.beginPath(); g.arc(x, y, 6, 0, TAU); g.fill(); g.restore();
    }
    STAGES.forEach(([name], i) => {
      const [x, y, a] = nodeXY(i), pk = springB(u, 54.5 + i * 0.12);
      if (pk <= 0) return;
      const sel = i === act, vis = act >= 0 && i < act;
      g.save(); g.translate(x, y); g.scale(pk, pk);
      if (sel) { g.save(); g.shadowColor = 'rgba(74,224,87,0.35)'; g.shadowBlur = 22; g.shadowOffsetY = 8; g.beginPath(); g.arc(0, 0, 24, 0, TAU); g.fillStyle = T.accent; g.fill(); g.restore(); }
      else { g.beginPath(); g.arc(0, 0, 23, 0, TAU); g.fillStyle = T.surface; g.fill(); g.lineWidth = 2; g.strokeStyle = vis ? T.accent : T.lineStrong; g.stroke(); }
      tx(g, `0${i + 1}`, 0, 5, 14, 700, UI, sel ? T.ink : vis ? T.accent : T.muted, 'center');
      g.restore();
      const side = Math.abs(Math.cos(a)) > 0.3, lr = R + (side ? 66 : 54), lx = cx + Math.cos(a) * lr + (side ? Math.sign(Math.cos(a)) * 6 : 0), ly = c + Math.sin(a) * lr + 6 + (Math.sin(a) > 0.5 ? 18 : 0);
      g.save(); g.globalAlpha = clamp(pk) * (sel || vis ? 1 : 0.6);
      tx(g, name, lx, ly + (Math.sin(a) < -0.9 ? -6 : 0), 17, 600, DISPLAY, sel || vis ? T.fg : T.subtle, Math.cos(a) > 0.3 ? 'left' : Math.cos(a) < -0.3 ? 'right' : 'center', -0.3);
      g.restore();
    });
    // centre readout: the active stage and its line, swapping as the comet moves on
    for (let i = 0; i < 5 && live; i++) {
      const t0 = STAGE_T[i] - 0.15, t1 = i === 4 ? 1e9 : STAGE_T[i + 1] - 0.15;
      const kin = eo(u, t0, t0 + 0.45), kout = E.inCubic(prog(u, t1, t1 + 0.35));
      if (kin <= 0 || kout >= 1) continue;
      g.save(); g.globalAlpha = kin * (1 - kout); g.translate(0, (1 - kin) * 14 - kout * 14);
      tx(g, STAGES[i][0], cx, c - 6, 32, 600, DISPLAY, T.fg, 'center', -0.96);
      wrap(g, STAGES[i][1], 250, 15, 500, UI).forEach((ln, j) => tx(g, ln, cx, c + 24 + j * 22, 15, 500, UI, T.muted, 'center'));
      g.restore();
    }
  },
});

board('inventory', { old: true,
  css: [600, 410], s: 1.4, p: { s: 1.38 }, pose: { C: [-20, 0.5, -70], yaw: 32 },
  els: [[0, 0, 600, 410], [16, 92, 568, 66], [16, 168, 568, 66], [16, 244, 568, 66], [16, 320, 568, 66], [400, 330, 184, 46]],
  anim: [[62.6, 71.2]],
  draw(g, u) {
    g.save(); rise(g, eo(u, 62.9, 63.6), 14); panel(g, 0, 0, 600, 410); g.restore();
    g.save(); g.globalAlpha = eo(u, 63.0, 63.7);
    tx(g, 'AI inventory', 24, 46, 18, 600, DISPLAY, T.fg, 'left', -0.27);
    tx(g, 'Every model, agent and dataset in one register', 24, 70, 13, 500, UI, T.subtle); g.restore();
    INV.forEach((r, i) => {
      const y = 92 + i * 76, sh = i === 3;
      const ka = sh ? ease(u, r.t, r.t + 1.1) : eo(u, r.t, r.t + 0.6);
      if (ka <= 0) return;
      g.save(); g.globalAlpha = ka; g.translate(sh ? 0 : (1 - ka) * 28, sh ? (1 - ka) * 10 : 0);
      field(g, 16, y, 568, 66);
      tile(g, 30, y + 13, 40, r.icon);
      tx(g, r.name, 84, y + 30, 15, 600, UI, T.fg); tx(g, r.via, 84, y + 50, 13, 500, UI, T.subtle);
      if (!sh) pill(g, 570, y + 19, r.type, { align: 'right' });
      else {
        const sw = ease(u, 69.5, 69.9), ck = ease(u, 70.3, 70.6);
        if (sw < 1) { g.save(); g.globalAlpha *= 1 - sw; pill(g, 570, y + 19, 'Shadow AI', { align: 'right', color: T.warn, ico: 'Warning' }); g.restore(); }
        if (sw > 0) { g.save(); g.globalAlpha *= sw; checkPill(g, 570, y + 13, ck > 0.5 ? 'Registered' : 'Register', ck, { align: 'right' }); g.restore(); }
      }
      g.restore();
    });
  },
});

board('risk', { old: true,
  css: [600, 460], s: 1.4, p: { s: 1.38 }, pose: { C: [-10, -1.5, -86], yaw: 10 },
  els: [[0, 0, 600, 460], [16, 16, 568, 70], [120, 110, 360, 280], [440, 18, 150, 44], [130, 396, 460, 50]],
  anim: [[71.6, 75.8]],
  draw(g, u) {
    g.save(); rise(g, eo(u, 71.8, 72.5), 14); panel(g, 0, 0, 600, 460); g.restore();
    g.save(); g.globalAlpha = eo(u, 72.2, 72.9);
    tile(g, 24, 24, 44, 'ChartLineUp');
    tx(g, 'Credit decision model', 82, 44, 18, 600, DISPLAY, T.fg, 'left', -0.27);
    tx(g, 'Classified under EU AI Act Annex III', 82, 66, 13, 500, UI, T.subtle); g.restore();
    const hk = springB(u, 74.1, { stiffness: 300, damping: 16 });
    if (hk > 0) { g.save(); g.globalAlpha = clamp(hk); g.translate(576, 46); g.scale(hk, hk); g.translate(-576, -46); pill(g, 576, 32, 'High risk', { align: 'right', color: T.risk, ico: 'Warning' }); g.restore(); }
    radar(g, 300, 250, 108, AXES, AXV, E.outCubic(prog(u, 72.9, 74.4)), eo(u, 72.6, 73.2));
    g.save(); g.globalAlpha = eo(u, 74.8, 75.3);
    tx(g, 'Built-in workflow', 24, 430, 13, 500, UI, T.subtle);
    checkPill(g, 576, 404, 'Fundamental rights impact assessment', ease(u, 75.1, 75.4), { align: 'right' }); g.restore();
  },
});

// ---- six FrameworkCards: 3 x 2 (portrait 2 x 3), each landing on its spoken name
const FW = P ? { css: [656, 616], cols: 2, dy: 212 } : { css: [992, 400], cols: 3, dy: 208 };
const fwXY = (i) => [(i % FW.cols) * 336, Math.floor(i / FW.cols) * FW.dy];
board('frameworks', {
  css: FW.css, s: 1.42, p: { s: 1.25 }, pose: { C: [8, -1, -96], yaw: -20 }, occ: false, frame: P ? null : { ox: 0, oy: 118 },
  els: FRAMEWORKS.map((_, i) => [...fwXY(i), 320, 192]),
  anim: [[88.2, 111.6]],
  draw(g, u) {
    FRAMEWORKS.forEach((f, i) => {
      const k = eo(u, f.t, f.t + 0.8); if (k <= 0) return;
      const [x, y] = fwXY(i);
      g.save(); rise(g, k, 26); frameworkCard2(g, x, y, 320, 192, T[f.tone], IMGS[f.logo], f.name, f.stat, f.note); g.restore();
    });
  },
});

board('evidence', { old: true,
  css: [560, 410], s: 1.45, pose: { C: [8, -12, -96], yaw: -20 },
  els: [[0, 0, 560, 410], [28, 128, 504, 54], [28, 192, 504, 54], [28, 256, 504, 54], [20, 20, 64, 64], [20, 324, 240, 60]],
  anim: [[97.0, 100.6]],
  draw(g, u) {
    g.save(); rise(g, eo(u, 97.4, 98.1), 14); panel(g, 0, 0, 560, 410, { grad: T.green, border: 'rgba(255,255,255,0.1)' }); g.restore();
    const sk = springB(u, 99.2, { stiffness: 320, damping: 15 });
    g.save(); g.globalAlpha = eo(u, 97.6, 98.2);
    g.save(); const s = 0.82 + 0.18 * sk; g.translate(52, 52); g.scale(s, s); g.rotate((1 - sk) * -0.3); g.translate(-52, -52);
    tile(g, 28, 28, 48, 'SealCheck', { fill: 'rgba(255,255,255,0.15)', ring: 'rgba(255,255,255,0.2)', color: T.fg, weight: sk > 0.05 ? 'fill' : 'regular' }); g.restore();
    tx(g, 'Audit-ready', 92, 50, 22, 600, DISPLAY, T.fg, 'left', -0.44);
    wrap(g, 'Every action generates timestamped, immutable evidence.', 440, 14, 500, UI).forEach((ln, i) => tx(g, ln, 92, 76 + i * 20, 14, 500, UI, fgA(0.85)));
    g.restore();
    FILES.forEach((f, i) => {
      const t = 98.0 + i * 0.5, ka = eo(u, t, t + 0.55); if (ka <= 0) return;
      const y = 128 + i * 64;
      g.save(); g.globalAlpha = ka; g.translate((1 - ka) * 46, 0);
      field(g, 28, y, 504, 54, { fill: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.1)' });
      icon(g, 'FileText', 44, y + 16, 22, fgA(0.85));
      tx(g, f, 78, y + 33, 15, 600, UI, T.fg);
      g.globalAlpha *= eo(u, t + 0.35, t + 0.7); tx(g, 'Filed', 516, y + 33, 13, 600, UI, fgA(0.8), 'right');
      g.restore();
    });
    g.save(); rise(g, eo(u, 99.9, 100.5), 10); button(g, 28, 336, 'Export for auditors', 'secondary', { h: 44 }); g.restore();
  },
});

// ---- people in the loop: the agent run reaches the human confirmation gate; a person approves
const APPR = P ? { css: [660, 640], term: [0, 0, 660, 360], ok: [169, 376, 322, 264] } : { css: [840, 430], term: [0, 0, 540, 430], ok: [560, 108, 280, 214] };
board('approve', { old: true,
  css: APPR.css, s: P ? 1.3 : 1.08, pose: { C: [-4, -13, -112], yaw: 6 },
  els: [APPR.term, APPR.ok], anim: [[101.0, 105.8]],
  draw(g, u) {
    const [x0, y0, w0, h0] = APPR.term;
    g.save(); rise(g, eo(u, 101.2, 101.9), 14);
    terminal(g, x0, y0, w0, h0, u, { title: 'agents — niticore watch — zsh', cwd: '~/agents', command: 'niticore watch agent', t0: 101.5, lines: RUN, size: 14 });
    g.restore();
    const [x2, y2, w2, h2] = APPR.ok, ka = eo(u, 103.7, 104.4);
    if (ka <= 0) return;
    g.save(); rise(g, ka, 18); panel(g, x2, y2, w2, h2);
    const done = ease(u, 104.85, 105.25);
    if (done < 1) {
      g.save(); g.globalAlpha *= 1 - done;
      tx(g, 'Approval required', x2 + 20, y2 + 40, 18, 600, DISPLAY, T.fg, 'left', -0.27);
      wrap(g, 'Action exceeds pre-approved authority cap', w2 - 40, 14, 500, UI).forEach((ln, i) => tx(g, ln, x2 + 20, y2 + 68 + i * 21, 14, 500, UI, T.muted));
      const press = Math.max(0, 1 - Math.abs(u - 104.65) / 0.18), by = y2 + h2 - 20 - 40;
      const dw = button(g, x2 + 20, by, 'Decline', 'secondary');
      button(g, x2 + 20 + dw + 10, by, 'Approve', 'primary', { press });
      g.restore();
    }
    if (done > 0) {
      g.save(); g.globalAlpha *= done;
      checkMark(g, x2 + 38, y2 + 46, 18, done);
      tx(g, 'Approved', x2 + 68, y2 + 53, 18, 600, DISPLAY, T.fg, 'left', -0.27);
      wrap(g, 'Signed off by a human reviewer and logged for audit', w2 - 40, 14, 500, UI).forEach((ln, i) => tx(g, ln, x2 + 20, y2 + 98 + i * 21, 14, 500, UI, T.muted));
      g.restore();
    }
    g.restore();
  },
});

// ---- six ways governance gets enforced: one product demo each, stacked down the column
function sixFrame(g, u, i, t0) {
  g.save(); rise(g, eo(u, t0, t0 + 0.7), 14);
  panel(g, 0, 0, 600, 440, { grad: T[SIX[i].tone], border: 'rgba(255,255,255,0.1)' });
  tagPill(g, 24, 22, SIX[i].icon, SIX[i].tag);
  panel(g, 24, 76, 552, 340);
  g.restore();
}
function head(g, u, t0, title, sub) {
  g.save(); g.globalAlpha *= eo(u, t0, t0 + 0.6);
  tx(g, title, 44, 110, 16, 600, UI, T.fg); tx(g, sub, 44, 130, 12.5, 500, UI, T.subtle); g.restore();
}
const SIXB = (i, cfg) => board(`six${i}`, { old: true, css: [600, 440], s: 1.35, p: { s: 1.38 }, pose: { C: [10, -14 - 9.5 * i, -124 - 1.5 * i], yaw: -8 }, ...cfg });

const AUDIT = [['Assessment signed', 'FRIA · credit decision model', 'SealCheck'], ['Control mapped', 'Transparency control', 'ShieldCheck'],
  ['Evidence filed', 'Technical documentation', 'FileText'], ['Approval granted', 'Risk Officer', 'UserCheck']];
SIXB(0, {
  els: [[0, 0, 600, 440], ...AUDIT.map((_, i) => [40, 150 + i * 64, 520, 56])],
  anim: [[108.0, 119.4]],
  draw(g, u) {
    sixFrame(g, u, 0, 108.5);
    head(g, u, 108.9, 'Audit trail', 'Every entry carries the hash of the one before it');
    const scan = prog(u, 114.6, 116.4), done = u > 116.5;
    g.save(); g.globalAlpha *= eo(u, 109.2, 109.8);
    if (done) verdict(g, 556, 96, 'Verified on schedule', T.ok || T.accent, 'CheckCircle', springB(u, 116.5));
    else verdict(g, 556, 96, 'Integrity check scheduled', T.muted, 'Clock');
    g.restore();
    AUDIT.forEach(([a, b, ic], i) => {
      const t = 109.6 + i * 0.55, k = eo(u, t, t + 0.5); if (k <= 0) return;
      const y = 150 + i * 64;
      if (i > 0) { const lk = eo(u, t - 0.1, t + 0.4); g.save(); g.setLineDash([3, 4]); g.lineWidth = 1.5; g.strokeStyle = rgba(T.tertiary, 0.8); g.beginPath(); g.moveTo(470, y - 64 + 42); g.lineTo(470, y - 64 + 42 + 36 * lk); g.stroke(); g.restore(); }
      g.save(); g.globalAlpha *= k; g.translate((1 - k) * 30, 0);
      field(g, 40, y, 520, 56);
      tile(g, 52, y + 10, 36, ic);
      tx(g, a, 100, y + 25, 15, 600, UI, T.fg); tx(g, b, 100, y + 43, 12, 500, UI, T.subtle);
      hashGlyph(g, 420, y + 21, 31 + i, fgA(0.5));
      const ok = scan > 0 && 150 + i * 64 + 28 < lerp(150, 406, scan);
      if (ok) checkMark(g, 530, y + 28, 12, clamp((lerp(150, 406, scan) - (y + 28)) / 30));
      else icon(g, 'Fingerprint', 520, y + 18, 20, T.tertiary);
      g.restore();
    });
    if (scan > 0 && scan < 1) { const y = lerp(150, 406, scan); const lg = g.createLinearGradient(40, 0, 560, 0); lg.addColorStop(0, rgba(T.accent, 0)); lg.addColorStop(0.5, rgba(T.accent, 0.9)); lg.addColorStop(1, rgba(T.accent, 0)); g.fillStyle = lg; g.fillRect(40, y - 1, 520, 2); }
  },
});

SIXB(1, {
  els: [[0, 0, 600, 440], [40, 150, 520, 64], [40, 222, 520, 34], [40, 262, 520, 64], [40, 336, 520, 50]],
  anim: [[119.6, 124.4]],
  draw(g, u) {
    sixFrame(g, u, 1, 119.8);
    head(g, u, 120.0, 'Approval request', 'Policy update · authored by the Model Owner');
    const rows = [['Model Owner', 'Author', 120.2], ['Risk Officer', 'Reviewer', 120.5]];
    rows.forEach(([name, role, t], i) => {
      const k = eo(u, t, t + 0.5); if (k <= 0) return;
      const y = i ? 262 : 150;
      g.save(); g.globalAlpha *= k; g.translate((1 - k) * 30, 0);
      field(g, 40, y, 520, 64);
      tile(g, 52, y + 14, 36, 'UserCircle');
      tx(g, name, 100, y + 30, 15, 600, UI, T.fg); tx(g, role, 100, y + 48, 12, 500, UI, T.subtle);
      if (i === 0) {
        const press = Math.max(0, 1 - Math.abs(u - 120.95) / 0.16), blocked = u > 121.1;
        if (!blocked) button(g, 544, y + 12, 'Approve', 'primary', { press, align: 'right' });
        else verdict(g, 544, y + 17, 'Blocked', T.warn, 'Prohibit', springB(u, 121.1));
      } else {
        const press = Math.max(0, 1 - Math.abs(u - 122.6) / 0.16), ok = u > 122.75;
        if (!ok) button(g, 544, y + 12, 'Approve', 'primary', { press, align: 'right' });
        else verdict(g, 544, y + 17, 'Approved', T.accent, 'CheckCircle', springB(u, 122.75));
      }
      g.restore();
    });
    const ak = eo(u, 121.2, 121.7);
    if (ak > 0) { g.save(); g.globalAlpha *= ak; icon(g, 'Prohibit', 46, 230, 16, T.warn, 'bold'); tx(g, "An author can't approve their own work", 70, 243, 13, 700, UI, T.warn); g.restore(); }
    const fk = eo(u, 123.0, 123.5);
    if (fk > 0) { g.save(); g.globalAlpha *= fk; tx(g, 'Role conflicts are blocked before they happen', 44, 372, 13, 500, UI, T.subtle); g.restore(); }
  },
});

const SIGN = [['AISIA', 'AI system impact assessment', 125.6], ['FRIA', 'Fundamental rights impact assessment', 126.5], ['DPIA', 'Data protection impact assessment', 127.4]];
SIXB(2, {
  els: [[0, 0, 600, 440], ...SIGN.map((_, i) => [40, 150 + i * 76, 520, 66])],
  anim: [[124.6, 129.0]],
  draw(g, u) {
    sixFrame(g, u, 2, 124.8);
    head(g, u, 125.0, 'Regulatory assessments', 'Each locked to a named accountable role');
    SIGN.forEach(([a, b, t], i) => {
      const k = eo(u, 125.1 + i * 0.2, 125.6 + i * 0.2); if (k <= 0) return;
      const y = 150 + i * 76;
      g.save(); g.globalAlpha *= k; g.translate((1 - k) * 30, 0);
      field(g, 40, y, 520, 66);
      tile(g, 52, y + 15, 36, 'Scroll');
      tx(g, a, 100, y + 30, 16, 700, UI, T.fg); tx(g, b, 100, y + 49, 12, 500, UI, T.subtle);
      if (u < t) verdict(g, 544, y + 18, 'Awaiting sign-off', T.muted, 'Signature');
      else verdict(g, 544, y + 18, 'Signed · immutable', T.fg, 'Lock', springB(u, t));
      g.restore();
    });
  },
});

const GATE = [['Customer support agent', 'Live risk severity: low', 'Pass', 'ok', 'CheckCircle', 131.3], ['Marketing copy bot', 'Live risk severity: medium', 'Warn', 'warn', 'Warning', 132.1], ['Credit decision model', 'Live risk severity: high', 'Block', 'risk', 'Prohibit', 132.9]];
SIXB(3, {
  els: [[0, 0, 600, 440], [40, 146, 520, 50], ...GATE.map((_, i) => [40, 206 + i * 56, 520, 48]), [40, 376, 520, 32]],
  anim: [[130.6, 134.4]],
  draw(g, u) {
    sixFrame(g, u, 3, 130.8);
    head(g, u, 131.0, 'Deployment gate', 'Callable from any CI pipeline');
    const st = [['Build', 'CheckCircle'], ['Tests', 'CheckCircle'], ['Niticore gate', 'Gauge'], ['Deploy', 'Rocket']];
    g.save(); g.globalAlpha *= eo(u, 131.0, 131.6);
    st.forEach(([l, ic], i) => {
      const x = 66 + i * 130;
      if (i) { g.fillStyle = T.lineStrong; g.fillRect(x - 108, 170, 88, 2); }
      g.beginPath(); g.arc(x, 171, 13, 0, TAU); g.fillStyle = T.raised; g.fill(); g.lineWidth = 1.5; g.strokeStyle = i === 2 ? T.tertiary : T.lineStrong; g.stroke();
      icon(g, ic, x - 8, 163, 16, i < 2 ? T.accent : i === 2 ? T.tertiary : T.subtle, 'bold');
      tx(g, l, x + 20, 176, 13, 600, UI, i === 2 ? T.fg : T.muted);
    });
    g.restore();
    GATE.forEach(([n, sev, d, col, ic, t], i) => {
      const k = eo(u, t - 0.3, t + 0.2); if (k <= 0) return;
      const y = 206 + i * 56;
      g.save(); g.globalAlpha *= k; g.translate((1 - k) * 30, 0);
      field(g, 40, y, 520, 48);
      tx(g, n, 56, y + 21, 14, 600, UI, T.fg); tx(g, sev, 56, y + 38, 12, 500, UI, T.subtle);
      verdict(g, 546, y + 9, d, T[col] || T.accent, ic, springB(u, t));
      g.restore();
    });
    g.save(); g.globalAlpha *= eo(u, 131.4, 132.0);
    tx(g, '~/ci', 44, 398, 13, 400, MONO, T.tertiary); tx(g, 'niticore gate check --live-risk', 44 + tw(g, '~/ci  ', 13, 400, MONO), 398, 13, 400, MONO, T.fg);
    g.restore();
  },
});

SIXB(4, {
  els: [[0, 0, 600, 440], [40, 150, 520, 66], [40, 226, 520, 66], [40, 302, 520, 66]],
  anim: [[135.6, 141.0]],
  draw(g, u) {
    sixFrame(g, u, 4, 135.8);
    head(g, u, 136.0, 'Evidence vault', 'Encrypted, on its own retention schedule');
    const rows = [['FileText', 'Technical documentation', 'Filed evidence'], ['LinkSimple', 'Single-use view link', ''], ['Timer', 'Retention review', 'On its own schedule']];
    const lk = prog(u, 136.9, 139.3), sec = Math.ceil(60 * (1 - lk));
    rows.forEach(([ic, a, b], i) => {
      const k = eo(u, 136.1 + i * 0.25, 136.6 + i * 0.25); if (k <= 0) return;
      const y = 150 + i * 76;
      g.save(); g.globalAlpha *= k; g.translate((1 - k) * 30, 0);
      field(g, 40, y, 520, 66);
      tile(g, 52, y + 15, 36, ic);
      tx(g, a, 100, y + 30, 15, 600, UI, T.fg);
      if (i === 1) tx(g, lk <= 0 ? 'Opens once, expires in 60 seconds' : lk < 1 ? 'Opened once' : 'Expired', 100, y + 48, 12, 500, UI, T.subtle);
      else tx(g, b, 100, y + 48, 12, 500, UI, T.subtle);
      if (i === 0) verdict(g, 546, y + 18, 'Encrypted', T.fg, 'Lock');
      if (i === 1) {
        const cx = 520, cy = y + 33;
        g.lineWidth = 3; g.strokeStyle = T.line; g.beginPath(); g.arc(cx, cy, 18, 0, TAU); g.stroke();
        if (lk < 1) { g.strokeStyle = T.tertiary; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, 18, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - lk)); g.stroke(); g.lineCap = 'butt'; }
        tx(g, lk < 1 ? `${sec}` : '0', cx, cy + 5, 13, 700, UI, lk < 1 ? T.fg : T.subtle, 'center');
      }
      if (i === 2) verdict(g, 546, y + 18, 'Scheduled', T.accent, 'CheckCircle', springB(u, 139.6));
      g.restore();
    });
  },
});

const MAPS = ['EU AI Act · Art. 13', 'EU AI Act · Art. 50', 'ISO/IEC 42001 · A.8.2', 'ISO/IEC 42001 · A.8.3', 'ISO/IEC 42001 · A.5.5', 'ISO/IEC 42001 · A.8.4'];
SIXB(5, {
  els: [[0, 0, 600, 440], [44, 176, 200, 150], [296, 140, 264, 270]],
  anim: [[142.0, 146.4]],
  draw(g, u) {
    sixFrame(g, u, 5, 142.2);
    head(g, u, 142.4, 'Control mapping', 'Filed once, not once per framework');
    const ck = eo(u, 142.6, 143.2);
    if (ck > 0) {
      g.save(); g.globalAlpha *= ck; field(g, 44, 176, 200, 150);
      tile(g, 60, 192, 40, 'ShieldCheck');
      tx(g, 'Transparency', 60, 262, 16, 600, UI, T.fg); tx(g, 'control', 60, 282, 16, 600, UI, T.fg);
      tx(g, 'Filed once', 60, 306, 12, 500, UI, T.subtle);
      g.restore();
    }
    MAPS.forEach((m, j) => {
      const t = 143.0 + j * 0.32, k = eo(u, t - 0.2, t + 0.2), lit = ease(u, t, t + 0.3);
      if (k <= 0) return;
      const y = 140 + j * 45, x = 300;
      g.save(); g.globalAlpha *= k;
      g.lineWidth = 1.5; g.strokeStyle = lit > 0.5 ? rgba(T.accent, 0.8) : rgba(T.tertiary, 0.5);
      g.beginPath(); g.moveTo(244, 251); g.bezierCurveTo(272, 251, 272, y + 16, x, y + 16); g.stroke();
      rr(g, x, y, 256, 32, 16); g.fillStyle = 'rgba(255,255,255,0.04)'; g.fill();
      g.lineWidth = 1; g.strokeStyle = lit > 0.5 ? T.accent : T.lineStrong; rr(g, x + 0.5, y + 0.5, 255, 31, 16); g.stroke();
      if (lit > 0.5) icon(g, 'CheckCircle', x + 10, y + 8, 16, T.accent, 'bold');
      tx(g, m, x + 32, y + 21, 13, 600, UI, lit > 0.5 ? T.fg : T.muted);
      g.restore();
    });
  },
});


// ---- the end card: the niticore-sub wordmark (public/logo/niticore-sub.svg), parsed at init
let SUB = null;
async function loadSub() {
  const src = await fetch('assets/logos/niticore-sub.svg').then((r) => r.text());
  const doc = new DOMParser().parseFromString(src, 'image/svg+xml');
  const c = document.createElement('canvas'); c.width = 500; c.height = 500;
  const g = c.getContext('2d', { willReadFrequently: true });
  const paths = [...doc.querySelectorAll('path')].map((el) => {
    const d = el.getAttribute('d'), fill = el.getAttribute('fill');
    g.clearRect(0, 0, 500, 500); g.fillStyle = '#fff'; g.fill(new Path2D(d));
    const px = g.getImageData(0, 0, 500, 500).data;
    let x0 = 500, y0 = 500, x1 = 0, y1 = 0;
    for (let y = 0; y < 500; y++) for (let x = 0; x < 500; x++) if (px[(y * 500 + x) * 4 + 3] > 20) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    return { d, fill: fill === 'white' ? '#FFFFFF' : fill, box: [x0, y0, x1 + 1, y1 + 1] };
  });
  const big = paths.filter((p) => p.box[3] - p.box[1] > 30);
  const bottom = Math.max(...big.map((p) => p.box[3]));
  const letters = big.sort((a, b) => a.box[0] - b.box[0]);
  const sub = paths.filter((p) => p.box[1] > bottom - 2).sort((a, b) => a.box[0] - b.box[0]);
  const sparkles = paths.filter((p) => !letters.includes(p) && !sub.includes(p)).sort((a, b) => a.box[0] - b.box[0]);
  const all = paths.map((p) => p.box), pad = 4;
  const bx = Math.min(...all.map((b) => b[0])) - pad, by = Math.min(...all.map((b) => b[1])) - pad;
  const bw = Math.max(...all.map((b) => b[2])) + pad - bx, bh = Math.max(...all.map((b) => b[3])) + pad - by;
  SUB = { letters, sub, sparkles, bx, by, bw, bh };
}
const END_T0 = 159.6;
function drawSub(g, u) {
  g.save(); g.translate(-SUB.bx, -SUB.by);
  SUB.letters.forEach((p, i) => letterIn(g, u, END_T0 + i * 0.07, p.d, p.fill));
  SUB.sub.forEach((p, i) => {   // the subtitle types on with the voice
    const t = 162.45 + (i / SUB.sub.length) * 2.1, k = eo(u, t, t + 0.25);
    if (k <= 0) return;
    g.save(); g.globalAlpha = k; g.fillStyle = p.fill; g.fill(path2(p.d)); g.restore();
  });
  g.restore();
  sweep(g, u, END_T0 + 0.85, SUB.bw, SUB.bh);
  sweep(g, u, 165.6, SUB.bw, SUB.bh);
  g.save(); g.translate(-SUB.bx, -SUB.by);
  SUB.sparkles.forEach((p, i) => {
    const sk = springB(u, END_T0 + 0.95 + i * 0.25);
    if (sk <= 0) return;
    const cx = (p.box[0] + p.box[2]) / 2, cy = (p.box[1] + p.box[3]) / 2;
    g.save(); g.translate(cx, cy); g.rotate((1 - sk) * 2.2); g.scale(sk, sk); g.translate(-cx, -cy); g.fillStyle = p.fill; g.fill(path2(p.d)); g.restore();
  });
  g.restore();
}
function defineEndBoard() {
  const s = (P ? 820 : 1060) / SUB.bw, el = (p) => [p.box[0] - SUB.bx, p.box[1] - SUB.by, p.box[2] - p.box[0], p.box[3] - p.box[1]];
  const box = (ps) => { const b = ps.map(el); const x0 = Math.min(...b.map((r) => r[0])), y0 = Math.min(...b.map((r) => r[1])); return [x0, y0, Math.max(...b.map((r) => r[0] + r[2])) - x0, Math.max(...b.map((r) => r[1] + r[3])) - y0]; };
  board('logoEnd', { old: true,
    css: [SUB.bw, SUB.bh], s, pose: { C: [0, 0, -200], yaw: 0 }, center: true, occ: false, sampleScale: 4,
    els: [...SUB.letters.slice(0, NEL - 2).map(el), box(SUB.sparkles), box(SUB.sub)], anim: [[159.2, 166.6]],
    draw(g, u) { drawSub(g, u); },
  });
}

// ---------------------------------------------------------------- the AI-agent avatar (b21-47)
// A glossy violet blob with glowing eyes, built from the wordmark's particles: its skin fills in out of
// that light, it breathes with the voice, and the six agents bud out of its body like liquid. Then it
// acts out the problem itself: amber and flickering ("models no one approved"); stretching until a
// piece tears free and drifts away ("agents acting on their own"); coral and spiky ("risks no one can
// measure"). It calms, takes everything back in, and peels away into the particles that build the cockpit.
const BLOB_C = [0, 0.3, -24], BLOB_R = P ? 2.0 : 2.15, ORBIT = P ? 3.0 : 3.6;
const BLOBF = { C: BLOB_C, pose: { C: BLOB_C, yaw: 0 }, wpx: P ? 700 : 900, hpx: 700 };
let VOENV = null, PHI = null;
const voiceAt = (t) => { if (!VOENV) return 0; const f = t * VOENV.rate, i = Math.floor(f); const a = VOENV.env[i] || 0, b = VOENV.env[i + 1] || 0; return lerp(a, b, f - i); };
const omega = (u) => 0.24 + 1.45 * ease(u, 29.2, 31.6) * (1 - ease(u, 34.2, 36.6));   // orbit speed, radians per beat
function buildPhi() { PHI = new Float32Array(6001); for (let i = 1; i <= 6000; i++) PHI[i] = PHI[i - 1] + omega((i - 0.5) / 100) / 100; }
const phiAt = (u) => { const f = clamp(u * 100, 0, 6000), i = Math.floor(f); return lerp(PHI[i], PHI[Math.min(6000, i + 1)], f - i); };
function orbitPos(i, u) {
  const a = (i * TAU) / 6 + phiAt(u);
  const lx = Math.cos(a) * ORBIT, ly = Math.sin(a) * ORBIT * 0.2 + 0.32 * Math.sin(2 * a + i), lz = Math.sin(a) * ORBIT * 0.85;
  const tl = -0.24, y = ly * Math.cos(tl) - lz * Math.sin(tl), z = ly * Math.sin(tl) + lz * Math.cos(tl);
  return [BLOB_C[0] + lx, BLOB_C[1] + y, BLOB_C[2] + z];
}
const BLINKS = [24.1, 27.6, 31.2, 35.2, 38.8, 42.3, 45.0];
const blinkAt = (u, off = 0) => 1 - Math.max(0, ...BLINKS.map((b) => M.bump(u, b + off, 0.16)));
const VIOLET = [0.36, 0.22, 0.92], AMBER = [0.86, 0.34, 0.03], CORAL = [0.95, 0.09, 0.15];   // linear light, so the moods stay saturated
const TEAR = vnorm([0.78, 0.36, 0.42]);   // the way the runaway piece goes
const mixv = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
// the main blob's mood: every change blends over about a beat
function moodAt(u) {
  const amber = ease(u, 35.8, 36.8), coral = ease(u, 42.9, 43.9), calm = ease(u, 45.1, 45.9);
  return {
    col: mixv(mixv(mixv(VIOLET, AMBER, amber), CORAL, coral), VIOLET, calm),
    k: Math.max(amber, coral) * (1 - calm),
    flick: amber * (1 - ease(u, 39.2, 39.9)),
    spike: ease(u, 43.0, 43.9) * (1 - ease(u, 45.0, 45.8)),
    worry: ease(u, 35.9, 36.6) * (1 - calm) * (0.55 + 0.45 * coral),
  };
}
// an agent starts inside the body and is pushed out through a bud; at the end it flows home
function clonePos(i, u) {
  const e = clamp(E.outBack(prog(u, 25.6 + i * 0.12, 26.6 + i * 0.12)));
  const p = vadd(BLOB_C, vsc(vsub(orbitPos(i, u), BLOB_C), lerp(0.4, 1, e)));
  const home = ease(u, 45.3, 46.2, E.inCubic);
  return vadd(vsc(p, 1 - home), vsc(BLOB_C, home));
}
// the runaway piece: inside the stretch at 39.6, free from 40.4, drifting until it is taken back at 44.9
function piecePos(u) {
  const out = E.outCubic(prog(u, 40.1, 42.6)), home = ease(u, 44.9, 45.7, E.inCubic);
  const d = lerp(BLOB_R * 0.55, BLOB_R + (P ? 1.5 : 1.9), out) * (1 - home) + BLOB_R * 0.3 * home;
  const wob = [noise1(u * 0.8, 61) * 0.25, noise1(u * 0.9, 62) * 0.2, noise1(u * 0.7, 63) * 0.15].map((v) => v * out * (1 - home));
  return vadd(vadd(BLOB_C, vsc(TEAR, d)), wob);
}
function blobScene(u, eye) {
  if (u < 21.5 || u > 47.2) return null;
  const voice = voiceAt(M.TS(u)), md = moodAt(u);
  const rev = ease(u, 22.4, 24.0) * (1 - ease(u, 46.0, 46.9));   // the skin fills in from the light, and peels back into it
  const R = BLOB_R * (1 + 0.14 * md.spike + 0.045 * M.wobble(u - 24.0, 2.2, 4) + 0.012 * Math.sin(u * 1.7));
  const buds = [];
  CLONES.forEach((_, i) => {   // the body stretches toward each agent as it emerges
    const h = 0.55 * Math.sin(Math.PI * prog(u, 25.4 + i * 0.12, 26.7 + i * 0.12));
    if (h > 0.002) buds.push([...vnorm(vsub(clonePos(i, u), BLOB_C)), h, 7]);
  });
  const tear = 0.62 * Math.sin(Math.PI * 0.5 * prog(u, 39.6, 40.35)) * (1 - E.inOutCubic(prog(u, 40.35, 41.2))) + (u > 41.2 ? 0.1 * M.wobble(u - 41.2, 2.4, 4) : 0);
  if (Math.abs(tear) > 0.002) buds.push([...TEAR, tear, 6]);
  const absorb = 0.32 * Math.sin(Math.PI * prog(u, 45.0, 46.0));   // and reaches out to take it back
  if (absorb > 0.002) buds.push([...TEAR, absorb, 6]);
  const pp = piecePos(u), follow = ease(u, 39.9, 40.5) * (1 - ease(u, 44.7, 45.4));
  let look = vnorm(vsub(eye, BLOB_C));
  if (follow > 0) look = vnorm(vadd(vsc(look, 1 - follow), vsc(vnorm(vsub(pp, BLOB_C)), follow)));
  const blobs = [{ C: BLOB_C, R, seed: 1.3, voice, amp: 1, spike: md.spike, tint: md.col, flick: md.flick, glow: 0.06 + 0.12 * voice + 0.16 * md.k,
    look, blink: blinkAt(u), mood: md.worry, rev, buds, main: true }];
  const quiet = 1 - 0.2 * ease(u, 35.4, 36.4);
  CLONES.forEach((_, i) => {
    const e = prog(u, 25.6 + i * 0.12, 26.6 + i * 0.12); if (e <= 0) return;
    const sc = clamp(E.outBack(e)) * (1 - ease(u, 45.3, 46.2, E.inCubic)) * quiet; if (sc <= 0.01) return;
    const p = clonePos(i, u);
    blobs.push({ C: p, R: 0.44 * sc, seed: 3.1 + i * 1.7, voice: 0.3, amp: 1.3, spike: 0, tint: VIOLET, flick: 0, glow: 0.08 * quiet,
      look: vnorm(vsub(eye, p)), blink: blinkAt(u, 0.4 + i * 0.37), mood: 0, rev, buds: [], i });
  });
  const tearing = ease(u, 39.6, 40.1) * (1 - ease(u, 45.3, 45.7));
  if (tearing > 0.01) {
    blobs.push({ C: pp, R: (0.34 + 0.24 * clamp(E.outBack(prog(u, 40.2, 40.9)))) * tearing, seed: 9.7, voice: 0.4, amp: 1.4, spike: md.spike * 0.6,
      tint: md.col, flick: md.flick, glow: 0.18, look: vnorm(vsub(eye, pp)), blink: blinkAt(u, 0.9), mood: 0, rev, buds: [], piece: true });
  }
  return { blobs, R, burst: ease(u, 45.8, 46.4), pre: ease(u, 21.2, 22.0) * (1 - ease(u, 23.4, 24.4)) };
}
function icosphere(level) {
  const t = (1 + Math.sqrt(5)) / 2;
  let v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(vnorm);
  let f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  for (let l = 0; l < level; l++) {
    const cache = new Map(), nf = [];
    const mid = (a, b) => { const k = a < b ? `${a}_${b}` : `${b}_${a}`; if (cache.has(k)) return cache.get(k); v.push(vnorm(vadd(v[a], v[b]).map((x) => x / 2))); cache.set(k, v.length - 1); return v.length - 1; };
    f.forEach(([a, b, c]) => { const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a); nf.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]); });
    f = nf;
  }
  return { pos: new Float32Array(v.flat()), idx: new Uint32Array(f.flat()), n: f.length * 3 };
}

// ---------------------------------------------------------------- the particle story: states and transitions
// rest shapes: 0 nebula · 1 spark · 2 ribbons · 3 the avatar's surface · 4 the loop ring
const SIXN = [0, 1, 2, 3, 4, 5].map((i) => `six${i}`);
const LAYERS = ['claimA', 'claimB', 'logoA', 'cockpit', 'loop', 'inventory', 'risk', 'frameworks', 'evidence', 'approve', ...SIXN, 'logoEnd'];
const LCOUNT = { claimA: 36000, claimB: 42000, logoA: 70000, cockpit: 64000, loop: 48000, inventory: 52000, risk: 52000, frameworks: 72000, evidence: 50000, approve: 56000, logoEnd: 74000 };
SIXN.forEach((n) => (LCOUNT[n] = 52000));
const LSAMPLE = { claimA: 5, claimB: 11.5, logoA: 18, cockpit: 53.5, loop: 67.6, inventory: 71, risk: 77, frameworks: 115.5, evidence: 100.5, approve: 104.5,
  six0: 117, six1: 123.9, six2: 129, six3: 134, six4: 140.5, six5: 147, logoEnd: 168 };
const wordEls = (ts, off, gh) => ts.map((t) => [t + off, gh]);
// element reveal beats + ghost alpha (how strongly the particles hold the shape before it resolves)
const STATES = [
  { rest: 1 },
  { rest: 2 },
  { lay: 'claimA', rest: 2, el: [5.55, 5.6, 5.65, 5.7, 5.75, 5.8].map((t) => [t, 0.24]) },
  { lay: 'claimB', rest: 2, el: wordEls([6.85, 7.68, 8.0, 8.64, 9.22, 9.85, 10.2, 10.65], 0.12, 0.05) },
  { lay: 'logoA', rest: 2, el: [...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => [15.92 + i * 0.07, 0.25]), [16.85, 0.25]] },
  { rest: 3 },
  { lay: 'cockpit', rest: 0, el: [[49.4, 0.3], [49.9, 0.3], [50.4, 0.3], [51.4, 0.3]] },
  { lay: 'loop', rest: 4, nt: true, el: [[54.4, 0.3], ...STAGE_T.slice(0, 5).map((t) => [t, 0.04]), [55.3, 0.1]] },
  { lay: 'inventory', rest: 0, el: [[63.0, 0.3], [63.5, 0.3], [65.1, 0.3], [66.2, 0.3], [68.9, 0], [70.4, 0]] },
  { lay: 'risk', rest: 0, el: [[71.9, 0.3], [72.3, 0.3], [72.9, 0.3], [74.1, 0], [75.1, 0]] },
  { lay: 'frameworks', rest: 0, nt: true, el: FRAMEWORKS.map((f) => [f.t + 0.05, 0.05]) },
  { lay: 'evidence', rest: 0, el: [[97.5, 0.3], [98.0, 0.15], [98.5, 0.15], [99.0, 0.15], [99.2, 0.2], [99.9, 0.05]] },
  { lay: 'approve', rest: 0, el: [[101.3, 0.3], [103.8, 0]] },
  { lay: 'six0', rest: 0, el: [[108.6, 0.3], [109.6, 0], [110.15, 0], [110.7, 0], [111.25, 0]] },
  { lay: 'six1', rest: 0, el: [[119.9, 0.3], [120.2, 0.1], [121.2, 0], [120.5, 0.1], [123.0, 0]] },
  { lay: 'six2', rest: 0, el: [[124.9, 0.3], [125.1, 0.1], [125.3, 0.1], [125.5, 0.1]] },
  { lay: 'six3', rest: 0, el: [[130.9, 0.3], [131.0, 0.2], [131.1, 0], [131.9, 0], [132.7, 0], [131.4, 0.1]] },
  { lay: 'six4', rest: 0, el: [[135.9, 0.3], [136.1, 0.1], [136.35, 0.1], [136.6, 0.1]] },
  { lay: 'six5', rest: 0, el: [[142.3, 0.3], [142.6, 0.1], [143.0, 0]] },
  { rest: 0 },
  { lay: 'logoEnd', rest: 2, el: [...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => [END_T0 + 0.02 + i * 0.07, 0.25]), [END_T0 + 0.95, 0.25], [162.45, 0.03]] },
];
// [K0, Kd, Ks, [ax, ay, bx, by], kr, kc, arc, squeeze]: start beat, per-particle flight, stagger spread,
// stagger weights on the source/target uv, random share, centre-out share, flight curl, stream squeeze
const TR = [
  [0.25, 2.4, 1.4, [0, 0, 0, 0], 0.35, 1.0, 0.5],             // spark → ribbons, unfurling from the centre
  [4.1, 1.0, 0.8, [0, 0, 0.85, 0.15], 0.2, 0, 0.7],           // ribbons → headline one, left to right
  [6.2, 1.3, 0.5, [0.6, 0, 0, 0], 0.3, 0, 1.2],               // headline one → headline two
  [13.6, 1.5, 0.6, [0, 0, 0.8, 0], 0.3, 0, 1.4],              // headline two → wordmark, letter by letter
  [21.0, 1.7, 0.7, [0.4, 0, 0, 0], 0.4, 0, 1.4],              // wordmark → the avatar
  [46.0, 2.0, 0.8, [0, 0, 0.6, 0.15], 0.3, 0, 1.2, 0.9],      // avatar → cockpit
  [53.0, 1.6, 0.6, [0.55, 0.1, 0, 0], 0.3, 0, 2.0, 0.85],     // cockpit → loop
  [61.0, 1.6, 0.6, [0.5, 0, 0, 0], 0.3, 0, 2.0, 0.85],        // loop → inventory
  [71.0, 1.6, 0.55, [0.5, 0.1, 0, 0], 0.3, 0, 2.0, 0.85],     // inventory → risk
  [77.3, 1.6, 0.6, [0.5, 0, 0, 0], 0.3, 0, 2.0, 0.85],        // risk → frameworks
  [96.0, 1.4, 0.5, [0, 0.6, 0, 0], 0.3, 0, 1.6, 0.8],         // frameworks → evidence (top to bottom, with the pan down)
  [100.6, 1.6, 0.55, [0.5, 0, 0, 0], 0.3, 0, 2.0, 0.85],      // evidence → approval
  [106.4, 1.6, 0.6, [0.5, 0, 0, 0], 0.3, 0, 2.0, 0.85],       // approval → audit trail
  [118.6, 1.3, 0.5, [0, 0.6, 0, 0], 0.3, 0, 1.5, 0.8],        // the six demos pour down the column
  [123.6, 1.3, 0.5, [0, 0.6, 0, 0], 0.3, 0, 1.5, 0.8],
  [130.0, 1.3, 0.5, [0, 0.6, 0, 0], 0.3, 0, 1.5, 0.8],
  [135.0, 1.3, 0.5, [0, 0.6, 0, 0], 0.3, 0, 1.5, 0.8],
  [141.4, 1.3, 0.5, [0, 0.6, 0, 0], 0.3, 0, 1.5, 0.8],
  [147.6, 1.8, 0.8, [0.4, 0, 0, 0], 0.5, 0, 2.2],             // → constellation
  [157.9, 1.3, 0.4, [0, 0, 0.8, 0], 0.5, 0, 2.0, 0.5],        // → the end wordmark, letter by letter
];
function shiftTimeline() {
  STATES.forEach((st) => { if (!st.nt && st.el) st.el = st.el.map(([t, gh]) => [sh(t), gh]); });
  TR.forEach((tr) => (tr[0] = sh(tr[0])));
  Object.values(SHOW).forEach((v) => (v[0] = sh(v[0])));
}
const trAt = (u) => { let i = 0; while (i + 1 < TR.length && TR[i + 1][0] <= u) i++; return i; };
// when each board shows, and the transition that dissolves it
const SHOW = { claimA: [1.5, 2], claimB: [6.4, 3], logoA: [15.4, 4], cockpit: [48.8, 6], loop: [54.0, 7], inventory: [62.6, 8], risk: [71.6, 9],
  frameworks: [80.2, 10], evidence: [97.0, 11], approve: [101.0, 12], six0: [108.0, 13], six1: [119.6, 14], six2: [124.6, 15], six3: [130.6, 16],
  six4: [135.6, 17], six5: [142.0, 18], logoEnd: [159.2, null] };
const CONST = ['cockpit', 'loop', 'inventory', 'risk', 'frameworks', 'evidence', 'approve', ...SIXN];

// ---------------------------------------------------------------- camera
function look(b, { yaw = 0, d = 1, dx = 0, dy = 0, lift = 0 } = {}) {
  let ox = 0, oy = 0;
  if (b.frame) { ox = b.frame.ox; oy = b.frame.oy; }
  else if (!b.center) { if (P) { ox = -40; oy = 95; } else { ox = 960 - 96 - b.wpx / 2 - 16; oy = 10; } }
  ox += dx; oy += dy;
  const yr = (b.pose.yaw + yaw) * DEG, v = [Math.sin(yr), lift, Math.cos(yr)], vl = Math.hypot(...v), cr = [Math.cos(yr), 0, -Math.sin(yr)];
  const tgt = [b.C[0] - (cr[0] * ox * d) / 100, b.C[1] + (oy * d) / 100, b.C[2] - (cr[2] * ox * d) / 100];
  return [...tgt.map((t, i) => t + (v[i] / vl) * D0 * d), ...tgt, FOV];
}
let CAM = null;
function buildCam() {
  const B = BOARDS, fr = (e, t, fv = FOV) => [...e, ...t, fv];
  // the constellation: every component again, laid out around the pull-back from the last demo
  const lm = look(B.six5, { yaw: 0, d: 0.95 }), me = lm.slice(0, 3), mt = lm.slice(3, 6);
  const back = vnorm(vsub(me, mt)), backH = vnorm([back[0], 0, back[2]]);
  const Ec = vadd(me, vadd(vsc(backH, 26), [0, 4, 0])), Tc = vadd(Ec, vadd(vsc(backH, -30), [0, -3.2, 0]));
  const f = vnorm(vsub(Tc, Ec)), r = vnorm(vcross(f, [0, 1, 0])), up = vcross(r, f);
  const tv = Math.tan((FOV * DEG) / 2), th = (tv * W) / H;
  const unproj = (sx, sy, d) => vadd(Ec, vsc(vadd(f, vadd(vsc(r, ((sx / W) * 2 - 1) * th), vsc(up, (1 - (sy / H) * 2) * tv))), d));
  const SL = P
    ? { cockpit: [230, 700, 62, 6], loop: [540, 690, 64, 0], inventory: [850, 700, 62, -6], risk: [230, 890, 63, 5], frameworks: [540, 900, 60, 0], evidence: [850, 890, 63, -5],
      approve: [230, 1080, 62, 6], six0: [540, 1075, 64, 0], six1: [850, 1080, 62, -6], six2: [230, 1260, 63, 5], six3: [540, 1255, 64, 0], six4: [850, 1260, 63, -5], six5: [540, 1430, 62, 0] }
    : { cockpit: [1000, 215, 58, 8], loop: [1235, 205, 60, 2], inventory: [1475, 215, 59, -4], risk: [1730, 225, 58, -8], frameworks: [1120, 470, 56, 6], evidence: [1500, 460, 59, 0],
      approve: [1760, 470, 58, -7], six0: [985, 720, 59, 7], six1: [1220, 715, 60, 2], six2: [1455, 720, 59, -2], six3: [1695, 725, 58, -7], six4: [1150, 935, 58, 4], six5: [1420, 935, 58, -4] };
  const yawC = Math.atan2(-f[0], -f[2]) / DEG;
  CONST.forEach((name) => { const [sx, sy, d, yj] = SL[name]; CPOSE[name] = poseFor(B[name], unproj(sx, sy, d), yawC + yj); });
  const Ee = vadd(Ec, vsc(f, 6)), fH = vnorm([f[0], 0, f[2]]);
  Object.assign(B.logoEnd, poseFor(B.logoEnd, vadd(Ee, vsc(fH, D0)), Math.atan2(-fH[0], -fH[2]) / DEG));
  B.logoEnd.pose = { C: B.logoEnd.C, yaw: B.logoEnd.yaw };
  B.CEND = { Ec, Tc, f };
  STATES[19].cen = vadd(Ec, vsc(f, 32));
  const six = (i, t0, t1) => [[t0, look(B[`six${i}`], { yaw: 6 })], [t1, look(B[`six${i}`], { yaw: 0, d: 0.95 })]];
  CAM = [
    [0, fr([0, 0, D0 * 1.04], [0, 0, 0])], [6.0, fr([0, 0.04, D0 * 0.98], [0, 0, 0])], [12.8, fr([0, 0.08, D0 * 0.93], [0, 0, 0])],
    [16.0, fr([0, 0, D0 * 1.0], [0, 0, 0])], [20.6, fr([0, 0.1, D0 * 0.92], [0, 0, 0])],
    [23.8, look(BLOBF, { yaw: -12, d: 1.06 })], [28.8, look(BLOBF, { yaw: 2, d: 1.0 })], [34.4, look(BLOBF, { yaw: 10, d: 0.97 })],
    [37.4, look(BLOBF, { yaw: 6, d: 0.9 })], [40.0, look(BLOBF, { yaw: 2, d: 0.95 })], [42.4, look(BLOBF, { yaw: -2, d: 0.99 })], [44.6, look(BLOBF, { yaw: -4, d: 0.87 })], [45.8, look(BLOBF, { yaw: 0, d: 0.99 })],
    [49.3, look(B.cockpit, { yaw: 9 })], [52.9, look(B.cockpit, { yaw: 3, d: 0.955 })],
    [55.2, look(B.loop, { yaw: -8 })], [68.6, look(B.loop, { yaw: 4, d: 0.95 }), true],
    [63.2, look(B.inventory, { yaw: -8 })], [71.2, look(B.inventory, { yaw: 4, d: 0.945 })],
    [73.2, look(B.risk, { yaw: 9 })], [77.6, look(B.risk, { yaw: 0, d: 0.955 })],
    [79.6, look(B.frameworks, { yaw: 6 })], [96.2, look(B.frameworks, { yaw: -2, d: 0.96 })],
    [98.0, look(B.evidence, { yaw: -7 })], [100.8, look(B.evidence, { yaw: 2, d: 0.955 })],
    [102.8, look(B.approve, { yaw: 7 })], [106.6, look(B.approve, { yaw: -3, d: 0.945 })],
    ...six(0, 108.8, 118.8), ...six(1, 120.4, 123.8), ...six(2, 125.4, 130.2), ...six(3, 131.8, 135.2), ...six(4, 136.8, 141.6), ...six(5, 143.2, 147.8),
    [151.0, fr(Ec, Tc)], [157.6, fr(vadd(Ec, vsc(f, 2.2)), vadd(Tc, vsc(f, 2.2)))],
    [160.4, look(B.logoEnd)], [172, look(B.logoEnd, { d: 0.92 })],
  ].map(([t, v, nt]) => [nt ? t : sh(t), v]);
}


// ---------------------------------------------------------------- camera maths
function slopeAt(keys, i, c) {
  if (i === 0 || i === keys.length - 1) return 0;
  const h0 = keys[i][0] - keys[i - 1][0], h1 = keys[i + 1][0] - keys[i][0];
  const d0 = (keys[i][1][c] - keys[i - 1][1][c]) / h0, d1 = (keys[i + 1][1][c] - keys[i][1][c]) / h1;
  if (d0 * d1 <= 0) return 0;
  const w1 = 2 * h1 + h0, w2 = h1 + 2 * h0;
  return (w1 + w2) / (w1 / d0 + w2 / d1);
}
// monotone cubic (PCHIP) through the keys: continuous velocity, never overshoots a framing
function pchip(keys, u) {
  const n = keys.length;
  if (u <= keys[0][0]) return keys[0][1].slice();
  if (u >= keys[n - 1][0]) return keys[n - 1][1].slice();
  let i = 0; while (keys[i + 1][0] < u) i++;
  const t0 = keys[i][0], h = keys[i + 1][0] - t0, s = (u - t0) / h;
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
  return keys[i][1].map((p0, c) => h00 * p0 + h10 * h * slopeAt(keys, i, c) + h01 * keys[i + 1][1][c] + h11 * h * slopeAt(keys, i + 1, c));
}
function camera(u) {
  const c = pchip(CAM, u);
  const d = [0.04 * noise1(u * 0.21, 3), 0.03 * noise1(u * 0.19, 7), 0.03 * noise1(u * 0.17, 11)];
  return { eye: [c[0] + d[0], c[1] + d[1], c[2] + d[2]], tgt: [c[3], c[4], c[5]], fov: c[6] };
}
function perspective(fovDeg, aspect, near, far) {
  const f = 1 / Math.tan((fovDeg * Math.PI) / 360), nf = 1 / (near - far);
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
}
function lookAt(e, t, up = [0, 1, 0]) {
  let z = [e[0] - t[0], e[1] - t[1], e[2] - t[2]]; const zl = Math.hypot(...z); z = z.map((v) => v / zl);
  let x = [up[1] * z[2] - up[2] * z[1], up[2] * z[0] - up[0] * z[2], up[0] * z[1] - up[1] * z[0]]; const xl = Math.hypot(...x); x = x.map((v) => v / xl);
  const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0,
    -(x[0] * e[0] + x[1] * e[1] + x[2] * e[2]), -(y[0] * e[0] + y[1] * e[1] + y[2] * e[2]), -(z[0] * e[0] + z[1] * e[1] + z[2] * e[2]), 1];
}
const mulv = (m, v) => [0, 1, 2, 3].map((r) => m[r] * v[0] + m[4 + r] * v[1] + m[8 + r] * v[2] + m[12 + r] * v[3]);
function projector(cam) {
  const view = lookAt(cam.eye, cam.tgt), proj = perspective(cam.fov, W / H, 0.1, 400);
  return {
    view, proj, eye: cam.eye, cam,
    to(p) { const v = mulv(view, [p[0], p[1], p[2], 1]), c = mulv(proj, v); return { x: ((c[0] / c[3]) * 0.5 + 0.5) * W, y: (1 - ((c[1] / c[3]) * 0.5 + 0.5)) * H, d: -v[2], ok: -v[2] > 0.25 }; },
  };
}

// ---------------------------------------------------------------- GLSL
const NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;} vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);} vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){ const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
 vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx); vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
 vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy; i=mod289(i);
 vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
 float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx; vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
 vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y); vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
 vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0)); vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
 vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
 vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3))); p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
 vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
 return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3))); }`;
const VS_P = `#version 300 es
precision highp float; precision highp int; precision highp sampler2D;
in float aId;
uniform sampler2D uData;
uniform mat4 uProj, uView; uniform vec3 uEye;
uniform float uU, uFocus, uAper, uGain;
uniform int uLay[2]; uniform float uCnt[2]; uniform int uRest[2];
uniform vec3 uC[2]; uniform vec3 uX[2]; uniform vec3 uY[2];
uniform float uElT[${2 * NEL}]; uniform float uElG[${2 * NEL}];
uniform float uK0, uKd, uKs, uKr, uKc, uArc, uSq; uniform vec4 uKw; uniform vec3 uCA, uCB;
float gHide;
uniform vec3 uPath[12];
uniform float uPt, uRibPhase, uRibY, uRibYaw, uRibK; uniform vec3 uRibO;
uniform vec3 uBlobC; uniform float uBlobR, uBlobP;
uniform vec3 uLpC, uLpX, uLpY; uniform float uLpR, uLpA, uLpK;
uniform vec4 uOcc[12]; uniform int uOccN;
out vec3 vCol; out float vA; out float vSz;
${NOISE}
uint pcg(uint v){ uint s=v*747796405u+2891336453u; uint w=((s>>((s>>28u)+4u))^s)*277803737u; return (w>>22u)^w; }
float R(float k){ return float(pcg(uint(aId)*128u+uint(k)))*(1.0/4294967295.0); }
vec3 sdir(float a,float b){ float z=a*2.-1.; float t=b*6.2831853; float r=sqrt(max(0.,1.-z*z)); return vec3(r*cos(t),z,r*sin(t)); }
vec3 unpack(float c){ float r=floor(c/65536.); float g=floor((c-r*65536.)/256.); float b=c-r*65536.-g*256.; return vec3(r,g,b)/255.; }
mat2 rot(float a){ float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }
const vec3 VIO=vec3(0.663,0.545,1.0), VIO2=vec3(0.545,0.408,0.961), LAV=vec3(0.788,0.722,1.0), WHT=vec3(0.949,0.941,0.984);
const vec3 GRN=vec3(0.29,0.878,0.341);
vec3 pathAt(float s){ float f=clamp(s,0.,0.9999)*11.; int i=int(f); return mix(uPath[i],uPath[i+1],f-float(i)); }
vec3 nebula(out vec3 col,out float al,out vec2 uv){
  vec3 c=pathAt(R(10.)); vec3 d=sdir(R(11.),R(12.));
  float rad=2.5+15.0*pow(R(13.),0.75);
  vec3 p=c+d*rad*vec3(1.25,0.6,1.1);
  float t=uU*0.05+R(14.)*6.2831;
  p+=vec3(sin(t+p.y*0.3),cos(t*0.8+p.x*0.2),sin(t*0.6+p.z*0.25))*0.6;
  float m=R(15.);
  col= m<0.55 ? mix(VIO,WHT,R(16.)*0.6) : (m<0.9 ? VIO2 : LAV);
  al=0.11+0.16*R(17.); if(R(18.)>0.975) al*=3.5;
  al*=0.65+0.35*sin(uU*1.3+R(19.)*40.);
  uv=vec2(R(10.),R(11.));
  return p;
}
vec3 spark(out vec3 col,out float al,out vec2 uv){ col=WHT; al=uPt; uv=vec2(0.5); return sdir(R(20.),R(21.))*0.03*R(22.); }
// three ribbons of light; their flow phase speeds up on "accelerating"
vec3 ribbon(out vec3 col,out float al,out vec2 uv){
  float k=floor(R(23.)*3.); float s=fract(R(24.)+uRibPhase);
  float x=mix(-14.,14.,s); float ph=uU*0.2+k*2.094;
  float y=0.8*sin(x*0.26+ph)+0.28*sin(x*0.67-ph*1.3+k)+(k-1.)*0.6+uRibY;
  float z=1.2*sin(x*0.17+ph*0.7+k*1.7)-0.6;
  float th=0.16+0.1*sin(x*0.45+k*2.+uU*0.3);
  vec2 o=vec2(R(25.)-0.5,(R(26.)-0.5)*0.8)*th*2.0; o=rot(x*0.3+uU*0.12+k)*o;
  vec3 p=vec3(x,y+o.x,z+o.y);
  p.xz=rot(uRibYaw)*p.xz; p+=uRibO;
  col= k<0.5 ? LAV : (k<1.5 ? WHT : VIO2);
  float edge=smoothstep(0.,0.1,s)*smoothstep(1.,0.9,s);
  al=(0.4+0.45*R(27.))*edge*uRibK; if(R(28.)>0.97) al*=2.6;
  uv=vec2(s,k/3.);
  return p;
}
// the avatar's surface: where the wordmark pours in, and what the avatar dissolves into
vec3 blobsurf(out vec3 col,out float al,out vec2 uv){
  if(R(100.)<0.45) return nebula(col,al,uv);
  vec3 d=sdir(R(101.),R(102.));
  float n=0.08*snoise(d*1.3+vec3(0.,uU*0.1,0.));
  vec3 p=uBlobC+d*uBlobR*(1.0+n)*(1.0+0.025*R(103.));
  col=mix(VIO,WHT,0.25+0.5*R(104.)); al=uBlobP*(0.35+0.6*R(105.));
  uv=vec2(atan(d.z,d.x)/6.2831+0.5,d.y*0.5+0.5);
  return p;
}
// the governance loop: light running round the OrbitSteps ring, brightest at the comet
vec3 loopring(out vec3 col,out float al,out vec2 uv){
  if(R(110.)<0.55) return nebula(col,al,uv);
  float a=R(111.)*6.2831853+uU*0.12;
  float rr=uLpR*(1.0+(R(112.)-0.5)*0.035);
  vec3 p=uLpC+normalize(uLpX)*cos(a)*rr+normalize(uLpY)*sin(a)*rr+normalize(cross(uLpX,uLpY))*(0.05+(R(113.)-0.5)*0.1);
  float dA=abs(mod(a-uLpA+3.14159265,6.2831853)-3.14159265);
  col=mix(VIO,GRN,exp(-dA*dA*30.)); al=uLpK*(0.12+0.5*R(114.)+1.6*exp(-dA*dA*18.));
  uv=vec2(R(111.),0.5);
  return p;
}
vec3 primary(int s,out vec3 col,out float al,out vec2 uv){
  int id=int(aId);
  vec4 d=texelFetch(uData,ivec2(id%512,uLay[s]*${RL}+id/512),0);
  uv=d.xy;
  vec3 X=uX[s], Y=uY[s]; vec3 nrm=normalize(cross(X,Y));
  vec3 p=uC[s]+X*(d.x*2.-1.)+Y*(1.-2.*d.y)+nrm*(0.04+0.05*R(80.));
  float el=floor(d.w), bri=fract(d.w);
  col=unpack(d.z);
  int ei=s*${NEL}+int(el);
  float te=uElT[ei], gh=uElG[ei];
  float x=uU-te;
  gHide=(gh<0.001 && x<0.) ? 1. : 0.;
  float flare=smoothstep(-0.12,0.1,x)*exp(-max(x,0.)*2.0);
  al=mix(gh,0.022+0.018*sin(uU*2.+R(81.)*30.),smoothstep(0.,0.3,x))+1.5*flare;
  al*=0.35+0.9*bri;
  return p;
}
vec3 statePos(int s,out vec3 col,out float al,out vec2 uv){
  if(uLay[s]>=0 && aId<uCnt[s]) return primary(s,col,al,uv);
  int r=uRest[s];
  if(r==1) return spark(col,al,uv);
  if(r==2) return ribbon(col,al,uv);
  if(r==3) return blobsurf(col,al,uv);
  if(r==4) return loopring(col,al,uv);
  return nebula(col,al,uv);
}
void main(){
  vec3 cA,cB,col,p; float aA,aB,al; vec2 uvA,uvB; gHide=0.;
  float rnd=R(90.);
  if(uU>=uK0+uKs+uKd){ p=statePos(1,cB,aB,uvB); col=cB; al=aB; }
  else if(uU<=uK0){ p=statePos(0,cA,aA,uvA); col=cA; al=aA; }
  else {
    vec3 pA=statePos(0,cA,aA,uvA); vec3 pB=statePos(1,cB,aB,uvB);
    float st=uKs*clamp(uKw.x*uvA.x+uKw.y*uvA.y+uKw.z*uvB.x+uKw.w*uvB.y+uKc*abs(uvB.x-0.5)*2.+uKr*rnd,0.,1.);
    float k=clamp((uU-uK0-st)/uKd,0.,1.);
    float e=k*k*k*(k*(k*6.-15.)+10.);
    p=mix(pA,pB,e);
    float mv=smoothstep(0.05,0.6,distance(pA,pB));
    float arc=sin(3.14159*e)*mv;
    bool prim=(uLay[0]>=0 && aId<uCnt[0]) || (uLay[1]>=0 && aId<uCnt[1]);
    if(prim && uSq>0.){
      vec3 dir=normalize(uCB-uCA); vec3 n1=normalize(cross(dir,vec3(0.,1.,0.))+vec3(0.,0.,1e-4)); vec3 n2=cross(dir,n1);
      float ang=rnd*6.2831+e*9.0; float rad=(0.2+0.95*R(93.))*(1.1+0.6*sin(e*6.2831+rnd*3.));
      vec3 tube=mix(uCA,uCB,e)+(n1*cos(ang)+n2*sin(ang))*rad;
      p=mix(p,tube,sin(3.14159*e)*uSq);
      arc*=1.-0.75*uSq;
    }
    if(arc>0.001) p+=arc*uArc*vec3(snoise(p*0.11+vec3(rnd*7.,0.,uU*0.04)),snoise(p*0.11+vec3(0.,rnd*7.+3.,uU*0.04)),snoise(p*0.11+vec3(5.,0.,rnd*7.+uU*0.04)));
    float trav=(0.6+0.5*R(91.))*(1.-0.88*gHide)*(prim?1.:0.3);
    float base=mix(aA,aB,smoothstep(0.6,1.,k));
    float tr=mix(mix(aA,trav,smoothstep(0.,0.15,k)),aB,smoothstep(0.82,1.,k));
    al=mix(base,tr,mv);
    col=mix(cA,cB,smoothstep(0.25,0.8,k));
  }
  for(int b=0;b<4;b++){
    if(b>=uOccN) break;
    vec4 c0=uOcc[b*3]; vec3 X=uOcc[b*3+1].xyz, Y=uOcc[b*3+2].xyz; vec3 n=cross(X,Y); vec3 dv=p-uEye; float den=dot(dv,n);
    if(abs(den)<1e-6) continue;
    float t=dot(c0.xyz-uEye,n)/den;
    if(t>0. && t<0.999){ vec3 h=uEye+dv*t-c0.xyz; float lx=dot(h,X)/dot(X,X), ly=dot(h,Y)/dot(Y,Y); if(abs(lx)<0.985 && abs(ly)<0.985) al*=1.-c0.w*0.94; }
  }
  vec4 vp=uView*vec4(p,1.); float depth=-vp.z; gl_Position=uProj*vp;
  float sz=(1.25+1.5*R(92.))*(14.84/max(depth,0.1));
  float coc=uAper*abs(depth-uFocus)/max(depth,0.1)*40.;
  float ps=max(sz+coc,1.0);
  al*=clamp((sz*sz+0.6)/(ps*ps+0.6),0.02,1.)*smoothstep(2.0,7.5,depth);
  gl_PointSize=min(ps,40.);
  vCol=pow(col,vec3(2.2)); vA=al*uGain; vSz=ps;
}`;
// the avatar: an icosphere displaced by noise (and by the voice), glossy studio shading, painted eyes
const VS_BLOB = `#version 300 es
precision highp float;
in vec3 aP;
uniform mat4 uProj, uView; uniform vec3 uC; uniform float uR, uT, uAmp, uVoice, uSpike, uSeed;
uniform vec4 uBud[8]; uniform float uBudK[8]; uniform int uBudN;
out vec3 vN; out vec3 vW; out vec3 vD;
${NOISE}
float disp(vec3 d){
  float r=1.0 + 0.07*uAmp*snoise(d*1.15+vec3(uSeed,uT*0.2,0.))
    + 0.016*snoise(d*2.4+vec3(0.,uSeed,uT*0.6))*(0.5+3.0*uVoice)
    + uSpike*0.34*pow(max(0.,snoise(d*4.6+vec3(uT*0.35,uSeed,0.))),1.6);
  for(int k=0;k<8;k++){ if(k>=uBudN) break; r+=uBud[k].w*exp((dot(d,uBud[k].xyz)-1.0)*uBudK[k]); }
  return r;
}
void main(){
  vec3 d=normalize(aP);
  vec3 t1=normalize(cross(d,abs(d.y)<0.99?vec3(0.,1.,0.):vec3(1.,0.,0.))); vec3 t2=cross(d,t1);
  float e=0.02;
  vec3 p0=d*disp(d); vec3 q1=normalize(d+t1*e); vec3 p1=q1*disp(q1); vec3 q2=normalize(d+t2*e); vec3 p2=q2*disp(q2);
  vec3 n=normalize(cross(p1-p0,p2-p0)); if(dot(n,d)<0.) n=-n;
  vec3 w=uC+p0*uR;
  vN=n; vW=w; vD=d;
  gl_Position=uProj*uView*vec4(w,1.);
}`;
const FS_BLOB = `#version 300 es
precision highp float;
in vec3 vN; in vec3 vW; in vec3 vD;
uniform vec3 uEye, uTint, uLook; uniform float uGlow, uBlink, uMood, uFlick, uRev, uSeed, uT;
out vec4 o;
${NOISE}
void main(){
  float nz=snoise(vD*2.3+vec3(uSeed*3.1,1.7,0.))*0.5+0.5, th=uRev*1.2-0.1;
  if(nz>th) discard;
  vec3 N=normalize(vN), V=normalize(uEye-vW);
  float ndv=clamp(dot(N,V),0.,1.), F=pow(1.-ndv,3.);
  vec3 L1=normalize(vec3(-0.5,0.75,0.55));
  vec3 base=uTint*(1.0-0.16*uFlick*(0.5+0.5*sin(uT*13.0)));
  float dif=0.22+0.78*max(dot(N,L1),0.);
  vec3 Hh=normalize(L1+V); float spec=pow(max(dot(N,Hh),0.),90.)*2.4;
  vec3 R=reflect(-V,N);
  vec3 env=mix(vec3(0.05,0.03,0.14),vec3(0.55,0.45,1.0)*0.45,smoothstep(-0.5,0.9,R.y));
  env+=vec3(1.)*smoothstep(0.86,0.995,dot(R,normalize(vec3(-0.6,0.7,0.4))))*0.9;
  env+=vec3(0.75,0.85,1.)*smoothstep(0.9,0.995,dot(R,normalize(vec3(0.8,0.3,0.5))))*0.4;
  vec3 irid=0.5+0.5*cos(6.2831*(vec3(0.0,0.33,0.67)+(1.-ndv)*1.2+0.55));
  float warm=clamp((base.r-base.b)*1.5,0.,1.);   // amber and coral: less of the violet studio light, so the colour holds
  vec3 col=base*dif*0.85+env*(0.04+0.5*F)*(1.0-0.6*warm)+spec*(1.0-0.4*warm)+irid*F*0.3*vec3(0.6,0.7,1.0)*(1.0-warm)+base*uGlow*(0.4+0.6*(1.-F));
  // two eyes painted on the surface, facing uLook; they blink, and narrow when worried
  vec3 f=normalize(uLook), r=normalize(cross(vec3(0.,1.,0.),f)), u=cross(f,r);
  float eye=0., sock=0.;
  for(int i=0;i<2;i++){
    float sx=i==0?-1.:1.;
    float x=dot(vD,r)-sx*0.26, y=dot(vD,u)-0.07+uMood*sx*x*0.35;
    float h=0.16*max(uBlink,0.06)*(1.-0.45*uMood);
    float q=(x*x)/(0.095*0.095)+(y*y)/(h*h);
    float front=step(0.55,dot(vD,f));
    eye=max(eye,(1.-smoothstep(0.82,1.0,q))*front); sock=max(sock,(1.-smoothstep(1.0,2.6,q))*front);
  }
  col=mix(col,col*0.4,(sock-eye)*0.8);
  col=mix(col,vec3(2.0,2.0,2.3),eye);
  col+=vec3(0.75,0.62,1.0)*3.0*(1.0-smoothstep(0.0,0.07,th-nz))*(1.0-step(0.999,uRev));   // the glowing edge as the skin fills in or peels
  o=vec4(col*0.8,1.);
}`;

const FS_P = `#version 300 es
precision highp float; in vec3 vCol; in float vA; in float vSz; out vec4 o;
void main(){ vec2 q=gl_PointCoord*2.0-1.0; float d2=dot(q,q); if(d2>1.0) discard;
 float g=exp(-d2*3.2); float disc=1.0-smoothstep(0.75,1.0,sqrt(d2)); float k=smoothstep(4.0,12.0,vSz);
 o=vec4(vCol*vA*mix(g,disc*0.55+g*0.2,k),1.0); }`;
const VS_B = `#version 300 es
in vec2 aP; uniform mat4 uProj, uView; uniform vec3 uC, uX, uY; out vec2 vUv;
void main(){ vUv=vec2(aP.x*0.5+0.5,0.5-aP.y*0.5); gl_Position=uProj*uView*vec4(uC+uX*aP.x+uY*aP.y,1.0); }`;
const FS_B = `#version 300 es
precision highp float; in vec2 vUv; uniform sampler2D uT; uniform float uA, uU, uK0, uKd, uKs, uKr; uniform vec2 uKw; uniform int uLeave; out vec4 o;
float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
void main(){ vec4 c=texture(uT,vUv); float a=uA;
 if(uLeave==1){ float rnd=h(floor(vUv*vec2(260.0,180.0))); float st=uKs*clamp(uKw.x*vUv.x+uKw.y*vUv.y+uKr*rnd,0.0,1.0); float k=(uU-uK0-st)/uKd; a*=1.0-smoothstep(0.0,0.14,k); }
 o=c*a; }`;
const VS_QUAD = `#version 300 es
in vec2 aP; out vec2 vUv; void main(){ vUv=aP*0.5+0.5; gl_Position=vec4(aP,0.,1.); }`;
const FS_COPY = `#version 300 es
precision highp float; in vec2 vUv; uniform sampler2D uT; uniform float uGain; out vec4 o;
void main(){ o=vec4(texture(uT,vUv).rgb*uGain,1.0); }`;
const FS_BRIGHT = `#version 300 es
precision highp float; in vec2 vUv; uniform sampler2D uT; uniform vec2 uPx; uniform float uThr; out vec4 o;
void main(){ vec3 c=(texture(uT,vUv+uPx*vec2(-.5,-.5)).rgb+texture(uT,vUv+uPx*vec2(.5,-.5)).rgb+texture(uT,vUv+uPx*vec2(-.5,.5)).rgb+texture(uT,vUv+uPx*vec2(.5,.5)).rgb)*0.25;
 float l=max(c.r,max(c.g,c.b)); o=vec4(c*max(l-uThr,0.)/max(l,1e-4),1.0); }`;
const FS_BLUR = `#version 300 es
precision highp float; in vec2 vUv; uniform sampler2D uT; uniform vec2 uDir; out vec4 o;
void main(){ vec3 c=texture(uT,vUv).rgb*0.2270270;
 c+=texture(uT,vUv+uDir*1.3846153).rgb*0.3162162; c+=texture(uT,vUv-uDir*1.3846153).rgb*0.3162162;
 c+=texture(uT,vUv+uDir*3.2307692).rgb*0.0702702; c+=texture(uT,vUv-uDir*3.2307692).rgb*0.0702702; o=vec4(c,1.0); }`;
const FS_COMP = `#version 300 es
precision highp float; in vec2 vUv; uniform sampler2D uScene, uB1, uB2, uB3, uSt, uCards; uniform vec2 uRes; uniform float uT, uExp, uGrain;
uniform vec3 uBg0, uBg1; out vec4 o;
void main(){ vec2 cc=vUv-0.5; float r=length(cc*vec2(uRes.x/uRes.y,1.)); vec2 off=cc*0.0018;
 vec3 sc=vec3(texture(uScene,vUv+off).r,texture(uScene,vUv).g,texture(uScene,vUv-off).b);
 vec3 bl=texture(uB1,vUv).rgb*0.4+texture(uB2,vUv).rgb*0.55+texture(uB3,vUv).rgb*0.75+texture(uSt,vUv).rgb*vec3(0.55,0.45,1.0)*0.35;
 vec3 L=(sc+bl)*uExp; L=(L*(2.51*L+0.03))/(L*(2.43*L+0.59)+0.14); L=pow(clamp(L,0.,1.),vec3(1.0/2.2));
 vec3 bg=mix(uBg0,uBg1,smoothstep(0.0,1.1,r));
 vec4 cd=texture(uCards,vUv);
 vec3 base=bg*(1.0-cd.a)+cd.rgb;
 vec3 c=1.0-(1.0-base)*(1.0-L);
 c*=mix(1.0,smoothstep(1.35,0.35,r),0.45);
 float n=fract(sin(dot(gl_FragCoord.xy+fract(uT*7.13)*vec2(91.3,47.1),vec2(12.9898,78.233)))*43758.5453);
 c+=(n-0.5)*uGrain; o=vec4(c,1.0); }`;


// ---------------------------------------------------------------- GL plumbing
let G = null;
function setupGL() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const gl = cv.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true, premultipliedAlpha: false, alpha: false });
  if (!gl) throw new Error('WebGL2 unavailable');
  gl.getExtension('EXT_color_buffer_float');
  const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const mk = (vs, fs) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; };
  const progs = { parts: mk(VS_P, FS_P), blob: mk(VS_BLOB, FS_BLOB), board: mk(VS_B, FS_B), copy: mk(VS_QUAD, FS_COPY), bright: mk(VS_QUAD, FS_BRIGHT), blur: mk(VS_QUAD, FS_BLUR), comp: mk(VS_QUAD, FS_COMP) };
  const ids = new Float32Array(N); for (let i = 0; i < N; i++) ids[i] = i;
  const vaoP = gl.createVertexArray(); gl.bindVertexArray(vaoP);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);
  const la = gl.getAttribLocation(progs.parts, 'aId'); gl.enableVertexAttribArray(la); gl.vertexAttribPointer(la, 1, gl.FLOAT, false, 0, 0);
  const mesh = (m) => {
    const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, m.pos, gl.STATIC_DRAW);
    const l = gl.getAttribLocation(progs.blob, 'aP'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.idx, gl.STATIC_DRAW);
    return { vao, n: m.n };
  };
  const meshHi = mesh(icosphere(5)), meshLo = mesh(icosphere(4));
  const vaoQ = gl.createVertexArray(); gl.bindVertexArray(vaoQ);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  for (const p of [progs.board, progs.copy, progs.bright, progs.blur, progs.comp]) { const l = gl.getAttribLocation(p, 'aP'); if (l >= 0) { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0); } }
  const fbo = (w, h, fmt = 'f16', depth = false) => {
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    if (fmt === 'f16') gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    let rb = null;   // depth: true makes a buffer, or pass another target's buffer to share it
    if (depth) { rb = depth === true ? gl.createRenderbuffer() : depth; if (depth === true) { gl.bindRenderbuffer(gl.RENDERBUFFER, rb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, w, h); } gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb); }
    return { f, tex, w, h, rb };
  };
  const texOf = (mip) => {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    if (mip && aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    return t;
  };
  const glowCv = document.createElement('canvas'); glowCv.width = W; glowCv.height = H;
  const cache = new Map();
  const ul = {}; for (const [k, p] of Object.entries(progs)) ul[k] = (n) => { const key = `${k}:${n}`; if (!cache.has(key)) cache.set(key, gl.getUniformLocation(p, n)); return cache.get(key); };
  const scene = fbo(W, H, 'f16', true);
  G = {
    gl, cv, progs, ul, vaoP, vaoQ, meshHi, meshLo, texOf, scene, mesh: fbo(W, H, 'f16', scene.rb), cards: fbo(W, H, 'rgba8'),
    lv: [2, 4, 8].map((d) => [fbo(Math.ceil(W / d), Math.ceil(H / d)), fbo(Math.ceil(W / d), Math.ceil(H / d))]),
    streak: [fbo(Math.ceil(W / 4), Math.ceil(H / 8)), fbo(Math.ceil(W / 4), Math.ceil(H / 8))],
    glowTex: texOf(false), glowCv, glow: glowCv.getContext('2d'),
  };
  // static uniforms: the nebula's path through the film
  gl.useProgram(progs.parts);
  const L = ul.parts;
  gl.uniform1i(L('uData'), 0);
  const B = BOARDS, mid = (b) => b.C.map((v, i) => v + b.N[i] * 7);
  const path = [[0, 0, 8], [0, 0, -10], BLOB_C.map((v, i) => v + [0, 0, 8][i]), mid(B.cockpit), mid(B.loop), mid(B.inventory), mid(B.risk), mid(B.frameworks), mid(B.approve), mid(B.six2), vadd(B.CEND.Ec, vsc(B.CEND.f, 30)), B.logoEnd.C];
  gl.uniform3fv(L('uPath'), path.flat());
}

function quad(prog, target, setup) {
  const { gl } = G;
  gl.useProgram(prog); gl.bindVertexArray(G.vaoQ);
  gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.f : null);
  gl.viewport(0, 0, target ? target.w : W, target ? target.h : H);
  setup();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
function tex(unit, t) { const { gl } = G; gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); }
function upload(t, canvas, mip, flip) {
  const { gl } = G;
  tex(0, t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !!flip); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  if (mip) gl.generateMipmap(gl.TEXTURE_2D);
}

// ---------------------------------------------------------------- particle data: every component sampled into points

// ---------------------------------------------------------------- particle data: every component sampled into points
function sampleLayers() {
  const { gl } = G;
  const data = new Float32Array(TW * RL * LAYERS.length * 4);
  LAYERS.forEach((name, li) => {
    const b = BOARDS[name], sc = b.sampleScale || 1, cw = Math.round(b.css[0] * sc), ch = Math.round(b.css[1] * sc);
    const c = document.createElement('canvas'); c.width = cw; c.height = ch;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.scale(sc, sc); b.sampling = true; b.draw.call(b, g, LSAMPLE[name], b); b.sampling = false;
    const px = g.getImageData(0, 0, cw, ch).data;
    const lum = new Float32Array(cw * ch);
    for (let i = 0; i < cw * ch; i++) lum[i] = (Math.max(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]) / 255) * (px[i * 4 + 3] / 255);
    const cum = new Float64Array(cw * ch); let tot = 0;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const i = y * cw + x, a = px[i * 4 + 3] / 255;
      let w = 0;
      if (a > 0) {
        const gx = x > 0 && x < cw - 1 ? Math.abs(lum[i + 1] - lum[i - 1]) : 0, gy = y > 0 && y < ch - 1 ? Math.abs(lum[i + cw] - lum[i - cw]) : 0;
        w = a * (0.05 + 1.5 * lum[i] ** 1.5) + 1.2 * (gx + gy);
      }
      tot += w; cum[i] = tot;
    }
    // elements: fixed rects, or (headlines) one per word
    const els = b.words ? b.words(g).map((wd) => [wd.x - 6, wd.y - 110, wd.ww + 12, 140]) : b.els || [[0, 0, b.css[0], b.css[1]]];
    const rnd = M.mulberry32(101 + li * 7), off = li * TW * RL * 4, cnt = LCOUNT[name];
    for (let n = 0; n < cnt; n++) {
      const r = rnd() * tot; let lo = 0, hi = cw * ch - 1;
      while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < r) lo = m + 1; else hi = m; }
      const x = lo % cw, y = Math.floor(lo / cw), q = lo * 4;
      const R0 = px[q], G0 = px[q + 1], B0 = px[q + 2], mx = Math.max(R0, G0, B0, 1), l = mx / 255, t = ss(0.15, 0.55, l);
      const cr = Math.round(lerp(169, (R0 * 255) / mx, t)), cg = Math.round(lerp(139, (G0 * 255) / mx, t)), cb = Math.round(lerp(255, (B0 * 255) / mx, t));
      const bri = 0.25 + 0.74 * ss(0.08, 0.7, l);
      const xc = x / sc, yc = y / sc;
      let el = 0;
      for (let e = els.length - 1; e >= 0; e--) { const [ex, ey, ew, eh] = els[e]; if (xc >= ex && xc <= ex + ew && yc >= ey && yc <= ey + eh) { el = e; break; } }
      const o = off + n * 4;
      data[o] = (x + rnd()) / cw; data[o + 1] = (y + rnd()) / ch; data[o + 2] = cr * 65536 + cg * 256 + cb; data[o + 3] = Math.min(el, NEL - 1) + bri * 0.99;
    }
  });
  G.data = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, G.data);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, TW, RL * LAYERS.length, 0, gl.RGBA, gl.FLOAT, data);
  for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
}

// ---------------------------------------------------------------- per-frame GL
const EXP = (u) => M.kf(u, [[0, 1.45], [15.7, 1.45], [16.0, 2.0], [17.6, 1.45], [179.4, 1.45], [179.8, 2.0], [181.6, 1.4]], E.inOutSine);
function visible(u) {
  const out = [], add = (b, a, leave, final, pose) => { const p = pose || b; out.push({ b, a, leave, final, C: p.C, X: p.X, Y: p.Y }); };
  const cl = (i) => (u > 176.6 ? [176.8 + i * 0.07, 0.6, 0.8, 0.8, 0, 0.4] : null);
  for (const [name, [from, leave]] of Object.entries(SHOW)) {
    if (u < from) continue;
    const b = BOARDS[name];
    if (leave !== null) { const tr = TR[leave]; if (u > tr[0] + tr[2] + tr[1] + 0.05) continue; add(b, 1, [tr[0], tr[1], tr[2], tr[3][0], tr[3][1], tr[4]]); }
    else add(b, 1, null);
  }
  if (u > 168.2 && u < 178.6) CONST.forEach((name, i) => {
    const a = ease(u, 168.4 + i * 0.16, 169.6 + i * 0.16) * 0.94;
    if (a > 0) add(BOARDS[name], a, cl(i), true, CPOSE[name]);
  });
  return out;
}
function boardTex(b, u, final) {
  // a still board is always drawn at one fixed moment (the end of its last animation), so frames
  // rendered in different chunks can never disagree about it
  const ub = b.old ? unsh(u) : u;
  let key = 'final', ud = 1000;
  if (!final) {
    const live = b.anim.findIndex(([a, c]) => ub >= a && ub <= c);
    if (live >= 0) { key = `u${ub.toFixed(4)}`; ud = ub; }
    else { const n = b.anim.filter(([, c]) => ub > c).length; key = `h${n}`; ud = n > 0 ? b.anim[n - 1][1] : b.anim[0][0] - 0.01; }
  }
  if (!b.cv) { b.cv = document.createElement('canvas'); b.cv.width = Math.ceil(b.wpx * b.ts); b.cv.height = Math.ceil(b.hpx * b.ts); b.g = b.cv.getContext('2d'); b.tex = G.texOf(true); }
  if (b.texKey === key) return b.tex;
  const k = b.cv.width / b.css[0];
  b.g.setTransform(1, 0, 0, 1, 0, 0); b.g.clearRect(0, 0, b.cv.width, b.cv.height); b.g.setTransform(k, 0, 0, k, 0, 0);
  b.draw.call(b, b.g, ud, b);
  upload(b.tex, b.cv, true, false); b.texKey = key;
  return b.tex;
}
function stateUniforms(L, gl, sA, sB) {
  const st = [STATES[sA], STATES[sB]];
  const lay = st.map((s) => (s.lay ? LAYERS.indexOf(s.lay) : -1)), bd = st.map((s) => (s.lay ? BOARDS[s.board || s.lay] : null));
  gl.uniform1iv(L('uLay'), lay); gl.uniform1fv(L('uCnt'), st.map((s) => (s.lay ? LCOUNT[s.lay] : 0))); gl.uniform1iv(L('uRest'), st.map((s) => s.rest));
  gl.uniform3fv(L('uC'), bd.flatMap((b) => (b ? b.C : [0, 0, 0]))); gl.uniform3fv(L('uX'), bd.flatMap((b) => (b ? b.X : [1, 0, 0]))); gl.uniform3fv(L('uY'), bd.flatMap((b) => (b ? b.Y : [0, 1, 0])));
  const et = new Float32Array(2 * NEL).fill(-100), eg = new Float32Array(2 * NEL);
  st.forEach((s, k) => (s.el || []).slice(0, NEL).forEach(([t, gh], e) => { et[k * NEL + e] = t; eg[k * NEL + e] = gh; }));
  gl.uniform1fv(L('uElT'), et); gl.uniform1fv(L('uElG'), eg);
  const cen = (s, b, dflt) => (b ? b.C : s.cen || dflt);
  gl.uniform3fv(L('uCA'), cen(st[0], bd[0], [0, 0, 0])); gl.uniform3fv(L('uCB'), cen(st[1], bd[1], [0, 0, 1]));
}
// the ribbons' flow: an integrated speed, so it can surge on "accelerating" and settle again
const ribSpeed = (u) => 0.014 + 0.05 * ease(u, 2.6, 4.6) * (1 - ease(u, 5.4, 7.6));
let RIBPH = null;
function buildRib() { RIBPH = new Float32Array(2001); for (let i = 1; i <= 2000; i++) RIBPH[i] = RIBPH[i - 1] + ribSpeed((i - 0.5) / 100) / 100; }
const ribPhase = (u) => (u <= 20 ? (() => { const f = Math.max(0, u * 100), i = Math.floor(f); return lerp(RIBPH[i], RIBPH[Math.min(2000, i + 1)], f - i); })() : RIBPH[2000] + (u - 20) * 0.014);
function drawBlobs(gl, sc, sb) {
  const LB = G.ul.blob;
  gl.useProgram(G.progs.blob);
  gl.uniformMatrix4fv(LB('uProj'), false, sb.pj.proj); gl.uniformMatrix4fv(LB('uView'), false, sb.pj.view);
  gl.uniform3fv(LB('uEye'), sb.cam.eye); gl.uniform1f(LB('uT'), sb.u);
  sc.blobs.forEach((b) => {
    if (b.R < 0.01) return;
    const m = b.main ? G.meshHi : G.meshLo;
    gl.bindVertexArray(m.vao);
    const bd = new Float32Array(32), bk = new Float32Array(8);
    b.buds.slice(0, 8).forEach((x, k) => { bd.set(x.slice(0, 4), k * 4); bk[k] = x[4]; });
    gl.uniform4fv(LB('uBud'), bd); gl.uniform1fv(LB('uBudK'), bk); gl.uniform1i(LB('uBudN'), Math.min(8, b.buds.length));
    gl.uniform3fv(LB('uC'), b.C); gl.uniform1f(LB('uR'), b.R);
    gl.uniform1f(LB('uAmp'), b.amp); gl.uniform1f(LB('uVoice'), b.voice); gl.uniform1f(LB('uSpike'), b.spike); gl.uniform1f(LB('uSeed'), b.seed);
    gl.uniform3fv(LB('uTint'), b.tint); gl.uniform1f(LB('uFlick'), b.flick); gl.uniform1f(LB('uRev'), b.rev);
    gl.uniform3fv(LB('uLook'), b.look); gl.uniform1f(LB('uBlink'), b.blink); gl.uniform1f(LB('uMood'), b.mood); gl.uniform1f(LB('uGlow'), b.glow);
    gl.drawElements(gl.TRIANGLES, m.n, gl.UNSIGNED_INT, 0);
  });
}
function renderGL(u, t, subs, vis, cam, pj, glowUsed) {
  const { gl, progs, ul } = G;
  gl.bindFramebuffer(gl.FRAMEBUFFER, G.scene.f); gl.viewport(0, 0, W, H);
  gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
  const L = ul.parts;
  const occ = vis.filter((v) => v.b.occ !== false && v.a > 0.05).map((v) => {
    let a = v.a; if (v.leave) a *= 1 - clamp((u - v.leave[0]) / (v.leave[1] + v.leave[2]));
    return { v, a, d: Math.hypot(...v.C.map((c, i) => c - cam.eye[i])) };
  }).filter((o) => o.a > 0.02).sort((a, b) => a.d - b.d).slice(0, 4);
  const occU = new Float32Array(48).map((_, i) => { const o = occ[Math.floor(i / 12)]; if (!o) return 0; const r = Math.floor((i % 12) / 4), c = i % 4; const src = r === 0 ? [...o.v.C, o.a] : r === 1 ? [...o.v.X, 0] : [...o.v.Y, 0]; return src[c]; });
  for (const sb of subs) {
    const uu = sb.u, i = trAt(uu), tr = TR[i];
    const sc = blobScene(uu, sb.cam.eye);
    if (sc) {   // the avatar is opaque: drawn on its own (sharing the scene's depth), then added in at this sub-frame's weight
      gl.bindFramebuffer(gl.FRAMEBUFFER, G.mesh.f); gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 0); gl.depthMask(true); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LESS); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
      drawBlobs(gl, sc, sb);
      gl.disable(gl.CULL_FACE); gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      quad(progs.copy, G.scene, () => { tex(0, G.mesh.tex); gl.uniform1i(ul.copy('uT'), 0); gl.uniform1f(ul.copy('uGain'), 1 / subs.length); });
    } else { gl.bindFramebuffer(gl.FRAMEBUFFER, G.scene.f); gl.depthMask(true); gl.clear(gl.DEPTH_BUFFER_BIT); }
    gl.bindFramebuffer(gl.FRAMEBUFFER, G.scene.f); gl.viewport(0, 0, W, H);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(false);
    gl.useProgram(progs.parts); gl.bindVertexArray(G.vaoP); tex(0, G.data);
    gl.uniform4fv(L('uOcc'), occU); gl.uniform1i(L('uOccN'), occ.length);
    stateUniforms(L, gl, i, i + 1);
    gl.uniform1f(L('uK0'), tr[0]); gl.uniform1f(L('uKd'), tr[1]); gl.uniform1f(L('uKs'), tr[2]); gl.uniform4fv(L('uKw'), tr[3]);
    gl.uniform1f(L('uKr'), tr[4]); gl.uniform1f(L('uKc'), tr[5]); gl.uniform1f(L('uArc'), tr[6]); gl.uniform1f(L('uSq'), tr[7] || 0);
    gl.uniformMatrix4fv(L('uProj'), false, sb.pj.proj); gl.uniformMatrix4fv(L('uView'), false, sb.pj.view); gl.uniform3fv(L('uEye'), sb.cam.eye);
    gl.uniform1f(L('uU'), uu); gl.uniform1f(L('uGain'), 1 / subs.length);
    gl.uniform1f(L('uFocus'), Math.hypot(...sb.cam.eye.map((e, k) => e - sb.cam.tgt[k])));
    const fog = ease(uu, 31.4, 33.6) * (1 - ease(uu, 34.6, 36.4));
    gl.uniform1f(L('uAper'), 0.012 + 0.07 * fog);
    gl.uniform1f(L('uPt'), 0.006 * ease(uu, 0, 0.3));
    // ribbons: around the headlines at the open, far behind the end card at the close
    const endR = uu > 170, eb = BOARDS.logoEnd;
    gl.uniform1f(L('uRibPhase'), ribPhase(uu)); gl.uniform1f(L('uRibY'), endR ? (P ? -4.8 : -4.4) : P ? -3.9 : -2.25);
    gl.uniform3fv(L('uRibO'), endR ? vadd(eb.C, vsc(eb.N, -6)) : [0, 0, 0]); gl.uniform1f(L('uRibYaw'), endR ? eb.yaw * DEG : 0);
    gl.uniform1f(L('uRibK'), endR ? 0.32 : 1 - 0.45 * ease(uu, 13.6, 16.0));
    const bs = sc || { R: BLOB_R, burst: uu > 46 ? 1 : 0, pre: 0 };
    gl.uniform3fv(L('uBlobC'), BLOB_C); gl.uniform1f(L('uBlobR'), Math.max(0.3, bs.R)); gl.uniform1f(L('uBlobP'), Math.max(bs.burst, bs.pre));
    const lb = BOARDS.loop;
    gl.uniform3fv(L('uLpC'), lb.C); gl.uniform3fv(L('uLpX'), lb.X); gl.uniform3fv(L('uLpY'), lb.Y); gl.uniform1f(L('uLpR'), (LOOP.R * lb.s) / 100); gl.uniform3fv(L('uLpC'), at(lb, LOOP.cx, LOOP.c));
    gl.uniform1f(L('uLpA'), Math.PI / 2 - (loopStep(uu) / 5) * TAU); gl.uniform1f(L('uLpK'), 0.6 * ease(uu, 54.4, 55.4));
    gl.drawArrays(gl.POINTS, 0, N);
  }
  gl.disable(gl.DEPTH_TEST); gl.depthMask(true);
  if (glowUsed) {
    upload(G.glowTex, G.glowCv, false, true);
    quad(progs.copy, G.scene, () => { tex(0, G.glowTex); gl.uniform1i(ul.copy('uT'), 0); gl.uniform1f(ul.copy('uGain'), 1.4); });
  }
  gl.disable(gl.BLEND);
  let src = G.scene;
  G.lv.forEach(([a, b], i) => {
    quad(progs.bright, a, () => { tex(0, src.tex); gl.uniform1i(ul.bright('uT'), 0); gl.uniform2f(ul.bright('uPx'), 1 / src.w, 1 / src.h); gl.uniform1f(ul.bright('uThr'), i === 0 ? 0.5 : 0.0); });
    quad(progs.blur, b, () => { tex(0, a.tex); gl.uniform1i(ul.blur('uT'), 0); gl.uniform2f(ul.blur('uDir'), 1 / a.w, 0); });
    quad(progs.blur, a, () => { tex(0, b.tex); gl.uniform1i(ul.blur('uT'), 0); gl.uniform2f(ul.blur('uDir'), 0, 1 / a.h); });
    src = a;
  });
  const [sa, sb2] = G.streak;
  quad(progs.bright, sa, () => { tex(0, G.lv[0][0].tex); gl.uniform1i(ul.bright('uT'), 0); gl.uniform2f(ul.bright('uPx'), 1 / G.lv[0][0].w, 1 / G.lv[0][0].h); gl.uniform1f(ul.bright('uThr'), 0.7); });
  [2, 5, 11, 22].forEach((st, i) => {
    const [a, b] = i % 2 ? [sb2, sa] : [sa, sb2];
    quad(progs.blur, b, () => { tex(0, a.tex); gl.uniform1i(ul.blur('uT'), 0); gl.uniform2f(ul.blur('uDir'), st / a.w, 0); });
  });
  // the components, crisp, on their planes (premultiplied, back to front)
  gl.bindFramebuffer(gl.FRAMEBUFFER, G.cards.f); gl.viewport(0, 0, W, H);
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.useProgram(progs.board); gl.bindVertexArray(G.vaoQ);
  const LB = ul.board;
  gl.uniformMatrix4fv(LB('uProj'), false, pj.proj); gl.uniformMatrix4fv(LB('uView'), false, pj.view);
  gl.uniform1i(LB('uT'), 0); gl.uniform1f(LB('uU'), u);
  vis.slice().sort((a, b) => Math.hypot(...b.C.map((c, i) => c - cam.eye[i])) - Math.hypot(...a.C.map((c, i) => c - cam.eye[i]))).forEach((v) => {
    tex(0, v.tex);
    gl.uniform3fv(LB('uC'), v.C); gl.uniform3fv(LB('uX'), v.X); gl.uniform3fv(LB('uY'), v.Y); gl.uniform1f(LB('uA'), v.a);
    gl.uniform1i(LB('uLeave'), v.leave ? 1 : 0);
    if (v.leave) { const [k0, kd, ks, ax, ay, kr] = v.leave; gl.uniform1f(LB('uK0'), k0); gl.uniform1f(LB('uKd'), kd); gl.uniform1f(LB('uKs'), ks); gl.uniform2f(LB('uKw'), ax, ay); gl.uniform1f(LB('uKr'), kr); }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  });
  gl.disable(gl.BLEND);
  quad(progs.comp, null, () => {
    tex(0, G.scene.tex); tex(1, G.lv[0][0].tex); tex(2, G.lv[1][0].tex); tex(3, G.lv[2][0].tex); tex(4, sa.tex); tex(5, G.cards.tex);
    const C = ul.comp;
    gl.uniform1i(C('uScene'), 0); gl.uniform1i(C('uB1'), 1); gl.uniform1i(C('uB2'), 2); gl.uniform1i(C('uB3'), 3); gl.uniform1i(C('uSt'), 4); gl.uniform1i(C('uCards'), 5);
    gl.uniform2f(C('uRes'), W, H); gl.uniform1f(C('uT'), t); gl.uniform1f(C('uExp'), EXP(u)); gl.uniform1f(C('uGrain'), 0.025);
    gl.uniform3fv(C('uBg0'), [0x10 / 255, 0x09 / 255, 0x36 / 255]); gl.uniform3fv(C('uBg1'), [0x06 / 255, 0x01 / 255, 0x1f / 255]);
  });
}

// ---------------------------------------------------------------- accents that bloom (2D, uploaded into the HDR scene)
function flowDots(g, a, z, bend, u, t0, col, n = 26, speed = 0.9) {
  if (!a.ok || !z.ok) return false;
  const m = { x: (a.x + z.x) / 2 + bend[0], y: (a.y + z.y) / 2 + bend[1] };
  let any = false;
  for (let k = 0; k < n; k++) {
    const f = (u - t0) * speed - k * 0.035; if (f < 0 || f > 1) continue;
    const x = (1 - f) ** 2 * a.x + 2 * (1 - f) * f * m.x + f * f * z.x, y = (1 - f) ** 2 * a.y + 2 * (1 - f) * f * m.y + f * f * z.y;
    g.fillStyle = col((1 - k / n) * 0.9); g.beginPath(); g.arc(x, y, 2.6 - k * 0.06, 0, TAU); g.fill(); any = true;
  }
  return any;
}
const green = (a) => `rgba(74,224,87,${a})`, lilac = (a) => `rgba(201,184,255,${a})`;
function accents(g, u, pj) {
  let used = false;
  const sp = (b, x, y) => pj.to(at(b, x, y));
  // frameworks: once all six have landed, light threads cross-map them
  if (u > 111.6 && u < 116.2) {
    const b = BOARDS.frameworks, c = (i) => { const [x, y] = fwXY(i); return sp(b, x + 160, y + 96); };
    const fade = 1 - ease(u, 115.2, 116.0);
    [[0, 1], [0, 2], [1, 4], [2, 5], [3, 4], [4, 5], [0, 3]].forEach(([i, j], n) => {
      if (flowDots(g, c(i), c(j), [0, -50], u, 111.8 + n * 0.18, (a) => green(a * fade), 22, 0.9)) used = true;
    });
  }
  const uo = unsh(u);   // the rest is on the old grid
  // a short ring each: the registered shadow AI, the evidence seal, the approval
  [[70.4, 'inventory', 500, 353, 'rgba(74,224,87,'], [99.2, 'evidence', 52, 52, 'rgba(255,255,255,'], [104.6, 'approve', APPR.ok[0] + APPR.ok[2] - 60, APPR.ok[1] + APPR.ok[3] - 40, 'rgba(74,224,87,']].forEach(([t0, name, x, y, col]) => {
    if (uo < t0 || uo > t0 + 1.0) return;
    const c = sp(BOARDS[name], x, y), k = prog(uo, t0, t0 + 1.0);
    if (c.ok) { g.strokeStyle = `${col}${0.7 * (1 - k)})`; g.lineWidth = 2.5; g.beginPath(); g.arc(c.x, c.y, 16 + k * 120, 0, TAU); g.stroke(); used = true; }
  });
  // the mapping demo: light runs from the control to each clause it satisfies
  if (uo > 142.9 && uo < 146.6) {
    const b = BOARDS.six5, a = sp(b, 244, 251);
    MAPS.forEach((_, j) => { if (flowDots(g, a, sp(b, 300, 156 + j * 45), [10, 0], uo, 142.9 + j * 0.32, green, 16, 1.6)) used = true; });
  }
  // the constellation: light travels the path we flew, component to component
  if (uo > 148.6 && uo < 157.6) {
    const k = ease(uo, 148.6, 150.2) * (1 - ease(uo, 156.6, 157.6));
    for (let i = 0; i < CONST.length - 1; i++) {
      const a = pj.to(CPOSE[CONST[i]].C), z = pj.to(CPOSE[CONST[i + 1]].C); if (!a.ok || !z.ok) continue;
      for (let n = 0; n < 30; n++) {
        const f = (n / 30 + u * 0.06) % 1, x = lerp(a.x, z.x, f), y = lerp(a.y, z.y, f) - Math.sin(f * Math.PI) * 26;
        g.fillStyle = lilac(0.55 * k * Math.sin(f * Math.PI)); g.beginPath(); g.arc(x, y, 1.7, 0, TAU); g.fill(); used = true;
      }
    }
  }
  return used;
}


// ---------------------------------------------------------------- type and labels over the film (2D, crisp)
const CAPS = [
  [24.2, 28.6, [['AI is already '], ['everywhere', 1], ['.']], 'Models, agents, vendor tools and embedded APIs.'],
  [29.0, 34.9, [['Moving faster than anyone can '], ['see', 1], ['.']], null],
  [48.9, 52.9, [['One '], ['clear', 1], [' view.']], 'Every AI system, in one place.'],
  [54.1, 68.4, [['One continuous '], ['loop', 1], ['.']], 'Each stage feeds the next.'],
  [70.4, 78.9, [['Discover', 1], [' every model, agent and dataset.']], null],
  [79.8, 85.3, [['Assess', 1], [' the risk of each one.']], 'The moment it appears.'],
  [85.9, 115.6, [['Align', 1], [' with governance frameworks such as…']], null, true],
  [116.6, 120.5, [['Evidence, '], ['audit-ready', 1], [', always.']], 'File once, satisfy everywhere.'],
  [121.6, 126.4, [['People in the '], ['loop', 1], ['.']], 'A person signs off when it matters most.'],
  [170.6, 177.4, [['Innovate with '], ['confidence', 1], ['.']], 'And prove it.'],
];
const CAP = P ? { x: S.x, top: 300, size: 64, maxW: S.w, lead: 30 } : { x: 110, top: 404, size: 62, maxW: 790, lead: 26 };
const CAP_TOP = P ? CAP : { x: 110, top: 104, size: 60, maxW: 1700, lead: 26 };
function layoutWords(ctx, parts, size, maxW) {
  const toks = [];
  parts.forEach(([s, hi]) => s.split(/(\s+)/).forEach((w) => { if (w) toks.push({ w, hi: !!hi, sp: /^\s+$/.test(w) }); }));
  setFont(ctx, size, 600, DISPLAY, -size * 0.035);
  const lines = [[]]; let x = 0;
  toks.forEach((tk) => {
    const w = ctx.measureText(tk.w).width;
    if (!tk.sp && x + w > maxW && x > 0) { lines.push([]); x = 0; }
    if (tk.sp && x === 0) return;
    lines[lines.length - 1].push({ ...tk, x, wd: w }); x += w;
  });
  return lines;
}
// a caption rolls in word by word from under its line, and rolls out upward as the next arrives
function caption(ctx, u, [t0, t1, parts, lead, top], cfg = top ? CAP_TOP : CAP) {
  if (u < t0 - 0.05 || u > t1 + 1.4) return;
  const { x: X, top: Y, size, maxW } = cfg, lh = size * 1.12;
  const lines = layoutWords(ctx, parts, size, maxW);
  let wi = 0;
  lines.forEach((ln, li) => {
    const base = Y + li * lh + size * 0.9;
    ctx.save(); ctx.beginPath(); ctx.rect(X - 40, base - size * 1.02, maxW + 200, lh + size * 0.12); ctx.clip();
    ln.forEach((tk) => {
      if (tk.sp) return;
      const kin = E.outCubic(prog(u, t0 + wi * 0.06, t0 + wi * 0.06 + 0.8)), kout = E.inCubic(prog(u, t1 + wi * 0.03, t1 + wi * 0.03 + 0.62));
      wi++;
      if (kin <= 0 || kout >= 1) return;
      ctx.globalAlpha = kin * (1 - kout);
      tx(ctx, tk.w, X + tk.x, base + (1 - kin) * lh * 0.9 - kout * lh * 0.9, size, 600, DISPLAY, tk.hi ? T.accent : T.fg, 'left', -size * 0.035);
    });
    ctx.restore();
  });
  if (lead) {
    const kin = eo(u, t0 + 0.45, t0 + 1.2), kout = E.inCubic(prog(u, t1 + 0.05, t1 + 0.55));
    if (kin > 0 && kout < 1) {
      const ly = Y + lines.length * lh + 26 + cfg.lead;
      ctx.save(); ctx.globalAlpha = kin * (1 - kout);
      wrap(ctx, lead, maxW, cfg.lead, 500, UI).forEach((s, i) => tx(ctx, s, X, ly + i * cfg.lead * 1.5 + (1 - kin) * 14 - kout * 14, cfg.lead, 500, UI, T.muted));
      ctx.restore();
    }
  }
}
// the problem, as statements that stack
function problems(ctx, u) {
  const list = [[36.0, 'Models no one approved.'], [39.4, 'Agents acting on their own.'], [42.9, 'Risks no one can measure.']];
  if (u < 36 || u > 47.2) return;
  const size = P ? 56 : 54, lh = size * 1.25, X = CAP.x, top = CAP.top;
  list.forEach(([b0, s], i) => {
    if (u < b0) return;
    const kin = E.outCubic(prog(u, b0, b0 + 0.9)), kout = E.inCubic(prog(u, 45.7 + i * 0.12, 46.4 + i * 0.12));
    const dim = list.slice(i + 1).reduce((a, [b1]) => a + ease(u, b1, b1 + 0.8), 0);
    const y = top + i * lh + size * 0.9;
    ctx.save(); ctx.beginPath(); ctx.rect(X - 40, y - size * 1.05, 1400, lh + 10); ctx.clip();
    ctx.globalAlpha = (1 - kout) * lerp(1, 0.42, Math.min(1, dim));
    tx(ctx, s, X, y + (1 - kin) * lh * 0.9 - kout * lh * 0.9, size, 600, DISPLAY, T.fg, 'left', -size * 0.03);
    ctx.restore();
  });
}
// a chip: the site's pill, a violet icon, a hairline to what it names
function chip(ctx, s, label, ic, { a = 1, col = T.fg, icol = T.tertiary, blur = 0, dy = 30 } = {}) {
  if (a <= 0.01 || !s.ok) return;
  const h = 44, size = 18, w = tw(ctx, label, size, 600, UI) + 32 + 26;
  const flip = s.x + 18 + w > W - 40, x = clamp(flip ? s.x - 18 - w : s.x + 18, 24, W - 24 - w), y = s.y - dy - h;
  ctx.save(); ctx.globalAlpha = a; if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`;
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(flip ? x + w - 14 : x + 14, y + h); ctx.stroke();
  rr(ctx, x, y, w, h, h / 2); ctx.fillStyle = 'rgba(20,13,61,0.88)'; ctx.fill();
  ctx.strokeStyle = T.lineStrong; rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, h / 2); ctx.stroke();
  icon(ctx, ic, x + 16, y + (h - 19) / 2, 19, icol, 'bold');
  tx(ctx, label, x + 16 + 26, y + h / 2 + size * 0.36, size, 600, UI, col);
  ctx.restore();
}
// the agents' labels ride on their blobs; the moods are labelled on the avatar and on the runaway piece
function agentChips(ctx, u, pj) {
  if (u < 25.8 || u > 46.4) return;
  const sc = blobScene(u, pj.eye); if (!sc) return;
  const fog = ease(u, 31.4, 33.6) * (1 - ease(u, 34.6, 36.0));
  const m = sc.blobs[0], mc = pj.to(m.C), rad = Math.abs(pj.to(vadd(m.C, [m.R, 0, 0])).x - mc.x);
  sc.blobs.forEach((b) => {
    if (b.i === undefined) return;
    const bc = pj.to(b.C);
    if (bc.d > mc.d && Math.hypot(bc.x - mc.x, bc.y - mc.y) < rad * 1.05) return;   // hidden behind the avatar
    const kin = eo(u, 26.4 + b.i * 0.22, 27.0 + b.i * 0.22) * (1 - ease(u, 35.0, 35.7));
    chip(ctx, pj.to(vadd(b.C, [0, b.R * 1.05, 0])), CLONES[b.i].kind[0], CLONES[b.i].kind[1], { a: kin * (1 - 0.45 * fog), blur: fog * 2.5, dy: 18 });
  });
  const top = pj.to(vadd(m.C, [-m.R * 0.25, m.R * 1.02, 0]));
  chip(ctx, top, 'Unapproved model', 'Warning', { a: eo(u, 36.3, 36.9) * (1 - ease(u, 39.4, 39.9)), col: T.warn, icol: T.warn, dy: 22 });
  chip(ctx, top, 'Risk not measured', 'Warning', { a: eo(u, 43.4, 44.0) * (1 - ease(u, 45.1, 45.6)), col: T.risk, icol: T.risk, dy: 22 });
  const piece = sc.blobs.find((b) => b.piece);
  if (piece) chip(ctx, pj.to(vadd(piece.C, [0, piece.R * 1.05, 0])), 'Agent acting alone', 'Robot', { a: eo(u, 40.6, 41.2) * (1 - ease(u, 44.4, 44.9)), col: T.warn, icol: T.warn, dy: 18 });
}
// "Six ways": the heading, a focus list of the six (active one lit, with its line), demos on the right
function circleMark(ctx, x, y, w, h, k) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = T.tertiary; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i <= 60 * k; i++) { const a = -2.3 + (i / 60) * TAU * 1.08, r = 1 + 0.04 * Math.sin(i * 0.4); const px = x + w / 2 + Math.cos(a) * (w / 2 + 14) * r, py = y + h / 2 + Math.sin(a) * (h / 2 + 8) * r + i * 0.08; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.stroke(); ctx.restore();
}
function sixOverlay(ctx, u) {
  if (u < 107.8 || u > 149.6) return;
  const out = E.inCubic(prog(u, 147.7, 148.6));
  const size = P ? 58 : 52, X = CAP.x, Y = P ? 290 : 128, lh = size * 1.12, maxW = P ? S.w : 720;
  // heading, rolling in word by word
  const parts = [['Six ways', 0], [' governance actually gets enforced.']];
  const lines = layoutWords(ctx, parts, size, maxW);
  let wi = 0;
  lines.forEach((ln, li) => {
    const base = Y + li * lh + size * 0.9;
    ctx.save(); ctx.beginPath(); ctx.rect(X - 40, base - size * 1.02, maxW + 200, lh + size * 0.12); ctx.clip();
    ln.forEach((tk) => {
      if (tk.sp) return;
      const kin = E.outCubic(prog(u, 108.0 + wi * 0.06, 108.8 + wi * 0.06)), kout = E.inCubic(prog(u, 147.7 + wi * 0.03, 148.3 + wi * 0.03)); wi++;
      if (kin <= 0 || kout >= 1) return;
      ctx.globalAlpha = kin * (1 - kout);
      tx(ctx, tk.w, X + tk.x, base + (1 - kin) * lh * 0.9 - kout * lh * 0.9, size, 600, DISPLAY, T.fg, 'left', -size * 0.035);
    });
    ctx.restore();
  });
  ctx.save(); ctx.globalAlpha = 1 - out; circleMark(ctx, X, Y + size * 0.12, tw(ctx, 'Six ways', size, 600, DISPLAY, -size * 0.035), size * 0.95, ease(u, 109.0, 110.0)); ctx.restore();
  const act = SIX_ON.reduce((a, t, i) => (u >= t ? i : a), -1);
  if (P) {   // portrait: only the active mechanism, rolling in and out under the heading
    SIX.forEach((s, i) => {
      const t0 = SIX_ON[i], t1 = i < 5 ? SIX_ON[i + 1] - 0.3 : 147.4;
      const kin = eo(u, t0, t0 + 0.6), kout = E.inCubic(prog(u, t1, t1 + 0.45));
      if (kin <= 0 || kout >= 1) return;
      const y0 = Y + lines.length * lh + 76;
      ctx.save(); ctx.globalAlpha = kin * (1 - kout); ctx.translate(0, (1 - kin) * 20 - kout * 20);
      tx(ctx, `0${i + 1}`, X, y0, 26, 700, UI, T.accent);
      tx(ctx, s.title, X + 62, y0, 42, 600, DISPLAY, T.fg, 'left', -1);
      wrap(ctx, s.body, maxW, 28, 500, UI).forEach((ln, j) => tx(ctx, ln, X, y0 + 60 + j * 40, 28, 500, UI, T.muted));
      ctx.restore();
    });
    return;
  }
  const top = Y + lines.length * lh, listH = 6 * 64 + 3 * 32 + 14;
  let y = Math.max(top + 40, (top + 40 + H - 60) / 2 - listH / 2);
  SIX.forEach((s, i) => {
    const kin = eo(u, 109.4 + i * 0.18, 110.1 + i * 0.18);
    const on = ease(u, SIX_ON[i], SIX_ON[i] + 0.6) * (i < 5 ? 1 - ease(u, SIX_ON[i + 1], SIX_ON[i + 1] + 0.6) : 1);
    const lit = act < 0 ? 0.7 : lerp(0.42, 1, on);
    ctx.save(); ctx.globalAlpha = kin * (1 - out); ctx.translate((1 - kin) * -24, 0);
    tx(ctx, `0${i + 1}`, X, y + 33, 20, 700, UI, on > 0.5 ? T.accent : T.subtle);
    ctx.globalAlpha *= lit;
    tx(ctx, s.title, X + 58, y + 34, 36, 600, DISPLAY, T.fg, 'left', -0.8);
    ctx.restore();
    const body = wrap(ctx, s.body, 640, 23, 500, UI), extra = body.length * 32 + 14;
    if (on > 0.01) {
      ctx.save(); ctx.beginPath(); ctx.rect(X + 48, y + 44, 760, extra * on + 6); ctx.clip();
      ctx.globalAlpha = on * (1 - out);
      body.forEach((ln, j) => tx(ctx, ln, X + 58, y + 74 + j * 32 - (1 - on) * 10, 23, 500, UI, T.muted));
      ctx.restore();
    }
    y += 64 + extra * on;
  });
}
function endCard(ctx, u, pj) {
  if (u < 164) return;
  const b = BOARDS.logoEnd, bot = pj.to(at(b, b.css[0] / 2, b.css[1]));
  const k = eo(u, 165.0, 166.0);
  if (k > 0) { ctx.save(); ctx.globalAlpha = k; tx(ctx, 'www.niticore.ai', W / 2, bot.y + (P ? 120 : 104) + (1 - k) * 12, P ? 36 : 32, 700, UI, T.accent, 'center', 0.5); ctx.restore(); }
}
function overlay(ctx, u, pj) {
  agentChips(ctx, u, pj);
  CAPS.forEach((c) => caption(ctx, u, c));
  problems(ctx, u);
  sixOverlay(ctx, unsh(u));
  endCard(ctx, unsh(u), pj);
}

// ---------------------------------------------------------------- hits (sounds on the picture's accents)
// accents authored on the old grid (inventory onward), mapped onto the new one
const OLD_HITS = [
  [61.8, 'to the inventory', 'whoosh', { len: 1.4, from: 400, to: 2200, gain: 0.12 }],
  [63.5, 'model', 'tick', { gain: 0.2 }], [65.1, 'agent', 'tick', { gain: 0.2 }], [66.2, 'dataset', 'tick', { gain: 0.2 }],
  [68.8, 'out of the shadows', 'blip', { pitch: 'F#4', gain: 0.14 }],
  [70.4, 'registered', 'bell', { pitch: 'D6', gain: 0.18 }],
  [72.0, 'to the risk card', 'whoosh', { len: 1.4, from: 400, to: 2200, gain: 0.12 }],
  [74.1, 'high risk', 'thud', { pitch: 70, to: 45, gain: 0.22 }],
  [75.2, 'FRIA', 'tick', { gain: 0.2 }],
  [78.4, 'to the frameworks', 'whoosh', { len: 1.4, from: 400, to: 2200, gain: 0.12 }],
  [96.8, 'pan down', 'whoosh', { len: 1.2, from: 1800, to: 400, gain: 0.12 }],
  [98.0, 'file', 'tick', { gain: 0.2 }], [98.5, 'file', 'tick', { gain: 0.2 }], [99.0, 'file', 'tick', { gain: 0.2 }],
  [99.2, 'sealed', 'bell', { pitch: 'A5', gain: 0.2 }],
  [101.4, 'typing', 'type', { n: 10, len: 0.5, gain: 0.12 }],
  [103.5, 'approval required', 'blip', { pitch: 'F#5', gain: 0.14 }],
  [104.6, 'approve', 'click', { gain: 0.3 }], [104.9, 'approved', 'bell', { pitch: 'D6', gain: 0.2 }],
  [107.4, 'to the six', 'whoosh', { len: 1.4, from: 400, to: 2200, gain: 0.12 }],
  ...SIX_ON.map((t) => [t, 'mechanism', 'tick', { gain: 0.18 }]),
  [109.6, 'entry', 'tick', { gain: 0.14 }], [110.15, 'entry', 'tick', { gain: 0.14 }], [110.7, 'entry', 'tick', { gain: 0.14 }], [111.25, 'entry', 'tick', { gain: 0.14 }],
  [116.5, 'chain verified', 'bell', { pitch: 'A5', gain: 0.16 }],
  [121.1, 'self-approval blocked', 'thud', { pitch: 74, to: 48, gain: 0.22 }],
  [122.75, 'reviewer approves', 'bell', { pitch: 'D6', gain: 0.16 }],
  [125.6, 'signed', 'click', { gain: 0.22 }], [126.5, 'signed', 'click', { gain: 0.22 }], [127.4, 'signed', 'click', { gain: 0.22 }],
  [131.3, 'pass', 'blip', { pitch: 'A5', gain: 0.12 }], [132.1, 'warn', 'blip', { pitch: 'E5', gain: 0.12 }], [132.9, 'block', 'thud', { pitch: 70, to: 42, gain: 0.22 }],
  [139.3, 'link expires', 'blip', { pitch: 'C5', gain: 0.12 }], [139.6, 'retention scheduled', 'tick', { gain: 0.2 }],
  ...MAPS.map((_, j) => [143.0 + j * 0.32, 'clause satisfied', 'blip', { pitch: ['D5', 'F#5', 'A5', 'B5', 'D6', 'F#6'][j], gain: 0.08 }]),
  [148.2, 'pull back', 'whoosh', { len: 2.0, from: 300, to: 1800, gain: 0.15 }],
  [149.8, 'the constellation lights', 'swell', { gain: 0.14 }],
  [160.0, 'wordmark', 'impact'],
  [160.55, 'sparkle', 'bell', { pitch: 'D6', gain: 0.22 }], [160.8, 'sparkle 2', 'bell', { pitch: 'A6', gain: 0.2 }],
  [165.0, 'www.niticore.ai', 'tick', { gain: 0.18 }],
];
const HITS = [
  [0.25, 'the spark', 'sub', { len: 1.6, gain: 0.4 }],
  [1.6, 'ribbons unfurl', 'whoosh', { len: 2.0, from: 300, to: 2400, gain: 0.13 }],
  [4.4, 'accelerating', 'whoosh', { len: 1.6, from: 600, to: 3600, gain: 0.14 }],
  [6.6, 'headline one breaks', 'whoosh', { len: 1.0, from: 2400, to: 700, gain: 0.1 }],
  [8.64, 'governance', 'blip', { pitch: 'A5', gain: 0.08 }],
  [16.0, 'into the wordmark', 'swell', { gain: 0.12 }],
  [16.0, 'wordmark forms', 'bell', { pitch: 'D5', gain: 0.16 }], [16.0, 'wordmark chord', 'bell', { pitch: 'A5', gain: 0.12 }],
  [16.85, 'sparkle', 'bell', { pitch: 'D6', gain: 0.2 }], [17.1, 'sparkle 2', 'bell', { pitch: 'F#6', gain: 0.16 }],
  [24.0, 'the avatar takes shape', 'swell', { gain: 0.12 }],
  ...CLONES.map((_, i) => [25.8 + i * 0.12, 'an agent buds', 'pop', { pitch: ['A5', 'B5', 'D6', 'E6', 'F#6', 'A6'][i], gain: 0.1 }]),
  [31.4, 'faster', 'whoosh', { len: 2.2, from: 400, to: 2600, gain: 0.12 }],
  [36.8, 'it turns amber', 'swell', { gain: 0.13 }],
  [40.3, 'a piece tears away', 'boing', { pitch: 'E4', to: 'B3', gain: 0.14 }],
  [43.3, 'spikes', 'thud', { pitch: 58, to: 32, gain: 0.3 }],
  [45.6, 'calm again', 'pop', { pitch: 'D5', to: 'D4', gain: 0.16 }],
  [46.4, 'the avatar pours out', 'whoosh', { len: 1.6, from: 2600, to: 300, gain: 0.17 }],
  [49.4, 'cockpit lands', 'swell', { gain: 0.15 }],
  [51.9, 'readiness 78', 'bell', { pitch: 'A5', gain: 0.18 }],
  [53.6, 'to the loop', 'whoosh', { len: 1.2, from: 400, to: 2200, gain: 0.11 }],
  ...STAGE_T.map((t) => [t, 'a stage', 'tick', { gain: 0.22 }]),
  [STAGE_T[4] + 0.02, 'held on monitor', 'bell', { pitch: 'A5', gain: 0.12 }],
  ...OLD_HITS.map(([t, ...r]) => [sh(t), ...r]),
  ...FRAMEWORKS.map((f) => [f.t, f.name, 'sub', { len: 0.6, gain: 0.26 }]),
  [112.4, 'cross-mapped', 'bell', { pitch: 'D6', gain: 0.14 }],
].sort((a, b) => a[0] - b[0]);

M.film({
  fonts: [`600 100px ${DISPLAY}`, `500 100px ${DISPLAY}`, `500 40px ${UI}`, `600 40px ${UI}`, `700 40px ${UI}`, `400 40px ${MONO}`, `700 40px ${MONO}`],
  images: { eu: 'assets/logos/eu-ai-act.webp', iso: 'assets/logos/iso-42001.webp', nist: 'assets/logos/nist-rmf.webp', uae: 'assets/logos/uae.svg', adgm: 'assets/logos/adgm.png', difc: 'assets/logos/difc.webp' },
  hits: HITS,
  samples: 1,   // motion blur happens on the GPU (renderGL accumulates particle and avatar sub-frames)
  async init(ctx, IMG) {
    IMGS = IMG;
    [ICONS, VOENV] = await Promise.all([fetch('assets/icons.json').then((r) => r.json()), fetch('audio/vo_env.json').then((r) => r.json())]);
    await loadSub(); defineEndBoard();
    STATES[20].el = [...SUB.letters.slice(0, NEL - 2).map((_, i) => [END_T0 + 0.02 + i * 0.07, 0.25]), [END_T0 + 0.95, 0.25], [162.45, 0.03]].slice(0, NEL);
    shiftTimeline();
    buildPhi(); buildRib(); buildCam(); setupGL(); sampleLayers();
  },
  draw(ctx, u, t) {
    const cam = camera(u), pj = projector(cam);
    const vis = visible(u);
    vis.forEach((v) => (v.tex = boardTex(v.b, u, v.final)));
    G.glow.clearRect(0, 0, W, H);
    const glowUsed = accents(G.glow, u, pj);
    const subs = [];
    for (let k = 0; k < MB; k++) {
      const uk = M.U(t + (k / MB - 0.5) * (SHUTTER / FPS)), ck = camera(uk);
      subs.push({ u: uk, cam: ck, pj: projector(ck) });
    }
    renderGL(u, t, subs, vis, cam, pj, glowUsed);
    ctx.drawImage(G.cv, 0, 0);
    overlay(ctx, u, pj);
  },
});
