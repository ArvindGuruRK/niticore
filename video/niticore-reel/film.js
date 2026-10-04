// Niticore — "Trusted AI, by design" (motion reel). A grid-world motion-graphics film; a pure function
// of time. No product UI and no website components: governance is told in the world itself (a core,
// a radar sweep, risk columns, two standards monoliths, an evidence vault, a guardrail dome, an
// approval gate, live telemetry), with spark accents and faint dust. GL does HDR bloom/composite;
// 2D draws the grid world and the type. Beats on the measured 96 bpm grid; VO in audio/vo.json.
import * as M from './lib/motion.js';

const { W, H, FORMAT, E, prog, lerp, clamp, kf, font, text, noise1 } = M;
const P = FORMAT.portrait;
const S = FORMAT.safe;
const DISPLAY = 'Display', UI = 'UI';
const QS = new URLSearchParams(location.search);
const FPS = Number(QS.get('fps') || 60), SHUTTER = 0.5;
const MB = QS.get('render') === '1' && QS.get('blur') !== '0' ? 3 : 1;   // GPU motion-blur sub-frames (dust only)
const ND = 6000;

const PAL = { pearl: '#EEF3FF', cyan: '#59D8FF', teal: '#3EF0C0', violet: '#8E7CFF', amber: '#FFB547', coral: '#FF5468', green: '#4AE057', muted: '#8E9BC4' };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const lin = (hex) => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255].map((v) => (v / 255) ** 2.2); };
const ease = (u, a, b, fn = E.inOutCubic) => fn(prog(u, a, b));
const K = (keys, fn = E.inOutSine) => (u) => kf(u, keys, fn);

// ---------------------------------------------------------------- the wordmark (assets/logo/logo_img.svg)
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

// ================================================================= the world
const WALL_Z = -4;
const LOGO_W = P ? 5.6 : 7.4, LOGO_Y = 2.8;
// AI systems: blocks extruded from grid cells
const BLOCKS = (() => {
  const out = [], used = new Set(), rnd = M.mulberry32(7);
  while (out.length < 34) {
    const x = Math.floor(rnd() * 26) - 13, z = Math.floor(rnd() * 30) - 27;
    const key = `${x},${z}`;
    if (used.has(key) || (Math.abs(x) < 2 && z > -3) || (Math.abs(x + 0.5) < 2.6 && Math.abs(z + 8.5) < 2.6) || (Math.abs(x - 2) < 1.6 && Math.abs(z + 7.5) < 1.6)) continue;
    used.add(key);
    out.push({ x: x + 0.5, z: z + 0.5, h: 0.35 + rnd() * 1.4, type: Math.floor(rnd() * 3), t: 14.2 + rnd() * 2.8, shadow: rnd() < 0.3, seed: rnd(), tier: Math.floor(rnd() * 3), hidden: rnd() < 0.3 });
  }
  return out;
})();
const CORE = [0, 0, -9], VAULT = [2.6, 0, -7.6], PILLAR_L = [P ? -5.5 : -10, 0, -19], PILLAR_R = [P ? 5.5 : 10, 0, -19];
const nearest = (x, z, f = () => true) => BLOCKS.filter(f).reduce((a, b) => (Math.hypot(b.x - x, b.z - z) < Math.hypot(a.x - x, a.z - z) ? b : a));
const SB = nearest(-5, -4); SB.shadow = true; SB.hidden = true;
const HERO = nearest(5, -3, (b) => b !== SB); HERO.type = 1; HERO.hidden = false; HERO.shadow = false;
const HI = nearest(-3, -13, (b) => b !== SB && b !== HERO); HI.tier = 2; HI.hidden = false;
BLOCKS.forEach((b) => { if (Math.hypot(b.x - HERO.x, b.z - HERO.z) < 2.6 && b !== HERO) b.h = Math.min(b.h, 0.5); });
const DOME_HIT = (() => { const v = [0.75, 0.45, 0.48], l = Math.hypot(...v); return v.map((x) => x / l); })();
const GATE = [HERO.x, 0, HERO.z + 2.0];
const TAGGED = [[nearest(-7, -15, (b) => b !== SB), 'MODEL'], [nearest(7, -12, (b) => b !== HERO), 'AGENT'], [nearest(-1, -20), 'DATASET'], [nearest(9, -22), 'MODEL']];
const TIERED = [[nearest(4, -16, (b) => b !== HI && b !== HERO), 'LIMITED', '#FFD08A'], [nearest(-8, -9, (b) => b !== SB), 'LOW', '#7DF5CF']];
TIERED[0][0].tier = 1; TIERED[1][0].tier = 0;
const PACKETS = (() => {
  const out = [], rnd = M.mulberry32(11);
  for (let i = 0; i < 46; i++) {
    const a = BLOCKS[Math.floor(rnd() * BLOCKS.length)], b = BLOCKS[Math.floor(rnd() * BLOCKS.length)];
    out.push({ a, b, ph: rnd(), sp: 0.12 + rnd() * 0.14, agent: rnd() < 0.3, seed: rnd() * 100 });
  }
  return out;
})();
const fog = K([[0, 0], [19, 0], [23.5, 0.55], [34, 0.55], [35.2, 0]]);
// packet clock: speeds up through "the faster it moves"
const pclock = (u) => (u < 19 ? u : u < 24 ? 19 + (u - 19) + 0.32 * (u - 19) ** 2 : 19 + 5 + 0.32 * 25 + (u - 24) * 1.0);

// ================================================================= camera
// world keys [beat, [eye xyz, target xyz, fov]]
const DD = P ? 1.32 : 1;   // portrait pulls back a little
const CAM = [
  [0, [0, 1.15, 9.5, 0, 1.0, -12, 40]], [6.5, [0, 1.25, 8.2, 0, 1.2, -12, 40]],
  [8.2, [0, 2.4, 8.6 * DD, 0, LOGO_Y, WALL_Z, 38]], [13.0, [0, 2.5, 8.0 * DD, 0, LOGO_Y, WALL_Z, 38]],
  [15.0, [0, 6.0, 10.5, 0, 0, -5, 42]], [19, [1.5, 5.2, 8.5, 0, 0, -6, 42]], [24, [3.0, 4.0, 5.0, 0, 0, -8, 44]],
  [33.6, [-2.6, 4.4, 7.0, 0, 0.2, -4, 42]], [35.0, [0, 4.6, 9.5, 0, 1.0, -5, 42]],
  [37.4, [0, 6.2, 7.5, CORE[0], 1.4, CORE[2], 42]], [39.8, [4.5, 7.2, 5.5, CORE[0], 0.8, CORE[2], 44]],
  [41.4, [0, 13, 7, 0, 0, -10, 46]], [44.6, [-1.5, 11, 5, -2, 0, -9, 46]],
  [46.4, [SB.x + 3.2, 3.6, SB.z + 6, SB.x, 0.6, SB.z, 42]], [49.2, [SB.x + 2.4, 3.2, SB.z + 5.2, SB.x, 0.6, SB.z, 42]],
  [50.6, [-9, 2.3, 1.5, 0, 1.3, -11, 44]], [54.8, [HI.x - 5, 2.6, HI.z + 6, HI.x, 1.2, HI.z, 42]],
  [56.8, [0, 5.8, 9.5, 0, 2.8, -13, 46]], [62.6, [3, 6.4, 6.5, 0, 2.8, -13, 46]],
  [64.0, [VAULT[0] + 5.5, 3.6, VAULT[2] + 6.5, VAULT[0], 1.6, VAULT[2], 42]], [67.8, [VAULT[0] + 4.5, 3.4, VAULT[2] + 5.8, VAULT[0], 1.6, VAULT[2], 42]],
  [69.0, [HERO.x + 3.8, 2.4, HERO.z + 5.6, HERO.x, 0.9, HERO.z, 42]], [71.6, [HERO.x + 3.0, 2.2, HERO.z + 5.6, HERO.x, 0.9, HERO.z + 0.6, 42]],
  [72.6, [HERO.x + 1.6, 1.7, HERO.z + 5.8, HERO.x, 1.0, HERO.z + 1.6, 42]], [76.4, [HERO.x + 1.2, 1.7, HERO.z + 5.4, HERO.x, 1.0, HERO.z + 1.6, 42]],
  [78.0, [0, 14, 7, 0, 0, -10, 46]], [82.8, [2.5, 13, 5, 0, 0, -10, 46]],
  [86.6, [0, 7.0, 15.5, 0, 1.0, -4, 42]], [89.6, [0, 6.0, 14.0, 0, 1.0, -4, 42]],
  [91.0, [0, 2.6, 8.8 * DD, 0, LOGO_Y, WALL_Z, 38]], [100, [0, 2.6, 8.2 * DD, 0, LOGO_Y, WALL_Z, 38]],
];
function camera(u) {
  const c = kf(u, CAM, E.inOutCubic);
  const d = [0.05 * noise1(u * 0.21, 3), 0.04 * noise1(u * 0.19, 7), 0.03 * noise1(u * 0.17, 11)];
  let fov = c[6];
  if (P) fov = (2 * Math.atan(Math.tan((fov * Math.PI) / 360) * 1.75) * 180) / Math.PI;
  // portrait: look further down at the floor in the world shots, so the frame isn't half sky
  const pw = P ? ease(u, 13.4, 15.2) * (1 - ease(u, 89.6, 90.8)) * (1 - ease(u, 68.2, 69.2) * (1 - ease(u, 76.6, 77.8))) : 0;   // not in the close guard shots
  return { eye: [c[0] + d[0], c[1] + d[1] + pw * 1.8, c[2] + d[2]], tgt: [c[3], c[4] - pw * 1.4, c[5]], fov };
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
  const view = lookAt(cam.eye, cam.tgt), proj = perspective(cam.fov, W / H, 0.1, 300);
  return {
    view, proj, eye: cam.eye,
    to(p) {
      const v = mulv(view, [p[0], p[1], p[2], 1]), c = mulv(proj, v);
      return { x: (c[0] / c[3] * 0.5 + 0.5) * W, y: (1 - (c[1] / c[3] * 0.5 + 0.5)) * H, d: -v[2], ok: -v[2] > 0.25 };
    },
  };
}

