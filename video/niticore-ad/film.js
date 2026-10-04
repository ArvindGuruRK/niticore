// Niticore — "Trusted AI, by design". A grid-world product film; a pure function of time.
// Visual language: luminous grid animation (world, wall, wordmark tiles) + a 3D glass app window with a
// cursor driving a real demo (discover, assess, comply, guard, monitor). Particles are only a faint
// dust for depth. GL does the HDR bloom/composite and the window's perspective; 2D draws the grid,
// the UI and the type. Beats are on the measured 96 bpm grid; VO in audio/vo.json.
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
    if (used.has(key) || (Math.abs(x) < 2 && z > -3)) continue;
    used.add(key);
    out.push({ x: x + 0.5, z: z + 0.5, h: 0.35 + rnd() * 1.4, type: Math.floor(rnd() * 3), t: 14.2 + rnd() * 2.8, shadow: rnd() < 0.3, seed: rnd() });
  }
  return out;
})();
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

// ================================================================= the window (3D glass app)
const UW = P ? 1000 : 1440, UH = P ? 1400 : 900;
const WIN = { c: [0, 2.6, -1.0], w: P ? 4.0 : 6.4, h: P ? 5.6 : 4.0 };
const winYaw = K([[35, 0], [40, -6], [50, 5], [56, -5], [68.5, 5], [77, -3], [83, 0], [88, 0]]);
const winRise = (u) => ease(u, 34.8, 37.4, E.outCubic) * (1 - ease(u, 88.6, 90.4, E.inCubic));
function winBasis(u) {
  const y = (winYaw(u) * Math.PI) / 180;
  const right = [Math.cos(y), 0, -Math.sin(y)], up = [0, 1, 0], nrm = [Math.sin(y), 0, Math.cos(y)];
  const r = winRise(u);
  const c = [WIN.c[0], WIN.c[1] - (1 - r) * 4.2, WIN.c[2]];
  return { c, right, up, nrm, r };
}
const winPoint = (B, ux, uy) => [0, 1, 2].map((i) => B.c[i] + B.right[i] * (ux - 0.5) * WIN.w + B.up[i] * (0.5 - uy) * WIN.h);

// ================================================================= camera
// world keys [beat, [eye xyz, target xyz, fov]] and demo keys built from points on the window
const camDemo = (u, ux, uy, dist, yawDeg, elev, center = true, fov = 38) => {
  const B = winBasis(Math.max(u, 37.5));
  if (P) ux = lerp(0.5, ux, 0.25);   // portrait: the window already fills the width; stay centred
  const F = winPoint(B, ux, uy);
  const y = (yawDeg * Math.PI) / 180;
  const n = [B.nrm[0] * Math.cos(y) + B.right[0] * Math.sin(y), 0, B.nrm[2] * Math.cos(y) + B.right[2] * Math.sin(y)];
  const shiftR = P || center ? 0 : -1.6, shiftU = P ? (center ? 0.35 : 1.05) : 0;
  const tgt = [F[0] + B.right[0] * shiftR, F[1] + shiftU, F[2] + B.right[2] * shiftR];
  return [u, [tgt[0] + n[0] * dist, tgt[1] + elev, tgt[2] + n[2] * dist, tgt[0], tgt[1], tgt[2], fov]];
};
const DD = P ? 1.32 : 1;   // portrait pulls back a little
const CAM = [
  [0, [0, 1.15, 9.5, 0, 1.0, -12, 40]], [6.5, [0, 1.25, 8.2, 0, 1.2, -12, 40]],
  [8.2, [0, 2.4, 8.6 * DD, 0, LOGO_Y, WALL_Z, 38]], [13.0, [0, 2.5, 8.0 * DD, 0, LOGO_Y, WALL_Z, 38]],
  [15.0, [0, 6.0, 10.5, 0, 0, -5, 42]], [19, [1.5, 5.2, 8.5, 0, 0, -6, 42]], [24, [3.0, 4.0, 5.0, 0, 0, -8, 44]],
  [33.6, [-2.6, 4.4, 7.0, 0, 0.2, -4, 42]], [35.0, [0, 4.6, 9.5, 0, 1.0, -3, 42]],
  camDemo(37.6, 0.5, 0.5, 9.4 * DD, 0, 0.7, false), camDemo(39.8, 0.5, 0.5, 9.0 * DD, -2, 0.6, false),
  camDemo(41.2, 0.62, 0.42, 5.0 * DD, -5, 0.35), camDemo(45.0, 0.58, 0.58, 4.8 * DD, -3, 0.3), camDemo(47.4, 0.62, 0.7, 4.7 * DD, -2, 0.3),
  camDemo(50.8, 0.72, 0.5, 4.9 * DD, 5, 0.35), camDemo(54.8, 0.7, 0.55, 5.2 * DD, 4, 0.35), camDemo(56.4, 0.38, 0.5, 5.6 * DD, -3, 0.4),
  camDemo(58.6, 0.5, 0.55, 4.9 * DD, -5, 0.35), camDemo(60.8, 0.44, 0.4, 5.0 * DD, -4, 0.35), camDemo(63.8, 0.6, 0.8, 5.0 * DD, 3, 0.3),
  camDemo(67.0, 0.62, 0.72, 5.4 * DD, 3, 0.3), camDemo(68.8, 0.48, 0.45, 5.6 * DD, 5, 0.4), camDemo(72.6, 0.6, 0.38, 4.8 * DD, 3, 0.35),
  camDemo(75.8, 0.55, 0.45, 5.2 * DD, 2, 0.35), camDemo(77.6, 0.5, 0.5, 5.9 * DD, -3, 0.45), camDemo(81.4, 0.52, 0.5, 5.2 * DD, -2, 0.4),
  camDemo(83.2, 0.5, 0.5, 9.0 * DD, 0, 0.8),
  [86.6, [0, 7.0, 15.5, 0, 1.0, -4, 42]], [89.6, [0, 6.0, 14.0, 0, 1.0, -4, 42]],
  [91.0, [0, 2.6, 8.8 * DD, 0, LOGO_Y, WALL_Z, 38]], [100, [0, 2.6, 8.2 * DD, 0, LOGO_Y, WALL_Z, 38]],
];
function camera(u) {
  const c = kf(u, CAM, E.inOutCubic);
  const d = [0.05 * noise1(u * 0.21, 3), 0.04 * noise1(u * 0.19, 7), 0.03 * noise1(u * 0.17, 11)];
  let fov = c[6];
  if (P) fov = (2 * Math.atan(Math.tan((fov * Math.PI) / 360) * 1.75) * 180) / Math.PI;
  // portrait: look further down at the floor in the world shots, so the frame isn't half sky
  const pw = P ? ease(u, 13.4, 15.2) * (1 - ease(u, 34.2, 35.6)) + ease(u, 83.4, 85.4) * (1 - ease(u, 89.6, 90.8)) : 0;
  return { eye: [c[0] + d[0], c[1] + d[1] + pw * 2.5, c[2] + d[2]], tgt: [c[3], c[4] - pw * 2.2, c[5]], fov };
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
const VS_WIN = `#version 300 es
in vec3 aP; in vec2 aUV; uniform mat4 uProj, uView; out vec2 vUv;
void main(){ vUv=aUV; gl_Position=uProj*uView*vec4(aP,1.); }`;
const FS_WIN = `#version 300 es
precision highp float; in vec2 vUv; uniform sampler2D uT; uniform float uA, uFade; out vec4 o;
void main(){ vec4 c=texture(uT,vUv); float f=mix(1.0,pow(vUv.y,4.0),uFade); o=c*uA*f; }`;

// ================================================================= GL plumbing
let G = null;
function setupGL() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const gl = cv.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true, premultipliedAlpha: false, alpha: false });
  if (!gl) throw new Error('WebGL2 unavailable');
  gl.getExtension('EXT_color_buffer_float');
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const mk = (vs, fs) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; };
  const progs = { dust: mk(VS_DUST, FS_POINT), copy: mk(VS_QUAD, FS_COPY), bright: mk(VS_QUAD, FS_BRIGHT), blur: mk(VS_QUAD, FS_BLUR), comp: mk(VS_QUAD, FS_COMP), win: mk(VS_WIN, FS_WIN) };
  const ids = new Float32Array(ND); for (let i = 0; i < ND; i++) ids[i] = i;
  const vaoD = gl.createVertexArray(); gl.bindVertexArray(vaoD);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);
  let loc = gl.getAttribLocation(progs.dust, 'aId'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 1, gl.FLOAT, false, 0, 0);
  const vaoQ = gl.createVertexArray(); gl.bindVertexArray(vaoQ);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  for (const p of [progs.copy, progs.bright, progs.blur, progs.comp]) { const l = gl.getAttribLocation(p, 'aP'); if (l >= 0) { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0); } }
  const vaoW = gl.createVertexArray(); gl.bindVertexArray(vaoW);
  const winBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, winBuf); gl.bufferData(gl.ARRAY_BUFFER, 4 * 5 * 4, gl.DYNAMIC_DRAW);
  loc = gl.getAttribLocation(progs.win, 'aP'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 20, 0);
  loc = gl.getAttribLocation(progs.win, 'aUV'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 20, 12);
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
  const uiCv = document.createElement('canvas'); uiCv.width = UW; uiCv.height = UH;
  const ul = {}; for (const [k, p] of Object.entries(progs)) ul[k] = (n) => gl.getUniformLocation(p, n);
  G = {
    gl, cv, progs, ul, vaoD, vaoQ, vaoW, winBuf, scene: fbo(W, H),
    lv: [2, 4, 8].map((d) => [fbo(Math.ceil(W / d), Math.ceil(H / d)), fbo(Math.ceil(W / d), Math.ceil(H / d))]),
    streak: [fbo(Math.ceil(W / 4), Math.ceil(H / 8)), fbo(Math.ceil(W / 4), Math.ceil(H / 8))],
    glowTex: texOf(false), uiTex: texOf(true), glowCv, glow: glowCv.getContext('2d'), uiCv, ui: uiCv.getContext('2d'),
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
function drawWindow(pj, B, alpha, mirror, fade) {
  const { gl, progs, ul } = G;
  const corners = [[0, 0], [0, 1], [1, 0], [1, 1]].map(([ux, uy]) => {
    const p = winPoint(B, ux, uy);
    return mirror ? [p[0], -p[1], p[2], ux, uy] : [p[0], p[1], p[2], ux, uy];
  });
  gl.useProgram(progs.win); gl.bindVertexArray(G.vaoW);
  gl.bindBuffer(gl.ARRAY_BUFFER, G.winBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(corners.flat()));
  gl.uniformMatrix4fv(ul.win('uProj'), false, pj.proj); gl.uniformMatrix4fv(ul.win('uView'), false, pj.view);
  tex(0, G.uiTex); gl.uniform1i(ul.win('uT'), 0); gl.uniform1f(ul.win('uA'), alpha); gl.uniform1f(ul.win('uFade'), fade);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
const U = {
  aper: K([[0, 0.04], [35, 0.04], [37, 0.06], [83, 0.06], [86, 0.03]]),
  exp: K([[0, 2.4], [8, 2.4], [8.15, 3.0], [9.6, 2.4], [90.2, 2.4], [90.4, 2.9], [92, 2.3], [100, 2.3]]),
};
function renderGL(u, t, subs, glowUsed, win) {
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
  if (win) {   // the window's own light, for a soft halo in the bloom
    gl.bindFramebuffer(gl.FRAMEBUFFER, G.scene.f); gl.viewport(0, 0, W, H);
    drawWindow(win.pj, win.B, 0.18 * win.a, false, 0);
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
  if (win) {   // the window itself: crisp, over the graded image, with a floor reflection
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
    drawWindow(win.pj, win.B, 0.16 * win.a, true, 1);
    drawWindow(win.pj, win.B, win.a, false, 0);
    gl.disable(gl.BLEND);
  }
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
    if (u > 13.8 && u < 91.5) drawSystems(g, u, pj, fg, floorK);
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
        for (let i = 0; i <= 96; i++) { const a = (i / 96) * Math.PI * 2; pts.push(pj.to([Math.cos(a) * rr, 0, -6 + Math.sin(a) * rr])); }
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
  const scan = clamp((u - 34.0 - ((b.z + 36) / 46) * 1.6) / 0.2);   // the scan passes from far to near
  if (scan >= 1) return [b.type === 0 ? PAL.cyan : b.type === 1 ? PAL.violet : PAL.teal, 1];
  if (u > 24.8 && b.shadow) {
    const fl = Math.sin(u * 13 + b.seed * 50) > 0.2 ? 1 : 0.35;
    return [PAL.amber, fl];
  }
  return [b.type === 0 ? PAL.cyan : b.type === 1 ? PAL.violet : PAL.teal, 0.85];
}
function drawSystems(g, u, pj, fg, floorK) {
  const order = BLOCKS.map((b) => ({ b, d: Math.hypot(b.x - pj.eye[0], b.z - pj.eye[2]) })).sort((a, c) => c.d - a.d);
  const dimDemo = 1 - 0.55 * ease(u, 35.5, 37.5) * (1 - ease(u, 83, 86));
  for (const { b } of order) {
    const k = E.outBack(clamp((u - b.t) / 0.7), 1.3);
    if (k <= 0) continue;
    const h = b.h * k, s = 0.36;
    const [col, br] = blockColor(b, u);
    const a = br * (1 - fg * 0.65) * dimDemo * floorK;
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

// ================================================================= the app UI (drawn into a canvas, mapped onto the 3D window)
const C = { bg0: '#101634', bg1: '#0A0E22', card: 'rgba(255,255,255,0.045)', line: 'rgba(170,200,255,0.12)', text: '#EAF0FF', muted: '#8E9BC4', faint: '#5D6890' };
const NAV = [['Dashboard', 'grid'], ['_Inventory'], ['Use Cases', 'cube'], ['Risk Dashboard', 'shield'], ['LLM Evaluations', 'flask'], ['Assessment', 'doc'], ['_Assurance'], ['Audit Dashboard', 'doc'], ['_Governance'], ['Policy Dashboard', 'scale'], ['My Task', 'check']];
const L = (() => {   // layout of the window in UI pixels
  const side = P ? 0 : 268, top = 76;
  const cx = side + (P ? 36 : 32), cw = UW - cx - 36;
  const kpiY = top + (P ? 96 : 92), kpiH = 104, kpiCols = P ? 2 : 4, kpiGap = 18;
  const kpiW = (cw - (kpiCols - 1) * kpiGap) / kpiCols, kpiRows = P ? 2 : 1;
  const mainY = kpiY + (P ? 20 : 0) + kpiRows * kpiH + (kpiRows - 1) * kpiGap + 24;
  const main = { x: cx, y: mainY, w: cw, h: UH - mainY - (P ? 36 : 30) };
  const navItem = (name) => {
    if (P) { const tabs = ['Dashboard', 'Use Cases', 'Policy Dashboard', 'My Task']; const i = tabs.indexOf(name); const w = (UW - 72) / 4; return { x: 36 + i * w, y: top + 14, w: w - 8, h: 50 }; }
    let y = top + 26;
    for (const it of NAV) { if (it[0] === name) return { x: 14, y, w: side - 28, h: 44 }; y += it[0][0] === '_' ? 36 : 48; }
    return { x: 0, y: 0, w: 0, h: 0 };
  };
  return { side, top, cx, cw, kpiY, kpiH, kpiW, kpiGap, kpiCols, main, navItem };
})();
const VIEWS = [['overview', 34.8], ['inventory', 40.6], ['controls', 56.2], ['agents', 68.5], ['monitor', 77.0]];
const viewAt = (u) => { let v = VIEWS[0], prev = null; for (const x of VIEWS) if (u >= x[1]) { prev = v; v = x; } return { name: v[0], t: v[1], prev: prev && prev !== v ? prev[0] : null }; };
const NAVOF = { overview: 'Dashboard', inventory: 'Use Cases', controls: 'Policy Dashboard', agents: 'My Task', monitor: 'Dashboard' };
const TITLE = { overview: ['Overview', 'Every AI system, risk, control and approval in one place'], inventory: ['AI Inventory', 'Models, agents and datasets across the business'], controls: ['Controls', 'One control set, mapped to every framework'], agents: ['Agent activity', 'Guardrails and approvals, live'], monitor: ['Live monitoring', 'Continuous oversight across every system'] };

function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); }
function tx(c, s, x, y, size, weight, color, align = 'left', fam = UI, track = 0) { c.font = `${weight} ${size}px ${fam}`; c.fillStyle = color; c.textAlign = align; c.letterSpacing = `${track}px`; c.fillText(s, x, y); c.letterSpacing = '0px'; }
function chip(c, x, y, label, color, align = 'left', size = 15) {
  c.font = `700 ${size}px ${UI}`; const w = c.measureText(label).width + 22, h = size + 13;
  const X = align === 'right' ? x - w : x;
  rr(c, X, y - h / 2, w, h, h / 2); c.fillStyle = rgba(color, 0.14); c.fill(); c.strokeStyle = rgba(color, 0.5); c.lineWidth = 1; c.stroke();
  tx(c, label, X + w / 2, y + size * 0.36, size, 700, color, 'center');
  return w;
}
function button(c, R, label, primary, press = 0) {
  c.save();
  const s = 1 - 0.05 * press;
  c.translate(R.x + R.w / 2, R.y + R.h / 2); c.scale(s, s); c.translate(-R.x - R.w / 2, -R.y - R.h / 2);
  rr(c, R.x, R.y, R.w, R.h, R.h / 2);
  c.fillStyle = primary ? PAL.green : 'rgba(255,255,255,0.06)'; c.fill();
  if (!primary) { c.strokeStyle = 'rgba(170,200,255,0.25)'; c.lineWidth = 1.2; c.stroke(); }
  tx(c, label, R.x + R.w / 2, R.y + R.h / 2 + 6, 17, 700, primary ? '#04140A' : C.text, 'center');
  c.restore();
}
function icon(c, x, y, kind, color) {
  c.save(); c.strokeStyle = color; c.lineWidth = 1.8; c.lineJoin = 'round';
  if (kind === 'grid') { for (const [a, b] of [[0, 0], [9, 0], [0, 9], [9, 9]]) { rr(c, x + a, y + b, 7, 7, 2); c.stroke(); } }
  else if (kind === 'cube') { c.beginPath(); c.moveTo(x + 8, y); c.lineTo(x + 16, y + 4); c.lineTo(x + 16, y + 12); c.lineTo(x + 8, y + 16); c.lineTo(x, y + 12); c.lineTo(x, y + 4); c.closePath(); c.moveTo(x, y + 4); c.lineTo(x + 8, y + 8); c.lineTo(x + 16, y + 4); c.moveTo(x + 8, y + 8); c.lineTo(x + 8, y + 16); c.stroke(); }
  else if (kind === 'shield') { c.beginPath(); c.moveTo(x + 8, y); c.lineTo(x + 16, y + 3); c.lineTo(x + 15, y + 10); c.quadraticCurveTo(x + 13, y + 15, x + 8, y + 17); c.quadraticCurveTo(x + 3, y + 15, x + 1, y + 10); c.lineTo(x, y + 3); c.closePath(); c.stroke(); }
  else if (kind === 'flask') { c.beginPath(); c.moveTo(x + 5, y); c.lineTo(x + 11, y); c.moveTo(x + 6, y); c.lineTo(x + 6, y + 6); c.lineTo(x + 1, y + 16); c.lineTo(x + 15, y + 16); c.lineTo(x + 10, y + 6); c.lineTo(x + 10, y); c.stroke(); }
  else if (kind === 'doc') { rr(c, x + 1, y, 14, 17, 2); c.stroke(); c.beginPath(); c.moveTo(x + 4, y + 6); c.lineTo(x + 12, y + 6); c.moveTo(x + 4, y + 10); c.lineTo(x + 12, y + 10); c.stroke(); }
  else if (kind === 'scale') { c.beginPath(); c.moveTo(x + 8, y); c.lineTo(x + 8, y + 16); c.moveTo(x + 2, y + 16); c.lineTo(x + 14, y + 16); c.moveTo(x, y + 4); c.lineTo(x + 16, y + 4); c.stroke(); c.beginPath(); c.moveTo(x, y + 4); c.lineTo(x - 1, y + 10); c.lineTo(x + 5, y + 10); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(x + 16, y + 4); c.lineTo(x + 11, y + 10); c.lineTo(x + 17, y + 10); c.closePath(); c.stroke(); }
  else if (kind === 'check') { rr(c, x, y, 16, 16, 4); c.stroke(); c.beginPath(); c.moveTo(x + 4, y + 8); c.lineTo(x + 7, y + 11); c.lineTo(x + 12, y + 5); c.stroke(); }
  c.restore();
}
function checkbox(c, x, y, k, color = PAL.green) {
  rr(c, x, y, 24, 24, 6); c.strokeStyle = 'rgba(170,200,255,0.35)'; c.lineWidth = 1.5; c.stroke();
  if (k <= 0) return;
  c.save(); c.translate(x + 12, y + 12); c.scale(k, k);
  rr(c, -12, -12, 24, 24, 6); c.fillStyle = color; c.fill();
  c.strokeStyle = '#04140A'; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-6, 0); c.lineTo(-1.5, 4.5); c.lineTo(6.5, -5); c.stroke(); c.restore();
}
const pop = (u, t) => clamp(M.spring((u - t) * M.GRID.period, { stiffness: 300, damping: 16 }), 0, 1.15);
const press = (u, t) => Math.exp(-(((u - t - 0.05) / 0.09) ** 2));

// ---- the demo script: data and click targets
const INV = [
  ['Claims Triage Assistant', 'Model', 'Operations', 0], ['Customer Support Agent', 'Agent', 'Service', 0], ['Fraud Signals Dataset', 'Dataset', 'Risk', 0],
  ['Credit Decision Model', 'Model', 'Lending', 43.2], ['Refund Agent', 'Agent', 'Finance', 44.2], ['Marketing Copy Bot', 'Agent', '—', 45.3],
];
const CTRL = [['Human Oversight Procedure', 'CTRL-ART14-001'], ['Automatic Logging System', 'CTRL-ART12-001'], ['Risk Register', 'CTRL-ART9-001'], ['Post-Market Surveillance Plan', 'CTRL-ART9-003'], ['Provider Obligations Register', 'CTRL-ART16-001']];
const TICKS = [57.6, 58.4, 59.2];   // controls 3, 4, 5 on the EU AI Act tab
const R_ = {
  discover: () => ({ x: L.main.x + L.main.w - 230, y: L.main.y + 20, w: 206, h: 48 }),
  row: (i) => ({ x: L.main.x + 16, y: L.main.y + 126 + i * (P ? 92 : 62), w: L.main.w - 32, h: P ? 84 : 56 }),
  register: () => { const r = R_.row(5); return { x: r.x + r.w - 136, y: r.y + (r.h - 38) / 2, w: 120, h: 38 }; },
  tab: (i) => ({ x: L.main.x + 24 + i * 170, y: L.main.y + 74, w: 160, h: 40 }),
  ctrlRow: (i) => ({ x: L.main.x + 16, y: L.main.y + (P ? 200 : 140) + i * (P ? 84 : 60), w: L.main.w - 32, h: P ? 76 : 52 }),
  upload: () => ({ x: L.main.x + 24, y: L.main.y + L.main.h - (P ? 150 : 74), w: 200, h: 46 }),
  exportB: () => ({ x: L.main.x + L.main.w - 254, y: L.main.y + L.main.h - (P ? 150 : 74), w: 230, h: 46 }),
  feed: (i) => ({ x: L.main.x + 16, y: L.main.y + 76 + i * (P ? 190 : 116), w: L.main.w - 32, h: P ? 176 : 104 }),
  approve: () => { const f = R_.feed(0); return P ? { x: f.x + 20, y: f.y + f.h - 58, w: 150, h: 44 } : { x: f.x + f.w - 520, y: f.y + f.h / 2 - 22, w: 136, h: 44 }; },
};
const ctr = (R) => [R.x + R.w / 2, R.y + R.h / 2];
const CLICKS = () => [
  [41.6, ctr(R_.discover())], [47.8, ctr(R_.register())], [50.3, ctr(R_.row(3))], [56.0, ctr(L.navItem('Policy Dashboard'))],
  ...TICKS.map((t, i) => [t, [R_.ctrlRow(i + 2).x + 28, R_.ctrlRow(i + 2).y + R_.ctrlRow(i + 2).h / 2]]),
  [60.8, ctr(R_.tab(1))], [63.6, ctr(R_.upload())], [66.2, ctr(R_.exportB())], [68.3, ctr(L.navItem('My Task'))], [74.4, ctr(R_.approve())], [76.9, ctr(L.navItem('Dashboard'))],
];
let CLK = null;
function cursorAt(u) {
  const ks = [[40.4, [UW * 0.82, UH * 0.95]], ...CLK.flatMap(([t, p]) => [[t - 0.45, p], [t + 0.15, p]]), [79, [UW * 0.78, UH * 0.82]]];
  for (let i = 1; i < ks.length; i++) {
    if (u <= ks[i][0]) {
      const [a, pa] = ks[i - 1], [b, pb] = ks[i];
      const t = E.inOutCubic(prog(u, a, b)), arc = Math.sin(t * Math.PI) * 0.1, dx = pb[0] - pa[0], dy = pb[1] - pa[1];
      return [pa[0] + dx * t - dy * arc, pa[1] + dy * t + dx * arc];
    }
  }
  return ks[ks.length - 1][1];
}
function drawCursor(c, u) {
  const vis = ease(u, 40.4, 40.9) * (1 - ease(u, 82.2, 83));
  if (vis <= 0) return;
  const [x, y] = cursorAt(u);
  let pr = 0;
  for (const [t] of CLK) {
    pr = Math.max(pr, press(u, t));
    const k = prog(u, t, t + 0.7);
    if (k > 0 && k < 1) { c.save(); c.strokeStyle = rgba(PAL.teal, (1 - k) * 0.9); c.lineWidth = 3 * (1 - k) + 1; c.beginPath(); c.arc(x, y, 8 + 34 * E.outCubic(k), 0, Math.PI * 2); c.stroke(); c.restore(); }
  }
  const s = (P ? 2.0 : 1.7) * (1 - 0.16 * pr);
  c.save(); c.globalAlpha = vis; c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 21); c.lineTo(5, 16.4); c.lineTo(8.6, 24.6); c.lineTo(12, 23.1); c.lineTo(8.5, 15.2); c.lineTo(15, 15.2); c.closePath();
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 8; c.shadowOffsetY = 2; c.fillStyle = '#FFFFFF'; c.fill();
  c.shadowColor = 'transparent'; c.lineJoin = 'round'; c.lineWidth = 1.4; c.strokeStyle = '#0A0E22'; c.stroke();
  c.restore();
}

function drawUI(u) {
  const c = G.ui;
  c.clearRect(0, 0, UW, UH);
  const reveal = ease(u, 35.0, 37.0, E.inOutSine);
  c.save();
  rr(c, 0, 0, UW, UH, 28); c.clip();
  if (reveal < 1) { c.beginPath(); c.rect(0, 0, UW, UH * reveal); c.clip(); }
  const g = c.createLinearGradient(0, 0, UW, UH); g.addColorStop(0, C.bg0); g.addColorStop(1, C.bg1);
  c.fillStyle = g; c.fillRect(0, 0, UW, UH);
  const v = viewAt(u);
  c.fillStyle = 'rgba(255,255,255,0.025)'; c.fillRect(0, 0, UW, L.top);
  c.fillStyle = C.line; c.fillRect(0, L.top, UW, 1);
  c.save(); c.translate(28, 22); c.scale(30 / LOGO.h, 30 / LOGO.h); c.fillStyle = PAL.green; LOGO.letters.forEach((d) => c.fill(new Path2D(d))); c.fillStyle = '#fff'; LOGO.sparkles.forEach((d) => c.fill(new Path2D(d))); c.restore();
  if (!P) tx(c, `Workspace  /  ${TITLE[v.name][0]}`, 300, 46, 17, 600, C.muted);
  rr(c, UW - (P ? 330 : 470), 18, P ? 250 : 360, 40, 20); c.fillStyle = 'rgba(255,255,255,0.05)'; c.fill(); c.strokeStyle = C.line; c.stroke();
  tx(c, P ? 'Search' : 'Search systems, risks, controls', UW - (P ? 310 : 448), 44, 15, 500, C.faint);
  c.beginPath(); c.arc(UW - 44, 38, 18, 0, Math.PI * 2); c.fillStyle = 'rgba(62,240,192,0.16)'; c.fill(); tx(c, 'RK', UW - 44, 44, 14, 800, PAL.teal, 'center');
  const active = NAVOF[v.name];
  if (!P) {
    c.fillStyle = 'rgba(255,255,255,0.02)'; c.fillRect(0, L.top, L.side, UH - L.top); c.fillStyle = C.line; c.fillRect(L.side, L.top, 1, UH - L.top);
    let y = L.top + 26;
    for (const it of NAV) {
      if (it[0][0] === '_') { tx(c, it[0].slice(1), 26, y + 24, 14, 600, C.faint); y += 36; continue; }
      const on = it[0] === active;
      if (on) { rr(c, 14, y, L.side - 28, 44, 12); c.fillStyle = 'rgba(62,240,192,0.12)'; c.fill(); c.strokeStyle = 'rgba(62,240,192,0.35)'; c.stroke(); }
      icon(c, 30, y + 13, it[1], on ? PAL.teal : C.muted);
      tx(c, it[0], 62, y + 28, 17, on ? 700 : 600, on ? C.text : C.muted);
      y += 48;
    }
  } else {
    ['Dashboard', 'Use Cases', 'Policy Dashboard', 'My Task'].forEach((n) => {
      const R = L.navItem(n), on = n === active;
      rr(c, R.x, R.y, R.w, R.h, 14); c.fillStyle = on ? 'rgba(62,240,192,0.12)' : 'rgba(255,255,255,0.03)'; c.fill(); c.strokeStyle = on ? 'rgba(62,240,192,0.35)' : C.line; c.stroke();
      tx(c, n === 'Policy Dashboard' ? 'Policies' : n === 'My Task' ? 'Tasks' : n, R.x + R.w / 2, R.y + 32, 18, 700, on ? C.text : C.muted, 'center');
    });
  }
  if (!P) { tx(c, TITLE[v.name][0], L.cx, L.top + 52, 30, 600, C.text, 'left', DISPLAY, -0.5); tx(c, TITLE[v.name][1], L.cx + 300, L.top + 50, 16, 500, C.muted); }
  kpis(c, u, P ? L.kpiY + 20 : L.kpiY);
  const fadeIn = ease(u, v.t, v.t + 0.5);
  if (v.prev && fadeIn < 1) view(c, v.prev, u, 1 - fadeIn, 0);
  view(c, v.name, u, fadeIn, (1 - fadeIn) * 18);
  drawCursor(c, u);
  const ta = ease(u, 66.5, 66.9) * (1 - ease(u, 68.0, 68.4));
  if (ta > 0) {
    const tw = P ? 640 : 520, th = 70, x = UW - tw - 30, y = UH - th - 26 + (1 - ta) * 20;
    c.save(); c.globalAlpha = ta; rr(c, x, y, tw, th, 16); c.fillStyle = '#16304A'; c.fill(); c.strokeStyle = rgba(PAL.teal, 0.6); c.stroke();
    checkbox(c, x + 20, y + 23, 1, PAL.teal);
    tx(c, 'Audit pack exported', x + 60, y + 31, 18, 700, C.text); tx(c, 'EU AI Act + ISO/IEC 42001, evidence attached', x + 60, y + 54, 14, 500, C.muted);
    c.restore();
  }
  if (reveal > 0 && reveal < 1) { c.fillStyle = rgba(PAL.teal, 0.9); c.fillRect(0, UH * reveal - 2, UW, 3); }
  c.restore();
  rr(c, 1, 1, UW - 2, UH - 2, 28); c.strokeStyle = 'rgba(170,210,255,0.3)'; c.lineWidth = 2; c.stroke();
}
function kpis(c, u, y0) {
  const sys = u < 43.2 ? 3 : u < 44.2 ? 4 : u < 45.3 ? 5 : 6;
  const high = u < 53.4 ? '—' : '2';
  const mapped = Math.round(40 + 60 * ease(u, 57.6, 60.0));
  const pend = u >= 72.4 && u < 74.6 ? 1 : 0;
  const items = [['AI systems', String(sys), null, 'registered'], ['High-risk systems', high, PAL.coral, 'need controls'], ['Controls mapped', `${mapped}%`, PAL.teal, 'EU AI Act · ISO 42001'], ['Pending approvals', String(pend), pend ? PAL.violet : null, 'human in the loop']];
  items.forEach(([lab, val, col, sub], i) => {
    const cx = i % L.kpiCols, cy = Math.floor(i / L.kpiCols);
    const x = L.cx + cx * (L.kpiW + L.kpiGap), y = y0 + cy * (L.kpiH + L.kpiGap);
    rr(c, x, y, L.kpiW, L.kpiH, 16); c.fillStyle = C.card; c.fill(); c.strokeStyle = C.line; c.lineWidth = 1; c.stroke();
    tx(c, lab, x + 18, y + 30, 15, 600, C.muted);
    tx(c, val, x + 18, y + 76, 36, 600, col || C.text, 'left', DISPLAY, -0.5);
    c.font = `600 36px ${DISPLAY}`; const vw = c.measureText(val).width;
    tx(c, sub, x + 30 + vw, y + 74, 13, 500, C.faint);
  });
}
function panelBox(c, title, chipL, chipC) {
  const m = L.main;
  rr(c, m.x, m.y, m.w, m.h, 18); c.fillStyle = 'rgba(255,255,255,0.03)'; c.fill(); c.strokeStyle = C.line; c.lineWidth = 1; c.stroke();
  tx(c, title, m.x + 24, m.y + 46, 22, 600, C.text, 'left', DISPLAY, -0.3);
  if (chipL) { c.font = `600 22px ${DISPLAY}`; chip(c, m.x + 40 + c.measureText(title).width, m.y + 39, chipL, chipC); }
}
function view(c, name, u, a, dy) {
  if (a <= 0.001) return;
  c.save(); c.globalAlpha *= a; c.translate(0, dy);
  const m = L.main;
  if (name === 'overview') {
    panelBox(c, 'Governance readiness');
    const k = ease(u, 36.2, 38.6, E.outCubic), cx = m.x + (P ? m.w / 2 : 190), cy = m.y + (P ? 250 : 260), r = P ? 130 : 120;
    c.lineWidth = 16; c.lineCap = 'round';
    c.strokeStyle = 'rgba(255,255,255,0.07)'; c.beginPath(); c.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25); c.stroke();
    c.strokeStyle = PAL.teal; c.beginPath(); c.arc(cx, cy, r, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * 0.78 * k)); c.stroke();
    tx(c, String(Math.round(78 * k)), cx, cy + 18, 64, 600, C.text, 'center', DISPLAY, -1); tx(c, '/ 100', cx, cy + 50, 16, 600, C.muted, 'center');
    const lx = P ? m.x + 30 : m.x + 400, ly = P ? m.y + 450 : m.y + 110;
    tx(c, 'RECENT ACTIVITY', lx, ly, 14, 800, C.faint, 'left', UI, 2.4);
    [['Control mapped', 'Human Oversight Procedure', PAL.teal], ['Risk assessed', 'Claims Triage Assistant', PAL.amber], ['Policy acknowledged', 'Responsible AI policy v1.0', PAL.violet], ['Evidence filed', 'Automatic Logging System', PAL.teal]].forEach(([t1, t2, col], i) => {
      const kk = ease(u, 36.6 + i * 0.35, 37.2 + i * 0.35, E.outCubic);
      if (kk <= 0) return;
      const y = ly + 36 + i * (P ? 92 : 78);
      c.save(); c.globalAlpha *= kk;
      rr(c, lx, y, (P ? m.w - 60 : m.w - 420), P ? 78 : 64, 12); c.fillStyle = C.card; c.fill();
      c.fillStyle = col; rr(c, lx + 14, y + 16, 4, (P ? 78 : 64) - 32, 2); c.fill();
      tx(c, t1, lx + 32, y + 28, 17, 700, C.text); tx(c, t2, lx + 32, y + 50, 15, 500, C.muted);
      c.restore();
    });
  } else if (name === 'inventory') {
    panelBox(c, 'AI Inventory');
    button(c, R_.discover(), u < 41.6 ? 'Run discovery' : u < 45.8 ? 'Scanning…' : 'Run discovery', true, press(u, 41.6));
    const sp = ease(u, 41.7, 45.8);
    if (sp > 0) {
      rr(c, m.x + 24, m.y + 72, m.w - 48, 6, 3); c.fillStyle = 'rgba(255,255,255,0.07)'; c.fill();
      rr(c, m.x + 24, m.y + 72, (m.w - 48) * sp, 6, 3); c.fillStyle = PAL.teal; c.fill();
      tx(c, sp < 1 ? 'Scanning code repositories, cloud accounts and vendors…' : '3 new systems found  ·  1 unregistered', m.x + 24, m.y + 104, 14, 600, sp < 1 ? C.muted : PAL.teal);
    }
    const cols = [0, 0.42, 0.6, 0.78];
    INV.forEach(([name, type, owner, t0], i) => {
      const k = t0 === 0 ? 1 : ease(u, t0, t0 + 0.5, E.outCubic);
      if (k <= 0) return;
      const R = R_.row(i);
      c.save(); c.globalAlpha *= k; c.translate((1 - k) * 30, 0);
      const sel = i === 3 && u > 50.3;
      rr(c, R.x, R.y, R.w, R.h, 12); c.fillStyle = sel ? 'rgba(62,240,192,0.09)' : 'rgba(255,255,255,0.025)'; c.fill();
      if (sel) { c.strokeStyle = 'rgba(62,240,192,0.4)'; c.stroke(); }
      const shadow = i === 5 && u < 47.85;
      if (i === 5) { c.strokeStyle = shadow ? rgba(PAL.amber, 0.55) : 'rgba(62,240,192,0.3)'; c.lineWidth = 1.2; c.stroke(); }
      icon(c, R.x + 18, R.y + R.h / 2 - 8, type === 'Model' ? 'cube' : type === 'Agent' ? 'shield' : 'doc', shadow ? PAL.amber : C.muted);
      tx(c, name, R.x + 50, R.y + R.h / 2 + (P ? -4 : 6), P ? 20 : 18, 700, C.text);
      const own = i === 5 ? (shadow ? 'No owner' : 'Marketing') : owner;
      if (P) tx(c, `${type} · ${own}`, R.x + 50, R.y + R.h / 2 + 24, 15, 500, C.muted);
      else { tx(c, type, R.x + R.w * cols[1], R.y + R.h / 2 + 6, 16, 600, C.muted); tx(c, own, R.x + R.w * cols[2], R.y + R.h / 2 + 6, 16, 600, C.muted); }
      const sx = P ? R.x + R.w - 16 : R.x + R.w * cols[3];
      if (shadow) {
        chip(c, P ? sx - 136 : sx, R.y + R.h / 2, 'Shadow AI', PAL.amber, P ? 'right' : 'left');
        if (u > 46.6) button(c, R_.register(), 'Register', false, press(u, 47.8));
      } else chip(c, sx, R.y + R.h / 2, t0 && u < t0 + 1.2 ? 'New' : 'Registered', t0 && u < t0 + 1.2 ? PAL.cyan : PAL.teal, P ? 'right' : 'left');
      c.restore();
    });
    if (!P) ['NAME', 'TYPE', 'OWNER', 'STATUS'].forEach((h2, i) => tx(c, h2, (i ? R_.row(0).x + R_.row(0).w * cols[i] : R_.row(0).x + 50), m.y + 120, 13, 800, C.faint, 'left', UI, 2));
    const dk = ease(u, 50.5, 51.1, E.outCubic) * (1 - ease(u, 55.6, 56.1));
    if (dk > 0) drawer(c, u, dk);
  } else if (name === 'controls') {
    panelBox(c, 'Controls');
    const iso = u >= 60.85;
    ['EU AI Act', 'ISO/IEC 42001'].forEach((n, i) => {
      const R = R_.tab(i), on = (i === 1) === iso;
      rr(c, R.x, R.y, R.w, R.h, 20); c.fillStyle = on ? 'rgba(62,240,192,0.12)' : 'rgba(255,255,255,0.03)'; c.fill(); c.strokeStyle = on ? 'rgba(62,240,192,0.45)' : C.line; c.stroke();
      tx(c, n, R.x + R.w / 2, R.y + 26, 16, 700, on ? C.text : C.muted, 'center');
    });
    const cov = iso ? ease(u, 61.3, 62.8) : 0.4 + 0.6 * ease(u, 57.6, 60.0);
    const bx = P ? m.x + 24 : m.x + 420, by = P ? m.y + 150 : m.y + 96, bw = P ? m.w - 48 : m.w - 444;
    rr(c, bx, by, bw, 8, 4); c.fillStyle = 'rgba(255,255,255,0.07)'; c.fill();
    rr(c, bx, by, bw * cov, 8, 4); c.fillStyle = PAL.teal; c.fill();
    tx(c, `${Math.round(cov * 100)}% covered`, bx + bw, by - 10, 14, 700, cov >= 0.999 ? PAL.teal : C.muted, 'right');
    CTRL.forEach(([n, code], i) => {
      const R = R_.ctrlRow(i);
      rr(c, R.x, R.y, R.w, R.h, 12); c.fillStyle = 'rgba(255,255,255,0.025)'; c.fill();
      const ck = iso ? clamp(pop(u, 61.3 + i * 0.25)) : i < 2 ? 1 : pop(u, TICKS[i - 2]);
      checkbox(c, R.x + 16, R.y + R.h / 2 - 12, ck);
      tx(c, n, R.x + 56, R.y + R.h / 2 + (P ? -4 : 6), P ? 19 : 17, 700, C.text);
      tx(c, code, P ? R.x + 56 : R.x + R.w * 0.46, R.y + R.h / 2 + (P ? 22 : 6), 14, 600, C.faint, 'left', UI, 0.5);
      if (iso) { const mk = ease(u, 61.3 + i * 0.25, 61.6 + i * 0.25); if (mk > 0) { c.save(); c.globalAlpha *= mk; chip(c, R.x + R.w - 16, R.y + R.h / 2, 'Mapped from EU AI Act', PAL.cyan, 'right', 13); c.restore(); } }
      else if (ck >= 0.99) chip(c, R.x + R.w - 16, R.y + R.h / 2, 'Implemented', PAL.teal, 'right', 13);
    });
    button(c, R_.upload(), 'Upload evidence', false, press(u, 63.6));
    const fk = ease(u, 63.9, 64.4, E.outCubic);
    if (fk > 0) {
      const U2 = R_.upload(); c.save(); c.globalAlpha *= fk;
      const fx = U2.x + U2.w + 16, fy = U2.y;
      rr(c, fx, fy, P ? 330 : 300, 46, 23); c.fillStyle = 'rgba(89,216,255,0.1)'; c.fill(); c.strokeStyle = 'rgba(89,216,255,0.4)'; c.stroke();
      icon(c, fx + 14, fy + 14, 'doc', PAL.cyan); tx(c, 'oversight-procedure.pdf', fx + 40, fy + 29, 15, 700, C.text);
      c.restore();
    }
    const ak = pop(u, 65.2);
    if (ak > 0 && !P) { const E2 = R_.exportB(); c.save(); c.globalAlpha *= clamp(ak); c.translate(E2.x - 20, E2.y + 23); c.scale(ak, ak); chip(c, 0, 0, 'Audit-ready', PAL.teal, 'right', 15); c.restore(); }
    if (ak > 0 && P) { const E2 = R_.exportB(); c.save(); c.globalAlpha *= clamp(ak); chip(c, E2.x + E2.w, E2.y - 30, 'Audit-ready', PAL.teal, 'right', 15); c.restore(); }
    button(c, R_.exportB(), 'Export audit pack', true, press(u, 66.2));
  } else if (name === 'agents') {
    panelBox(c, 'Agent activity', 'Guardrails on', PAL.teal);
    const items = [
      [72.3, 'Refund Agent', 'Issue a refund to a customer · irreversible', 'approval'],
      [69.8, 'Customer Support Agent', 'Share customer records with an external tool', 'blocked'],
      [68.6, 'Customer Support Agent', 'Look up order status', 'allowed'],
    ];
    const shown = items.filter(([t]) => u >= t);
    shown.forEach(([t, who, what, kind], idx) => {
      const R = R_.feed(idx), k = ease(u, t, t + 0.5, E.outCubic);
      c.save(); c.globalAlpha *= idx === 0 ? k : 1; c.translate(0, idx === 0 ? (1 - k) * -24 : 0);
      rr(c, R.x, R.y, R.w, R.h, 14);
      const col = kind === 'blocked' ? PAL.coral : kind === 'approval' ? (u > 74.45 ? PAL.teal : PAL.violet) : PAL.teal;
      c.fillStyle = rgba(col, 0.06); c.fill(); c.strokeStyle = rgba(col, 0.35); c.lineWidth = 1.2; c.stroke();
      icon(c, R.x + 20, R.y + 24, 'shield', col);
      tx(c, who, R.x + 52, R.y + 38, 18, 700, C.text);
      tx(c, what, R.x + 52, R.y + 66, 16, 500, C.muted);
      const label = kind === 'blocked' ? 'Blocked by guardrail' : kind === 'allowed' ? 'Allowed' : u > 74.45 ? 'Approved · Risk owner' : 'Approval required';
      chip(c, R.x + R.w - 18, P ? R.y + 38 : R.y + R.h / 2, label, col, 'right');
      if (kind === 'blocked') tx(c, 'Policy: Data protection · logged to audit trail', R.x + 52, R.y + (P ? 96 : 90), 14, 600, rgba(PAL.coral, 0.85));
      if (kind === 'approval' && u < 74.9) {
        const bk = 1 - ease(u, 74.5, 74.9);
        c.save(); c.globalAlpha *= bk;
        button(c, R_.approve(), 'Approve', true, press(u, 74.4));
        const A = R_.approve(); button(c, { x: A.x + A.w + 12, y: A.y, w: 120, h: A.h }, 'Reject', false, 0);
        c.restore();
      }
      c.restore();
    });
  } else if (name === 'monitor') {
    panelBox(c, 'Live monitoring', 'LIVE', PAL.teal);
    const half = P ? m.w - 48 : (m.w - 72) / 2, chH = P ? 250 : 230;
    [['Audit events', PAL.cyan, 0], ['Model drift', PAL.teal, 1]].forEach(([lab, col, i]) => {
      const x = m.x + 24 + (P ? 0 : i * (half + 24)), y = m.y + 76 + (P ? i * (chH + 24) : 0);
      rr(c, x, y, half, chH, 14); c.fillStyle = C.card; c.fill(); c.strokeStyle = C.line; c.stroke();
      tx(c, lab, x + 18, y + 32, 16, 700, C.text);
      const gx = x + 18, gw = half - 36, gy = y + chH - 30, gh = chH - 80;
      if (i === 1) { c.setLineDash([6, 6]); c.strokeStyle = rgba(PAL.amber, 0.5); c.beginPath(); c.moveTo(gx, gy - gh * 0.8); c.lineTo(gx + gw, gy - gh * 0.8); c.stroke(); c.setLineDash([]); tx(c, 'threshold', gx + gw, gy - gh * 0.8 - 8, 12, 700, rgba(PAL.amber, 0.8), 'right'); }
      const pts = [];
      for (let q = 0; q <= 60; q++) {
        const f = q / 60, tt = u * 0.9 + f * 6;
        const v = i === 0 ? 0.45 + 0.3 * Math.sin(tt * 1.7) * Math.sin(tt * 0.6 + 1) + 0.15 * Math.sin(tt * 4.1) : 0.35 + 0.08 * Math.sin(tt * 2.3) + 0.05 * Math.sin(tt * 5.7);
        pts.push([gx + f * gw, gy - v * gh]);
      }
      const ag = c.createLinearGradient(0, gy - gh, 0, gy); ag.addColorStop(0, rgba(col, 0.28)); ag.addColorStop(1, rgba(col, 0));
      c.beginPath(); c.moveTo(pts[0][0], gy); pts.forEach(([px, py]) => c.lineTo(px, py)); c.lineTo(pts[pts.length - 1][0], gy); c.closePath(); c.fillStyle = ag; c.fill();
      c.beginPath(); pts.forEach(([px, py], j) => (j ? c.lineTo(px, py) : c.moveTo(px, py))); c.strokeStyle = col; c.lineWidth = 2.5; c.stroke();
    });
    const ly = m.y + 76 + (P ? 2 * (chH + 24) : chH + 30);
    [['All 6 systems within policy', PAL.teal], ['Next surveillance review scheduled · ISO/IEC 42001', PAL.cyan]].forEach(([s2, col], i) => {
      const y = ly + i * 64;
      rr(c, m.x + 24, y, m.w - 48, 52, 12); c.fillStyle = rgba(col, 0.06); c.fill();
      checkbox(c, m.x + 40, y + 14, 1, col); tx(c, s2, m.x + 80, y + 33, 16, 700, C.text);
    });
  }
  c.restore();
}
function drawer(c, u, k) {
  const m = L.main;
  const w = P ? m.w : m.w * 0.48, h = P ? m.h * 0.62 : m.h;
  const x = P ? m.x : m.x + m.w - w + (1 - k) * 60, y = P ? m.y + m.h - h + (1 - k) * 60 : m.y;
  c.save(); c.globalAlpha *= k;
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40;
  rr(c, x, y, w, h, 18); c.fillStyle = '#121A3C'; c.fill(); c.shadowBlur = 0; c.strokeStyle = 'rgba(170,200,255,0.3)'; c.stroke();
  tx(c, 'RISK ASSESSMENT', x + 26, y + 40, 13, 800, C.faint, 'left', UI, 2.4);
  tx(c, 'Credit Decision Model', x + 26, y + 76, 26, 600, C.text, 'left', DISPLAY, -0.4);
  chip(c, x + 26, y + 110, 'EU AI Act · High-risk', PAL.coral);
  const g = ease(u, 51.0, 52.8, E.outCubic);
  const gx = x + 110, gy = y + 230, gr = 70;
  c.lineWidth = 12; c.lineCap = 'round';
  c.strokeStyle = 'rgba(255,255,255,0.07)'; c.beginPath(); c.arc(gx, gy, gr, Math.PI * 0.8, Math.PI * 2.2); c.stroke();
  c.strokeStyle = PAL.coral; c.beginPath(); c.arc(gx, gy, gr, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * 0.783 * g)); c.stroke();
  tx(c, (7.83 * g).toFixed(2), gx, gy + 12, 40, 600, C.text, 'center', DISPLAY, -0.8);
  tx(c, 'HIGH', gx, gy + 40, 13, 800, PAL.coral, 'center', UI, 2);
  tx(c, 'Inherent 7.92', gx + 110, gy - 12, 15, 600, C.muted); tx(c, 'Residual 7.83', gx + 110, gy + 14, 15, 600, C.muted);
  const fy = y + 340;
  [['Bias & fairness', 0.72], ['Privacy', 0.81], ['Security', 0.64], ['Transparency', 0.58], ['Robustness', 0.69]].forEach(([n, v], i) => {
    const kk = ease(u, 51.6 + i * 0.3, 52.6 + i * 0.3, E.outCubic);
    const yy = fy + i * 44;
    if (yy > y + h - 16) return;
    tx(c, n, x + 26, yy, 15, 600, C.muted);
    const bx = x + (P ? 240 : 200), bw = w - (P ? 240 : 200) - 30;
    rr(c, bx, yy - 9, bw, 7, 4); c.fillStyle = 'rgba(255,255,255,0.07)'; c.fill();
    rr(c, bx, yy - 9, Math.max(0.1, bw * v * kk), 7, 4); c.fillStyle = v > 0.7 ? PAL.coral : PAL.amber; c.fill();
  });
  c.restore();
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
  // ---- chapters beside the demo
  chapter(ctx, u, 35.4, 40.2, 'One clear view.', 'EVERY AI SYSTEM\nIN ONE PLATFORM', true);
  chapter(ctx, u, 40.6, 49.9, 'Discover', 'EVERY MODEL, AGENT\nAND DATASET');
  chapter(ctx, u, 50.1, 55.9, 'Assess', 'RISK, THE MOMENT\nIT APPEARS');
  chapter(ctx, u, 56.2, 68.2, 'Comply', [[56.2, 'EU AI ACT\nISO/IEC 42001'], [63.4, 'EVIDENCE,\nAUDIT-READY']]);
  chapter(ctx, u, 68.5, 76.8, 'Guard', [[68.5, 'GUARDRAILS FOR\nEVERY AGENT'], [72.2, 'PEOPLE IN\nTHE LOOP']]);
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
  [41.6, 'click: run discovery', 'click', { gain: 0.32 }], [45.3, 'shadow AI found', 'blip', { pitch: 'E5', gain: 0.14 }], [47.8, 'click: register', 'click', { gain: 0.32 }],
  [50.3, 'click: assess', 'click', { gain: 0.32 }], [52.8, 'score lands', 'blip', { pitch: 'A5', gain: 0.14 }],
  [56.0, 'click: policies', 'click', { gain: 0.3 }], [57.6, 'tick', 'tick', { gain: 0.3 }], [58.4, 'tick', 'tick', { gain: 0.3 }], [59.2, 'tick', 'tick', { gain: 0.3 }],
  [60.8, 'click: ISO tab', 'click', { gain: 0.3 }], [62.8, 'mapped', 'bell', { pitch: 'D6', gain: 0.14 }],
  [63.6, 'click: upload', 'click', { gain: 0.3 }], [65.2, 'audit-ready', 'blip', { pitch: 'A5', gain: 0.14 }], [66.2, 'click: export', 'click', { gain: 0.32 }], [66.6, 'toast', 'bell', { pitch: 'A5', gain: 0.16 }],
  [68.3, 'click: tasks', 'click', { gain: 0.3 }], [69.8, 'blocked', 'thud', { pitch: 70, to: 45, gain: 0.26 }], [72.3, 'approval needed', 'blip', { pitch: 'F#5', gain: 0.14 }],
  [74.4, 'click: approve', 'click', { gain: 0.34 }], [74.6, 'approved', 'bell', { pitch: 'D6', gain: 0.18 }],
  [76.9, 'click: dashboard', 'click', { gain: 0.3 }],
  [84, 'pull back', 'whoosh', { len: 1.6, from: 300, to: 1800, gain: 0.14 }],
  [90.2, 'end logo tiles', 'impact'],
  [92.4, 'sparkle', 'bell', { pitch: 'D6', gain: 0.22 }], [92.7, 'sparkle 2', 'bell', { pitch: 'A6', gain: 0.2 }],
];