// ================================================================= GLSL
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
const VS_DUST = `#version 300 es
precision highp float; precision highp int;
in float aId; uniform mat4 uProj, uView; uniform float uU, uH, uFocus, uAper, uDim;
out vec3 vCol; out float vA; out float vSz;
${NOISE}
uint pcg(uint v){ uint s=v*747796405u+2891336453u; uint w=((s>>((s>>28u)+4u))^s)*277803737u; return (w>>22u)^w; }
float R(float k){ return float(pcg(uint(aId)*16u+uint(k)))*(1.0/4294967295.0); }
void main(){
  vec3 p=(vec3(R(0.),R(1.),R(2.))*2.0-1.0)*vec3(18.0,6.0,20.0)+vec3(0.,5.2,-8.);
  float t=uU*0.02;
  p+=0.8*vec3(snoise(p*0.08+vec3(t,0.,0.)),snoise(p*0.08+vec3(5.,t,1.)),snoise(p*0.08+vec3(1.,2.,t)));
  float tw=0.55+0.45*sin(uU*1.3+R(3.)*40.);
  vec3 c=mix(vec3(0.86,0.9,1.0), mix(vec3(0.1,0.68,1.0),vec3(0.27,0.2,1.0),R(4.)), 0.5);
  vec4 vp=uView*vec4(p,1.); float depth=-vp.z; gl_Position=uProj*vp;
  float k=uH/1080.; float px=(1.4+2.2*R(5.))*1.55*k*(10.0/max(depth,0.1));
  float coc=uAper*abs(depth-uFocus)/max(depth,0.1)*k*40.0;
  float ps=max(px+coc,1.0);
  float al=0.16*tw*(1.0-uDim*0.5)*clamp((px*px+1.0)/(ps*ps+1.0),0.03,1.0)*step(0.3,depth);
  gl_PointSize=min(ps,64.0); vCol=c; vA=al; vSz=ps;
}`;
const FS_POINT = `#version 300 es
precision highp float; in vec3 vCol; in float vA; in float vSz; uniform float uGain; out vec4 o;
void main(){ vec2 q=gl_PointCoord*2.0-1.0; float d2=dot(q,q); if(d2>1.0) discard;
 float g=exp(-d2*3.6); float disc=1.0-smoothstep(0.7,1.0,sqrt(d2)); float k=smoothstep(4.0,14.0,vSz);
 o=vec4(vCol*vA*uGain*mix(g,disc*0.5+g*0.25,k),1.0); }`;
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
precision highp float; in vec2 vUv; uniform sampler2D uScene, uB1, uB2, uB3, uSt; uniform vec2 uRes; uniform float uT, uExp, uGrain;
uniform vec3 uBg0, uBg1; out vec4 o;
void main(){ vec2 cc=vUv-0.5; float r=length(cc*vec2(uRes.x/uRes.y,1.)); vec2 off=cc*0.0022;
 vec3 sc=vec3(texture(uScene,vUv+off).r,texture(uScene,vUv).g,texture(uScene,vUv-off).b);
 vec3 bl=texture(uB1,vUv).rgb*0.45+texture(uB2,vUv).rgb*0.6+texture(uB3,vUv).rgb*0.8+texture(uSt,vUv).rgb*vec3(0.35,0.55,1.0)*0.7;
 vec3 bg=mix(uBg0,uBg1,smoothstep(0.0,1.15,r));
 vec3 c=bg+(sc+bl)*uExp;
 c=(c*(2.51*c+0.03))/(c*(2.43*c+0.59)+0.14);
 c=pow(clamp(c,0.,1.),vec3(1.0/2.2));
 c*=mix(1.0,smoothstep(1.3,0.3,r),0.5);
 float n=fract(sin(dot(gl_FragCoord.xy+fract(uT*7.13)*vec2(91.3,47.1),vec2(12.9898,78.233)))*43758.5453);
 c+=(n-0.5)*uGrain; o=vec4(c,1.0); }`;
// ================================================================= GL plumbing
let G = null;
function setupGL() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const gl = cv.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true, premultipliedAlpha: false, alpha: false });
  if (!gl) throw new Error('WebGL2 unavailable');
  gl.getExtension('EXT_color_buffer_float');
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const mk = (vs, fs) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; };
  const progs = { dust: mk(VS_DUST, FS_POINT), copy: mk(VS_QUAD, FS_COPY), bright: mk(VS_QUAD, FS_BRIGHT), blur: mk(VS_QUAD, FS_BLUR), comp: mk(VS_QUAD, FS_COMP) };
  const ids = new Float32Array(ND); for (let i = 0; i < ND; i++) ids[i] = i;
  const vaoD = gl.createVertexArray(); gl.bindVertexArray(vaoD);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);
  let loc = gl.getAttribLocation(progs.dust, 'aId'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 1, gl.FLOAT, false, 0, 0);
  const vaoQ = gl.createVertexArray(); gl.bindVertexArray(vaoQ);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  for (const p of [progs.copy, progs.bright, progs.blur, progs.comp]) { const l = gl.getAttribLocation(p, 'aP'); if (l >= 0) { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0); } }
  const fbo = (w, h) => {
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { f, tex, w, h };
  };
  const texOf = (mip) => {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    return t;
  };
  const glowCv = document.createElement('canvas'); glowCv.width = W; glowCv.height = H;
  const ul = {}; for (const [k, p] of Object.entries(progs)) ul[k] = (n) => gl.getUniformLocation(p, n);
  G = {
    gl, cv, progs, ul, vaoD, vaoQ, scene: fbo(W, H),
    lv: [2, 4, 8].map((d) => [fbo(Math.ceil(W / d), Math.ceil(H / d)), fbo(Math.ceil(W / d), Math.ceil(H / d))]),
    streak: [fbo(Math.ceil(W / 4), Math.ceil(H / 8)), fbo(Math.ceil(W / 4), Math.ceil(H / 8))],
    glowTex: texOf(false), glowCv, glow: glowCv.getContext('2d'),
  };
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
function upload(t, canvas, mip) {
  const { gl } = G;
  tex(0, t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !mip); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  if (mip) gl.generateMipmap(gl.TEXTURE_2D);
}
const U = {
  aper: K([[0, 0.04], [35, 0.04], [37, 0.06], [83, 0.06], [86, 0.03]]),
  exp: K([[0, 2.4], [8, 2.4], [8.15, 3.0], [9.6, 2.4], [90.2, 2.4], [90.4, 2.9], [92, 2.3], [100, 2.3]]),
};
function renderGL(u, t, subs, glowUsed) {
  const { gl, progs, ul } = G;
  gl.bindFramebuffer(gl.FRAMEBUFFER, G.scene.f); gl.viewport(0, 0, W, H);
  gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
  // dust (motion-blurred across the shutter)
  for (const sb of subs) {
    gl.useProgram(progs.dust); gl.bindVertexArray(G.vaoD);
    const L = ul.dust;
    gl.uniformMatrix4fv(L('uProj'), false, sb.pj.proj); gl.uniformMatrix4fv(L('uView'), false, sb.pj.view);
    gl.uniform1f(L('uU'), sb.u); gl.uniform1f(L('uH'), H); gl.uniform1f(L('uAper'), U.aper(sb.u)); gl.uniform1f(L('uDim'), fog(sb.u));
    gl.uniform1f(L('uFocus'), Math.hypot(sb.cam.eye[0] - sb.cam.tgt[0], sb.cam.eye[1] - sb.cam.tgt[1], sb.cam.eye[2] - sb.cam.tgt[2]));
    gl.uniform1f(ul.dust('uGain'), 1 / subs.length);
    gl.drawArrays(gl.POINTS, 0, ND);
  }
  if (glowUsed) {
    upload(G.glowTex, G.glowCv, false);
    quad(progs.copy, G.scene, () => { tex(0, G.glowTex); gl.uniform1i(ul.copy('uT'), 0); gl.uniform1f(ul.copy('uGain'), 1.5); });
  }
  gl.disable(gl.BLEND);
  let src = G.scene;
  G.lv.forEach(([a, b], i) => {
    quad(progs.bright, a, () => { tex(0, src.tex); gl.uniform1i(ul.bright('uT'), 0); gl.uniform2f(ul.bright('uPx'), 1 / src.w, 1 / src.h); gl.uniform1f(ul.bright('uThr'), i === 0 ? 0.3 : 0.0); });
    quad(progs.blur, b, () => { tex(0, a.tex); gl.uniform1i(ul.blur('uT'), 0); gl.uniform2f(ul.blur('uDir'), 1 / a.w, 0); });
    quad(progs.blur, a, () => { tex(0, b.tex); gl.uniform1i(ul.blur('uT'), 0); gl.uniform2f(ul.blur('uDir'), 0, 1 / a.h); });
    src = a;
  });
  const [sa, sb2] = G.streak;
  quad(progs.bright, sa, () => { tex(0, G.lv[0][0].tex); gl.uniform1i(ul.bright('uT'), 0); gl.uniform2f(ul.bright('uPx'), 1 / G.lv[0][0].w, 1 / G.lv[0][0].h); gl.uniform1f(ul.bright('uThr'), 0.55); });
  [2, 5, 11, 22].forEach((st, i) => {
    const [a, b] = i % 2 ? [sb2, sa] : [sa, sb2];
    quad(progs.blur, b, () => { tex(0, a.tex); gl.uniform1i(ul.blur('uT'), 0); gl.uniform2f(ul.blur('uDir'), st / a.w, 0); });
  });
  quad(progs.comp, null, () => {
    tex(0, G.scene.tex); tex(1, G.lv[0][0].tex); tex(2, G.lv[1][0].tex); tex(3, G.lv[2][0].tex); tex(4, sa.tex);
    const C = ul.comp;
    gl.uniform1i(C('uScene'), 0); gl.uniform1i(C('uB1'), 1); gl.uniform1i(C('uB2'), 2); gl.uniform1i(C('uB3'), 3); gl.uniform1i(C('uSt'), 4);
    gl.uniform2f(C('uRes'), W, H); gl.uniform1f(C('uT'), t); gl.uniform1f(C('uExp'), U.exp(u)); gl.uniform1f(C('uGrain'), 0.03);
    gl.uniform3fv(C('uBg0'), lin('#0B1028')); gl.uniform3fv(C('uBg1'), lin('#030308'));
  });
}

// ================================================================= grid world (2D, bloomed)
function worldGlow(g, u, pj) {
  let used = false;
  const fg = fog(u);
  // ---- floor grid: unfolds from the horizon at the open, fades for the logo wall, returns
  const floorK = (u < 7.6 ? 1 : 1 - ease(u, 7.6, 8.6)) + ease(u, 13.2, 14.6) * (1 - ease(u, 89.8, 91.2));
  if (floorK > 0.01) {
    used = true;
    g.save(); g.lineCap = 'round';
    const span = (u - 0.1) / 3.2;   // opening draw-in: far lines first, then nearer
    const lineA = (z) => clamp((span - (6 - z) / 46) * 4);
    for (let z = -36; z <= 10; z += 1) {
      const a0 = u < 7.6 ? lineA(z) : 1;
      if (a0 <= 0) continue;
      const pts = [];
      for (let x = -18; x <= 18; x += 2) { const s = pj.to([x, 0, z]); pts.push(s); }
      seg(g, pts, z, a0 * floorK, u, fg);
    }
    for (let x = -18; x <= 18; x += 1) {
      const grow = u < 7.6 ? clamp(span * 1.15 - Math.abs(x) / 60) : 1;
      if (grow <= 0) continue;
      const zEnd = lerp(-36, 10, grow);
      const pts = [];
      for (let z = -36; z <= zEnd + 0.01; z += 2) pts.push(pj.to([x, 0, z]));
      seg(g, pts, null, floorK * (u < 7.6 ? clamp(span * 2) : 1), u, fg);
    }
    // the horizon line that opens the film
    const hl = ease(u, 0, 1.2, E.outCubic) * (1 - ease(u, 2.5, 5));
    if (hl > 0) {
      const a = pj.to([-40, 0, -36]), b = pj.to([40, 0, -36]);
      const c = (a.x + b.x) / 2, half = ((b.x - a.x) / 2) * hl;
      const gr = g.createLinearGradient(c - half, 0, c + half, 0);
      gr.addColorStop(0, 'rgba(120,200,255,0)'); gr.addColorStop(0.5, `rgba(200,240,255,${0.9 * (1 - ease(u, 2.5, 5))})`); gr.addColorStop(1, 'rgba(120,200,255,0)');
      g.strokeStyle = gr; g.lineWidth = 2.4; g.beginPath(); g.moveTo(c - half, (a.y + b.y) / 2); g.lineTo(c + half, (a.y + b.y) / 2); g.stroke();
    }
    g.restore();
    // ---- AI systems: blocks extruded from the cells, packets running the lines
    if (u > 13.8 && u < 91.5) { drawSystems(g, u, pj, fg, floorK); governance(g, u, pj); }
    // ---- risk ripples through the cells
    if (u > 30.6 && u < 35.2) {
      const k = 1 - ease(u, 34.2, 35.2);
      for (const [sx, sz, ph] of [[-5, -10, 0], [6, -14, 0.33], [1, -20, 0.66]]) {
        const rr = ((u - 30.6) * 2.2 + ph * 6) % 6;
        for (let cx = Math.floor(sx - rr - 1); cx <= sx + rr + 1; cx++) for (let cz = Math.floor(sz - rr - 1); cz <= sz + rr + 1; cz++) {
          const d = Math.hypot(cx + 0.5 - sx, cz + 0.5 - sz), w = Math.exp(-(((d - rr) * 1.6) ** 2)) * (1 - rr / 6) * k;
          if (w < 0.04) continue;
          cell(g, pj, cx, cz, rgba(PAL.coral, 0.32 * w));
        }
      }
    }
    // ---- the clarity scan: one bright line sweeps the floor
    const sc = prog(u, 34.0, 35.6);
    if (sc > 0 && sc < 1) {
      const z = lerp(-36, 10, E.inOutSine(sc));
      const a = pj.to([-30, 0, z]), b = pj.to([30, 0, z]);
      if (a.ok && b.ok) { g.save(); g.strokeStyle = rgba(PAL.teal, 0.95); g.lineWidth = 3; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.restore(); }
    }
    // ---- heartbeat rings while monitoring
    const mon = ease(u, 77, 78.5) * (1 - ease(u, 83, 84.5));
    if (mon > 0.01) {
      for (let q = 0; q < 2; q++) {
        const rr = (((u * 0.5) + q * 0.5) % 1) * 16;
        const pts = [];
        for (let i = 0; i <= 96; i++) { const a = (i / 96) * Math.PI * 2; pts.push(pj.to([CORE[0] + Math.cos(a) * rr, 0, CORE[2] + Math.sin(a) * rr])); }
        g.save(); g.strokeStyle = rgba(PAL.teal, 0.5 * mon * (1 - rr / 16)); g.lineWidth = 2;
        g.beginPath(); let st = false; pts.forEach((s2) => { if (!s2.ok) { st = false; return; } if (st) g.lineTo(s2.x, s2.y); else { g.moveTo(s2.x, s2.y); st = true; } }); g.stroke(); g.restore();
      }
    }
  }
  // ---- the logo wall: a vertical grid that the wordmark assembles on, tile by tile
  const wallK = ease(u, 7.2, 8.2) * (1 - ease(u, 13.0, 14.2)) + ease(u, 89.8, 90.8);
  if (wallK > 0.01) {
    used = true;
    g.save(); g.lineWidth = 1.1;
    for (let x = -10; x <= 10; x += 0.5) { const a = pj.to([x, 0, WALL_Z]), b = pj.to([x, 7, WALL_Z]); if (a.ok && b.ok) { g.strokeStyle = `rgba(80,130,255,${0.16 * wallK})`; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } }
    for (let y = 0; y <= 7; y += 0.5) { const a = pj.to([-10, y, WALL_Z]), b = pj.to([10, y, WALL_Z]); if (a.ok && b.ok) { g.strokeStyle = `rgba(80,130,255,${0.16 * wallK})`; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } }
    g.restore();
    const t0 = u < 50 ? 8.0 : 90.2;
    logoTiles(g, u, pj, t0, wallK);
  }
  return used;
}
function seg(g, pts, z, a, u, fg) {
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i];
    if (!p0.ok || !p1.ok) continue;
    const d = (p0.d + p1.d) / 2;
    const near = clamp((d - 0.8) / 2.5), far = 1 - clamp((d - 6) / 34);
    const al = a * (0.07 + 0.2 * far) * near * (1 - fg * 0.6);
    if (al < 0.006) continue;
    g.strokeStyle = `rgba(90,140,255,${al})`; g.lineWidth = 1.1;
    g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.stroke();
  }
}
function cell(g, pj, cx, cz, color) {
  const q = [[cx, cz], [cx + 1, cz], [cx + 1, cz + 1], [cx, cz + 1]].map(([x, z]) => pj.to([x, 0.01, z]));
  if (q.some((s) => !s.ok)) return;
  g.fillStyle = color; g.beginPath(); q.forEach((s, i) => (i ? g.lineTo(s.x, s.y) : g.moveTo(s.x, s.y))); g.closePath(); g.fill();
}
function blockColor(b, u) {
  const typeC = b.type === 0 ? PAL.cyan : b.type === 1 ? PAL.violet : PAL.teal;
  const scan = clamp((u - 34.0 - ((b.z + 36) / 46) * 1.6) / 0.2);   // the clarity scan passes far to near
  if (b === SB && u > 24.8 && u < 47.8) return [PAL.amber, Math.sin(u * 13 + b.seed * 50) > 0.2 ? 1 : 0.4];
  if (scan < 1 && u > 24.8 && b.shadow) return [PAL.amber, Math.sin(u * 13 + b.seed * 50) > 0.2 ? 1 : 0.35];
  const tk = tierK(u);
  if (tk > 0) return [tk > 0.5 ? TIER_C[b.tier] : typeC, 1];
  return [typeC, scan >= 1 ? 1 : 0.85];
}
function drawSystems(g, u, pj, fg, floorK) {
  const order = BLOCKS.map((b) => ({ b, d: Math.hypot(b.x - pj.eye[0], b.z - pj.eye[2]) })).sort((a, c) => c.d - a.d);
  const dimDemo = 1;
  for (const { b } of order) {
    const k = E.outBack(clamp((u - b.t) / 0.7), 1.3);
    if (k <= 0) continue;
    const h = blockH(b, u) * k, s = 0.36;
    const [col, br] = blockColor(b, u);
    const hid = b.hidden ? lerp(0.22, 1, u > 40.5 ? revealK(b, u) : 0) : 1;
    const a = br * (1 - fg * 0.65) * dimDemo * floorK * hid;
    const c = [[-s, -s], [s, -s], [s, s], [-s, s]].map(([dx, dz]) => [b.x + dx, b.z + dz]);
    const bot = c.map(([x, z]) => pj.to([x, 0.01, z])), top = c.map(([x, z]) => pj.to([x, h, z]));
    if ([...bot, ...top].some((p) => !p.ok)) continue;
    g.save();
    g.fillStyle = rgba(col, 0.1 * a); g.beginPath(); top.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.fill();
    for (let i = 0; i < 4; i++) {   // side faces, faint
      const j = (i + 1) % 4;
      g.fillStyle = rgba(col, 0.05 * a); g.beginPath(); g.moveTo(bot[i].x, bot[i].y); g.lineTo(bot[j].x, bot[j].y); g.lineTo(top[j].x, top[j].y); g.lineTo(top[i].x, top[i].y); g.closePath(); g.fill();
    }
    g.strokeStyle = rgba(col, 0.75 * a); g.lineWidth = 1.3;
    g.beginPath(); top.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.stroke();
    g.strokeStyle = rgba(col, 0.4 * a);
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(bot[i].x, bot[i].y); g.lineTo(top[i].x, top[i].y); g.stroke(); }
    g.fillStyle = rgba(col, 0.08 * a); g.beginPath(); bot.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.fill();
    g.restore();
  }
  // packets along the lines (Manhattan routes between systems)
  const pc = pclock(u);
  const vis = clamp((u - 15.5) / 1.5) * (1 - fg * 0.5) * dimDemo * floorK;
  if (vis <= 0) return;
  for (const p of PACKETS) {
    if (u < Math.max(p.a.t, p.b.t) + 0.6) continue;
    const L2 = Math.abs(p.b.x - p.a.x) + Math.abs(p.b.z - p.a.z) + 0.01;
    const s = ((pc * p.sp * 6) / L2 + p.ph) % 1;
    const at = (q) => { const dd = q * L2, lx = Math.abs(p.b.x - p.a.x); return dd < lx ? [p.a.x + Math.sign(p.b.x - p.a.x) * dd, p.a.z] : [p.b.x, p.a.z + Math.sign(p.b.z - p.a.z) * (dd - lx)]; };
    const rogue = p.agent && u > 27.6 && u < 34.6;
    let [x, z] = at(s);
    if (rogue) { x += 2.4 * noise1(u * 0.9 + p.seed, 3); z += 2.4 * noise1(u * 0.9 + p.seed, 9); }
    const col = rogue ? PAL.amber : u > 35 ? PAL.teal : PAL.pearl;
    const head = pj.to([x, 0.05, z]);
    if (!head.ok) continue;
    let [tx2, tz] = at(Math.max(0, s - 0.06));
    if (rogue) { tx2 += 2.4 * noise1((u - 0.15) * 0.9 + p.seed, 3); tz += 2.4 * noise1((u - 0.15) * 0.9 + p.seed, 9); }
    const tail = pj.to([tx2, 0.05, tz]);
    g.save();
    if (tail.ok) {
      const gr = g.createLinearGradient(tail.x, tail.y, head.x, head.y);
      gr.addColorStop(0, rgba(col, 0)); gr.addColorStop(1, rgba(col, 0.9 * vis));
      g.strokeStyle = gr; g.lineWidth = 2.2; g.beginPath(); g.moveTo(tail.x, tail.y); g.lineTo(head.x, head.y); g.stroke();
    }
    g.fillStyle = rgba(col, vis); g.beginPath(); g.arc(head.x, head.y, Math.max(1.4, 18 / head.d), 0, Math.PI * 2); g.fill();
    g.restore();
  }
}
// the wordmark as lit grid tiles
let TILES = null;
function buildTiles() {
  const cols = 120, rows = Math.round((cols * LOGO.h) / LOGO.w), sc = 10;
  const mk = (paths) => { const c = document.createElement('canvas'); c.width = LOGO.w * sc; c.height = LOGO.h * sc; const x = c.getContext('2d'); x.scale(sc, sc); x.fillStyle = '#fff'; paths.forEach((d) => x.fill(new Path2D(d))); return x.getImageData(0, 0, c.width, c.height).data; };
  const Lm = mk(LOGO.letters), Sp = mk(LOGO.sparkles), cw = LOGO.w * sc;
  const rnd = M.mulberry32(5);
  TILES = { cols, rows, list: [] };
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const px = Math.floor(((c + 0.5) / cols) * LOGO.w * sc), py = Math.floor(((r + 0.5) / rows) * LOGO.h * sc), o = (py * cw + px) * 4 + 3;
    const sp = Sp[o] > 128, le = Lm[o] > 128;
    if (sp || le) TILES.list.push({ c, r, sp, ord: (c / cols) * 0.75 + (r / rows) * 0.12 + rnd() * 0.13 });
  }
}
function logoRect(pj, cy) {
  const a = pj.to([-LOGO_W / 2, cy + (LOGO_W * LOGO.h) / LOGO.w / 2, WALL_Z]), b = pj.to([LOGO_W / 2, cy - (LOGO_W * LOGO.h) / LOGO.w / 2, WALL_Z]);
  return { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y, ok: a.ok && b.ok };
}
function logoTiles(g, u, pj, t0, k) {
  const R = logoRect(pj, LOGO_Y);
  if (!R.ok) return;
  const tw = R.w / TILES.cols, th = R.h / TILES.rows;
  const settle = ease(u, t0 + 1.5, t0 + 2.3);
  g.save();
  for (const t of TILES.list) {
    const kk = clamp((u - t0 - t.ord * 1.4) / 0.22);
    if (kk <= 0) continue;
    const flash = Math.exp(-Math.max(0, u - t0 - t.ord * 1.4 - 0.22) * 3) * (1 - settle);
    const a = k * kk * (0.55 + 0.9 * flash) * (1 - 0.6 * settle);
    g.fillStyle = t.sp ? `rgba(255,255,255,${a})` : rgba(PAL.green, a);
    const gx = tw * 0.12;
    g.fillRect(R.x + t.c * tw + gx, R.y + t.r * th + gx, tw - 2 * gx, th - 2 * gx);
  }
  g.restore();
}
function drawLogoCrisp(ctx, u, pj, t0) {
  const a = ease(u, t0 + 1.5, t0 + 2.3);
  if (a <= 0) return;
  const R = logoRect(pj, LOGO_Y);
  if (!R.ok) return;
  const k = R.w / LOGO.w;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(R.x, R.y); ctx.scale(k, k);
  ctx.shadowColor = rgba(PAL.green, 0.55); ctx.shadowBlur = 30 / k;
  ctx.fillStyle = PAL.green; LOGO.letters.forEach((d) => ctx.fill(new Path2D(d)));
  ctx.shadowColor = 'rgba(255,255,255,0.8)';
  LOGO.sparkles.forEach((d, i) => {
    const sk = M.spring((u - (t0 + 2.2 + i * 0.3)) * M.GRID.period, { stiffness: 260, damping: 13 });
    if (sk <= 0) return;
    const cx = i ? 56.06 : 28.1, cy = 7.38;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((1 - sk) * 1.6); ctx.scale(sk, sk); ctx.translate(-cx, -cy);
    ctx.fillStyle = '#FFFFFF'; ctx.fill(new Path2D(d)); ctx.restore();
  });
  ctx.restore();
}

// ================================================================= governance, as motion graphics (b34-90)
// No product UI: every capability is told in the grid world itself.
const ringPts = (pj, c, r, y = 0.02, n = 96) => { const o = []; for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; o.push(pj.to([c[0] + Math.cos(a) * r, y, c[2] + Math.sin(a) * r])); } return o; };
function polyline(g, pts) { g.beginPath(); let st = false; for (const s of pts) { if (!s.ok) { st = false; continue; } if (st) g.lineTo(s.x, s.y); else { g.moveTo(s.x, s.y); st = true; } } g.stroke(); }
function arcPts(pj, a, b, lift, n = 28, upto = 1) { const o = []; for (let i = 0; i <= n; i++) { const t = (i / n) * upto; const m = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + lift, (a[2] + b[2]) / 2]; o.push(pj.to([0, 1, 2].map((k) => (1 - t) ** 2 * a[k] + 2 * (1 - t) * t * m[k] + t * t * b[k]))); } return o; }
const arcAt = (a, b, lift, t) => { const m = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + lift, (a[2] + b[2]) / 2]; return [0, 1, 2].map((k) => (1 - t) ** 2 * a[k] + 2 * (1 - t) * t * m[k] + t * t * b[k]); };
function sparks(g, s, u, u0, n, color, seed, size = 1) {
  const t = u - u0; if (t < 0 || t > 1.4 || !s.ok) return;
  const k = 1 - t / 1.4, sc = (10 / s.d) * size;
  for (let i = 0; i < n; i++) {
    const a = M.hash01(i, seed) * Math.PI * 2, sp = (40 + 160 * M.hash01(i, seed + 3)) * sc;
    const x = s.x + Math.cos(a) * sp * E.outCubic(t / 1.4), y = s.y + Math.sin(a) * sp * E.outCubic(t / 1.4) + 30 * sc * t * t;
    g.fillStyle = rgba(color, k * (0.6 + 0.4 * M.hash01(i, seed + 7))); g.beginPath(); g.arc(x, y, Math.max(1, 2.4 * sc * k), 0, Math.PI * 2); g.fill();
  }
}
const radarR = (u) => 24 * E.outCubic(prog(u, 40.8, 46.6));
const revealK = (b, u) => { if (!b.hidden) return 1; const d = Math.hypot(b.x - CORE[0], b.z - CORE[2]); return clamp((radarR(u) - d) / 1.2); };
const tierK = (u) => ease(u, 51, 52.6) * (1 - ease(u, 59.0, 62.4));   // risk calms as the controls map
const TIER_H = [0.55, 1.35, 2.5], TIER_C = [PAL.teal, PAL.amber, PAL.coral];
function blockH(b, u) { return lerp(b.h, TIER_H[b.tier], tierK(u)); }
function governance(g, u, pj) {
  const top = (b) => [b.x, blockH(b, u) * E.outBack(clamp((u - b.t) / 0.7), 1.3), b.z];
  // ---- the core rises at "one clear view", and every system threads to it
  const coreK = ease(u, 35.2, 37.4, E.outCubic) * (1 - ease(u, 89.6, 90.8));
  if (coreK > 0) {
    const Hc = 3.0 * coreK, rot = u * 0.15, R = 0.95;
    const ring = (y) => Array.from({ length: 7 }, (_, i) => { const a = rot + (i / 6) * Math.PI * 2; return pj.to([CORE[0] + Math.cos(a) * R, y, CORE[2] + Math.sin(a) * R]); });
    g.save(); g.lineWidth = 1.6; g.strokeStyle = rgba(PAL.teal, 0.85 * coreK);
    const b0 = ring(0), b1 = ring(Hc);
    polyline(g, b0); polyline(g, b1);
    for (let i = 0; i < 6; i++) polyline(g, [b0[i], b1[i]]);
    for (let q = 0; q < 3; q++) { const y = ((u * 0.35 + q / 3) % 1) * Hc; g.strokeStyle = rgba(PAL.teal, 0.45 * coreK); polyline(g, ring(y)); }
    const tp = pj.to([CORE[0], Hc + 0.4, CORE[2]]);
    if (tp.ok) { const r = (14 + 4 * Math.sin(u * 3)) * (10 / tp.d); const gr = g.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, r * 3); gr.addColorStop(0, rgba(PAL.pearl, 0.95 * coreK)); gr.addColorStop(0.3, rgba(PAL.teal, 0.5 * coreK)); gr.addColorStop(1, rgba(PAL.teal, 0)); g.fillStyle = gr; g.fillRect(tp.x - r * 3, tp.y - r * 3, r * 6, r * 6); }
    g.restore();
    // threads, block -> core, with pulses flowing in
    const mon = ease(u, 77, 78.5) * (1 - ease(u, 83.5, 85));
    BLOCKS.forEach((b, i) => {
      const t0 = 36.6 + i * 0.05, k = ease(u, t0, t0 + 1.2) * coreK * (b.hidden ? revealK(b, u) : 1);
      if (k <= 0) return;
      const a = top(b), c = [CORE[0], Hc * 0.5, CORE[2]];
      g.save(); g.lineWidth = 1.1; g.strokeStyle = rgba(PAL.cyan, (0.16 + 0.22 * mon) * k);
      polyline(g, arcPts(pj, a, c, 1.2, 20, k)); g.restore();
      if (k >= 1) { const f = (u * 0.35 + M.hash01(i, 5)) % 1; const s = pj.to(arcAt(a, c, 1.2, f)); if (s.ok) { g.fillStyle = rgba(PAL.teal, 0.8 * Math.sin(f * Math.PI) * (0.5 + mon)); g.beginPath(); g.arc(s.x, s.y, Math.max(1.3, 16 / s.d), 0, Math.PI * 2); g.fill(); } }
    });
  }
  // ---- discover: a radar ring sweeps out from the core and lights what was hiding
  const rr = radarR(u), rk = 1 - ease(u, 46.6, 48);
  if (rr > 0 && rk > 0) {
    g.save();
    g.strokeStyle = rgba(PAL.teal, 0.9 * rk); g.lineWidth = 2.6; polyline(g, ringPts(pj, CORE, rr));
    for (let q = 1; q <= 3; q++) { g.strokeStyle = rgba(PAL.teal, (0.25 / q) * rk); g.lineWidth = 1.4; polyline(g, ringPts(pj, CORE, Math.max(0.1, rr - q * 0.8))); }
    g.restore();
    BLOCKS.forEach((b, i) => { if (!b.hidden) return; const d = Math.hypot(b.x - CORE[0], b.z - CORE[2]); sparks(g, pj.to(top(b)), u, 40.8 + 5.8 * (1 - Math.pow(1 - d / 24, 1 / 3)) || 0, 10, b === SB ? PAL.amber : PAL.teal, 30 + i, 0.7); });
  }
  // the shadow system: a reticle locks on, then it is registered
  const lk = ease(u, 45.6, 46.6, E.outCubic) * (1 - ease(u, 48.6, 49.4));
  if (lk > 0) {
    const s = pj.to([SB.x, blockH(SB, u) * 0.5, SB.z]);
    if (s.ok) {
      const reg = u > 47.8, sz = (60 + 120 * (1 - lk)) * (10 / s.d), rot = (1 - lk) * 1.2;
      g.save(); g.translate(s.x, s.y); g.rotate(rot); g.strokeStyle = rgba(reg ? PAL.teal : PAL.amber, 0.95 * lk); g.lineWidth = 2.4;
      for (let q = 0; q < 4; q++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(sz, sz * 0.45); g.lineTo(sz, sz); g.lineTo(sz * 0.45, sz); g.stroke(); }
      g.restore();
      sparks(g, s, u, 47.8, 16, PAL.teal, 77, 1.1);
    }
  }
  // ---- assess: a gauge ring on the floor round the high-risk system
  const gk = ease(u, 51.4, 52.2) * (1 - ease(u, 56.2, 57));
  if (gk > 0) {
    const fillK = ease(u, 51.6, 53.0, E.outCubic) * 0.78;
    g.save();
    for (let i = 0; i < 48; i++) {
      const a = -Math.PI / 2 + (i / 48) * Math.PI * 2, on = i / 48 < fillK;
      const p0 = pj.to([HI.x + Math.cos(a) * 1.25, 0.03, HI.z + Math.sin(a) * 1.25]), p1 = pj.to([HI.x + Math.cos(a) * 1.6, 0.03, HI.z + Math.sin(a) * 1.6]);
      if (!p0.ok || !p1.ok) continue;
      g.strokeStyle = on ? rgba(PAL.coral, 0.95 * gk) : rgba(PAL.pearl, 0.14 * gk); g.lineWidth = on ? 3 : 2;
      g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.stroke();
    }
    g.restore();
    sparks(g, pj.to([HI.x, blockH(HI, u), HI.z]), u, 53.0, 14, PAL.coral, 91, 1);
  }
  // ---- comply: two monoliths of light, one thread from every system to both at once
  const pk = ease(u, 56.6, 58.8, E.outCubic) * (1 - ease(u, 67.6, 69.4));
  if (pk > 0) {
    const fill = ease(u, 59.2, 62.6);
    for (const P0 of [PILLAR_L, PILLAR_R]) {
      const h = 7.5 * pk, w = 0.8;
      const c = [[-w, -w], [w, -w], [w, w], [-w, w]];
      const bot = c.map(([dx, dz]) => pj.to([P0[0] + dx, 0, P0[2] + dz])), tpp = c.map(([dx, dz]) => pj.to([P0[0] + dx, h, P0[2] + dz]));
      g.save(); g.strokeStyle = rgba(PAL.pearl, 0.75 * pk); g.lineWidth = 1.6;
      polyline(g, [...tpp, tpp[0]]); for (let i = 0; i < 4; i++) polyline(g, [bot[i], tpp[i]]);
      for (let q = 0; q < 14; q++) {   // scanlines, lit from the bottom as controls map in
        const y = (q / 14) * h, lit = y / h < fill;
        const ring = c.map(([dx, dz]) => pj.to([P0[0] + dx, y, P0[2] + dz]));
        g.strokeStyle = lit ? rgba(PAL.teal, 0.7 * pk) : rgba(PAL.pearl, 0.1 * pk); g.lineWidth = lit ? 1.6 : 1; polyline(g, [...ring, ring[0]]);
      }
      g.restore();
    }
    BLOCKS.forEach((b, i) => {
      if (i % 2) return;
      const t0 = 58.6 + (i / BLOCKS.length) * 2.2, k = ease(u, t0, t0 + 0.9) * (1 - ease(u, 67.4, 68.8));
      if (k <= 0) return;
      for (const P0 of [PILLAR_L, PILLAR_R]) {
        const a = top(b), c2 = [P0[0], 4.5, P0[2]];
        g.save(); g.strokeStyle = rgba(PAL.teal, 0.32 * k); g.lineWidth = 1.1; polyline(g, arcPts(pj, a, c2, 2.0, 22, k)); g.restore();
        if (k >= 1) { const f = (u * 0.5 + M.hash01(i, 9)) % 1; const s = pj.to(arcAt(a, c2, 2.0, f)); if (s.ok) { g.fillStyle = rgba(PAL.pearl, 0.85 * Math.sin(f * Math.PI)); g.beginPath(); g.arc(s.x, s.y, Math.max(1.3, 15 / s.d), 0, Math.PI * 2); g.fill(); } }
      }
    });
  }
  // evidence: cubes fly in from the systems and stack into a sealed vault
  const vk = 1 - ease(u, 68.4, 69.6);
  if (u > 63.4 && vk > 0) {
    for (let k = 0; k < 8; k++) {
      const src = BLOCKS[(k * 5 + 3) % BLOCKS.length], t0 = 63.6 + k * 0.3;
      const f = ease(u, t0, t0 + 0.9, E.inOutCubic);
      if (f <= 0) continue;
      const dst = [VAULT[0], 0.3 + k * 0.62, VAULT[2]];
      const p = arcAt([src.x, blockH(src, u), src.z], dst, 2.4, f), s = 0.27;
      const cs = [[-s, -s], [s, -s], [s, s], [-s, s]];
      const bot = cs.map(([dx, dz]) => pj.to([p[0] + dx, p[1] - s, p[2] + dz])), tpp = cs.map(([dx, dz]) => pj.to([p[0] + dx, p[1] + s, p[2] + dz]));
      const sealed = u > 66.2;
      g.save(); g.strokeStyle = rgba(sealed ? PAL.teal : PAL.cyan, 0.9 * vk); g.lineWidth = 1.4;
      g.fillStyle = rgba(sealed ? PAL.teal : PAL.cyan, 0.14 * vk); g.beginPath(); tpp.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y))); g.closePath(); g.fill();
      polyline(g, [...tpp, tpp[0]]); polyline(g, [...bot, bot[0]]); for (let i = 0; i < 4; i++) polyline(g, [bot[i], tpp[i]]);
      g.restore();
    }
    const sk = ease(u, 66.0, 66.6, E.outBack) * vk;
    if (sk > 0) { g.save(); g.strokeStyle = rgba(PAL.teal, 0.9 * Math.min(1, sk)); g.lineWidth = 2.4; polyline(g, ringPts(pj, VAULT, 0.9 * sk, 2.6, 64)); polyline(g, ringPts(pj, VAULT, 1.1 * sk, 0.05, 64)); g.restore(); }
    sparks(g, pj.to([VAULT[0], 2.6, VAULT[2]]), u, 66.2, 20, PAL.teal, 55, 1.2);
  }
  // ---- guard: a lattice dome round one agent; a rogue action is turned back; a gate waits for a person
  const dk = ease(u, 68.8, 69.8) * (1 - ease(u, 76.6, 77.4));
  if (dk > 0) {
    const Rd = 2.0, ripT = u - 70.5, hit = DOME_HIT;
    const rip = (lat, lon) => { if (ripT < 0 || ripT > 1.6) return 0; const d = [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)]; const ang = Math.acos(clamp(d[0] * hit[0] + d[1] * hit[1] + d[2] * hit[2], -1, 1)); return Math.exp(-(((ang - ripT * 1.6) * 3) ** 2)) * (1 - ripT / 1.6); };
    g.save(); g.lineWidth = 1.2;
    for (let la = 0; la < 6; la++) {
      const lat = (la / 6) * Math.PI / 2, pts = [];
      for (let i = 0; i <= 48; i++) { const lon = (i / 48) * Math.PI * 2; pts.push(pj.to([HERO.x + Math.cos(lat) * Math.cos(lon) * Rd, Math.sin(lat) * Rd, HERO.z + Math.cos(lat) * Math.sin(lon) * Rd])); }
      g.strokeStyle = rgba(PAL.violet, (0.35 + 1.4 * rip(lat, 0.5)) * dk); polyline(g, pts);
    }
    for (let lo = 0; lo < 16; lo++) {
      const lon = (lo / 16) * Math.PI * 2, pts = [];
      for (let i = 0; i <= 16; i++) { const lat = (i / 16) * Math.PI / 2; pts.push(pj.to([HERO.x + Math.cos(lat) * Math.cos(lon) * Rd, Math.sin(lat) * Rd, HERO.z + Math.cos(lat) * Math.sin(lon) * Rd])); }
      g.strokeStyle = rgba(PAL.violet, (0.3 + 1.2 * rip(0.5, lon)) * dk); polyline(g, pts);
    }
    g.restore();
    // the rogue action
    const start = [HERO.x, 1.0, HERO.z], hp = [HERO.x + hit[0] * Rd, hit[1] * Rd, HERO.z + hit[2] * Rd];
    const pos = (q) => { if (q < 69.6) return null; if (q < 70.5) return [0, 1, 2].map((k) => lerp(start[k], hp[k], (q - 69.6) / 0.9)); const t = q - 70.5; return [hp[0] - hit[0] * t * 1.4 + hit[2] * t * 0.9, Math.max(0.2, hp[1] - t * 0.5), hp[2] - hit[2] * t * 1.4 - hit[0] * t * 0.9]; };
    const fade = 1 - ease(u, 71.4, 72.2);
    for (let q = 0; q < 10; q++) { const p = pos(u - q * 0.035); if (!p) continue; const s = pj.to(p); if (!s.ok) continue; g.fillStyle = rgba(q ? PAL.amber : '#FFFFFF', (1 - q / 10) * fade * dk); g.beginPath(); g.arc(s.x, s.y, Math.max(1.5, (24 - q * 1.6) / s.d), 0, Math.PI * 2); g.fill(); }
    sparks(g, pj.to(hp), u, 70.5, 22, PAL.coral, 61, 1.2);
    // the gate and the person
    const gk2 = ease(u, 71.8, 72.6) * dk, ok = u > 74.6;
    if (gk2 > 0) {
      const G0 = GATE, w = 0.55, h = 1.3;
      const q = [[-w, 0], [-w, h], [w, h], [w, 0]].map(([dx, dy]) => pj.to([G0[0] + dx, dy, G0[2]]));
      g.save(); g.strokeStyle = rgba(ok ? PAL.teal : PAL.violet, 0.95 * gk2); g.lineWidth = 3; polyline(g, q); g.restore();
      const hk = ease(u, 73.6, 74.2) * dk;
      const hs = pj.to([G0[0], h + 0.75, G0[2]]);
      if (hk > 0 && hs.ok) {
        const r = 34 * (10 / hs.d);
        g.save(); g.globalAlpha = hk; g.strokeStyle = ok ? PAL.teal : PAL.pearl; g.lineWidth = 2.4;
        g.beginPath(); g.arc(hs.x, hs.y, r, 0, Math.PI * 2); g.stroke();
        g.fillStyle = ok ? PAL.teal : PAL.pearl; g.beginPath(); g.arc(hs.x, hs.y - r * 0.28, r * 0.24, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.ellipse(hs.x, hs.y + r * 0.42, r * 0.46, r * 0.3, 0, Math.PI, 0); g.fill();
        g.restore();
      }
      sparks(g, hs, u, 74.6, 18, PAL.teal, 88, 1.1);
      // the waiting action, then through
      const pb = (qq) => { if (qq < 72.2) return null; const from = [HERO.x, 1.0, HERO.z], at = [G0[0], 0.65, G0[2]]; if (qq < 73.0) return [0, 1, 2].map((k) => lerp(from[k], at[k], E.inOutCubic((qq - 72.2) / 0.8))); if (qq < 74.8) return at; const t = qq - 74.8; return [at[0] + t * 0.3, 0.65 + t * 0.1, at[2] + t * 2.4]; };
      for (let q2 = 0; q2 < 8; q2++) { const p = pb(u - q2 * 0.03); if (!p) continue; const s = pj.to(p); if (!s.ok) continue; const wait = u > 73 && u < 74.8 ? 0.6 + 0.4 * Math.sin(u * 14) : 1; g.fillStyle = rgba(ok ? PAL.teal : PAL.amber, (1 - q2 / 8) * dk * wait); g.beginPath(); g.arc(s.x, s.y, Math.max(1.5, (22 - q2 * 1.8) / s.d), 0, Math.PI * 2); g.fill(); }
    }
  }
  // ---- monitor: live telemetry drawn across the sky of the world
  const mk = ease(u, 77.4, 78.6) * (1 - ease(u, 83.2, 84.4));
  if (mk > 0) {
    const lines = [[PAL.teal, 0.2, 0], [PAL.cyan, 0.27, 1]];
    for (const [col, yf, i] of lines) {
      const y0 = H * (P ? yf + 0.12 : yf), x0 = P ? S.x : 110, x1 = W - (P ? S.x : 110);
      const head = clamp((u - 77.4) / 3.2);
      g.save(); g.strokeStyle = rgba(col, 0.9 * mk); g.lineWidth = 2; g.beginPath();
      for (let q = 0; q <= 160; q++) {
        const f = q / 160; if (f > head) break;
        const tt = u * 0.9 + f * 7 + i * 3;
        const v = i === 0 ? Math.exp(-(((((f * 6 + 0.3) % 1) - 0.5) * 22) ** 2)) - 0.45 * Math.exp(-(((((f * 6 + 0.3) % 1) - 0.56) * 30) ** 2)) : 0.35 * Math.sin(tt * 1.7) * Math.sin(tt * 0.6 + 1) + 0.12 * Math.sin(tt * 4.1);
        const y = y0 - v * 40;
        if (q) g.lineTo(lerp(x0, x1, f), y); else g.moveTo(lerp(x0, x1, f), y);
      }
      g.stroke(); g.restore();
    }
  }
}
// crisp tags anchored in the world
function tag(ctx, s, str, a, color = '#CFE6FF') {
  if (a <= 0.01 || !s.ok) return;
  const lead = 34;
  ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = rgba(color, 0.6); ctx.lineWidth = 1.2;
  ctx.font = font(P ? 24 : 20, 750, UI); ctx.letterSpacing = '3.4px';
  const flip = s.x + 30 + ctx.measureText(str).width > W - 24;   // near the right edge: label goes left
  ctx.letterSpacing = '0px';
  const dx = flip ? -1 : 1;
  ctx.beginPath(); ctx.moveTo(s.x, s.y - 8); ctx.lineTo(s.x, s.y - lead); ctx.lineTo(s.x + 14 * dx, s.y - lead - 12); ctx.stroke();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(s.x, s.y - 6, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 10;
  text(ctx, str, s.x + 20 * dx, s.y - lead - 8, font(P ? 24 : 20, 750, UI), color, flip ? 'right' : 'left', 3.4);
  ctx.restore();
}
function govTags(ctx, u, pj) {
  const fadeD = 1 - ease(u, 49.2, 50.2);
  if (u > 41 && fadeD > 0) {
    TAGGED.forEach(([b, name]) => tag(ctx, pj.to([b.x, blockH(b, u) + 0.15, b.z]), name, revealK(b, u) * ease(u, 41, 42) * fadeD));
    const reg = u > 47.8;
    tag(ctx, pj.to([SB.x, blockH(SB, u) + 0.15, SB.z]), reg ? 'REGISTERED' : 'SHADOW AI', ease(u, 45.8, 46.6) * fadeD, reg ? '#7DF5CF' : '#FFD08A');
  }
  const ta = ease(u, 52.4, 53.2) * (1 - ease(u, 56.2, 57));
  if (ta > 0) {
    tag(ctx, pj.to([HI.x, blockH(HI, u) + 0.15, HI.z]), 'HIGH RISK', ta, '#FF9AA6');
    TIERED.forEach(([b, name, col]) => tag(ctx, pj.to([b.x, blockH(b, u) + 0.15, b.z]), name, ta, col));
  }
  const pa = ease(u, 58.2, 59) * (1 - ease(u, 67.6, 68.6));
  if (pa > 0) {
    [['EU AI ACT', PILLAR_L], ['ISO/IEC 42001', PILLAR_R]].forEach(([str, P0]) => {
      const s = pj.to([P0[0], 7.5 * ease(u, 56.6, 58.8) + 0.5, P0[2]]);
      if (!s.ok) return;
      ctx.save(); ctx.globalAlpha = pa; ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 12;
      text(ctx, str, s.x, s.y, font(P ? 28 : 26, 750, UI), '#DDF6FF', 'center', 5); ctx.restore();
    });
  }
  tag(ctx, pj.to([VAULT[0], 3.4, VAULT[2]]), 'AUDIT-READY', ease(u, 66.2, 66.8) * (1 - ease(u, 68.4, 69.2)), '#7DF5CF');
  tag(ctx, pj.to([HERO.x + DOME_HIT[0] * 2, DOME_HIT[1] * 2 + 0.2, HERO.z + DOME_HIT[2] * 2]), 'BLOCKED BY GUARDRAIL', ease(u, 70.6, 71.1) * (1 - ease(u, 72.2, 72.8)), '#FF9AA6');
  const ok = u > 74.6;
  tag(ctx, pj.to([GATE[0] + 0.5, 2.6, GATE[2]]), ok ? 'APPROVED BY A PERSON' : 'APPROVAL REQUIRED', ease(u, 73.0, 73.6) * (1 - ease(u, 76.2, 76.8)), ok ? '#7DF5CF' : '#C9B8FF');
  const ml = ease(u, 78.2, 79) * (1 - ease(u, 83.2, 84));
  if (ml > 0) {
    ctx.save(); ctx.globalAlpha = ml;
    [['AUDIT EVENTS', 0.2], ['MODEL DRIFT', 0.27]].forEach(([str, yf]) => text(ctx, str, P ? S.x : 110, H * (P ? yf + 0.12 : yf) - 52, font(P ? 20 : 17, 750, UI), '#8FE9CF', 'left', 3.2));
    ctx.restore();
  }
}

// ================================================================= type over the film
function charsIn(ctx, str, x, y, f, color, k, align = 'left', track = 0) {
  if (k <= 0) return;
  ctx.save(); ctx.font = f; ctx.letterSpacing = `${track}px`;
  const w = ctx.measureText(str).width;
  let x0 = align === 'center' ? x - w / 2 : x;
  const chars = [...str];
  const size = parseFloat(f.split(' ').find((s) => s.endsWith('px')));
  chars.forEach((ch, i) => {
    const ki = E.outCubic(clamp(k * (1 + chars.length * 0.05) - i * 0.05));
    const adv = ctx.measureText(chars.slice(0, i + 1).join('')).width - ctx.measureText(chars.slice(0, i).join('')).width;
    if (ki > 0) { ctx.globalAlpha = ki; ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.fillText(ch, x0, y + (1 - ki) * size * 0.35); }
    x0 += adv;
  });
  ctx.restore();
}
function chapter(ctx, u, t0, t1, main, caps, side = false) {
  if (u < t0 || u > t1 + 0.1) return;
  const kin = prog(u, t0, t0 + 1.3), out = E.inCubic(prog(u, t1 - 0.7, t1));
  const X = P ? S.x : 110, Y = P ? S.y + 110 : side ? H * 0.5 + 10 : H - 170, size = P ? 84 : side ? 80 : 70;
  ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(0, -out * 20);
  if (!side) {   // a soft dark band so the caption reads over the UI
    const bg = ctx.createRadialGradient(X + 260, Y + 10, 20, X + 260, Y + 10, P ? 560 : 520);
    bg.addColorStop(0, `rgba(3,3,10,${0.82 * Math.min(1, kin * 2)})`); bg.addColorStop(1, 'rgba(3,3,10,0)');
    ctx.fillStyle = bg; ctx.fillRect(0, Y - 340, P ? W : 1100, 700);
  }
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30;
  charsIn(ctx, main, X, Y, `600 ${size}px ${DISPLAY}`, PAL.pearl, kin, 'left', -size * 0.03);
  ctx.shadowBlur = 0;
  const caps2 = Array.isArray(caps) ? caps : [[t0, caps]];
  let cur = caps2[0][1]; for (const [cb, cs] of caps2) if (u >= cb) cur = cs;
  const sw = caps2.find(([cb]) => cb > t0 && Math.abs(u - cb) < 0.35);
  const ca = sw ? clamp(Math.abs(u - sw[0]) / 0.35) : 1;
  const ck = E.outCubic(prog(u, t0 + 0.6, t0 + 1.5));
  ctx.globalAlpha = (1 - out) * ck * ca;
  ctx.strokeStyle = rgba(PAL.green, 0.9); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(X, Y + 46); ctx.lineTo(X + 44 * ck, Y + 46); ctx.stroke();
  const lines = P ? [cur.replace('\n', ' ')] : cur.split('\n');
  lines.forEach((ln, i) => text(ctx, ln, X + 60, Y + 54 + i * 34, font(P ? 26 : 22, 700, UI), '#CFE6FF', 'left', P ? 4 : 3.6));
  ctx.restore();
}
function typeLayer(ctx, u, pj) {
  // ---- the opening claim
  const o1 = prog(u, 0.9, 2.3), o2 = prog(u, 2.6, 3.8), oo = E.inCubic(prog(u, 6.6, 7.5));
  if (u > 0.8 && oo < 1) {
    const s1 = P ? 60 : 78, s2 = P ? 92 : 112;
    const y1 = P ? H * 0.36 : H * 0.38, y2 = y1 + s2 * 1.15;
    ctx.save(); ctx.globalAlpha = 1 - oo; ctx.translate(0, -oo * 30);
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30;
    if (P) {
      charsIn(ctx, 'The first AI governance', W / 2, y1 - s1 * 1.2, `500 ${s1}px ${DISPLAY}`, PAL.pearl, o1, 'center', -1.5);
      charsIn(ctx, 'platform', W / 2, y1, `500 ${s1}px ${DISPLAY}`, PAL.pearl, prog(u, 1.4, 2.6), 'center', -1.5);
    } else charsIn(ctx, 'The first AI governance platform', W / 2, y1, `500 ${s1}px ${DISPLAY}`, PAL.pearl, o1, 'center', -2);
    charsIn(ctx, 'from India.', W / 2, y2, `700 ${s2}px ${DISPLAY}`, PAL.green, o2, 'center', -3);
    const hk = E.inOutCubic(prog(u, 3.6, 4.8));   // a fine saffron / white / green hairline
    if (hk > 0) {
      ctx.font = `700 ${s2}px ${DISPLAY}`; const wd = ctx.measureText('from India.').width * 0.62 * hk;
      ctx.shadowBlur = 0; const yy = y2 + s2 * 0.28;
      [['#FF9933', 0], ['#FFFFFF', 1], ['#138808', 2]].forEach(([col, i]) => { ctx.fillStyle = col; ctx.fillRect(W / 2 - wd / 2 + i * (wd / 3), yy, wd / 3, 4); });
    }
    ctx.restore();
  }
  // ---- the wordmark resolves crisp over its tiles
  if (u > 8 && u < 14.4) { ctx.save(); ctx.globalAlpha = 1 - ease(u, 13.0, 14.0); drawLogoCrisp(ctx, u, pj, 8.0); ctx.restore(); }
  if (u > 90) drawLogoCrisp(ctx, u, pj, 90.2);
  // ---- the problem, as a list that stacks
  const list = [[25, 'Unapproved models.'], [28, 'Autonomous agents.'], [31, 'Unmeasured risk.']];
  const lo = E.inCubic(prog(u, 33.4, 34.2));
  if (u >= 25 && lo < 1) {
    const ls = P ? 60 : 64, lh = ls * 1.3, bx = P ? S.x : 110, by = P ? 1420 : H - 140;
    list.forEach(([b0, str], i) => {
      if (u < b0) return;
      const shift = list.slice(i + 1).reduce((acc, [b1]) => acc + E.inOutCubic(prog(u, b1, b1 + 0.8)), 0);
      ctx.save(); ctx.globalAlpha = (1 - lo) * lerp(1, 0.4, Math.min(1, shift));
      ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 24;
      charsIn(ctx, str, bx, by - shift * lh, `600 ${ls}px ${DISPLAY}`, i === 2 ? '#FF9AA6' : i === 0 ? '#FFD08A' : PAL.pearl, prog(u, b0, b0 + 1.2), 'left', -ls * 0.025);
      ctx.restore();
    });
  }
  govTags(ctx, u, pj);
  // ---- chapters
  chapter(ctx, u, 35.4, 40.2, 'One clear view.', 'EVERY AI SYSTEM\nIN ONE PLATFORM');
  chapter(ctx, u, 40.6, 49.9, 'Discover', 'EVERY MODEL, AGENT\nAND DATASET');
  chapter(ctx, u, 50.1, 55.9, 'Assess', 'RISK, THE MOMENT\nIT APPEARS');
  chapter(ctx, u, 56.2, 68.2, 'Comply', [[56.2, 'EU AI ACT\nISO/IEC 42001'], [63.4, 'EVIDENCE,\nAUDIT-READY']]);
  chapter(ctx, u, 68.5, 76.8, 'Guard', [[68.5, 'GUARDRAILS FOR\nEVERY AGENT'], [72.4, 'PEOPLE IN\nTHE LOOP']]);
  chapter(ctx, u, 77.0, 83.0, 'Monitor', 'EVERYTHING,\nCONTINUOUSLY');
  // ---- the payoff
  const ik = prog(u, 84.0, 85.4), io = E.inCubic(prog(u, 89.0, 89.8));
  if (u > 84 && io < 1) {
    const s = P ? 76 : 96;
    ctx.save(); ctx.globalAlpha = 1 - io; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30;
    if (P) { charsIn(ctx, 'Innovate with', W / 2, H * 0.5, `600 ${s}px ${DISPLAY}`, PAL.pearl, ik, 'center', -2); charsIn(ctx, 'confidence.', W / 2, H * 0.5 + s * 1.1, `600 ${s}px ${DISPLAY}`, PAL.green, prog(u, 84.6, 86), 'center', -2); }
    else charsIn(ctx, 'Innovate with confidence.', W / 2, H * 0.5, `600 ${s}px ${DISPLAY}`, PAL.pearl, ik, 'center', -3);
    ctx.shadowBlur = 0;
    const ak = E.outCubic(prog(u, 85.6, 86.6));
    ctx.globalAlpha = (1 - io) * ak;
    text(ctx, 'AND PROVE IT', W / 2, H * 0.5 + (P ? s * 1.1 + 70 : 70), font(P ? 28 : 24, 700, UI), '#CFE6FF', 'center', 6);
    ctx.restore();
  }
  // ---- end card copy
  if (u > 92) {
    const R = logoRect(pj, LOGO_Y);
    const ty = R.y + R.h + (P ? 110 : 100);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20;
    charsIn(ctx, 'Trusted AI, by design.', W / 2, ty, `500 ${P ? 58 : 56}px ${DISPLAY}`, PAL.pearl, prog(u, 92.6, 94.0), 'center', -1.2);
    ctx.restore();
    const k2 = E.outCubic(prog(u, 94.0, 95.0));
    ctx.save(); ctx.globalAlpha = k2;
    text(ctx, 'niticore.ai', W / 2, ty + (P ? 90 : 80) + (1 - k2) * 12, font(P ? 34 : 30, 700, UI), '#BFF3DE', 'center', 4);
    ctx.restore();
  }
}

// ================================================================= hits (sounds on the picture's accents)
const HITS = [
  [0, 'horizon line', 'sub', { len: 1.4 }],
  [2.6, 'from India', 'whoosh', { len: 0.8, from: 500, to: 2600, gain: 0.12 }],
  [8, 'logo tiles', 'impact'],
  [10.2, 'sparkle', 'bell', { pitch: 'D6', gain: 0.22 }], [10.5, 'sparkle 2', 'bell', { pitch: 'A6', gain: 0.2 }],
  [14.4, 'systems rise', 'whoosh', { len: 1.4, from: 260, to: 1800, gain: 0.14 }],
  [25, 'unapproved', 'blip', { pitch: 'A4', gain: 0.12 }], [28, 'agents', 'blip', { pitch: 'C5', gain: 0.12 }], [31, 'risk', 'thud', { pitch: 60, to: 35, gain: 0.3 }],
  [34.6, 'clarity scan', 'whoosh', { len: 1.4, from: 2600, to: 300, gain: 0.16 }],
  [36.2, 'the core rises', 'swell', { gain: 0.16 }], [37.2, 'threads', 'whoosh', { len: 1.2, from: 400, to: 2400, gain: 0.12 }],
  [41.4, 'radar sweep', 'whoosh', { len: 2.4, from: 260, to: 2200, gain: 0.16 }], [43.4, 'hidden systems light', 'blip', { pitch: 'E5', gain: 0.12 }],
  [46.4, 'reticle locks', 'tick', { gain: 0.3 }], [47.8, 'registered', 'bell', { pitch: 'A5', gain: 0.18 }],
  [51.2, 'risk columns rise', 'riser', { len: 0.8, gain: 0.16 }], [53.0, 'high risk', 'thud', { pitch: 70, to: 45, gain: 0.24 }],
  [57.2, 'monoliths rise', 'sub', { len: 1.0, gain: 0.35 }], [59.2, 'mapped to both', 'whoosh', { len: 1.6, from: 300, to: 2400, gain: 0.14 }], [62.6, 'fully mapped', 'bell', { pitch: 'D6', gain: 0.16 }],
  [64.5, 'evidence', 'tick', { gain: 0.24 }], [65.4, 'evidence', 'tick', { gain: 0.24 }], [66.2, 'sealed', 'bell', { pitch: 'A5', gain: 0.2 }],
  [69.2, 'dome', 'swell', { gain: 0.16 }], [70.5, 'blocked', 'thud', { pitch: 80, to: 40, gain: 0.3 }],
  [73.0, 'waits at the gate', 'blip', { pitch: 'F#5', gain: 0.14 }], [74.6, 'approved', 'bell', { pitch: 'D6', gain: 0.2 }],
  [77.6, 'aerial', 'whoosh', { len: 1.6, from: 300, to: 1800, gain: 0.14 }],
  [84, 'pull back', 'whoosh', { len: 1.6, from: 300, to: 1800, gain: 0.14 }],
  [90.2, 'end logo tiles', 'impact'],
  [92.4, 'sparkle', 'bell', { pitch: 'D6', gain: 0.22 }], [92.7, 'sparkle 2', 'bell', { pitch: 'A6', gain: 0.2 }],
];

M.film({
  fonts: [`500 100px ${DISPLAY}`, `600 100px ${DISPLAY}`, `700 100px ${DISPLAY}`, font(40, 500, UI), font(40, 600, UI), font(40, 700, UI), font(40, 800, UI)],
  images: {},
  hits: HITS,
  samples: 1,   // motion blur happens on the GPU (renderGL accumulates dust sub-frames)
  init() { setupGL(); buildTiles(); },
  draw(ctx, u, t) {
    const cam = camera(u), pj = projector(cam);
    G.glow.clearRect(0, 0, W, H);
    const used = worldGlow(G.glow, u, pj);
    const subs = [];
    for (let k = 0; k < MB; k++) {
      const uk = M.U(t + (k / MB - 0.5) * (SHUTTER / FPS));
      const ck = camera(uk);
      subs.push({ u: uk, cam: ck, pj: projector(ck) });
    }
    renderGL(u, t, subs, used);
    ctx.drawImage(G.cv, 0, 0);
    typeLayer(ctx, u, pj);
  },
});