M.film({
  fonts: [`500 100px ${DISPLAY}`, `600 100px ${DISPLAY}`, `700 100px ${DISPLAY}`, font(40, 500, UI), font(40, 600, UI), font(40, 700, UI), font(40, 800, UI)],
  images: {},
  hits: HITS,
  samples: 1,   // motion blur happens on the GPU (renderGL accumulates dust sub-frames)
  init() { setupGL(); buildTiles(); CLK = CLICKS(); },
  draw(ctx, u, t) {
    const cam = camera(u), pj = projector(cam);
    G.glow.clearRect(0, 0, W, H);
    const used = worldGlow(G.glow, u, pj);
    const B = winBasis(u);
    const wa = B.r > 0.001 && u > 34.8 && u < 90.6 ? clamp(B.r * 1.5) : 0;
    if (wa > 0) { drawUI(u); upload(G.uiTex, G.uiCv, true); }
    const subs = [];
    for (let k = 0; k < MB; k++) {
      const uk = M.U(t + (k / MB - 0.5) * (SHUTTER / FPS));
      const ck = camera(uk);
      subs.push({ u: uk, cam: ck, pj: projector(ck) });
    }
    renderGL(u, t, subs, used, wa > 0 ? { pj, B, a: wa } : null);
    ctx.drawImage(G.cv, 0, 0);
    typeLayer(ctx, u, pj);
  },
});
