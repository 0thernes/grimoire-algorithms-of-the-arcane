// ===== GRIMOIRE VIZ ENGINE =====
// All visualizations run on HTML Canvas — no libraries, pure dimensional fuckery

'use strict';

// Theme toggle
(function () {
  const btn = document.querySelector('[data-theme-toggle]');
  const html = document.documentElement;
  let theme = 'dark';
  html.setAttribute('data-theme', theme);
  if (btn) {
    btn.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', theme);
      btn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
      btn.innerHTML = theme === 'dark'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    });
  }
})();

// ===== UTILITY =====
function getThemeColor(dark, light) {
  return document.documentElement.getAttribute('data-theme') === 'light' ? light : dark;
}
const rng = (min, max) => Math.random() * (max - min) + min;
const rngInt = (min, max) => Math.floor(rng(min, max + 1));
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const TAU = Math.PI * 2;
function hash32(value, seed = 0) {
  const text = String(value);
  let h = (2166136261 ^ seed) >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

function emitAlgorithmSound(id, event = {}) {
  try {
    const runtime = window.__grimoireRuntime;
    if (!runtime || typeof runtime.algorithmEvent !== 'function') return false;
    const result = runtime.algorithmEvent(id, event);
    if (result && typeof result.catch === 'function') result.catch(() => {});
    return Boolean(result);
  } catch {
    return false;
  }
}

const visualPointer = { x: 0.5, y: 0.5, active: false };
window.addEventListener('pointermove', (event) => {
  visualPointer.x = clamp(event.clientX / Math.max(1, window.innerWidth), 0, 1);
  visualPointer.y = clamp(event.clientY / Math.max(1, window.innerHeight), 0, 1);
  visualPointer.active = true;
}, { passive: true });
window.addEventListener('pointerleave', () => {
  visualPointer.active = false;
}, { passive: true });

// Resize canvas to actual display size
function resizeCanvas(c) {
  const rect = c.parentElement.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width));
  const h = Math.max(1, Math.round(rect.height));
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  }
}

// ===== REGISTRY =====
const runners = {};
const frames = {};
const frameSets = {};
const runTokens = {};
const lastFrameAt = {};
const visibleIds = new Set();
const FRAME_INTERVAL_MS = 1000 / 30;
const DEFAULT_RUN_AUDIO_MS = 45000;
const AUTO_RUN_AUDIO_MS = 6200;
const AUTO_HANDOFF_MS = 650;
const MONSTER_CHORUS_MS = 6200;
const HAND_BUILT_ALGO_IDS = [
  'wfc','diffusion','annealing','sleepsort','bogosort','rsa','shors','marching',
  'byzantine','boyermoore','stoogesort','quantumbogo','cyclesort','reservoir','algorithmx',
  'dlx','jumphash','cocktail','timsort','fisr','astar','perlin','kalman','hyperloglog',
  'bloom','merkle','mcts','genetic','lsystem','barneshut'
];
const nativeRequestAnimationFrame = window.requestAnimationFrame.bind(window);
const nativeCancelAnimationFrame = window.cancelAnimationFrame.bind(window);
let rafOwner = null;

window.requestAnimationFrame = function managedRequestAnimationFrame(callback) {
  const owner = rafOwner;
  if (!owner) return nativeRequestAnimationFrame(callback);

  const { id, token } = owner;
  if (!frameSets[id]) frameSets[id] = new Set();

  let rafId = 0;
  const wrapped = (time) => {
    frameSets[id]?.delete(rafId);
    if (runTokens[id] !== token) return;

    const elapsed = time - (lastFrameAt[id] || 0);
    if (elapsed < FRAME_INTERVAL_MS) {
      rafId = nativeRequestAnimationFrame(wrapped);
      frameSets[id]?.add(rafId);
      return;
    }

    lastFrameAt[id] = time;
    const previousOwner = rafOwner;
    rafOwner = owner;
    try {
      try {
        window.__grimoireRuntime?.tickRunAudio?.(id, { time, elapsed });
      } catch {
        // Audio telemetry must never break a visual frame.
      }
      callback(time);
    } finally {
      rafOwner = previousOwner;
    }
  };

  rafId = nativeRequestAnimationFrame(wrapped);
  frameSets[id].add(rafId);
  return rafId;
};

function register(id, initFn) {
  runners[id] = initFn;
}

function stop(id) {
  window.__grimoireRuntime?.stopRunAudio?.(id);
  runTokens[id] = (runTokens[id] || 0) + 1;
  if (frameSets[id]) {
    for (const rafId of frameSets[id]) nativeCancelAnimationFrame(rafId);
    frameSets[id].clear();
  }
  if (typeof frames[id] === 'number') nativeCancelAnimationFrame(frames[id]);
  frames[id] = null;
}

function run(id, options = {}) {
  stop(id);
  const c = document.getElementById('c-' + id);
  if (!c || !runners[id]) return;
  resizeCanvas(c);
  const token = runTokens[id];
  const previousOwner = rafOwner;
  rafOwner = { id, token };
  try {
    const firstFrame = runners[id](c);
    frames[id] = firstFrame || true;
    if (options.audible) {
      window.__grimoireRuntime?.startRunAudio?.(id, {
        source: options.source || 'run',
        maxMs: options.maxMs,
        mode: options.mode
      });
    }
  } finally {
    rafOwner = previousOwner;
  }
}

// Re-run buttons, including cards generated after load.
document.addEventListener('click', (event) => {
  const btn = event.target.closest('.btn-run, .btn-stop, .btn-reset');
  if (!btn) return;
  const id = btn.dataset.target;
  if (!id) return;
  if (btn.classList.contains('btn-stop')) {
    stop(id);
    updateSonicConsoleStatus(`paused ${id}`);
    return;
  }
  run(id, {
    audible: true,
    source: btn.classList.contains('btn-reset') ? 'reset-button' : 'run-button'
  });
  updateSonicConsoleStatus(`${btn.classList.contains('btn-reset') ? 'reset' : 'running'} ${id}`);
});

// ===== 1. WAVE FUNCTION COLLAPSE =====
register('wfc', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const CELL = 18;
  const cols = Math.floor(W / CELL);
  const rows = Math.floor(H / CELL);

  const COLORS = ['#9d5cff', '#ff3cac', '#3cffd5', '#ffd700', '#ff7c4d', '#4d9fff'];
  const UNCOLLAPSED = -1;
  const actual = Array.from({length: cols * rows}, () => UNCOLLAPSED);
  let queue = [];
  let collapsed = 0;
  let done = false;

  function idx(col, row) { return row * cols + col; }

  function init() {
    for (let i = 0; i < cols * rows; i++) actual[i] = UNCOLLAPSED;
    collapsed = 0;
    queue = [];
    done = false;
    // seed one cell
    const startCol = Math.floor(cols / 2);
    const startRow = Math.floor(rows / 2);
    actual[idx(startCol, startRow)] = rngInt(0, COLORS.length - 1);
    collapsed++;
    queue.push([startCol, startRow]);
    draw();
  }

  function collapseNeighbors() {
    if (queue.length === 0 || done) {
      done = true;
      return;
    }
    const batch = Math.min(3, queue.length);
    for (let b = 0; b < batch; b++) {
      const [col, row] = queue.shift();
      const parentColor = actual[idx(col, row)];
      const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
      for (const [dc, dr] of dirs) {
        const nc = col + dc, nr = row + dr;
        if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue;
        if (actual[idx(nc, nr)] !== UNCOLLAPSED) continue;
        // Constrained by neighbor: pick similar or adjacent color
        const variation = rngInt(0, COLORS.length - 1);
        const bias = Math.random() < 0.7 ? parentColor : variation;
        actual[idx(nc, nr)] = bias;
        collapsed++;
        queue.push([nc, nr]);
      }
    }
    if (collapsed >= cols * rows) done = true;
  }

  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    for (let r = 0; r < rows; r++) {
      for (let co = 0; co < cols; co++) {
        const v = actual[idx(co, r)];
        if (v === UNCOLLAPSED) {
          ctx.fillStyle = getThemeColor('rgba(40,35,55,0.8)', 'rgba(200,190,230,0.4)');
          ctx.fillRect(co * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
          // Superposition flicker
          if (Math.random() < 0.3) {
            ctx.fillStyle = COLORS[rngInt(0, COLORS.length - 1)];
            ctx.globalAlpha = 0.2;
            ctx.fillRect(co * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
            ctx.globalAlpha = 1;
          }
        } else {
          const col = COLORS[v];
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.75;
          ctx.fillRect(co * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
          ctx.globalAlpha = 1;
          // Glow on edges
          if (queue.some(([qc, qr]) => Math.abs(qc - co) + Math.abs(qr - r) === 1)) {
            ctx.strokeStyle = col;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = 0.5;
            ctx.strokeRect(co * CELL, r * CELL, CELL, CELL);
            ctx.globalAlpha = 1;
          }
        }
      }
    }
    // Progress bar
    const pct = collapsed / (cols * rows);
    ctx.fillStyle = '#9d5cff';
    ctx.globalAlpha = 0.6;
    ctx.fillRect(0, H - 3, W * pct, 3);
    ctx.globalAlpha = 1;
  }

  let rafId;
  init();
  function loop() {
    if (!done) {
      collapseNeighbors();
      draw();
    }
    rafId = requestAnimationFrame(loop);
  }
  loop();
  return rafId;
});

// ===== 2. DIFFUSION =====
register('diffusion', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const N = W * H;
  let t = 0;
  let phase = 'forward'; // forward: add noise, reverse: denoise
  let pixels;

  function generateTarget() {
    pixels = new Float32Array(N * 3);
    // Draw concentric rings
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 3;
        const dx = x - W/2, dy = y - H/2;
        const r = Math.sqrt(dx*dx + dy*dy);
        const ang = Math.atan2(dy, dx);
        const ring = Math.sin(r * 0.18 + ang * 2) * 0.5 + 0.5;
        pixels[i]   = ring * 0.6 + 0.1; // R
        pixels[i+1] = (1 - ring) * 0.4 + 0.2; // G
        pixels[i+2] = Math.sin(r * 0.12) * 0.3 + 0.6; // B
      }
    }
  }

  function draw() {
    const imgData = ctx.createImageData(W, H);
    const d = imgData.data;
    const noiseLevel = phase === 'forward'
      ? clamp(t / 100, 0, 1)
      : clamp(1 - t / 100, 0, 1);
    for (let i = 0; i < N; i++) {
      const pi = i * 3;
      const di = i * 4;
      const noise = noiseLevel;
      const r = clamp(pixels[pi]   * (1-noise) + rng(-noise, noise) + noise * Math.random(), 0, 1);
      const g = clamp(pixels[pi+1] * (1-noise) + rng(-noise, noise) + noise * Math.random(), 0, 1);
      const b = clamp(pixels[pi+2] * (1-noise) + rng(-noise, noise) + noise * Math.random(), 0, 1);
      d[di]   = r * 255;
      d[di+1] = g * 255;
      d[di+2] = b * 255;
      d[di+3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    // Label
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(6, 6, 120, 20);
    ctx.fillStyle = phase === 'forward' ? '#ff3cac' : '#3cffd5';
    ctx.font = '11px Space Mono, monospace';
    ctx.fillText(phase === 'forward' ? `→ CORRUPTING t=${t}` : `← DENOISING t=${t}`, 10, 20);
  }

  generateTarget();

  let rafId;
  function loop() {
    t++;
    if (t >= 110) {
      t = 0;
      phase = phase === 'forward' ? 'reverse' : 'forward';
      if (phase === 'forward') generateTarget();
    }
    draw();
    rafId = requestAnimationFrame(loop);
  }
  loop();
  return rafId;
});

// ===== 3. SIMULATED ANNEALING (TSP) =====
register('annealing', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const N_CITIES = 22;
  let cities, tour, energy, temp, bestTour, bestEnergy;

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  function tourLen(t) {
    let d = 0;
    for (let i = 0; i < t.length; i++) d += dist(cities[t[i]], cities[t[(i+1)%t.length]]);
    return d;
  }
  function init() {
    cities = Array.from({length: N_CITIES}, () => ({x: rng(20, W-20), y: rng(20, H-20)}));
    tour = Array.from({length: N_CITIES}, (_, i) => i);
    for (let i = tour.length - 1; i > 0; i--) {
      const j = rngInt(0, i);
      [tour[i], tour[j]] = [tour[j], tour[i]];
    }
    energy = tourLen(tour);
    bestTour = [...tour];
    bestEnergy = energy;
    temp = 200;
  }
  function step() {
    for (let i = 0; i < 80; i++) {
      const a = rngInt(0, N_CITIES - 1);
      const b = rngInt(0, N_CITIES - 1);
      const newTour = [...tour];
      [newTour[a], newTour[b]] = [newTour[b], newTour[a]];
      const newE = tourLen(newTour);
      const dE = newE - energy;
      if (dE < 0 || Math.random() < Math.exp(-dE / temp)) {
        tour = newTour;
        energy = newE;
        if (energy < bestEnergy) { bestTour = [...tour]; bestEnergy = energy; }
      }
    }
    temp = Math.max(temp * 0.995, 0.1);
    if (temp <= 0.12) init();
  }
  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    // Best tour (faint)
    ctx.strokeStyle = getThemeColor('rgba(157,92,255,0.2)', 'rgba(123,53,221,0.15)');
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= bestTour.length; i++) {
      const city = cities[bestTour[i % bestTour.length]];
      i === 0 ? ctx.moveTo(city.x, city.y) : ctx.lineTo(city.x, city.y);
    }
    ctx.stroke();
    // Current tour
    const tempRatio = clamp(temp / 200, 0, 1);
    const r = Math.floor(lerp(60, 255, tempRatio));
    const g = Math.floor(lerp(255, 60, tempRatio));
    ctx.strokeStyle = `rgb(${r},${g},100)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= tour.length; i++) {
      const city = cities[tour[i % tour.length]];
      i === 0 ? ctx.moveTo(city.x, city.y) : ctx.lineTo(city.x, city.y);
    }
    ctx.stroke();
    // Cities
    for (const city of cities) {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(city.x, city.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Temp bar
    ctx.fillStyle = `rgba(${r},${g},100,0.3)`;
    ctx.fillRect(6, H-8, (W-12) * tempRatio, 4);
    ctx.fillStyle = '#fff';
    ctx.font = '10px Space Mono, monospace';
    ctx.fillText(`T=${temp.toFixed(1)} E=${energy.toFixed(0)}`, 8, H-12);
  }
  init();
  let rafId;
  function loop() { step(); draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 4. SLEEP SORT =====
register('sleepsort', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let values, sorted, announced, frame;

  function init() {
    const N = 14;
    values = Array.from({length: N}, () => rngInt(1, N));
    sorted = [];
    announced = new Array(N).fill(false);
    frame = 0;
  }

  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    const N = values.length;
    const barW = Math.floor((W - 40) / N);
    const maxV = Math.max(...values);
    const scale = (H - 60) / maxV;

    for (let i = 0; i < N; i++) {
      const v = values[i];
      const x = 20 + i * barW;
      const bH = v * scale;
      const y = H - 30 - bH;
      // Sleeping bar — pulses while waiting
      const sleepProgress = clamp(frame / (v * 12), 0, 1);
      const isAnnounced = sorted.includes(v) && announced[i];
      ctx.fillStyle = isAnnounced
        ? '#3cffd5'
        : `rgba(${lerp(150, 255, sleepProgress)},${lerp(60, 92, sleepProgress)},${lerp(255, 100, sleepProgress)},0.85)`;
      ctx.fillRect(x + 2, y, barW - 4, bH);
      // Value label
      ctx.fillStyle = '#fff';
      ctx.font = '10px Space Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(v, x + barW/2, y - 3);
      // Sleep progress line
      if (!isAnnounced) {
        ctx.fillStyle = 'rgba(255,215,0,0.6)';
        ctx.fillRect(x + 2, H - 28, (barW - 4) * sleepProgress, 3);
      }
    }
    ctx.textAlign = 'left';
    // Show sorted output
    ctx.fillStyle = getThemeColor('rgba(0,0,0,0.5)', 'rgba(255,255,255,0.5)');
    ctx.fillRect(0, 0, W, 24);
    ctx.fillStyle = '#3cffd5';
    ctx.font = '11px Space Mono, monospace';
    ctx.fillText('OUT: [' + sorted.join(', ') + ']', 8, 16);
  }

  init();
  let rafId;
  function loop() {
    frame++;
    const N = values.length;
    // Each value announces after frame = value * 12
    for (let i = 0; i < N; i++) {
      if (!announced[i] && frame >= values[i] * 12) {
        announced[i] = true;
        sorted.push(values[i]);
        emitAlgorithmSound('sleepsort', {
          type: 'wake',
          value: values[i],
          index: i,
          step: frame,
          sortedCount: sorted.length,
          intensity: values[i] / N
        });
      }
    }
    if (frame > maxOf(values) * 12 + 60) init();
    draw();
    rafId = requestAnimationFrame(loop);
  }
  function maxOf(arr) { return Math.max(...arr); }
  loop();
  return rafId;
});

// ===== 5. BOGOSORT =====
register('bogosort', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let arr, attempts, isSorted;

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = rngInt(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
  function sorted(a) {
    for (let i = 1; i < a.length; i++) if (a[i] < a[i-1]) return false;
    return true;
  }
  function init() {
    arr = Array.from({length: 7}, (_, i) => i + 1);
    shuffle(arr);
    attempts = 0;
    isSorted = false;
  }
  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    const N = arr.length;
    const barW = Math.floor((W - 40) / N);
    const maxV = N;
    for (let i = 0; i < N; i++) {
      const v = arr[i];
      const x = 20 + i * barW;
      const bH = (v / maxV) * (H - 55);
      const y = H - 30 - bH;
      const hue = isSorted ? '160' : String(rngInt(260, 320));
      ctx.fillStyle = isSorted ? '#3cffd5' : `hsl(${hue},80%,65%)`;
      ctx.fillRect(x + 2, y, barW - 4, bH);
      ctx.fillStyle = '#fff';
      ctx.font = '11px Space Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(v, x + barW/2, y - 4);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = isSorted ? '#3cffd5' : '#ff3cac';
    ctx.font = '11px Space Mono, monospace';
    ctx.fillText(`Attempt #${attempts} — ${isSorted ? 'SORTED ✓' : 'NOPE, shuffle again'}`, 8, H - 8);
  }
  init();
  let rafId, pauseFrames = 0;
  function loop() {
    if (isSorted) {
      pauseFrames++;
      if (pauseFrames > 90) { init(); }
    } else {
      shuffle(arr);
      attempts++;
      isSorted = sorted(arr);
      if (attempts % 8 === 0 || isSorted) {
        emitAlgorithmSound('bogosort', {
          type: isSorted ? 'sorted' : 'shuffle',
          value: arr[attempts % arr.length],
          index: attempts % arr.length,
          step: attempts,
          success: isSorted,
          disorder: arr.reduce((sum, value, index) => sum + Math.abs(value - index - 1), 0)
        });
      }
      if (isSorted) pauseFrames = 0;
    }
    draw();
    rafId = requestAnimationFrame(loop);
  }
  loop();
  return rafId;
});

// ===== 6. RSA =====
register('rsa', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let anim = 0;
  let primes, n, e, d, msg, encrypted, decrypted, phase;

  // Small primes for demo
  const PRIMES = [11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97];
  function modPow(base, exp, mod) {
    let result = 1n;
    base = BigInt(base) % BigInt(mod);
    exp = BigInt(exp);
    mod = BigInt(mod);
    while (exp > 0n) {
      if (exp % 2n === 1n) result = (result * base) % mod;
      exp /= 2n;
      base = (base * base) % mod;
    }
    return Number(result);
  }
  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
  function modInverse(e, phi) {
    let [old_r, r] = [e, phi];
    let [old_s, s] = [1, 0];
    while (r !== 0) {
      const q = Math.floor(old_r / r);
      [old_r, r] = [r, old_r - q * r];
      [old_s, s] = [s, old_s - q * s];
    }
    return ((old_s % phi) + phi) % phi;
  }
  function init() {
    primes = [PRIMES[rngInt(0, 8)], PRIMES[rngInt(9, 18)]];
    n = primes[0] * primes[1];
    const phi = (primes[0]-1) * (primes[1]-1);
    e = 65537 % n;
    while (gcd(e, phi) !== 1) e = rngInt(3, phi - 1);
    d = modInverse(e, phi);
    msg = rngInt(2, Math.min(n - 1, 99));
    encrypted = modPow(msg, e, n);
    decrypted = modPow(encrypted, d, n);
    anim = 0; phase = 0;
  }
  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2;
    const P1 = {x: 40, y: H/2};
    const P2 = {x: W-40, y: H/2};
    const t = clamp(anim / 80, 0, 1);

    // Alice
    ctx.fillStyle = '#9d5cff';
    ctx.beginPath();
    ctx.arc(P1.x, P1.y, 18, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Space Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ALICE', P1.x, P1.y + 30);
    ctx.fillStyle = '#ccc';
    ctx.font = '9px Space Mono, monospace';
    ctx.fillText(`m=${msg}`, P1.x, P1.y + 42);

    // Bob
    ctx.fillStyle = '#ff3cac';
    ctx.beginPath();
    ctx.arc(P2.x, P2.y, 18, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('BOB', P2.x, P2.y + 30);
    ctx.fillStyle = '#ccc';
    ctx.fillText(`n=${n}`, P2.x, P2.y + 42);

    // Flying message
    if (anim > 10 && anim < 120) {
      const px = lerp(P1.x + 20, P2.x - 20, clamp((anim - 10) / 80, 0, 1));
      const py = P1.y - Math.sin(Math.PI * clamp((anim-10)/80,0,1)) * 40;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 8px Space Mono, monospace';
      ctx.fillText(anim < 60 ? msg : encrypted, px, py + 3);
    }

    // Keys display
    ctx.textAlign = 'left';
    ctx.fillStyle = getThemeColor('rgba(157,92,255,0.12)', 'rgba(123,53,221,0.08)');
    ctx.fillRect(8, 8, W-16, 52);
    ctx.fillStyle = '#9d5cff';
    ctx.font = '9px Space Mono, monospace';
    ctx.fillText(`p=${primes[0]}  q=${primes[1]}  n=p×q=${n}`, 12, 22);
    ctx.fillStyle = '#3cffd5';
    ctx.fillText(`e(pub)=${e}   d(priv)=${d}`, 12, 36);
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`m=${msg} → encrypt → ${encrypted} → decrypt → ${decrypted}${decrypted===msg?' ✓':''}`, 12, 50);

    anim++;
    if (anim > 200) init();
  }
  init();
  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 7. SHOR'S ALGORITHM =====
register('shors', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let t = 0;
  let N_val, a, period, factors;

  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
  function findPeriod(a, n) {
    let x = 1, r = 0;
    do { x = (x * a) % n; r++; } while (x !== 1 && r < 1000);
    return r;
  }
  function init() {
    const composites = [15, 21, 33, 35, 77, 91];
    N_val = composites[rngInt(0, composites.length - 1)];
    a = rngInt(2, N_val - 1);
    while (gcd(a, N_val) !== 1) a = rngInt(2, N_val - 1);
    period = findPeriod(a, N_val);
    if (period % 2 === 0) {
      const sq = Math.round(Math.pow(a, period/2));
      const f1 = gcd(sq - 1, N_val);
      const f2 = gcd(sq + 1, N_val);
      factors = [f1, f2].filter(x => x > 1 && x < N_val);
    } else factors = [];
    t = 0;
  }

  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);

    // QFT visualization: draw quantum amplitudes as bar chart with phases
    const numBins = Math.min(period * 3, 48);
    const barW = (W - 20) / numBins;
    const maxH = H - 80;
    const cx = W / 2;

    for (let k = 0; k < numBins; k++) {
      const phase = (2 * Math.PI * k) / numBins;
      // Simulate QFT peaks at multiples of (numBins/period)
      let amp = 0;
      for (let j = 0; j < period; j++) {
        amp += Math.cos(2 * Math.PI * k * j / period + t * 0.05);
      }
      amp = Math.abs(amp / period);
      const barH = amp * maxH * 0.9;
      const x = 10 + k * barW;
      const hue = (k / numBins) * 300 + t * 2;
      ctx.fillStyle = `hsla(${hue},85%,65%,0.8)`;
      ctx.fillRect(x, H - 40 - barH, barW - 1, barH);
    }

    // Period markers
    const step = (W - 20) / numBins * (numBins / period);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= period; i++) {
      const x = 10 + i * step;
      ctx.beginPath();
      ctx.moveTo(x, H - 40);
      ctx.lineTo(x, 30);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Info
    ctx.fillStyle = getThemeColor('rgba(0,0,0,0.6)', 'rgba(255,255,255,0.6)');
    ctx.fillRect(0, 0, W, 28);
    ctx.fillStyle = '#ffd700';
    ctx.font = '10px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`N=${N_val}  a=${a}  r(period)=${period}`, 8, 13);
    if (factors.length >= 2) {
      ctx.fillStyle = '#3cffd5';
      ctx.fillText(`FACTORS: ${factors[0]} × ${factors[1]} = ${N_val}  ← RSA BROKEN`, 8, 25);
    } else {
      ctx.fillStyle = '#ff3cac';
      ctx.fillText(`finding period via QFT superposition...`, 8, 25);
    }
    ctx.textAlign = 'left';
    t++;
    if (t > 300) init();
  }
  init();
  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 8. MARCHING CUBES (2D Marching Squares) =====
register('marching', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const CELL = 12;
  const cols = Math.floor(W / CELL) + 1;
  const rows = Math.floor(H / CELL) + 1;
  let t = 0;
  let metaballs;

  const EDGE_TABLE = new Array(16).fill(0).map((_, i) => i);
  // Edge lookup for marching squares: 4-bit index from corners
  // Each case defines line segments to draw
  const MC_LINES = {
    0: [], 15: [],
    1:  [[0,0.5, 0.5,1]],
    2:  [[0.5,1, 1,0.5]],
    3:  [[0,0.5, 1,0.5]],
    4:  [[0.5,0, 1,0.5]],
    5:  [[0,0.5, 0.5,0], [0.5,1, 1,0.5]],
    6:  [[0.5,0, 0.5,1]],
    7:  [[0,0.5, 0.5,0]],
    8:  [[0,0.5, 0.5,0]],
    9:  [[0.5,0, 0.5,1]],
    10: [[0,0.5, 0.5,1], [0.5,0, 1,0.5]],
    11: [[0.5,0, 1,0.5]],
    12: [[0,0.5, 1,0.5]],
    13: [[0.5,1, 1,0.5]],
    14: [[0,0.5, 0.5,1]],
  };

  function initBalls() {
    metaballs = Array.from({length: 4}, () => ({
      x: rng(0.2, 0.8), y: rng(0.2, 0.8),
      vx: rng(-0.003, 0.003), vy: rng(-0.003, 0.003),
      r: rng(0.08, 0.15)
    }));
  }

  function scalar(px, py) {
    let s = 0;
    for (const b of metaballs) {
      const dx = px - b.x, dy = py - b.y;
      s += b.r * b.r / (dx*dx + dy*dy + 0.0001);
    }
    return s;
  }

  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);

    const ISO = 1.0;

    for (let row = 0; row < rows - 1; row++) {
      for (let col = 0; col < cols - 1; col++) {
        const x = col * CELL, y = row * CELL;
        const nx = x / W, ny = y / H;
        const s00 = scalar(nx, ny);
        const s10 = scalar(nx + CELL/W, ny);
        const s01 = scalar(nx, ny + CELL/H);
        const s11 = scalar(nx + CELL/W, ny + CELL/H);
        const mid = clamp(scalar(nx + 0.5*CELL/W, ny + 0.5*CELL/H) / 2.4, 0, 1);
        if (mid > 0.025) {
          ctx.fillStyle = `hsla(${168 + mid * 165},82%,56%,${0.16 + mid * 0.42})`;
          ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
        }

        const idx = ((s00 > ISO) ? 8 : 0) | ((s10 > ISO) ? 4 : 0) |
                    ((s11 > ISO) ? 2 : 0) | ((s01 > ISO) ? 1 : 0);

        const sampleMark = [
          [0.22, 0.22, s00],
          [0.78, 0.22, s10],
          [0.78, 0.78, s11],
          [0.22, 0.78, s01]
        ];
        for (const [mx, my, sv] of sampleMark) {
          ctx.fillStyle = sv > ISO ? 'rgba(255,215,0,0.7)' : 'rgba(60,255,213,0.22)';
          ctx.fillRect(x + mx * CELL - 1.1, y + my * CELL - 1.1, 2.2, 2.2);
        }

        if (idx === 0 || idx === 15) continue;

        const lines = MC_LINES[idx] || [];
        for (const [lx0, ly0, lx1, ly1] of lines) {
          const px0 = x + lx0 * CELL, py0 = y + ly0 * CELL;
          const px1 = x + lx1 * CELL, py1 = y + ly1 * CELL;
          const bright = clamp(scalar(nx + 0.5*CELL/W, ny + 0.5*CELL/H) / 2, 0, 1);
          ctx.strokeStyle = `hsla(${180 + bright * 150},80%,65%,0.9)`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(px0, py0);
          ctx.lineTo(px1, py1);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,215,0,0.5)';
        ctx.fillRect(x + CELL * 0.43, y + CELL * 0.43, 2.4, 2.4);
      }
    }

    // Draw metaballs
    for (const b of metaballs) {
      b.x = clamp(b.x + b.vx, 0.1, 0.9);
      b.y = clamp(b.y + b.vy, 0.1, 0.9);
      if (b.x <= 0.1 || b.x >= 0.9) b.vx *= -1;
      if (b.y <= 0.1 || b.y >= 0.9) b.vy *= -1;

      ctx.fillStyle = 'rgba(60,255,213,0.4)';
      ctx.beginPath();
      ctx.arc(b.x * W, b.y * H, 4, 0, Math.PI*2);
      ctx.fill();
    }

    // Case index label
    ctx.fillStyle = '#3cffd5';
    ctx.font = '9px Cascadia Mono, Consolas, monospace';
    ctx.fillText(`iso=${ISO.toFixed(1)} | ${metaballs.length} metaballs | marching squares`, 6, H - 6);
    t++;
  }

  initBalls();
  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 9. BYZANTINE GENERALS / PBFT =====
register('byzantine', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let nodes, traitors, phase, t, messages;

  function init() {
    const N = 7;
    traitors = new Set();
    while (traitors.size < 2) traitors.add(rngInt(0, N - 1));
    nodes = Array.from({length: N}, (_, i) => {
      const angle = (i / N) * Math.PI * 2 - Math.PI/2;
      const cx = W/2 + Math.cos(angle) * (Math.min(W,H)/2 - 30);
      const cy = H/2 + Math.sin(angle) * (Math.min(W,H)/2 - 30);
      return { x: cx, y: cy, id: i, vote: traitors.has(i) ? null : (Math.random() < 0.6 ? 'ATTACK' : 'RETREAT'), decided: false };
    });
    messages = [];
    phase = 0;
    t = 0;
  }

  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);

    t++;
    if (t % 40 === 0) phase = (phase + 1) % 5;
    if (t > 250) init();

    // Draw edges (some active)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const isByzantine = traitors.has(i) || traitors.has(j);
        ctx.strokeStyle = isByzantine
          ? 'rgba(255,60,60,0.1)' : 'rgba(100,100,200,0.08)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // Animate messages
    if (phase >= 1 && phase <= 3) {
      const sender = phase - 1;
      if (sender < nodes.length) {
        const a = nodes[sender];
        for (let j = 0; j < nodes.length; j++) {
          if (j === sender) continue;
          const b = nodes[j];
          const progress = ((t % 40) / 40);
          const px = lerp(a.x, b.x, progress);
          const py = lerp(a.y, b.y, progress);
          const isByz = traitors.has(sender);
          ctx.fillStyle = isByz ? '#ff4444' : '#ffd700';
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI*2);
          ctx.fill();
        }
      }
    }

    // Draw nodes
    for (const n of nodes) {
      const isByz = traitors.has(n.id);
      const col = isByz ? '#ff4444'
        : n.vote === 'ATTACK' ? '#9d5cff'
        : '#3cffd5';
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(n.x, n.y, isByz ? 12 : 10, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px Space Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(isByz ? '☠' : (n.vote || '?'), n.x, n.y + 3);
    }

    // Legend
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,68,68,0.2)';
    ctx.fillRect(6, 6, W - 12, 18);
    ctx.fillStyle = '#ff4444';
    ctx.font = '9px Space Mono, monospace';
    ctx.fillText(`PBFT: ${nodes.length - traitors.size} honest, ${traitors.size} byzantine (tolerable ≤ ⌊n/3⌋=${Math.floor(nodes.length/3)})`, 10, 18);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = '9px Space Mono, monospace';
    ctx.fillText(`Phase ${phase}: ${['INIT','PRE-PREPARE','PREPARE','COMMIT','REPLY'][phase]}`, W/2, H - 8);
  }

  init();
  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 10. BOYER-MOORE STRING SEARCH =====
register('boyermoore', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const TEXTS = ['THERE IS NO ESCAPE FROM THE ALGORITHM', 'ABRACADABRA THE PATTERN HIDDEN IN NOISE', 'THE WIZARD SEARCHES THE SCROLL BACKWARDS'];
  const PATTERNS = ['ALGO', 'ABA', 'BACKWARD', 'ARCANE', 'PATTERN', 'ESCAPE'];
  let text, pattern, pos, skip, found, done, t;

  function init() {
    text = TEXTS[rngInt(0, TEXTS.length - 1)];
    pattern = PATTERNS[rngInt(0, PATTERNS.length - 1)];
    pos = 0;
    done = false;
    found = -1;
    t = 0;
    // Build bad character table
    skip = {};
    for (let i = 0; i < pattern.length; i++) skip[pattern[i]] = pattern.length - 1 - i;
  }

  function step() {
    if (done || pos > text.length - pattern.length) { done = true; return; }
    // BM: compare right-to-left
    let match = true;
    let jump = 1;
    for (let i = pattern.length - 1; i >= 0; i--) {
      if (text[pos + i] !== pattern[i]) {
        match = false;
        const badCharSkip = skip[text[pos + i]] ?? pattern.length;
        jump = Math.max(1, badCharSkip);
        break;
      }
    }
    if (match) { found = pos; done = true; return; }
    pos += jump;
  }

  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    const charW = Math.floor((W - 20) / Math.max(text.length, 20));
    const cW = Math.min(charW, 16);
    const startX = (W - text.length * cW) / 2;

    // Text
    for (let i = 0; i < text.length; i++) {
      const x = startX + i * cW;
      const isInWindow = i >= pos && i < pos + pattern.length;
      const isFound = done && found >= 0 && i >= found && i < found + pattern.length;

      if (isFound) {
        ctx.fillStyle = '#3cffd5';
        ctx.fillRect(x, H/2 - 14, cW, 20);
        ctx.fillStyle = '#000';
      } else if (isInWindow) {
        ctx.fillStyle = 'rgba(157,92,255,0.3)';
        ctx.fillRect(x, H/2 - 14, cW, 20);
        ctx.fillStyle = '#fff';
      } else {
        ctx.fillStyle = getThemeColor('#555', '#999');
      }
      ctx.font = `${Math.max(10, cW - 2)}px Space Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(text[i], x + cW/2, H/2 + 3);
    }

    // Pattern below
    const patX = startX + pos * cW;
    for (let i = 0; i < pattern.length; i++) {
      const x = patX + i * cW;
      const textChar = text[pos + i] || '';
      const matches = textChar === pattern[i];
      ctx.fillStyle = done && found === pos ? '#3cffd5'
        : matches ? 'rgba(60,255,213,0.2)' : 'rgba(255,60,172,0.2)';
      ctx.fillRect(x, H/2 + 10, cW, 18);
      ctx.fillStyle = done && found === pos ? '#000' : (matches ? '#3cffd5' : '#ff3cac');
      ctx.font = `${Math.max(10, cW - 2)}px Space Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(pattern[i], x + cW/2, H/2 + 23);
    }

    // Arrows showing skip
    ctx.textAlign = 'left';
    ctx.fillStyle = done && found >= 0 ? '#3cffd5' : '#ffd700';
    ctx.font = '10px Space Mono, monospace';
    if (done && found >= 0) {
      ctx.fillText(`✓ FOUND "${pattern}" at pos ${found}`, 10, H - 30);
    } else if (done) {
      ctx.fillText(`✗ "${pattern}" NOT FOUND — searched right-to-left`, 10, H - 30);
    } else {
      ctx.fillText(`→ pos=${pos} | skipping by bad-char heuristic`, 10, H - 30);
    }
    ctx.fillStyle = '#555';
    ctx.fillText(`text[${pos}..${pos+pattern.length}] vs "${pattern}"`, 10, H - 16);
  }

  init();
  let rafId, pauseT = 0;
  function loop() {
    t++;
    if (done) {
      pauseT++;
      if (pauseT > 80) { init(); pauseT = 0; }
    } else if (t % 18 === 0) {
      step();
    }
    draw();
    rafId = requestAnimationFrame(loop);
  }
  loop();
  return rafId;
});

// ===== 11. STOOGE SORT =====
register('stoogesort', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let arr, steps, stepIdx, highlights;

  function stoogeSteps(a, lo, hi, s) {
    if (a[lo] > a[hi]) { s.push({swap:[lo,hi], arr:[...a]}); [a[lo],a[hi]]=[a[hi],a[lo]]; }
    if (hi - lo + 1 > 2) {
      const t3 = Math.floor((hi - lo + 1) / 3);
      stoogeSteps(a, lo, hi-t3, s);
      stoogeSteps(a, lo+t3, hi, s);
      stoogeSteps(a, lo, hi-t3, s);
    }
  }

  function init() {
    const N = 12;
    arr = Array.from({length: N}, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) { const j = rngInt(0, i); [arr[i],arr[j]]=[arr[j],arr[i]]; }
    steps = [];
    stoogeSteps([...arr], 0, arr.length - 1, steps);
    stepIdx = 0;
    highlights = [];
  }

  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    const state = stepIdx < steps.length ? steps[stepIdx] : {arr: steps[steps.length-1]?.arr || arr, swap:[]};
    const N = state.arr.length;
    const barW = Math.floor((W - 40) / N);
    const maxV = N;
    for (let i = 0; i < N; i++) {
      const v = state.arr[i];
      const x = 20 + i * barW;
      const bH = (v / maxV) * (H - 50);
      const isSwap = state.swap && state.swap.includes(i);
      ctx.fillStyle = isSwap ? '#ff3cac' : stepIdx >= steps.length ? '#3cffd5' : '#9d5cff';
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x + 2, H - 30 - bH, barW - 4, bH);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = '#ffd700';
    ctx.font = '10px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`step ${stepIdx}/${steps.length} | O(n^2.709)`, 8, H-8);
  }

  init();
  let rafId, tf = 0;
  function loop() {
    tf++;
    if (tf % 3 === 0 && stepIdx <= steps.length) {
      stepIdx++;
      const state = steps[Math.min(stepIdx, steps.length - 1)];
      if (state?.swap?.length) {
        const [from, to] = state.swap;
        emitAlgorithmSound('stoogesort', {
          type: 'swap',
          from,
          to,
          index: from,
          value: Math.abs((state.arr[from] || 0) - (state.arr[to] || 0)) + 1,
          step: stepIdx
        });
      }
    }
    if (stepIdx > steps.length + 40) init();
    draw();
    rafId = requestAnimationFrame(loop);
  }
  loop();
  return rafId;
});

// ===== 12. QUANTUM BOGOSORT =====
register('quantumbogo', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let t = 0, phase = 0, universeCount = 0;

  function drawPermutationBars(cx, cy, scale, values, alpha = 1) {
    const barW = 5 * scale;
    ctx.save();
    ctx.globalAlpha = alpha;
    values.forEach((v, i) => {
      const h = (8 + v * 6) * scale;
      const x = cx + (i - values.length / 2) * (barW + 2 * scale);
      ctx.fillStyle = v === i + 1 ? '#3cffd5' : `hsl(${250 + v * 17},80%,62%)`;
      ctx.fillRect(x, cy - h / 2, barW, h);
    });
    ctx.restore();
  }

  function drawQuantumScaffold(progress) {
    ctx.save();
    for (let i = 0; i < 7; i++) {
      const y = 18 + (i + 0.5) * ((H - 42) / 7);
      ctx.strokeStyle = `hsla(${190 + i * 18},70%,58%,0.16)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 12; x <= W - 12; x += 8) {
        const wave = Math.sin(x * 0.035 + t * 0.045 + i) * (3 + i * 0.25);
        if (x === 12) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
    for (let r = 0; r < 4; r++) {
      ctx.strokeStyle = `hsla(${285 + r * 22},76%,62%,${0.2 - r * 0.03})`;
      ctx.beginPath();
      ctx.ellipse(W / 2, H / 2, 26 + r * 24 + progress * 8, 10 + r * 9, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    t++;
    if (t % 60 === 0) {
      phase = (phase + 1) % 4;
      if (phase === 0) universeCount++;
      const phaseName = ['branch', 'projector', 'prune', 'observe'][phase];
      emitAlgorithmSound('quantumbogo', {
        type: phaseName,
        phase,
        value: universeCount + 1,
        index: phase,
        step: t,
        success: phase === 3
      });
    }

    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    const progress = (t % 60) / 60;
    drawQuantumScaffold(progress);

    if (phase === 0) {
      // Branch all permutation timelines as basis-state samples.
      const branches = 12;
      for (let b = 0; b < branches; b++) {
        const angle = (b / branches) * Math.PI * 2;
        const r = 14 + progress * Math.min(W,H) * (0.28 + (b % 3) * 0.035);
        const x = W/2 + Math.cos(angle) * r;
        const y = H/2 + Math.sin(angle) * r;
        ctx.strokeStyle = `hsla(${b*31},80%,60%,${0.72-progress * 0.32})`;
        ctx.lineWidth = 1 + (b % 4) * 0.35;
        ctx.beginPath();
        ctx.moveTo(W/2, H/2);
        ctx.quadraticCurveTo(W/2 + Math.cos(angle + 0.8) * r * 0.35, H/2 + Math.sin(angle - 0.5) * r * 0.35, x, y);
        ctx.stroke();
        drawPermutationBars(x, y, 0.72, [1,2,3,4,5,6,7].map((v, i) => ((i + b * 2 + Math.floor(t / 9)) % 7) + 1), 0.78);
        ctx.fillStyle = `hsla(${b*31},80%,60%,${0.95-progress * 0.25})`;
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI*2);
        ctx.fill();
      }
      drawPermutationBars(W / 2, H / 2, 1.15, [3,1,7,2,6,4,5], 0.95);
    } else if (phase === 1) {
      // Projector test: one sorted basis state survives.
      ctx.font = 'bold 12px Space Mono, monospace';
      ctx.textAlign = 'center';
      for (let i = 0; i < 12; i++) {
        const x = 18 + (W - 36) * (i / 11);
        const y = H / 2 + Math.sin(i + t * 0.06) * 22;
        const sorted = i === 0;
        drawPermutationBars(x, y - 12, 0.62, sorted ? [1,2,3,4,5,6,7] : [7,2,5,1,6,3,4].map(v => ((v + i) % 7) + 1), sorted ? 1 : 0.55);
        ctx.fillStyle = sorted ? '#3cffd5' : '#ff5d6c';
        ctx.fillText(sorted ? 'OK' : 'NO', x, y + 20);
      }
      ctx.fillStyle = '#ffd700';
      ctx.font = '10px Space Mono, monospace';
      ctx.fillText('projector: is sorted?', W/2, H - 12);
    } else if (phase === 2) {
      // Prune unsorted timelines.
      for (let i = 0; i < 18; i++) {
        const x = 14 + (i * 31 + t * 2) % Math.max(40, W - 28);
        const y = 20 + ((i * 47 + t * 3) % Math.max(30, H - 46));
        ctx.strokeStyle = `hsla(${350 + i * 7},85%,62%,${0.18 + progress * 0.42})`;
        ctx.lineWidth = 1 + (i % 3);
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 7);
        ctx.lineTo(x + 10, y + 7);
        ctx.moveTo(x + 10, y - 7);
        ctx.lineTo(x - 10, y + 7);
        ctx.stroke();
      }
      ctx.fillStyle = '#ffe4ec';
      ctx.font = 'bold 16px Space Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PRUNING UNSORTED TIMELINES', W/2, H/2);
      ctx.font = '10px Space Mono, monospace';
      ctx.fillStyle = '#ff7487';
      ctx.fillText('(anthropic joke: only the sorted branch reports back)', W/2, H/2 + 20);
    } else {
      // Observe result: the surviving branch is sorted.
      ctx.fillStyle = '#3cffd5';
      ctx.globalAlpha = 0.15;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      drawPermutationBars(W / 2, H / 2 - 30, 1.2, [1,2,3,4,5,6,7], 1);
      ctx.font = 'bold 13px Space Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#3cffd5';
      ctx.fillText('[1, 2, 3, 4, 5, 6, 7]  OK', W/2, H/2);
      ctx.font = '10px Space Mono, monospace';
      ctx.fillStyle = '#fff';
      ctx.fillText('anthropic principle: you survived', W/2, H/2 + 16);
      ctx.fillText(`universe ${universeCount+1} - O(1) in this timeline`, W/2, H/2 + 30);
    }

    ctx.textAlign = 'left';
  }

  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 13. CYCLE SORT =====
register('cyclesort', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let arr, steps, stepIdx;

  function cycleSteps(a) {
    const s = [];
    for (let cs = 0; cs < a.length - 1; cs++) {
      let item = a[cs];
      let pos = cs;
      for (let i = cs + 1; i < a.length; i++) if (a[i] < item) pos++;
      if (pos === cs) continue;
      while (a[pos] === item) pos++;
      s.push({write: pos, cycle: cs, arr: [...a]});
      [a[pos], item] = [item, a[pos]];
      while (pos !== cs) {
        pos = cs;
        for (let i = cs + 1; i < a.length; i++) if (a[i] < item) pos++;
        while (a[pos] === item) pos++;
        s.push({write: pos, cycle: cs, arr: [...a]});
        [a[pos], item] = [item, a[pos]];
      }
    }
    s.push({write: -1, cycle: -1, arr: [...a]});
    return s;
  }

  function init() {
    const N = 14;
    arr = Array.from({length: N}, (_, i) => i + 1);
    for (let i = arr.length-1; i > 0; i--) { const j=rngInt(0,i); [arr[i],arr[j]]=[arr[j],arr[i]]; }
    steps = cycleSteps([...arr]);
    stepIdx = 0;
  }

  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    const state = steps[Math.min(stepIdx, steps.length-1)];
    const N = state.arr.length;
    const barW = Math.floor((W-40)/N);
    for (let i = 0; i < N; i++) {
      const v = state.arr[i];
      const x = 20 + i*barW;
      const bH = (v/N)*(H-50);
      const isWrite = i === state.write;
      const isCycle = i === state.cycle;
      ctx.fillStyle = isWrite ? '#ffd700' : isCycle ? '#ff3cac' : stepIdx >= steps.length-1 ? '#3cffd5' : '#9d5cff';
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x+2, H-30-bH, barW-4, bH);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = getThemeColor('#ccc', '#333');
    ctx.font = '10px Space Mono, monospace';
    ctx.textAlign = 'left';
    const writes = steps.filter(s => s.write >= 0).length;
    ctx.fillText(`writes: ${Math.min(stepIdx, writes)} (min possible) | step ${stepIdx}/${steps.length}`, 8, H-10);
  }

  init();
  let rafId, tf=0;
  function loop() {
    tf++;
    if (tf % 4 === 0 && stepIdx <= steps.length) {
      stepIdx++;
      const state = steps[Math.min(stepIdx, steps.length - 1)];
      emitAlgorithmSound('cyclesort', {
        type: state.write >= 0 ? 'write' : 'done',
        from: state.cycle,
        to: state.write,
        index: state.write,
        value: state.write >= 0 ? state.arr[state.write] : state.arr.length,
        step: stepIdx,
        success: state.write < 0
      });
    }
    if (stepIdx > steps.length + 50) init();
    draw();
    rafId = requestAnimationFrame(loop);
  }
  loop();
  return rafId;
});

// ===== 14. RESERVOIR SAMPLING =====
register('reservoir', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const K = 5; // reservoir size
  let stream, streamIdx, reservoir, t;

  function init() {
    stream = Array.from({length: 60}, () => rngInt(1, 99));
    streamIdx = 0;
    reservoir = stream.slice(0, K).map(v => ({v, highlight: true}));
    t = 0;
  }

  function step() {
    if (streamIdx >= stream.length) { init(); return; }
    streamIdx++;
    if (streamIdx <= K) {
      reservoir[streamIdx-1] = {v: stream[streamIdx-1], highlight: true};
    } else {
      const i = rngInt(0, streamIdx-1);
      const prev = reservoir.map(r => ({...r, highlight: false}));
      if (i < K) {
        const replaced = {...reservoir[i], highlight: true};
        reservoir = prev;
        reservoir[i] = replaced;
      } else {
        reservoir = prev;
      }
    }
  }

  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);

    // Stream tape
    const charW = 24, startX = 10;
    const visCount = Math.floor((W - 20) / charW);
    const startVis = Math.max(0, streamIdx - Math.floor(visCount/2));
    for (let i = 0; i < visCount; i++) {
      const si = startVis + i;
      if (si >= stream.length) break;
      const x = startX + i * charW;
      const isCurrent = si === streamIdx;
      ctx.fillStyle = isCurrent ? '#ffd700' : getThemeColor('rgba(50,45,70,0.5)', 'rgba(200,190,230,0.4)');
      ctx.fillRect(x, 20, charW - 2, 22);
      ctx.fillStyle = isCurrent ? '#000' : getThemeColor('#aaa', '#555');
      ctx.font = `${isCurrent ? 'bold ' : ''}11px Space Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(stream[si], x + charW/2, 36);
    }
    // Stream label
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd700';
    ctx.font = '9px Space Mono, monospace';
    ctx.fillText(`STREAM (n unknown) →  item ${streamIdx}`, 8, 14);

    // Arrow
    ctx.fillStyle = '#9d5cff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('↓', W/2, 55);

    // Reservoir
    const rW = Math.min(80, (W - 30) / K);
    const rStartX = (W - K * rW) / 2;
    ctx.fillStyle = '#9d5cff';
    ctx.font = '9px Space Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`RESERVOIR (k=${K})`, W/2, 72);
    for (let i = 0; i < K; i++) {
      const x = rStartX + i * rW;
      const r = reservoir[i];
      ctx.fillStyle = r?.highlight ? 'rgba(157,92,255,0.4)' : 'rgba(157,92,255,0.1)';
      ctx.strokeStyle = r?.highlight ? '#9d5cff' : '#4a4558';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, 78, rW - 6, 36, 4);
      ctx.fill();
      ctx.stroke();
      if (r) {
        ctx.fillStyle = r.highlight ? '#fff' : getThemeColor('#aaa', '#555');
        ctx.font = `bold ${Math.min(14, rW - 8)}px Space Mono, monospace`;
        ctx.fillText(r.v, x + (rW-6)/2, 101);
      }
    }

    // Probability
    ctx.textAlign = 'left';
    ctx.fillStyle = '#3cffd5';
    ctx.font = '9px Space Mono, monospace';
    const prob = streamIdx > 0 ? (K / streamIdx).toFixed(3) : '1.000';
    ctx.fillText(`P(include) = k/i = ${K}/${streamIdx} = ${prob}  |  uniform guaranteed`, 10, H-10);

    t++;
  }

  init();
  let rafId, tf=0;
  function loop() {
    tf++;
    if (tf % 12 === 0) step();
    draw();
    rafId = requestAnimationFrame(loop);
  }
  loop();
  return rafId;
});

// ===== 15. ALGORITHM X =====
register('algorithmx', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const rows = [
    { name: 'r1', cols: [0, 3, 6] },
    { name: 'r2', cols: [0, 3] },
    { name: 'r3', cols: [3, 4, 6] },
    { name: 'r4', cols: [2, 4, 5] },
    { name: 'r5', cols: [1, 2, 5, 6] },
    { name: 'r6', cols: [1, 6] }
  ];
  let t = 0;

  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    t++;

    const phase = Math.floor(t / 42) % 6;
    const chosenCol = [3, 0, 6, 1, 2, 5][phase];
    const chosenRow = [1, 1, 5, 5, 4, 3][phase];
    const covered = new Set();
    for (let i = 0; i <= phase; i++) {
      rows[[1, 5, 4, 3, 0, 2][i]]?.cols.forEach(col => covered.add(col));
    }

    const left = 34;
    const top = 28;
    const cellW = Math.min(34, Math.floor((W - 60) / columns.length));
    const cellH = 18;

    ctx.textAlign = 'center';
    ctx.font = 'bold 10px Space Mono, monospace';
    for (let col = 0; col < columns.length; col++) {
      const x = left + col * cellW;
      ctx.fillStyle = covered.has(col) ? 'rgba(255,215,0,0.2)' : 'rgba(157,92,255,0.16)';
      ctx.strokeStyle = col === chosenCol ? '#ffd700' : '#352f45';
      ctx.lineWidth = col === chosenCol ? 2 : 1;
      ctx.fillRect(x, top, cellW - 2, cellH);
      ctx.strokeRect(x, top, cellW - 2, cellH);
      ctx.fillStyle = col === chosenCol ? '#ffd700' : '#c89fff';
      ctx.fillText(columns[col], x + cellW / 2, top + 13);
    }

    for (let row = 0; row < rows.length; row++) {
      const y = top + (row + 1) * cellH;
      ctx.fillStyle = row === chosenRow ? '#ffd700' : getThemeColor('#8a8499', '#5a5070');
      ctx.textAlign = 'right';
      ctx.fillText(rows[row].name, left - 8, y + 13);
      for (let col = 0; col < columns.length; col++) {
        const x = left + col * cellW;
        const hasOne = rows[row].cols.includes(col);
        const knockedOut = hasOne && covered.has(col) && row !== chosenRow;
        ctx.fillStyle = knockedOut ? 'rgba(255,60,172,0.12)' : 'rgba(30,25,45,0.45)';
        ctx.strokeStyle = '#2a2535';
        ctx.lineWidth = 1;
        ctx.fillRect(x, y, cellW - 2, cellH - 2);
        ctx.strokeRect(x, y, cellW - 2, cellH - 2);
        if (hasOne) {
          ctx.fillStyle = row === chosenRow ? '#ffd700' : knockedOut ? '#ff3cac' : '#3cffd5';
          ctx.beginPath();
          ctx.arc(x + cellW / 2, y + cellH / 2 - 1, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.textAlign = 'left';
    ctx.font = '9px Space Mono, monospace';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('choose sparse column -> select row -> cover conflicting columns', 8, H - 24);
    ctx.fillStyle = '#3cffd5';
    ctx.fillText(`depth ${phase + 1} | exact cover search prunes by constraint scarcity`, 8, H - 10);
  }

  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 16. DANCING LINKS (DLX) — Sudoku-style =====
register('dlx', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let t = 0, grid, links, phase;

  function init() {
    // 4x4 mini-sudoku for visualization
    grid = [
      [1, 0, 3, 0],
      [0, 0, 0, 2],
      [0, 2, 0, 0],
      [0, 4, 0, 1]
    ];
    t = 0; phase = 0;
    links = [];
    // Build some "dancing" link nodes
    for (let i = 0; i < 16; i++) {
      const row = Math.floor(i / 4), col = i % 4;
      if (grid[row][col] === 0) {
        links.push({row, col, val: rngInt(1, 4), active: true});
      }
    }
  }

  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    t++;
    if (t > 200) init();

    // Animate links dancing
    const animT = t * 0.08;
    if (t % 20 === 0 && links.length > 0) {
      // Toggle some links
      for (const lk of links) {
        if (Math.random() < 0.3) {
          lk.active = !lk.active;
          lk.val = rngInt(1, 4);
        }
      }
    }

    const CELL = Math.min(36, Math.floor(Math.min(W, H - 60) / 5));
    const startX = (W - 4 * CELL) / 2;
    const startY = 30;

    // Draw grid
    for (let r = 0; r < 4; r++) {
      for (let co = 0; co < 4; co++) {
        const x = startX + co * CELL;
        const y = startY + r * CELL;
        const v = grid[r][co];
        ctx.fillStyle = v ? 'rgba(157,92,255,0.15)' : 'rgba(30,25,45,0.5)';
        ctx.strokeStyle = '#352f45';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x+1, y+1, CELL-2, CELL-2, 3);
        ctx.fill();
        ctx.stroke();
        if (v) {
          ctx.fillStyle = '#9d5cff';
          ctx.font = `bold ${Math.floor(CELL*0.5)}px Space Mono, monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(v, x + CELL/2, y + CELL*0.65);
        }
      }
    }

    // 2x2 box borders
    ctx.strokeStyle = '#9d5cff';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, CELL*2, CELL*2);
    ctx.strokeRect(startX+CELL*2, startY, CELL*2, CELL*2);
    ctx.strokeRect(startX, startY+CELL*2, CELL*2, CELL*2);
    ctx.strokeRect(startX+CELL*2, startY+CELL*2, CELL*2, CELL*2);

    // Dancing links animation — draw links between empty cells
    for (let i = 0; i < links.length; i++) {
      const lk = links[i];
      const x1 = startX + lk.col * CELL + CELL/2;
      const y1 = startY + lk.row * CELL + CELL/2;
      if (!lk.active) continue;
      // Draw tentative value
      const wobble = Math.sin(animT + i) * 2;
      ctx.fillStyle = `hsla(${280+i*15},80%,70%,0.9)`;
      ctx.font = `bold ${Math.floor(CELL*0.45)}px Space Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(lk.val, x1 + wobble, y1 + CELL*0.15 + wobble);

      // Link arrows to siblings
      if (i + 1 < links.length && links[i+1].active) {
        const lk2 = links[i+1];
        const x2 = startX + lk2.col * CELL + CELL/2;
        const y2 = startY + lk2.row * CELL + CELL/2;
        ctx.strokeStyle = `hsla(${280+i*15},60%,60%,0.3)`;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3,3]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd700';
    ctx.font = '9px Space Mono, monospace';
    ctx.fillText('↔ nodes unlink/relink as backtracking occurs', 8, H-28);
    ctx.fillStyle = '#9d5cff';
    ctx.fillText('exact cover: each row/col/box contains 1-4 exactly once', 8, H-14);
  }

  init();
  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 16. JUMP CONSISTENCY HASHING =====
register('jumphash', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let keys, bucketCount, t;

  function jumpHash(key, numBuckets) {
    let b = -1n, j = 0n;
    let k = BigInt(key);
    let guard = 0;
    while (j < BigInt(numBuckets) && guard++ < 64) {
      b = j;
      k = BigInt.asUintN(64, k * 2862933555777941757n + 1n);
      const denominator = Number((k >> 33n) + 1n);
      j = BigInt(Math.floor(Number(b + 1n) * (2147483648 / denominator)));
    }
    return Number(b);
  }

  function init() {
    keys = Array.from({length: 20}, (_, i) => rngInt(1000, 9999));
    bucketCount = 4;
    t = 0;
  }

  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    t++;
    if (t % 120 === 0) {
      bucketCount = rngInt(3, 8);
      if (t % 360 === 0) keys = Array.from({length: 20}, () => rngInt(1000, 9999));
    }
    if (t > 500) init();

    const bucketW = Math.floor((W - 20) / bucketCount);
    const COLORS = ['#9d5cff','#ff3cac','#3cffd5','#ffd700','#ff7c4d','#4d9fff','#ff4444','#44ff88'];

    // Draw bucket columns
    for (let b = 0; b < bucketCount; b++) {
      const x = 10 + b * bucketW;
      ctx.fillStyle = `${COLORS[b % COLORS.length]}22`;
      ctx.strokeStyle = COLORS[b % COLORS.length];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x+2, 30, bucketW-4, H-50, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = COLORS[b % COLORS.length];
      ctx.font = 'bold 11px Space Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`B${b}`, x + bucketW/2, 45);
    }

    // Draw keys in buckets
    const bucketSlots = new Array(bucketCount).fill(0);
    for (const key of keys) {
      const b = jumpHash(key, bucketCount);
      const bx = 10 + b * bucketW;
      const slot = bucketSlots[b]++;
      const ky = 55 + slot * 14;
      if (ky > H - 24) continue;
      ctx.fillStyle = COLORS[b % COLORS.length];
      ctx.globalAlpha = 0.8;
      ctx.font = '9px Space Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(key, bx + bucketW/2, ky);
      ctx.globalAlpha = 1;
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd700';
    ctx.font = '9px Space Mono, monospace';
    ctx.fillText(`${bucketCount} buckets | ${keys.length} keys | O(ln n) | ~${Math.round(keys.length/bucketCount)} per bucket`, 8, H-10);
    const perBucket = new Array(bucketCount).fill(0);
    for (const k of keys) perBucket[jumpHash(k, bucketCount)]++;
    const maxDev = Math.max(...perBucket) - Math.min(...perBucket);
    ctx.fillStyle = '#3cffd5';
    ctx.fillText(`max deviation: ${maxDev} (perfect=0, real O(1/n))`, 8, H-22);
  }

  init();
  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 17. COCKTAIL SHAKER SORT =====
register('cocktail', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let arr, steps, stepIdx, dir;

  function cocktailSteps(a) {
    const s = [];
    a = [...a];
    let lo = 0, hi = a.length - 1;
    while (lo < hi) {
      let swapped = false;
      for (let i = lo; i < hi; i++) {
        if (a[i] > a[i+1]) { [a[i],a[i+1]]=[a[i+1],a[i]]; swapped=true; s.push({arr:[...a],cmp:[i,i+1],dir:'→'}); }
      }
      hi--;
      for (let i = hi; i > lo; i--) {
        if (a[i] < a[i-1]) { [a[i],a[i-1]]=[a[i-1],a[i]]; swapped=true; s.push({arr:[...a],cmp:[i-1,i],dir:'←'}); }
      }
      lo++;
      if (!swapped) break;
    }
    s.push({arr:[...a],cmp:[],dir:'✓'});
    return s;
  }

  function init() {
    const N = 14;
    arr = Array.from({length:N}, (_,i)=>i+1);
    for (let i=arr.length-1;i>0;i--){const j=rngInt(0,i);[arr[i],arr[j]]=[arr[j],arr[i]];}
    steps = cocktailSteps([...arr]);
    stepIdx = 0;
  }

  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    const state = steps[Math.min(stepIdx, steps.length-1)];
    const N = state.arr.length;
    const barW = Math.floor((W-40)/N);
    for (let i = 0; i < N; i++) {
      const v = state.arr[i];
      const bH = (v/N)*(H-50);
      const x = 20 + i*barW;
      const isCmp = state.cmp && state.cmp.includes(i);
      ctx.fillStyle = state.dir === '✓' ? '#3cffd5' : isCmp ? '#ff3cac' : (state.dir === '→' ? '#9d5cff' : '#ff7c4d');
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x+2, H-30-bH, barW-4, bH);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = '#ffd700';
    ctx.font = '10px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${state.dir || '?'} pass | step ${stepIdx}/${steps.length}`, 8, H-10);
  }

  init();
  let rafId, tf=0;
  function loop() {
    tf++;
    if (tf%3===0 && stepIdx <= steps.length) {
      stepIdx++;
      const state = steps[Math.min(stepIdx, steps.length - 1)];
      const pair = state.cmp || [];
      emitAlgorithmSound('cocktail', {
        type: state.dir === '✓' ? 'done' : 'swap',
        from: pair[0] ?? 0,
        to: pair[1] ?? 0,
        index: pair[0] ?? 0,
        value: pair.length ? Math.abs((state.arr[pair[0]] || 0) - (state.arr[pair[1]] || 0)) + 1 : state.arr.length,
        step: stepIdx,
        direction: state.dir,
        success: state.dir === '✓'
      });
    }
    if (stepIdx > steps.length + 40) init();
    draw();
    rafId = requestAnimationFrame(loop);
  }
  loop();
  return rafId;
});

// ===== 18. TIMSORT =====
register('timsort', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let arr, steps, stepIdx, runs;

  function timSteps(a) {
    const s = [];
    a = [...a];
    const RUN = 4;
    const runList = [];
    // Insertion sort for each run
    for (let i = 0; i < a.length; i += RUN) {
      const end = Math.min(i + RUN - 1, a.length - 1);
      runList.push([i, end]);
      for (let j = i + 1; j <= end; j++) {
        const key = a[j];
        let k = j - 1;
        while (k >= i && a[k] > key) { a[k+1] = a[k]; k--; s.push({arr:[...a],phase:'insert',active:[k+1,j]}); }
        a[k+1] = key;
      }
    }
    // Merge runs
    let size = RUN;
    while (size < a.length) {
      for (let left = 0; left < a.length; left += size * 2) {
        const mid = Math.min(left + size - 1, a.length - 1);
        const right = Math.min(left + size * 2 - 1, a.length - 1);
        if (mid < right) {
          // Merge [left..mid] and [mid+1..right]
          const L = a.slice(left, mid+1);
          const R = a.slice(mid+1, right+1);
          let i2=0, j=0, k=left;
          while (i2<L.length && j<R.length) {
            if (L[i2]<=R[j]) { a[k++]=L[i2++]; } else { a[k++]=R[j++]; }
            s.push({arr:[...a],phase:'merge',active:[k-1,mid]});
          }
          while (i2<L.length) { a[k++]=L[i2++]; s.push({arr:[...a],phase:'merge',active:[k-1]}); }
          while (j<R.length) { a[k++]=R[j++]; s.push({arr:[...a],phase:'merge',active:[k-1]}); }
        }
      }
      size *= 2;
    }
    s.push({arr:[...a],phase:'done',active:[]});
    return {steps: s, runs: runList};
  }

  function init() {
    const N = 16;
    arr = Array.from({length:N}, (_,i)=>i+1);
    for (let i=arr.length-1;i>0;i--){const j=rngInt(0,i);[arr[i],arr[j]]=[arr[j],arr[i]];}
    const res = timSteps([...arr]);
    steps = res.steps;
    runs = res.runs;
    stepIdx = 0;
  }

  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    const state = steps[Math.min(stepIdx, steps.length-1)];
    const N = state.arr.length;
    const barW = Math.floor((W-40)/N);
    for (let i = 0; i < N; i++) {
      const v = state.arr[i];
      const bH = (v/N)*(H-50);
      const x = 20 + i*barW;
      const isActive = state.active && state.active.includes(i);
      const runIdx = runs.findIndex(([lo,hi]) => i >= lo && i <= hi) % 4;
      const runCols = ['#9d5cff','#ff3cac','#ffd700','#3cffd5'];
      ctx.fillStyle = state.phase === 'done' ? '#3cffd5'
        : isActive ? '#fff'
        : runCols[runIdx] || '#9d5cff';
      ctx.globalAlpha = 0.8;
      ctx.fillRect(x+2, H-30-bH, barW-4, bH);
      ctx.globalAlpha = 1;
    }
    // Run dividers
    for (const [lo, hi] of runs) {
      const x = 20 + (hi+1)*barW;
      ctx.strokeStyle = 'rgba(255,215,0,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4,4]);
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x, H-30);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = '#ffd700';
    ctx.font = '10px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${state.phase} | ${runs.length} runs (min-run=4) | step ${stepIdx}/${steps.length}`, 8, H-10);
  }

  init();
  let rafId, tf=0;
  function loop() {
    tf++;
    if (tf%2===0 && stepIdx<=steps.length) {
      stepIdx++;
      const state = steps[Math.min(stepIdx, steps.length - 1)];
      const active = state.active || [];
      emitAlgorithmSound('timsort', {
        type: state.phase || 'state',
        from: active[0] ?? 0,
        to: active[1] ?? active[0] ?? 0,
        index: active[0] ?? 0,
        value: active.length ? state.arr[active[0]] : state.arr.length,
        step: stepIdx,
        success: state.phase === 'done'
      });
    }
    if (stepIdx > steps.length+50) init();
    draw();
    rafId = requestAnimationFrame(loop);
  }
  loop();
  return rafId;
});

// ===== 19. FAST INVERSE SQUARE ROOT =====
register('fisr', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let t = 0, x_val, result_fisr, result_true, bits_orig, bits_shifted;

  function floatToHex(f) {
    const buf = new ArrayBuffer(4);
    new Float32Array(buf)[0] = f;
    return '0x' + new Uint32Array(buf)[0].toString(16).toUpperCase().padStart(8, '0');
  }
  function fastInvSqrt(x) {
    const buf = new ArrayBuffer(4);
    const fa = new Float32Array(buf);
    const ia = new Int32Array(buf);
    fa[0] = x;
    ia[0] = 0x5F3759DF - (ia[0] >> 1);
    const y0 = fa[0];
    const y1 = y0 * (1.5 - 0.5 * x * y0 * y0); // 1 Newton-Raphson
    return y1;
  }

  function init() {
    x_val = rng(0.5, 20);
    result_fisr = fastInvSqrt(x_val);
    result_true = 1 / Math.sqrt(x_val);
    const buf = new ArrayBuffer(4);
    new Float32Array(buf)[0] = x_val;
    bits_orig = new Uint32Array(buf)[0];
    new Float32Array(buf)[0] = x_val;
    const ia = new Int32Array(buf);
    bits_shifted = (0x5F3759DF - (ia[0] >> 1)) >>> 0;
    t = 0;
  }

  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    t++;
    if (t > 280) init();

    const progress = clamp(t / 200, 0, 1);
    const step = Math.floor(progress * 5);

    const px = W / 2, cy = H / 2;
    const lines = [
      { label: 'float x =', val: x_val.toFixed(4), col: '#ffd700', active: step >= 0 },
      { label: 'as int:   ', val: floatToHex(x_val), col: '#ff3cac', active: step >= 1 },
      { label: '>> 1:     ', val: '0x' + (bits_orig >> 1).toString(16).toUpperCase(), col: '#ff7c4d', active: step >= 2 },
      { label: '0x5F3759DF -', val: '= ' + floatToHex(fastInvSqrt(x_val) * (1.5 - 0.5 * x_val * fastInvSqrt(x_val) * fastInvSqrt(x_val))), col: '#9d5cff', active: step >= 3 },
      { label: 'reinterpret float:', val: result_fisr.toFixed(6), col: '#3cffd5', active: step >= 4 },
    ];

    ctx.font = '11px Space Mono, monospace';
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const y = 22 + i * 26;
      ctx.globalAlpha = l.active ? 1 : 0.2;
      if (l.active && step === i) {
        ctx.fillStyle = `${l.col}22`;
        ctx.fillRect(6, y - 14, W - 12, 20);
      }
      ctx.fillStyle = l.col;
      ctx.textAlign = 'left';
      ctx.fillText(l.label, 10, y);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'right';
      ctx.fillText(l.val, W - 10, y);
      ctx.globalAlpha = 1;
    }

    // Result comparison
    const err = Math.abs(result_fisr - result_true) / result_true * 100;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(157,92,255,0.15)';
    ctx.fillRect(6, H-54, W-12, 46);
    ctx.fillStyle = '#9d5cff';
    ctx.font = 'bold 10px Space Mono, monospace';
    ctx.fillText(`FISR: 1/√${x_val.toFixed(2)} = ${result_fisr.toFixed(6)}`, px, H-38);
    ctx.fillStyle = '#3cffd5';
    ctx.fillText(`TRUE: ${result_true.toFixed(6)}   ERR: ${err.toFixed(3)}%`, px, H-24);
    ctx.fillStyle = '#ffd700';
    ctx.font = '9px Space Mono, monospace';
    ctx.fillText('magic: 0x5F3759DF  |  one Newton step  |  1% error  |  3x faster than division', px, H-10);
  }

  init();
  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 21. A* SEARCH =====
register('astar', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const cols = 17, rows = 10;
  let blocked, open, closed, cameFrom, gScore, path, done, noPath, rest;
  const start = { x: 0, y: 0 };
  const goal = { x: cols - 1, y: rows - 1 };

  const key = (p) => `${p.x},${p.y}`;
  const h = (p) => Math.abs(goal.x - p.x) + Math.abs(goal.y - p.y);

  function init() {
    blocked = new Set();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if ((x === start.x && y === start.y) || (x === goal.x && y === goal.y)) continue;
        if (Math.random() < 0.21) blocked.add(`${x},${y}`);
      }
    }
    open = [{ ...start }];
    closed = new Set();
    cameFrom = {};
    gScore = { [key(start)]: 0 };
    path = [];
    done = false;
    noPath = false;
    rest = 0;
  }

  function reconstruct(current) {
    const out = [current];
    while (cameFrom[key(current)]) {
      current = cameFrom[key(current)];
      out.unshift(current);
    }
    path = out;
  }

  function step() {
    for (let ticks = 0; ticks < 3 && !done; ticks++) {
      if (open.length === 0) {
        done = true;
        noPath = true;
        return;
      }
      open.sort((a, b) => (gScore[key(a)] + h(a)) - (gScore[key(b)] + h(b)));
      const current = open.shift();
      if (current.x === goal.x && current.y === goal.y) {
        reconstruct(current);
        done = true;
        return;
      }
      closed.add(key(current));
      const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      for (const [dx, dy] of dirs) {
        const n = { x: current.x + dx, y: current.y + dy };
        const nk = key(n);
        if (n.x < 0 || n.x >= cols || n.y < 0 || n.y >= rows || blocked.has(nk) || closed.has(nk)) continue;
        const tentative = gScore[key(current)] + 1;
        if (tentative < (gScore[nk] ?? Infinity)) {
          cameFrom[nk] = current;
          gScore[nk] = tentative;
          if (!open.some(p => p.x === n.x && p.y === n.y)) open.push(n);
        }
      }
    }
  }

  function draw() {
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    const cell = Math.min((W - 24) / cols, (H - 34) / rows);
    const ox = (W - cell * cols) / 2;
    const oy = 12;
    const pathSet = new Set(path.map(key));
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const k = `${x},${y}`;
        const px = ox + x * cell;
        const py = oy + y * cell;
        ctx.fillStyle = blocked.has(k) ? '#241b2f'
          : pathSet.has(k) ? '#ffd700'
          : closed.has(k) ? 'rgba(255,60,172,0.38)'
          : open.some(p => p.x === x && p.y === y) ? 'rgba(60,255,213,0.42)'
          : 'rgba(157,92,255,0.1)';
        ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
      }
    }
    ctx.fillStyle = '#3cffd5';
    ctx.fillRect(ox + 1, oy + 1, cell - 2, cell - 2);
    ctx.fillStyle = '#ff3cac';
    ctx.fillRect(ox + goal.x * cell + 1, oy + goal.y * cell + 1, cell - 2, cell - 2);
    ctx.fillStyle = noPath ? '#ff7070' : '#ffd700';
    ctx.font = '9px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(noPath ? 'no path | reset incoming' : `open ${open.length} | closed ${closed.size} | h=Manhattan`, 8, H - 10);
  }

  init();
  let rafId;
  function loop() {
    if (!done) step();
    else if (++rest > 70) init();
    draw();
    rafId = requestAnimationFrame(loop);
  }
  loop();
  return rafId;
});

// ===== 22. PERLIN / VALUE NOISE =====
register('perlin', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let seed = rng(0, 9999), z = 0;
  const fade = (t) => t * t * (3 - 2 * t);
  const fract = (n) => n - Math.floor(n);

  function lattice(ix, iy) {
    return fract(Math.sin(ix * 127.1 + iy * 311.7 + seed) * 43758.5453123);
  }
  function valueNoise(x, y) {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const sx = fade(x - x0), sy = fade(y - y0);
    const n00 = lattice(x0, y0);
    const n10 = lattice(x0 + 1, y0);
    const n01 = lattice(x0, y0 + 1);
    const n11 = lattice(x0 + 1, y0 + 1);
    return lerp(lerp(n00, n10, sx), lerp(n01, n11, sx), sy);
  }

  function draw() {
    const cell = 8;
    const cols = Math.ceil(W / cell);
    const rows = Math.ceil(H / cell);
    z += 0.018;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const n = valueNoise(x * 0.18 + z, y * 0.18 - z * 0.7);
        const n2 = valueNoise(x * 0.42 - z * 0.4, y * 0.42 + z);
        const v = clamp(n * 0.7 + n2 * 0.3, 0, 1);
        const hue = 170 + v * 120;
        ctx.fillStyle = `hsl(${hue}, 85%, ${18 + v * 42}%)`;
        ctx.fillRect(x * cell, y * cell, cell + 1, cell + 1);
      }
    }
    ctx.fillStyle = 'rgba(10,9,12,0.55)';
    ctx.fillRect(0, H - 22, W, 22);
    ctx.fillStyle = '#7dffe8';
    ctx.font = '9px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('coherent gradient-ish noise | terrain/cloud/void texture', 8, H - 8);
  }

  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 23. KALMAN FILTER =====
register('kalman', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let t, estimate, p, points;

  function init() {
    t = 0;
    estimate = H / 2;
    p = 30;
    points = [];
  }
  function push() {
    const truth = H / 2 + Math.sin(t * 0.09) * 44 + Math.sin(t * 0.031) * 18;
    const measurement = truth + rng(-34, 34);
    p += 2.2;
    const k = p / (p + 90);
    estimate = estimate + k * (measurement - estimate);
    p = (1 - k) * p;
    points.push({ truth, measurement, estimate, k });
    if (points.length > 86) points.shift();
    t++;
  }
  function drawSeries(prop, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    points.forEach((pt, i) => {
      const x = 12 + i * ((W - 24) / 86);
      if (i === 0) ctx.moveTo(x, pt[prop]);
      else ctx.lineTo(x, pt[prop]);
    });
    ctx.stroke();
  }
  function draw() {
    for (let i = 0; i < 2; i++) push();
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(157,92,255,0.14)';
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,60,172,0.35)';
    points.forEach((pt, i) => {
      const x = 12 + i * ((W - 24) / 86);
      ctx.beginPath();
      ctx.arc(x, pt.measurement, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });
    drawSeries('truth', 'rgba(255,215,0,0.55)', 1);
    drawSeries('estimate', '#3cffd5', 2.4);
    const last = points[points.length - 1] || { k: 0 };
    ctx.fillStyle = '#3cffd5';
    ctx.font = '9px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`measurement noise -> filtered state | Kalman gain ${last.k.toFixed(2)}`, 8, H - 10);
  }

  init();
  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 24. HYPERLOGLOG =====
register('hyperloglog', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const M = 16, BITS = 4;
  let registers, seen, seed, tick;

  function init() {
    registers = new Array(M).fill(0);
    seen = 0;
    seed = rngInt(1, 999999);
    tick = 0;
  }
  function add() {
    const h = hash32(`specter-${seed}-${seen}`);
    const bucket = h & (M - 1);
    const remainder = h >>> BITS;
    const rank = clamp(Math.clz32(remainder || 1) - BITS + 1, 1, 28);
    registers[bucket] = Math.max(registers[bucket], rank);
    seen++;
  }
  function estimate() {
    const sum = registers.reduce((acc, r) => acc + Math.pow(2, -r), 0);
    return 0.673 * M * M / sum;
  }
  function draw() {
    for (let i = 0; i < 9; i++) add();
    tick++;
    if (seen > 2400) init();
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    const gap = 4;
    const barW = (W - 30 - gap * (M - 1)) / M;
    for (let i = 0; i < M; i++) {
      const bh = registers[i] * 10;
      const x = 15 + i * (barW + gap);
      ctx.fillStyle = `hsla(${170 + registers[i] * 13},85%,60%,0.82)`;
      ctx.fillRect(x, H - 34 - bh, barW, bh);
      ctx.fillStyle = '#8a8499';
      ctx.font = '8px Space Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(registers[i], x + barW / 2, H - 20);
    }
    const est = estimate();
    ctx.fillStyle = '#ffd700';
    ctx.font = '9px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`actual ${seen} | estimate ${Math.round(est)} | memory ${M} registers`, 8, H - 8);
  }

  init();
  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 25. BLOOM FILTER =====
register('bloom', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const SIZE = 64;
  let bits, items, probe, hashes, t;

  function hashPositions(item) {
    return [hash32(item, 11) % SIZE, hash32(item, 29) % SIZE, hash32(item, 47) % SIZE];
  }
  function init() {
    bits = new Array(SIZE).fill(0);
    items = [];
    probe = 'SIGIL-0';
    hashes = [];
    t = 0;
  }
  function insert(item) {
    items.push(item);
    hashes = hashPositions(item);
    hashes.forEach(i => bits[i] = 1);
  }
  function draw() {
    t++;
    if (t % 32 === 1) {
      if (items.length < 20 || Math.random() < 0.7) {
        probe = `SIGIL-${items.length + rngInt(10, 99)}`;
        insert(probe);
      } else {
        probe = Math.random() < 0.45 ? items[rngInt(0, items.length - 1)] : `GHOST-${rngInt(100, 999)}`;
        hashes = hashPositions(probe);
      }
    }
    if (t > 760) init();
    const maybe = hashes.length > 0 && hashes.every(i => bits[i]);
    const known = items.includes(probe);
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    const cell = Math.min(18, Math.floor((W - 24) / 16));
    const ox = (W - cell * 16) / 2;
    const oy = 24;
    for (let i = 0; i < SIZE; i++) {
      const x = ox + (i % 16) * cell;
      const y = oy + Math.floor(i / 16) * cell;
      const hot = hashes.includes(i);
      ctx.fillStyle = hot ? '#ffd700' : bits[i] ? 'rgba(60,255,213,0.68)' : 'rgba(157,92,255,0.12)';
      ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
    }
    ctx.fillStyle = maybe ? (known ? '#3cffd5' : '#ffd700') : '#ff7070';
    ctx.font = '10px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${probe}: ${maybe ? known ? 'yes' : 'maybe' : 'no'} | false positives allowed`, 8, H - 10);
  }

  init();
  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 26. MERKLE TREE =====
register('merkle', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let leaves, levels, hotLeaf, t;

  function shortHash(value) {
    return hash32(value).toString(16).toUpperCase().padStart(8, '0').slice(0, 6);
  }
  function build() {
    levels = [leaves.map(shortHash)];
    while (levels[levels.length - 1].length > 1) {
      const prev = levels[levels.length - 1];
      const next = [];
      for (let i = 0; i < prev.length; i += 2) next.push(shortHash(prev[i] + (prev[i + 1] || prev[i])));
      levels.push(next);
    }
  }
  function init() {
    leaves = Array.from({ length: 8 }, (_, i) => `leaf-${i}-${rngInt(100, 999)}`);
    hotLeaf = rngInt(0, 7);
    t = 0;
    build();
  }
  function onHotPath(level, index) {
    return Math.floor(hotLeaf / Math.pow(2, level)) === index;
  }
  function draw() {
    t++;
    if (t % 90 === 1) {
      hotLeaf = rngInt(0, 7);
      leaves[hotLeaf] = `leaf-${hotLeaf}-${rngInt(100, 999)}`;
      build();
    }
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    const yStep = 44;
    for (let level = levels.length - 1; level >= 0; level--) {
      const nodes = levels[level];
      const visualLevel = levels.length - 1 - level;
      const y = 22 + visualLevel * yStep;
      for (let i = 0; i < nodes.length; i++) {
        const x = W * (i + 1) / (nodes.length + 1);
        if (level > 0) {
          const childCount = levels[level - 1].length;
          for (const child of [i * 2, i * 2 + 1]) {
            if (child >= childCount) continue;
            const cx = W * (child + 1) / (childCount + 1);
            const cy = y + yStep;
            ctx.strokeStyle = onHotPath(level, i) ? 'rgba(255,215,0,0.55)' : 'rgba(157,92,255,0.22)';
            ctx.beginPath();
            ctx.moveTo(x, y + 10);
            ctx.lineTo(cx, cy - 12);
            ctx.stroke();
          }
        }
        ctx.fillStyle = onHotPath(level, i) ? '#ffd700' : 'rgba(60,255,213,0.72)';
        ctx.beginPath();
        ctx.arc(x, y, level === levels.length - 1 ? 12 : 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = getThemeColor('#0a090c', '#1a1625');
        ctx.font = '7px Space Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(nodes[i].slice(0, 3), x, y + 2);
      }
    }
    ctx.fillStyle = '#ffd700';
    ctx.font = '9px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`mutated leaf ${hotLeaf} -> root ${levels.at(-1)[0]}`, 8, H - 10);
  }

  init();
  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 27. MONTE CARLO TREE SEARCH =====
register('mcts', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let nodes, t;

  function init() {
    nodes = [{ parent: -1, children: [], visits: 0, value: 0, depth: 0, x: W / 2, y: 24 }];
    const fanouts = [3, 3, 2];
    let frontier = [0];
    for (let depth = 1; depth <= 3; depth++) {
      const next = [];
      for (const parent of frontier) {
        for (let i = 0; i < fanouts[depth - 1]; i++) {
          const idx = nodes.length;
          nodes[parent].children.push(idx);
          nodes.push({ parent, children: [], visits: 0, value: 0, depth, x: 0, y: 0, bias: rng(0.2, 0.9) });
          next.push(idx);
        }
      }
      frontier = next;
    }
    const byDepth = [0,1,2,3].map(d => nodes.map((n, i) => n.depth === d ? i : -1).filter(i => i >= 0));
    for (const group of byDepth) {
      group.forEach((idx, i) => {
        nodes[idx].x = W * (i + 1) / (group.length + 1);
        nodes[idx].y = 24 + nodes[idx].depth * 48;
      });
    }
    t = 0;
  }
  function ucb(parent, child) {
    const n = nodes[child];
    if (n.visits === 0) return Infinity;
    return n.value / n.visits + Math.sqrt(2 * Math.log(nodes[parent].visits + 1) / n.visits);
  }
  function playout() {
    const path = [0];
    let current = 0;
    while (nodes[current].children.length) {
      current = nodes[current].children.reduce((best, child) => ucb(current, child) > ucb(current, best) ? child : best, nodes[current].children[0]);
      path.push(current);
    }
    const reward = Math.random() < (nodes[current].bias || 0.5) ? 1 : 0;
    for (const idx of path) {
      nodes[idx].visits++;
      nodes[idx].value += reward;
    }
  }
  function bestEdge(parent, child) {
    const kids = nodes[parent].children;
    if (!kids.length) return false;
    const best = kids.reduce((a, b) => nodes[a].visits > nodes[b].visits ? a : b, kids[0]);
    return best === child;
  }
  function draw() {
    for (let i = 0; i < 5; i++) playout();
    t++;
    if (t > 620) init();
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    for (let i = 1; i < nodes.length; i++) {
      const n = nodes[i], p = nodes[n.parent];
      ctx.strokeStyle = bestEdge(n.parent, i) ? '#ffd700' : 'rgba(157,92,255,0.28)';
      ctx.lineWidth = bestEdge(n.parent, i) ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + 10);
      ctx.lineTo(n.x, n.y - 10);
      ctx.stroke();
    }
    for (const n of nodes) {
      const rate = n.visits ? n.value / n.visits : 0;
      ctx.fillStyle = `hsla(${280 - rate * 110},85%,62%,${0.35 + Math.min(n.visits / 120, 0.55)})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 7 + Math.min(n.visits / 28, 8), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffd700';
    ctx.font = '9px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`rollouts ${nodes[0].visits} | UCB selection + random simulation + backprop`, 8, H - 10);
  }

  init();
  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 28. GENETIC ALGORITHM =====
register('genetic', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const target = 'ARCANE';
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ';
  let pop, gen, t;

  function randomGene() {
    return Array.from({ length: target.length }, () => alphabet[rngInt(0, alphabet.length - 1)]).join('');
  }
  function fitness(s) {
    let score = 0;
    for (let i = 0; i < target.length; i++) if (s[i] === target[i]) score++;
    return score;
  }
  function mutate(s) {
    return s.split('').map(ch => Math.random() < 0.08 ? alphabet[rngInt(0, alphabet.length - 1)] : ch).join('');
  }
  function init() {
    pop = Array.from({ length: 12 }, randomGene);
    gen = 0;
    t = 0;
  }
  function evolve() {
    pop.sort((a, b) => fitness(b) - fitness(a));
    if (fitness(pop[0]) === target.length || gen > 180) init();
    const elites = pop.slice(0, 4);
    const next = [...elites];
    while (next.length < pop.length) {
      const a = elites[rngInt(0, elites.length - 1)];
      const b = elites[rngInt(0, elites.length - 1)];
      const cut = rngInt(1, target.length - 1);
      next.push(mutate(a.slice(0, cut) + b.slice(cut)));
    }
    pop = next;
    gen++;
  }
  function draw() {
    if (++t % 5 === 0) evolve();
    pop.sort((a, b) => fitness(b) - fitness(a));
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    ctx.font = '11px Space Mono, monospace';
    for (let i = 0; i < pop.length; i++) {
      const y = 20 + i * 13;
      const fit = fitness(pop[i]);
      ctx.fillStyle = `rgba(60,255,213,${0.12 + fit / target.length * 0.6})`;
      ctx.fillRect(88, y - 9, fit / target.length * (W - 112), 10);
      ctx.fillStyle = i === 0 ? '#ffd700' : '#8a8499';
      ctx.textAlign = 'left';
      ctx.fillText(pop[i], 10, y);
      ctx.fillStyle = '#3cffd5';
      ctx.fillText(`${fit}/${target.length}`, W - 40, y);
    }
    ctx.fillStyle = '#ffd700';
    ctx.font = '9px Space Mono, monospace';
    ctx.fillText(`target ${target} | generation ${gen} | selection/crossover/mutation`, 8, H - 10);
  }

  init();
  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 29. L-SYSTEM =====
register('lsystem', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let level, sentence, t;

  function build(depth) {
    let s = 'F';
    for (let i = 0; i < depth; i++) s = s.replace(/F/g, 'F[+F]F[-F][F]');
    return s;
  }
  function init() {
    level = 1;
    sentence = build(level);
    t = 0;
  }
  function drawTurtle(limit) {
    const stack = [];
    let x = W / 2, y = H - 12;
    let a = -Math.PI / 2;
    const len = 34 / Math.pow(1.72, level);
    ctx.strokeStyle = '#3cffd5';
    ctx.lineWidth = Math.max(0.7, 2.2 - level * 0.25);
    ctx.beginPath();
    for (let i = 0; i < limit; i++) {
      const ch = sentence[i];
      if (ch === 'F') {
        const nx = x + Math.cos(a) * len;
        const ny = y + Math.sin(a) * len;
        ctx.moveTo(x, y);
        ctx.lineTo(nx, ny);
        x = nx; y = ny;
      } else if (ch === '+') a += 0.48;
      else if (ch === '-') a -= 0.48;
      else if (ch === '[') stack.push([x, y, a]);
      else if (ch === ']') [x, y, a] = stack.pop() || [x, y, a];
    }
    ctx.stroke();
  }
  function draw() {
    t++;
    if (t > 220) {
      level = level >= 4 ? 1 : level + 1;
      sentence = build(level);
      t = 0;
    }
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    const limit = Math.floor(sentence.length * clamp(t / 170, 0, 1));
    drawTurtle(limit);
    ctx.fillStyle = '#ffd700';
    ctx.font = '9px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`F -> F[+F]F[-F][F] | depth ${level} | symbols ${sentence.length}`, 8, H - 10);
  }

  init();
  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== 30. BARNES-HUT QUADTREE =====
register('barneshut', (c) => {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let particles, tree, t;

  function init() {
    particles = Array.from({ length: 38 }, () => ({
      x: rng(16, W - 16),
      y: rng(16, H - 30),
      vx: rng(-0.45, 0.45),
      vy: rng(-0.35, 0.35),
      m: rng(0.5, 2.5)
    }));
    t = 0;
  }
  function build(list, x, y, w, h, depth = 0) {
    const mass = list.reduce((acc, p) => acc + p.m, 0) || 1;
    const cx = list.reduce((acc, p) => acc + p.x * p.m, 0) / mass;
    const cy = list.reduce((acc, p) => acc + p.y * p.m, 0) / mass;
    const node = { x, y, w, h, depth, list, mass, cx, cy, children: [] };
    if (list.length <= 2 || depth >= 5) return node;
    const hw = w / 2, hh = h / 2;
    const quads = [
      [x, y, hw, hh],
      [x + hw, y, hw, hh],
      [x, y + hh, hw, hh],
      [x + hw, y + hh, hw, hh]
    ];
    for (const q of quads) {
      const sub = list.filter(p => p.x >= q[0] && p.x < q[0] + q[2] && p.y >= q[1] && p.y < q[1] + q[3]);
      if (sub.length) node.children.push(build(sub, q[0], q[1], q[2], q[3], depth + 1));
    }
    return node;
  }
  function drawNode(node) {
    ctx.strokeStyle = `rgba(157,92,255,${0.32 - node.depth * 0.04})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(node.x, node.y, node.w, node.h);
    if (node.list.length > 3) {
      ctx.fillStyle = 'rgba(255,215,0,0.55)';
      ctx.beginPath();
      ctx.arc(node.cx, node.cy, Math.min(6, 1 + node.mass / 5), 0, Math.PI * 2);
      ctx.fill();
    }
    node.children.forEach(drawNode);
  }
  function update() {
    t++;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 10 || p.x > W - 10) p.vx *= -1;
      if (p.y < 10 || p.y > H - 34) p.vy *= -1;
    }
    tree = build(particles, 6, 6, W - 12, H - 38);
  }
  function draw() {
    update();
    if (t > 900) init();
    ctx.fillStyle = getThemeColor('#0a090c', '#f4f0ff');
    ctx.fillRect(0, 0, W, H);
    drawNode(tree);
    for (const p of particles) {
      ctx.fillStyle = '#3cffd5';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8 + p.m, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffd700';
    ctx.font = '9px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${particles.length} bodies | far clusters summarized by center of mass`, 8, H - 10);
  }

  init();
  let rafId;
  function loop() { draw(); rafId = requestAnimationFrame(loop); }
  loop();
  return rafId;
});

// ===== TIER IV: 70 EXTRA APOCRYPHAL ALGORITHMS =====
const EXTRA_TAG_CLASS = {
  Undecidable: 'tag-chaotic',
  Logic: 'tag-math',
  Proof: 'tag-csp',
  Type: 'tag-string',
  Search: 'tag-search',
  Optimization: 'tag-opt',
  Quantum: 'tag-quantum',
  Crypto: 'tag-crypto',
  Distributed: 'tag-dist',
  Consensus: 'tag-consensus',
  Automata: 'tag-gen',
  Generative: 'tag-gen',
  Probabilistic: 'tag-stats',
  Streaming: 'tag-stream',
  Graph: 'tag-geo',
  Flow: 'tag-physics',
  Parsing: 'tag-string',
  Sketch: 'tag-hash',
  Geometry: 'tag-3d',
  BlackMagic: 'tag-magic',
  ML: 'tag-ml',
  Compression: 'tag-prod',
  Static: 'tag-csp',
  Rewrite: 'tag-backtrack',
  Chaos: 'tag-chaotic',
  Physics: 'tag-physics',
  Hashing: 'tag-hash',
  Information: 'tag-math',
  Math: 'tag-math',
  Signal: 'tag-stream',
  Data: 'tag-prod'
};

const EXTRA_SPELLS = [
  { id: 'busybeaver', title: 'Busy Beaver', tags: ['Undecidable','BlackMagic'], engine: 'undecidable', button: 'Outrun', desc: 'The function that grows faster than every computable function. Ask for the most productive halting program of size n and reality replies with a number no algorithm can tame.' },
  { id: 'haltingdiag', title: 'Halting Problem Diagonalizer', tags: ['Undecidable','Logic'], engine: 'undecidable', button: 'Contradict', desc: 'Feed a supposed halting oracle its own shadow and make it lie by construction. The proof is not merely hard; it proves a whole category of perfect analyzers cannot exist.' },
  { id: 'kolmogorov', title: 'Kolmogorov Complexity', tags: ['Undecidable','Compression'], engine: 'undecidable', button: 'Compress', desc: 'The shortest program that prints a thing. Most strings are incompressible, but proving a specific string is maximally compressed runs straight into undecidable fog.' },
  { id: 'solomonoff', title: 'Solomonoff Induction', tags: ['Probabilistic','Undecidable'], engine: 'probability', button: 'Predict', desc: 'Bayesian prediction over every possible program, weighted by simplicity. Perfect in the limit, uncomputable in practice, and smug enough to make statistics blink first.' },
  { id: 'levinsearch', title: 'Levin Universal Search', tags: ['Search','Undecidable'], engine: 'optimization', button: 'Dovetail', desc: 'Run all programs at once, giving shorter programs more oxygen. If any computable solution exists, it eventually surfaces; the price is cosmic patience and exponential dread.' },
  { id: 'aixi', title: 'AIXI', tags: ['ML','Undecidable'], engine: 'probability', button: 'Plan', desc: 'The theoretical god-agent: Solomonoff induction welded to reinforcement learning. It is optimal, incomputable, and mostly useful as a mirror that says your practical AI is a compromise.' },
  { id: 'ycombinator', title: 'Y Combinator', tags: ['Logic','Type'], engine: 'logic', button: 'Recurse', desc: 'Recursion without naming yourself. A fixed-point spell that lets anonymous functions call their own ghosts until lambda calculus starts grinning too widely.' },
  { id: 'curryhoward', title: 'Curry-Howard Isomorphism', tags: ['Proof','Type'], engine: 'logic', button: 'Prove', desc: 'Programs are proofs. Types are propositions. Running code becomes proof normalization, and suddenly your compiler is wearing a logician robe under the hoodie.' },
  { id: 'unification', title: 'Robinson Unification', tags: ['Logic','Type'], engine: 'logic', button: 'Unify', desc: 'Find substitutions that make symbolic expressions identical. Logic programming, theorem proving, and type inference all rely on this quiet ritual of forcing shapes to agree.' },
  { id: 'hindley', title: 'Hindley-Milner Type Inference', tags: ['Type','Logic'], engine: 'logic', button: 'Infer', desc: 'Types appear without annotations because constraints propagate through expressions and unify into principal types. It feels like the compiler read your mind, then filed paperwork.' },
  { id: 'abstractinterp', title: 'Abstract Interpretation', tags: ['Proof','Static'], engine: 'logic', button: 'Approximate', desc: 'Run the program in a smaller universe where values become intervals, signs, or shapes. You lose detail on purpose to gain proofs about every possible execution.' },
  { id: 'modelchecking', title: 'Model Checking', tags: ['Proof','Automata'], engine: 'automata', button: 'Verify', desc: 'Explore every reachable state of a system against a temporal logic formula. It finds bugs in places testing cannot even phrase as a question.' },
  { id: 'bisimulation', title: 'Bisimulation', tags: ['Proof','Automata'], engine: 'automata', button: 'Mirror', desc: 'Two systems are equivalent if each can match the other move for move forever. It is behavioral equality by mutual stalking across state space.' },
  { id: 'knuthbendix', title: 'Knuth-Bendix Completion', tags: ['Logic','Rewrite'], engine: 'logic', button: 'Complete', desc: 'Turn equations into rewrite rules until symbolic equality becomes normalization. When it converges, algebra becomes machinery; when it does not, the machinery screams politely.' },
  { id: 'egraphs', title: 'E-Graphs / Equality Saturation', tags: ['Optimization','Logic'], engine: 'logic', button: 'Saturate', desc: 'Represent many equivalent programs at once, rewrite them all, then extract the cheapest form. Optimization becomes cultivating a jungle of equal meanings.' },
  { id: 'dpllsat', title: 'DPLL SAT Solver', tags: ['Search','Logic'], engine: 'logic', button: 'Branch', desc: 'Boolean satisfiability by branching, propagation, and backtracking. It looks brute-force until unit clauses start collapsing whole dimensions of impossible worlds.' },
  { id: 'cdclsat', title: 'CDCL SAT Solver', tags: ['Search','Proof'], engine: 'logic', button: 'Learn', desc: 'Conflict-driven clause learning turns every contradiction into a new theorem. Modern SAT solvers do not just search; they remember why the universe said no.' },
  { id: 'smtsolver', title: 'SMT Solver', tags: ['Logic','Proof'], engine: 'logic', button: 'Decide', desc: 'SAT plus theories: integers, arrays, bit-vectors, reals, memory. It negotiates between Boolean skeletons and domain-specific demons until a model or contradiction appears.' },
  { id: 'pcpverifier', title: 'PCP Theorem Verifier', tags: ['Proof','Probabilistic'], engine: 'probability', button: 'Spot-check', desc: 'A proof can be checked by reading only a few random bits. The statement sounds like academic vandalism, yet it underpins deep hardness-of-approximation results.' },
  { id: 'interactiveproofs', title: 'Interactive Proofs', tags: ['Proof','Probabilistic'], engine: 'distributed', button: 'Challenge', desc: 'A weak verifier interrogates a powerful prover and gains confidence through randomness. Truth becomes a protocol, not a document.' },
  { id: 'rule110', title: 'Rule 110', tags: ['Automata','Undecidable'], engine: 'automata', button: 'Evolve', desc: 'A one-dimensional cellular automaton with tiny local rules and universal computation hidden in its spacetime trails. Simplicity here is a trapdoor.' },
  { id: 'lifeglider', title: 'Game of Life Glider Gun', tags: ['Automata','Generative'], engine: 'automata', button: 'Emit', desc: 'Cells live, die, and somehow manufacture moving machines. A glider gun is proof that local binary boredom can assemble computation in the dark.' },
  { id: 'langtonsant', title: "Langton's Ant", tags: ['Automata','Chaos'], engine: 'automata', button: 'March', desc: 'A two-rule ant wanders chaotically, then suddenly builds a highway forever. Order appears after enough nonsense has been allowed to embarrass itself.' },
  { id: 'leniaextra', title: 'Lenia', tags: ['Automata','Generative'], engine: 'automata', button: 'Pulse', desc: 'Continuous cellular automata that grow soft organisms instead of pixel blocks. The equations feel less like rules and more like a terrarium for alien math.' },
  { id: 'boidsextra', title: 'Boids', tags: ['Generative','Graph'], engine: 'graph', button: 'Flock', desc: 'Separation, alignment, cohesion: three local rules that create lifelike swarm motion. No leader, no plan, just emergent geometry pretending to be intent.' },
  { id: 'harmonysearch', title: 'Harmony Search', tags: ['Optimization','Probabilistic'], engine: 'evolution', button: 'Improvise', desc: 'Candidate solutions behave like musicians adjusting pitches toward better harmony. The search space becomes a jam session where bad notes quietly vanish.' },
  { id: 'antcolony', title: 'Ant Colony Optimization', tags: ['Optimization','Graph'], engine: 'graph', button: 'Pheromone', desc: 'Paths become attractive when previous agents survived them. Evaporation prevents stale certainty; reinforcement turns a graph into a chemical memory.' },
  { id: 'immunealg', title: 'Artificial Immune Systems', tags: ['Optimization','ML'], engine: 'evolution', button: 'Mutate', desc: 'Optimization modeled as clonal selection, affinity maturation, and anomaly response. The algorithm does not search; it develops suspicion.' },
  { id: 'diffevolution', title: 'Differential Evolution', tags: ['Optimization','Probabilistic'], engine: 'evolution', button: 'Splice', desc: 'Mutate vectors by adding scaled differences between other candidates. Geometry becomes heredity, and the population climbs by stealing directions from itself.' },
  { id: 'cmaes', title: 'CMA-ES', tags: ['Optimization','Probabilistic'], engine: 'evolution', button: 'Adapt', desc: 'A distribution learns the shape of the landscape by adapting its covariance matrix. It searches not with points, but with an evolving probability cloud.' },
  { id: 'bifurcation', title: 'Simulated Bifurcation', tags: ['Optimization','Physics'], engine: 'optimization', button: 'Split', desc: 'Optimization through nonlinear oscillator dynamics. Variables fall into binary states as a physical-looking system bifurcates toward low-energy assignments.' },
  { id: 'spinglass', title: 'Spin Glass / Ising Solver', tags: ['Optimization','Physics'], engine: 'optimization', button: 'Freeze', desc: 'Encode a problem as frustrated magnetic spins and seek the lowest-energy arrangement. The landscape is jagged, cursed, and mathematically delicious.' },
  { id: 'tensornet', title: 'Tensor Network Contraction', tags: ['Quantum','ML'], engine: 'quantum', button: 'Contract', desc: 'A computation drawn as a web of multidimensional arrays. Contract the network in the wrong order and the universe invoices you exponentially.' },
  { id: 'beliefprop', title: 'Belief Propagation', tags: ['Probabilistic','Graph'], engine: 'probability', button: 'Message', desc: 'Variables pass beliefs across a factor graph until uncertainty settles. Exact on trees, dangerously useful on loopy graphs, and everywhere in inference.' },
  { id: 'sparsedistributedmemory', title: 'Sparse Distributed Memory', tags: ['Probabilistic','ML'], engine: 'probability', button: 'Recall', desc: 'Kanerva memory stores patterns across a vast address space where nearby addresses answer together. Retrieval feels like asking a high-dimensional fog to remember your face.' },
  { id: 'viterbiextra', title: 'Viterbi Algorithm', tags: ['Probabilistic','Parsing'], engine: 'parsing', button: 'Decode', desc: 'Find the most likely hidden state path through a sequence. Speech recognition, gene finding, and noisy channels all hide paths for Viterbi to exhume.' },
  { id: 'insideoutside', title: 'Inside-Outside Algorithm', tags: ['Probabilistic','Parsing'], engine: 'parsing', button: 'Reweight', desc: 'Train probabilistic grammars by counting invisible parse structures. It is expectation-maximization performed inside a grammar cathedral.' },
  { id: 'cykparser', title: 'CYK Parser', tags: ['Parsing','Logic'], engine: 'parsing', button: 'Parse', desc: 'Dynamic programming over substrings decides whether a context-free grammar can generate a sentence. The parse chart becomes a triangular autopsy table.' },
  { id: 'earleyparser', title: 'Earley Parser', tags: ['Parsing','Search'], engine: 'parsing', button: 'Predict', desc: 'Predict, scan, complete. Earley parsing walks through ambiguous grammars with dotted rules, holding multiple futures without choosing too early.' },
  { id: 'alphabeta', title: 'Alpha-Beta Pruning', tags: ['Search','Optimization'], engine: 'graph', button: 'Prune', desc: 'Minimax with enough ruthlessness to ignore branches that cannot change the answer. It wins by proving entire futures irrelevant.' },
  { id: 'pcc', title: 'Proof-Carrying Code', tags: ['Proof','Crypto'], engine: 'logic', button: 'Certify', desc: 'Ship code with a proof that it obeys safety rules. The consumer checks the proof instead of trusting the producer, which is software supply-chain sorcery with receipts.' },
  { id: 'sequentcalc', title: 'Sequent Calculus Search', tags: ['Proof','Logic'], engine: 'logic', button: 'Cut', desc: 'Proofs become trees of sequents transformed by inference rules. Search space grows like ivy unless cut-elimination and tactics keep it under ritual control.' },
  { id: 'gaussianprocess', title: 'Gaussian Process Regression', tags: ['Probabilistic','ML'], engine: 'probability', button: 'Condition', desc: 'A distribution over functions. Observe a few points and the possible curves bend around them with uncertainty bands like mathematical weather.' },
  { id: 'hmc', title: 'Hamiltonian Monte Carlo', tags: ['Probabilistic','Physics'], engine: 'probability', button: 'Leapfrog', desc: 'Sampling by pretending probability is physics. Momentum carries samples across posterior landscapes instead of letting random walks shuffle in place.' },
  { id: 'wolffcluster', title: 'Wolff Cluster Algorithm', tags: ['Probabilistic','Physics'], engine: 'probability', button: 'Flip', desc: 'Instead of flipping one spin at a time, grow a correlated cluster and invert it whole. Critical slowing down gets ambushed by a statistical physics jump scare.' },
  { id: 'particlefilter', title: 'Particle Filter', tags: ['Probabilistic','Streaming'], engine: 'probability', button: 'Resample', desc: 'Track hidden state with a cloud of weighted guesses. Bad particles starve, good particles clone themselves, and uncertainty stays alive while evidence arrives.' },
  { id: 'countmin', title: 'Count-Min Sketch', tags: ['Sketch','Streaming'], engine: 'sketch', button: 'Estimate', desc: 'Approximate frequencies in a stream with hash tables that only overestimate. Tiny memory, one-sided error, and no mercy for exact bookkeeping.' },
  { id: 'freivalds', title: "Freivalds' Matrix Check", tags: ['Proof','Probabilistic'], engine: 'probability', button: 'Spot-check', desc: 'Verify matrix multiplication with random vectors instead of recomputing the product. One toss of algebraic dice catches lies with unnerving efficiency.' },
  { id: 'amssketch', title: 'AMS Moment Sketch', tags: ['Sketch','Streaming'], engine: 'sketch', button: 'Moment', desc: 'Estimate frequency moments in a stream with randomized signs and tiny counters. The stream passes once; the hidden norm leaves a statistical fingerprint.' },
  { id: 'simhashextra', title: 'SimHash', tags: ['Sketch','Hashing'], engine: 'sketch', button: 'Fingerprint', desc: 'Compress high-dimensional similarity into bits. Similar documents land near each other in Hamming space, which feels like cheating until the math shrugs.' },
  { id: 'minhash', title: 'MinHash', tags: ['Sketch','Probabilistic'], engine: 'sketch', button: 'Jaccard', desc: 'Estimate set similarity from minimum hash samples. It turns giant shingles into tiny signatures that preserve resemblance by statistical sleight of hand.' },
  { id: 'lsh', title: 'Locality-Sensitive Hashing', tags: ['Sketch','Search'], engine: 'sketch', button: 'Bucket', desc: 'Hash nearby things into the same buckets on purpose. Nearest-neighbor search stops scanning the universe and starts checking neighborhoods.' },
  { id: 'skiplist', title: 'Skip List', tags: ['Probabilistic','Search'], engine: 'graph', button: 'Skip', desc: 'A linked list grows express lanes by coin flips. Expected logarithmic search appears from stacked randomness instead of tree rotations.' },
  { id: 'splaytree', title: 'Splay Tree', tags: ['Search','Optimization'], engine: 'graph', button: 'Splay', desc: 'Every access drags the touched node to the root. The structure self-adjusts to locality, making recent history reshape future cost.' },
  { id: 'unionfindextra', title: 'Union-Find Path Compression', tags: ['Graph','Optimization'], engine: 'graph', button: 'Compress', desc: 'Disjoint sets with near-constant amortized operations. Each find flattens the tree it traverses, so asking questions improves the data structure.' },
  { id: 'tarjanscc', title: 'Tarjan SCC', tags: ['Graph','Search'], engine: 'graph', button: 'Lowlink', desc: 'One depth-first search discovers strongly connected components using stack discipline and lowlink numbers. Cycles reveal themselves by failing to escape.' },
  { id: 'edmondsblossom', title: "Edmonds' Blossom Algorithm", tags: ['Graph','BlackMagic'], engine: 'graph', button: 'Shrink', desc: 'Maximum matching in general graphs by shrinking odd cycles into blossoms. The first time you understand it, you deserve tea and a quiet room.' },
  { id: 'dinic', title: "Dinic's Max-Flow", tags: ['Flow','Graph'], engine: 'flow', button: 'Augment', desc: 'Layer the residual graph, then push blocking flows. Capacity becomes a landscape of pressure, channels, and saturated cuts.' },
  { id: 'hungarian', title: 'Hungarian Algorithm', tags: ['Optimization','Graph'], engine: 'optimization', button: 'Assign', desc: 'Optimal bipartite matching through potentials, zeros, and augmenting paths. It turns assignment into a dance of labels and exposed edges.' },
  { id: 'pushrelabel', title: 'Push-Relabel Max-Flow', tags: ['Flow','Optimization'], engine: 'flow', button: 'Relabel', desc: 'Forget finding paths; give nodes excess and heights, then push downhill. Flow becomes hydraulic pressure with bookkeeping teeth.' },
  { id: 'paxos', title: 'Paxos', tags: ['Consensus','Distributed'], engine: 'distributed', button: 'Propose', desc: 'Consensus under failure with proposers, acceptors, ballots, and a reputation for making smart people angry. The algorithm works; the explanations do not.' },
  { id: 'raft', title: 'Raft', tags: ['Consensus','Distributed'], engine: 'distributed', button: 'Elect', desc: 'Consensus redesigned to be understandable: leader election, replicated logs, committed entries. Less mythical than Paxos, still fully capable of ruining a weekend.' },
  { id: 'vectorclocks', title: 'Vector Clocks', tags: ['Distributed','Logic'], engine: 'distributed', button: 'Tick', desc: 'Causality in distributed systems as integer vectors. If neither timestamp dominates the other, events are concurrent, and reality refuses a single timeline.' },
  { id: 'crdt', title: 'CRDT Merge Magic', tags: ['Distributed','Logic'], engine: 'distributed', button: 'Merge', desc: 'Replicas update independently and converge without coordination. The trick is designing operations whose conflicts dissolve into algebraic inevitability.' },
  { id: 'kademlia', title: 'Kademlia DHT', tags: ['Distributed','Hashing'], engine: 'distributed', button: 'Route', desc: 'Peer-to-peer lookup by XOR distance and k-buckets. The network finds keys by moving through metric space made of bits.' },
  { id: 'gossip', title: 'Gossip Protocols', tags: ['Distributed','Probabilistic'], engine: 'distributed', button: 'Rumor', desc: 'Nodes spread information by random peer exchange. Reliability emerges from redundancy, probability, and the refusal to centralize a mouth.' },
  { id: 'zksnark', title: 'zk-SNARKs', tags: ['Crypto','Proof'], engine: 'crypto', button: 'Prove', desc: 'Prove you know a secret without revealing it, with tiny proofs and terrifying setup ceremonies. Computation becomes a shadow that still verifies.' },
  { id: 'stark', title: 'STARKs', tags: ['Crypto','Proof'], engine: 'crypto', button: 'Trace', desc: 'Scalable transparent arguments using algebraic traces and low-degree tests. They trade proof size for less ceremony and a very large polynomial grin.' },
  { id: 'homomorphic', title: 'Homomorphic Encryption', tags: ['Crypto','BlackMagic'], engine: 'crypto', button: 'Compute', desc: 'Compute on encrypted data without decrypting it. The server manipulates ciphertext, and the answer decrypts as if the computation happened in daylight.' },
  { id: 'garbled', title: 'Garbled Circuits', tags: ['Crypto','Logic'], engine: 'crypto', button: 'Garbled', desc: 'Two parties evaluate a circuit without exposing inputs. Every wire is masked, every gate is a tiny locked box, and the output still emerges.' }
];

const names = (text) => text.split('|').map(item => item.trim()).filter(Boolean);

const VOLUME_BLUEPRINTS = [
  {
    page: 2,
    title: 'Undecidability, Proof Engines & Type-Theory Catacombs',
    short: 'Proof Abyss',
    subtitle: 'Where programs become propositions, oracles betray themselves, and verification starts muttering in modal logic.',
    groups: [
      { name: 'Computability Abyss', tags: ['Undecidable','Logic'], engine: 'undecidable', lore: 'formal limits become executable nightmares', items: names(`Post Correspondence Problem|Hilbert's Tenth Problem|Rice's Theorem|Kleene Recursion Theorem|Minsky Register Machines|Wang Tile Domino Problem|Markov Algorithms|Semi-Thue Systems|Tag System Universality|Chaitin's Omega`) },
      { name: 'Proof Search Engines', tags: ['Proof','Logic'], engine: 'logic', lore: 'truth is hunted through clauses, substitutions, and refutations', items: names(`Resolution Refutation|Ordered Resolution|Hyperresolution|Tableau Proving|Connection Method|Inverse Method|Superposition Calculus|E-unification|Paramodulation|Congruence Closure`) },
      { name: 'Type-Theoretic Machinery', tags: ['Type','Proof'], engine: 'logic', lore: 'types become small universes with laws sharp enough to draw blood', items: names(`Girard's System F|Calculus of Constructions|Martin-Lof Type Theory|Cubical Type Theory|Homotopy Type Theory|Linear Logic Proof Nets|Bidirectional Type Checking|Higher-Rank Type Inference|Session Type Checking|Row Polymorphism Inference`) },
      { name: 'Static Analysis Rituals', tags: ['Static','Proof'], engine: 'logic', lore: 'programs are executed inside abstract worlds to prove real executions safe', items: names(`Shape Analysis|Separation Logic Frame Inference|Predicate Abstraction|CEGAR|Symbolic Execution|Concolic Testing|Abstract Domain Widening|Andersen Pointer Analysis|Steensgaard Pointer Analysis|Weakest Precondition Calculus`) },
      { name: 'Decision Procedures', tags: ['Logic','Search'], engine: 'logic', lore: 'specialized solvers carve decidable islands out of impossible seas', items: names(`QBF Expansion|BDD Variable Ordering|ZDD Family Compression|Craig Interpolation|Unsat Core Extraction|AllSAT Enumeration|Core-Guided MaxSAT|Difference Logic Solver|Nelson-Oppen Combination|Quantifier Elimination`) },
      { name: 'Program Transformation Alchemy', tags: ['Optimization','Logic'], engine: 'optimization', lore: 'code is rewritten until meaning stays put and cost changes shape', items: names(`Partial Evaluation|Supercompilation|Defunctionalization|CPS Conversion|ANF Translation|Environment Conversion|SSA Construction|Sparse Conditional Constant Propagation|Peephole Superoptimizer|Souper Superoptimization`) },
      { name: 'Rewrite Systems', tags: ['Rewrite','Logic'], engine: 'logic', lore: 'symbols reduce, normalize, and collide until equality confesses', items: names(`Critical Pair Analysis|Recursive Path Ordering|Dependency Pair Method|Ground Completion|Narrowing Search|Rewriting Modulo AC|Polynomial Interpretations|Ackermannization|Term Indexing Discrimination Trees|E-matching`) },
      { name: 'Proof Certificates', tags: ['Proof','Crypto'], engine: 'crypto', lore: 'claims arrive with machine-checkable bones instead of vibes', items: names(`Dedukti Kernel Checking|LF Type Checking|Proof by Reflection|Certificate Translation|Foundational Proof Certificates|Tactic Replay|Proof Compression|DRAT Proof Checking|LRAT Proof Checking|CakeML Verification`) },
      { name: 'Temporal and Modal Systems', tags: ['Automata','Proof'], engine: 'automata', lore: 'time itself becomes a state machine with obligations', items: names(`CTL Model Checking|LTL Automata Translation|Mu-Calculus Model Checking|Buchi Automata Emptiness|Parity Game Solving|Alternating Automata|Timed Automata Zone Graphs|Difference Bound Matrices|TLA+ State Exploration|Petri Net Reachability`) },
      { name: 'Nonclassical Logic', tags: ['Logic','BlackMagic'], engine: 'logic', lore: 'truth stops being monotone and starts negotiating with context', items: names(`Stable Model Semantics|Answer Set Programming|Magic Sets Transformation|Datalog Semi-Naive Evaluation|Chase Algorithm|Description Logic Classification|ALC Tableau|OWL Reasoner Saturation|Nonmonotonic Default Logic|Belief Revision AGM`) }
    ]
  },
  {
    page: 3,
    title: 'Quantum, Cryptographic & Information-Theoretic Witchcraft',
    short: 'Quantum Crypto',
    subtitle: 'Amplitude tricks, proof shadows, lattice traps, and ciphers that turn secrecy into programmable matter.',
    groups: [
      { name: 'Quantum Query Spells', tags: ['Quantum','Search'], engine: 'quantum', lore: 'queries interfere until the wrong answers cancel themselves', items: names(`Grover's Search|Deutsch-Jozsa Algorithm|Simon's Algorithm|Bernstein-Vazirani Algorithm|Quantum Phase Estimation|Quantum Amplitude Estimation|Quantum Counting|Quantum Walk Search|Quantum Fourier Sampling|Hidden Subgroup Algorithm`) },
      { name: 'Quantum Simulation', tags: ['Quantum','Physics'], engine: 'quantum', lore: 'Hilbert space is sampled, folded, or variationally bribed into answering', items: names(`Variational Quantum Eigensolver|QAOA|HHL Linear Systems|Trotter-Suzuki Simulation|Quantum Signal Processing|Quantum Singular Value Transformation|Quantum Imaginary Time Evolution|Adiabatic Quantum Computation|Boson Sampling|Stabilizer Tableau Simulation`) },
      { name: 'Quantum Error Correction', tags: ['Quantum','Proof'], engine: 'quantum', lore: 'fragile amplitudes survive by hiding logical state across many physical wounds', items: names(`Surface Code Decoding|GKP Code|Steane Code|Color Code Decoding|Magic State Distillation|Lattice Surgery|Renormalization Group Decoder|Minimum-Weight Perfect Matching Decoder|Ordered Statistics Decoding|ZX Calculus Simplification`) },
      { name: 'Hash and Cipher Primitives', tags: ['Crypto','Hashing'], engine: 'crypto', lore: 'bits are permuted until structure becomes indistinguishable from static', items: names(`Merkle-Damgard Construction|Sponge Construction|Keccak Permutation|ChaCha20 Quarter Round|Poly1305 MAC|BLAKE3 Compression Function|SipHash|AES Key Schedule|Serpent Cipher|Twofish Cipher`) },
      { name: 'Signature and Agreement Schemes', tags: ['Crypto','Distributed'], engine: 'crypto', lore: 'identity is reduced to algebraic difficulty and ritualized challenge', items: names(`Diffie-Hellman Key Exchange|Elliptic Curve Diffie-Hellman|Schnorr Signatures|EdDSA|BLS Signatures|Lamport One-Time Signatures|XMSS|SPHINCS+|Threshold ECDSA|MuSig2`) },
      { name: 'Zero-Knowledge Machinery', tags: ['Crypto','Proof'], engine: 'crypto', lore: 'knowledge casts a verifiable shadow without revealing its body', items: names(`Bulletproofs|Halo Accumulation|PLONK Arithmetization|FRI Low-Degree Test|KZG Commitments|Pedersen Commitments|Fiat-Shamir Transform|Sumcheck Protocol|GKR Protocol|Polynomial IOPs`) },
      { name: 'Post-Quantum Lattice Cryptography', tags: ['Crypto','Quantum'], engine: 'crypto', lore: 'high-dimensional grids become traps that quantum attacks still dislike', items: names(`LLL Lattice Reduction|BKZ Reduction|NTRU|Kyber KEM|Dilithium Signatures|Falcon Signatures|FrodoKEM|Classic McEliece|Learning With Errors|Ring-LWE`) },
      { name: 'Secure Multiparty Computation', tags: ['Crypto','Logic'], engine: 'crypto', lore: 'parties compute together while keeping their inputs occulted', items: names(`Oblivious Transfer|Yao's Millionaires Protocol|Secret Sharing MPC|SPDZ Protocol|Beaver Triples|Private Set Intersection|Oblivious RAM Path ORAM|PIR Chor-Goldreich-Kushilevitz-Sudan|Oblivious Linear Evaluation|Threshold Decryption`) },
      { name: 'Randomness and Beacons', tags: ['Probabilistic','Crypto'], engine: 'probability', lore: 'entropy is extracted, committed, delayed, and made publicly suspicious', items: names(`Blum Blum Shub|Fortuna PRNG|HKDF|Trevisan Extractor|Leftover Hash Lemma Extractor|Von Neumann Debiasing|Verifiable Random Function|VDF Wesolowski|RANDAO|Commit-Reveal Beacon`) },
      { name: 'Coding Theory Relics', tags: ['Crypto','Information'], engine: 'sketch', lore: 'messages survive corruption by hiding redundancy in algebraic structure', items: names(`Reed-Solomon Decoding|Berlekamp-Welch|BCH Decoding|BCJR Algorithm|LDPC Decoding|Polar Codes|Fountain Codes|Raptor Codes|Turbo Decoding|Hamming Code Syndrome Decoding`) }
    ]
  },
  {
    page: 4,
    title: 'Distributed, Adversarial & Consensus Labyrinths',
    short: 'Distributed Hell',
    subtitle: 'Messages lie, clocks drift, leaders vanish, replicas disagree, and still the system must move.',
    groups: [
      { name: 'Replication Protocols', tags: ['Distributed','Consensus'], engine: 'distributed', lore: 'state is copied through logs, quorums, and uneasy leadership', items: names(`Zab Atomic Broadcast|Viewstamped Replication|Chain Replication|Virtual Synchrony|Harp Replication|Horus Group Communication|Primary-Backup Replication|State Machine Replication|PacificA Replication|CRAQ Chain Reads`) },
      { name: 'Byzantine Agreement', tags: ['Consensus','Distributed'], engine: 'distributed', lore: 'agreement survives nodes that equivocate with theatrical malice', items: names(`HoneyBadgerBFT|HotStuff|Tendermint|Algorand BA Star|Casper FFG|GRANDPA Finality|Narwhal and Tusk|Hashgraph Virtual Voting|Stellar SCP|Ripple RPCA`) },
      { name: 'Mutual Exclusion and Election', tags: ['Distributed','Logic'], engine: 'distributed', lore: 'one node is allowed to act while everyone else proves they are not', items: names(`Ricart-Agrawala|Lamport Mutual Exclusion|Maekawa's Algorithm|Raymond Tree Token|Suzuki-Kasami Broadcast|Bully Election|Chang-Roberts Ring Election|Hirschberg-Sinclair Election|Peterson Leader Election|Echo Algorithm`) },
      { name: 'Distributed Transactions', tags: ['Distributed','Optimization'], engine: 'distributed', lore: 'atomicity is negotiated across machines that may disappear mid-sentence', items: names(`Two-Phase Commit|Calvin Sequencer|Percolator Transactions|Calvin Deterministic Transactions|Spanner TrueTime Commit|Sagas|Transactional Outbox|Deterministic Lockstep|Snapshot Isolation Validation|Write-Skew Detection`) },
      { name: 'Causality and Snapshots', tags: ['Distributed','Logic'], engine: 'distributed', lore: 'time is reconstructed from partial orders and careful suspicion', items: names(`Lamport Timestamps|Chandy-Lamport Snapshot|Mattern's Snapshot|Matrix Clocks|Hybrid Logical Clocks|Version Vectors|Bloom Clocks|Causal Stability|Causal Broadcast|Happens-Before Analysis`) },
      { name: 'Peer-to-Peer Overlays', tags: ['Distributed','Hashing'], engine: 'distributed', lore: 'lookup paths emerge from geometry imposed on identifiers', items: names(`Chord DHT|Pastry|Tapestry|Content Addressable Network|Viceroy|Koorde|Symphony DHT|Kelips|Skip Graphs|Cyclon Peer Sampling`) },
      { name: 'Epidemic Repair', tags: ['Distributed','Probabilistic'], engine: 'distributed', lore: 'random conversations eventually heal global knowledge', items: names(`SWIM Failure Detector|HyParView|Plumtree Broadcast|Scuttlebutt Reconciliation|Anti-Entropy Repair|Read Repair|Hinted Handoff|Sloppy Quorum|Dynamo Ring Placement|Rendezvous Hashing`) },
      { name: 'Distributed Scheduling', tags: ['Distributed','Optimization'], engine: 'flow', lore: 'work moves through queues, leases, buckets, and backpressure', items: names(`Work Stealing Deques|Fork-Join Scheduling|Cilk Scheduler|Distributed Work Queues|Lease-Based Coordination|ZooKeeper Watches|Consistent Snapshot Read|Backpressure Propagation|Token Bucket Rate Limiting|Leaky Bucket Shaping`) },
      { name: 'Self-Stabilizing Systems', tags: ['Distributed','Proof'], engine: 'distributed', lore: 'the system recovers from arbitrary nonsense without external rescue', items: names(`Dijkstra Self-Stabilization|Herman's Token Ring|Byzantine Clock Synchronization|FloodSet Consensus|Gradecast|Reliable Broadcast|Bracha Broadcast|Dolev-Strong Broadcast|Authenticated Echo Broadcast|Heartbeat Quorums`) },
      { name: 'Ledger Consensus', tags: ['Consensus','Crypto'], engine: 'crypto', lore: 'economic incentives and fork-choice rules pretend to be physics', items: names(`Nakamoto Consensus|GHOST Protocol|Avalanche Snowball|Snowman Consensus|Ouroboros Praos|DAG-Rider Consensus|Ethereum Fork Choice LMD-GHOST|BFT Locking Protocol|Proof of History|Proof of Space-Time`) }
    ]
  },
  {
    page: 5,
    title: 'Probabilistic Inference & Stochastic Oracle Engines',
    short: 'Stochastic Oracles',
    subtitle: 'Sampling, inference, uncertainty, and posterior machinery that turns ignorance into calibrated ritual.',
    groups: [
      { name: 'Monte Carlo Samplers', tags: ['Probabilistic','ML'], engine: 'probability', lore: 'random motion is disciplined until it resembles integration', items: names(`Metropolis-Hastings|Gibbs Sampling|Slice Sampling|Rejection Sampling|Importance Sampling|Coupling from the Past|Nested Sampling|Reversible-Jump MCMC|Hit-and-Run Sampler|Pseudo-Marginal MCMC`) },
      { name: 'Variational Inference', tags: ['Probabilistic','Optimization'], engine: 'probability', lore: 'an impossible posterior is replaced by a tractable impostor', items: names(`Mean-Field Variational Inference|Stochastic Variational Inference|Black-Box VI|Automatic Differentiation VI|Expectation Propagation|Laplace Approximation|Variational Message Passing|Wake-Sleep Algorithm|Assumed Density Filtering|Expectation Maximization`) },
      { name: 'Graphical Model Inference', tags: ['Probabilistic','Graph'], engine: 'probability', lore: 'factors, cliques, and hidden states pass uncertainty through structure', items: names(`Junction Tree Algorithm|Variable Elimination|Sum-Product Algorithm|Max-Product Algorithm|Forward-Backward Algorithm|Baum-Welch|Rauch-Tung-Striebel Smoother|Expectation Consistency|Cutset Conditioning|Moralization and Triangulation`) },
      { name: 'Nonparametric Bayes', tags: ['Probabilistic','ML'], engine: 'probability', lore: 'the model grows capacity as data asks for more rooms', items: names(`Chinese Restaurant Process|Indian Buffet Process|Dirichlet Process Mixture|Normalized Random Measures|Pitman-Yor Process|Stick-Breaking Construction|Polya Urn Scheme|Neal's Algorithm 8|Dirichlet Diffusion Tree|Mondrian Process`) },
      { name: 'Bandit Sorcery', tags: ['Probabilistic','Optimization'], engine: 'probability', lore: 'exploration and exploitation fight under uncertainty budgets', items: names(`Thompson Sampling|UCB1|KL-UCB|EXP3|Hedge Algorithm|LinUCB|BayesUCB|Successive Rejects|Top-Two Thompson Sampling|Gittins Index`) },
      { name: 'Online Optimization', tags: ['Optimization','Streaming'], engine: 'optimization', lore: 'updates arrive one wound at a time and regret is the scar tissue', items: names(`Follow the Regularized Leader|Online Mirror Descent|AdaGrad|RMSProp|Adam Optimizer|AdaBelief|Lion Optimizer|Exponentiated Gradient|Passive-Aggressive Updates|Pegasos SVM`) },
      { name: 'Bayesian Optimization', tags: ['Probabilistic','Optimization'], engine: 'probability', lore: 'expensive black boxes are interrogated by surrogate prophecy', items: names(`Expected Improvement|Probability of Improvement|GP-UCB|Knowledge Gradient|FABOLAS|REMBO Random Embedding BO|Tree-structured Parzen Estimator|SMAC|Hyperband|BOHB`) },
      { name: 'Sequential Resampling', tags: ['Probabilistic','Streaming'], engine: 'probability', lore: 'particles are culled, cloned, and marched through evidence', items: names(`Transport Map Sampling|SMC Squared|Delayed Rejection Adaptive Metropolis|Sobol Sequence Sampling|Rare Event Splitting|Auxiliary Variable MCMC|Polya-Gamma Augmentation|Approximate Bayesian Computation|Bayesian Synthetic Likelihood|Sequential Neural Posterior Estimation`) },
      { name: 'Unbiased Estimator Tricks', tags: ['Probabilistic','Math'], engine: 'probability', lore: 'variance is bribed, folded, or canceled until estimates behave', items: names(`Hajek Ratio Estimator|Jackknife Resampling|Bootstrap BCa|Control Variates|Antithetic Variates|Rao-Blackwellization|Russian Roulette Estimator|Hutchinson Trace Estimator|Lanczos Quadrature|Stein Variational Gradient Descent`) },
      { name: 'Information-Theoretic Learning', tags: ['ML','Probabilistic'], engine: 'probability', lore: 'learning is posed as compression, divergence, or channel capacity', items: names(`Cross-Entropy Method|Natural Evolution Strategies|Minimum Description Length|Bayesian Information Criterion Search|Akaike Weighting|Information Bottleneck|Blahut-Arimoto|Gallager E0 Bound Search|Contrastive Divergence|Noise-Contrastive Estimation`) }
    ]
  },
  {
    page: 6,
    title: 'Optimization, Search & Game-Solver Blasphemies',
    short: 'Search Warlockery',
    subtitle: 'Path planners, exact solvers, metaheuristics, schedulers, and game-tree engines with no patience for innocence.',
    groups: [
      { name: 'Heuristic Pathfinding', tags: ['Search','Optimization'], engine: 'graph', lore: 'frontiers bend toward goals while preserving enough truth to matter', items: names(`Perimeter Search|Uniform-Cost Search|Greedy Best-First Search|Iterative Deepening DFS|Jump Point Search|Fringe Search|Anya Any-Angle Search|Contraction Hierarchies|ALT Landmark Search|Transit Node Routing`) },
      { name: 'Local Metaheuristics', tags: ['Optimization','Search'], engine: 'optimization', lore: 'bad neighborhoods are escaped by memory, noise, and refusal', items: names(`Tabu Search|GRASP|Variable Neighborhood Search|Scatter Search|Iterated Local Search|Guided Local Search|Late Acceptance Hill Climbing|Great Deluge Algorithm|Record-to-Record Travel|Threshold Accepting`) },
      { name: 'Nature-Inspired Optimizers', tags: ['Optimization','Generative'], engine: 'evolution', lore: 'biological metaphors are weaponized into search pressure', items: names(`Firefly Algorithm|Cuckoo Search|Bat Algorithm|Artificial Bee Colony|Grey Wolf Optimizer|Whale Optimization Algorithm|Shuffled Frog Leaping|Invasive Weed Optimization|Biogeography-Based Optimization|Glowworm Swarm Optimization`) },
      { name: 'Mathematical Programming', tags: ['Optimization','Proof'], engine: 'optimization', lore: 'polyhedra are sliced until an optimum has nowhere left to hide', items: names(`Simplex Method|Interior-Point Method|Ellipsoid Method|Cutting Plane Method|Benders Decomposition|Dantzig-Wolfe Decomposition|Column Generation|Gomory Mixed-Integer Cuts|Lift-and-Project Cuts|Lagrangian Relaxation`) },
      { name: 'Gradient and Proximal Methods', tags: ['Optimization','Math'], engine: 'optimization', lore: 'derivatives, approximations, and trust regions negotiate descent', items: names(`Newton's Method|BFGS|Barzilai-Borwein Method|Nonlinear Conjugate Gradient|Proximal Gradient|FISTA|ADMM|Frank-Wolfe|Nelder-Mead|Trust Region Method`) },
      { name: 'Game Tree Solvers', tags: ['Search','ML'], engine: 'graph', lore: 'futures are pruned, valued, and regretted until strategy appears', items: names(`Negamax|Principal Variation Search|MTD(f)|SSS* Search|DFPN|Retrograde Analysis|Counterfactual Regret Minimization|CFR+|Regret Matching|Killer Heuristic`) },
      { name: 'Constraint Programming', tags: ['Search','Logic'], engine: 'logic', lore: 'domains shrink until only consistent assignments survive', items: names(`AC-3|AC-4|Path Consistency|Breakout Method|Backjumping|Conflict-Directed Backjumping|Nogood Recording|Limited Discrepancy Search|Lazy Clause Generation|Impact-Based Search`) },
      { name: 'Automated Planning', tags: ['Search','Logic'], engine: 'parsing', lore: 'actions compose into plans through relaxed worlds and symbolic reachability', items: names(`STRIPS Planner|Graphplan|SATPlan|FF Planner|Fast Downward|Landmark Heuristic Search|Partial-Order Planning|Hierarchical Task Network Planning|BRTDP|LAO*`) },
      { name: 'Scheduling and Timing', tags: ['Optimization','Streaming'], engine: 'flow', lore: 'time, precedence, and deadlines are packed into survivable order', items: names(`Critical Path Method|PERT|Job-Shop Shifting Bottleneck|Critical Chain Scheduling|Earliest Deadline First|Rate Monotonic Scheduling|Least Laxity First|Coffman-Graham Scheduling|Hu's Algorithm|HEFT Scheduling`) },
      { name: 'Exact Exponential Rites', tags: ['Search','BlackMagic'], engine: 'logic', lore: 'exponential search is made less doomed by decomposition and clever accounting', items: names(`Held-Karp TSP|Meet-in-the-Middle Subset Sum|Schroeppel-Shamir|Bron-Kerbosch Clique|Lawler's K-Best Enumeration|Horowitz-Sahni Knapsack|Measure and Conquer|Iterative Compression|Rank-Based DP|Inclusion-Exclusion DP`) }
    ]
  },
  {
    page: 7,
    title: 'Graph, Flow & Topological Machinery',
    short: 'Graph Rituals',
    subtitle: 'Paths, cuts, embeddings, homology, spectra, and networks that turn structure into leverage.',
    groups: [
      { name: 'Shortest Paths', tags: ['Graph','Search'], engine: 'graph', lore: 'distance is relaxed until the graph stops arguing', items: names(`Bellman-Ford|Floyd-Warshall|Johnson's Algorithm|Yen's K-Shortest Paths|Replacement Paths Algorithm|Suurballe's Algorithm|Ahuja-Orlin Shortest Path|Dial's Algorithm|0-1 BFS|Thorup's Integer Shortest Paths`) },
      { name: 'Spanning Structures', tags: ['Graph','Optimization'], engine: 'graph', lore: 'connectivity is purchased with the least possible edge grief', items: names(`Kruskal|Prim|Boruvka|Reverse-Delete MST|Chu-Liu Edmonds Arborescence|Gabow's MST|Karger-Klein-Tarjan MST|Frederickson Topology Trees|Minimum Bottleneck Spanning Tree|Steiner Tree Approximation`) },
      { name: 'Cuts and Flow', tags: ['Flow','Graph'], engine: 'flow', lore: 'capacity exposes bottlenecks by saturating every excuse', items: names(`Ford-Fulkerson|Edmonds-Karp|Stoer-Wagner Min-Cut|Karger's Min-Cut|Nagamochi-Ibaraki|Gomory-Hu Tree|Picard-Queyranne|Hao-Orlin Min-Cut|Capacity Scaling Max-Flow|Min-Cost Max-Flow`) },
      { name: 'Matching and Assignment', tags: ['Graph','Optimization'], engine: 'graph', lore: 'edges pair off under preference, parity, and augmenting-path pressure', items: names(`Hopcroft-Karp|Gale-Shapley|Stable Roommates|Auction Algorithm|Kuhn's Bipartite Matching|Gabow Matching|Micali-Vazirani Matching|Dulmage-Mendelsohn Decomposition|Tutte Matrix Matching|Rank-Maximal Matching`) },
      { name: 'Connectivity Decomposition', tags: ['Graph','Search'], engine: 'graph', lore: 'the graph is dissected into articulation, blocks, and lowlink anatomy', items: names(`Kosaraju SCC|Gabow SCC|Biconnected Components|Triconnected Components|Articulation Points|Bridge-Finding DFS|Block-Cut Tree|SPQR Tree|Ear Decomposition|Degeneracy Ordering`) },
      { name: 'Planarity and Embeddings', tags: ['Graph','Geometry'], engine: 'topology', lore: 'graphs are flattened, ordered, and drawn without forbidden crossings', items: names(`Hopcroft-Tarjan Planarity|Boyer-Myrvold Planarity|PQ-Tree Reduction|PC-Tree Planarity|Schnyder Woods|Tutte Embedding|Planar Separator|Straight-Line Planar Drawing|Visibility Representation|Canonical Ordering`) },
      { name: 'Coloring and Clique Structure', tags: ['Graph','Search'], engine: 'graph', lore: 'neighborhood order reveals hidden chordality and conflict color', items: names(`DSATUR|Welsh-Powell Coloring|Tomita Clique|Maximum Cardinality Search|Lexicographic BFS|Chordal Graph Recognition|Perfect Elimination Ordering|Modular Decomposition|Greedy Coloring|Kempe Chain Heuristic`) },
      { name: 'Topological Data Analysis', tags: ['Geometry','Math'], engine: 'topology', lore: 'shape is measured by holes that persist across scale', items: names(`Persistent Homology|Vietoris-Rips Complex|Cech Complex|Alpha Complex|Mapper Algorithm|Witness Complex|Zigzag Persistence|Persistent Cohomology|Discrete Morse Reduction|Forman Gradient Matching`) },
      { name: 'Geometric Graphs', tags: ['Geometry','Graph'], engine: 'topology', lore: 'points become networks through proximity, empty circles, and angular witnesses', items: names(`Delaunay Triangulation|Voronoi Diagram|Fortune's Sweep|Bowyer-Watson|Lawson Edge Flips|Gabriel Graph|Relative Neighborhood Graph|Euclidean MST|Well-Separated Pair Decomposition|Yao Graph`) },
      { name: 'Spectral and Random Walks', tags: ['Graph','Probabilistic'], engine: 'probability', lore: 'eigenvectors and walks reveal authority, clusters, and hidden communities', items: names(`PageRank|HITS|Spectral Clustering|Laplacian Eigenmaps|SALSA Hubs and Authorities|Random Walk with Restart|Label Propagation|Louvain Community Detection|Leiden Algorithm|Infomap`) }
    ]
  },
  {
    page: 8,
    title: 'Automata, Grammars, Strings & Esoteric Computation',
    short: 'Automata Vault',
    subtitle: 'Parsers, automata, string machinery, cellular weirdness, and tiny formal systems that secretly compute universes.',
    groups: [
      { name: 'String Matching', tags: ['Parsing','Search'], engine: 'parsing', lore: 'patterns are located by failure functions, rolling hashes, and bit masks', items: names(`Knuth-Morris-Pratt|Rabin-Karp|Aho-Corasick|Z-Algorithm|Manacher|Duval Lyndon Factorization|Crochemore Factorization|Two-Way String Matching|Shift-Or|Bitap`) },
      { name: 'Suffix Machinery', tags: ['Parsing','Compression'], engine: 'parsing', lore: 'all suffixes are organized so text can answer impossible questions quickly', items: names(`Ukkonen Suffix Tree|Enhanced Suffix Array|Lyndon Array Construction|SA-IS Suffix Array|DC3 Skew Algorithm|Kasai LCP|FM-Index Backward Search|Burrows-Wheeler Matching|Factor Oracle|Directed Acyclic Word Graph`) },
      { name: 'Parsing Engines', tags: ['Parsing','Logic'], engine: 'parsing', lore: 'sentences are accepted through stacks, tables, memoization, and precedence spells', items: names(`GLR Parsing|LR(1) Parsing|LALR Parsing|Packrat Parsing|Pratt Parsing|Shunting Yard|Parser Combinators|PEG Parsing|LL(*) Prediction|GLL Parsing`) },
      { name: 'Automata Construction', tags: ['Automata','Parsing'], engine: 'automata', lore: 'regular expressions become machines and machines become smaller machines', items: names(`Position NFA Construction|Subset Construction|Hopcroft DFA Minimization|Brzozowski Minimization|Brzozowski Derivatives|Glushkov Automaton|Aho-Sethi-Ullman|Regex Derivative Matching|Antimirov Partial Derivatives|McNaughton-Yamada`) },
      { name: 'Cellular Automata Relics', tags: ['Automata','Generative'], engine: 'automata', lore: 'local rules write large-scale behavior into spacetime', items: names(`Rule 30|Rule 90|Brian's Brain|Wireworld|Cyclic Cellular Automaton|Hodgepodge Machine|Margolus Neighborhood|Greenberg-Hastings Model|Larger Than Life CA|SmoothLife`) },
      { name: 'Combinator and Rewrite Machines', tags: ['Automata','Logic'], engine: 'logic', lore: 'computation is reduced to symbolic appetite and graph rewiring', items: names(`FRACTRAN|SKI Reduction|Combinatory Logic Normalization|Graph Reduction|Token-Passing Nets|Interaction Nets|Lafont's Interaction Combinators|Term Graph Rewriting|Thue Interpreter|Post Canonical System`) },
      { name: 'Grammar Induction and Compression', tags: ['Parsing','Compression'], engine: 'parsing', lore: 'structure is inferred by discovering repeated phrases and hidden productions', items: names(`Sequitur|Re-Pair Grammar Compression|Lempel-Ziv Grammar Inference|Bayesian Program Learning|ADIOS Grammar Induction|Minimum Grammar Problem|Charikar Approximation|Greibach Normal Form Conversion|Parikh Image Computation|Left Recursion Elimination`) },
      { name: 'Rule Engines and Logic Programming', tags: ['Logic','Parsing'], engine: 'logic', lore: 'facts trigger rules through indexed memory and unification machinery', items: names(`Rete Algorithm|TREAT Algorithm|Prolog SLD Resolution|Warren Abstract Machine|Tabling SLG Resolution|Magic Templates|Constraint Handling Rules|CHR Propagation|Discrimination Net Matching|Alpha Network Indexing`) },
      { name: 'Compiler Back-End Sorcery', tags: ['Optimization','Parsing'], engine: 'optimization', lore: 'programs become machine code through graphs, covers, and dominance', items: names(`Chaitin-Briggs Register Allocation|Linear Scan Register Allocation|Instruction Selection Tree Covering|BURS|Operator Precedence Parsing|LLVM GlobalISel|Dominator Frontier|Loop-Invariant Code Motion|Trace Scheduling|Superblock Scheduling`) },
      { name: 'Minimal Computing Models', tags: ['Undecidable','Automata'], engine: 'undecidable', lore: 'absurdly small machines carry full computational universality', items: names(`Cyclic Tag System|2-Tag System|Wang B-Machine|Small-Step Semantics Machine|One-Tape Turing Simulation|SK Combinator Machine|Lambda Calculus Beta Reduction|One-Instruction Set Computer|Small Universal Turing Machine|Collatz Function Iteration`) }
    ]
  },
  {
    page: 9,
    title: 'Numerical, Geometric & Physics Engine Forbidden Arts',
    short: 'Physics Geometry',
    subtitle: 'Transforms, solvers, simulations, geometry, rendering, and control systems where floating point starts sweating.',
    groups: [
      { name: 'Transforms and Spectra', tags: ['Math','Signal'], engine: 'probability', lore: 'signals are rotated into domains where hidden structure becomes obvious', items: names(`Cooley-Tukey FFT|Number Theoretic Transform|Fast Walsh-Hadamard Transform|Discrete Cosine Transform|Goertzel Algorithm|Spherical Harmonic Transform|Fast Radon Transform|Mellin Transform|Hilbert Transform|Prony's Method`) },
      { name: 'Linear Algebra Engines', tags: ['Math','Optimization'], engine: 'optimization', lore: 'matrices reveal eigenstructure, Krylov subspaces, and low-rank ghosts', items: names(`QR Algorithm|Jacobi Eigenvalue|Lanczos Iteration|Arnoldi Iteration|GMRES|BiCGSTAB|MINRES|Power Iteration|Randomized SVD|CUR Decomposition`) },
      { name: 'Numerical Robustness', tags: ['Math','BlackMagic'], engine: 'optimization', lore: 'rounding error is cornered with compensation and polynomial ritual', items: names(`Kahan Summation|TwoSum Error-Free Transform|Shewchuk Adaptive Predicates|Dekker Multiplication|CORDIC|Remez Exchange|Chebyshev Minimax|Clenshaw Recurrence|De Casteljau|Horner's Method`) },
      { name: 'Differential Equation Solvers', tags: ['Physics','Math'], engine: 'flow', lore: 'continuous dynamics are stepped through time without exploding immediately', items: names(`Runge-Kutta 4|Dormand-Prince|Verlet Integration|Leapfrog Integration|Symplectic Euler|Backward Euler|Crank-Nicolson|Finite Difference Time Domain|Finite Volume Method|Finite Element Assembly`) },
      { name: 'Physics Simulation', tags: ['Physics','Geometry'], engine: 'flow', lore: 'matter is approximated by particles, constraints, grids, and impulses', items: names(`Position Based Dynamics|Projective Dynamics|Smoothed Particle Hydrodynamics|Lattice Boltzmann Method|Fast Multipole Method|Particle Mesh Ewald|PIC FLIP|Material Point Method|Rigid Body Sequential Impulses|Baraff Constraint Solver`) },
      { name: 'Surface Reconstruction', tags: ['Geometry','3D'], engine: 'topology', lore: 'point clouds and scalar fields are coerced into surfaces', items: names(`Marching Tetrahedra|Dual Contouring|Voxel Greedy Meshing|Poisson Surface Reconstruction|Ball-Pivoting Algorithm|RANSAC|Iterative Closest Point|Moving Least Squares Surface|Crust Algorithm|Alpha Wrapping`) },
      { name: 'Computational Geometry', tags: ['Geometry','Search'], engine: 'topology', lore: 'polygons, intersections, and hulls are tamed by sweeps and orientation tests', items: names(`Sutherland-Hodgman Clipping|Weiler-Atherton Clipping|Bentley-Ottmann Sweep|Rotating Calipers|Quickhull|Gift Wrapping|Graham Scan|Monotone Chain Hull|Visvalingam-Whyatt Simplification|Douglas-Peucker`) },
      { name: 'Meshing and Subdivision', tags: ['Geometry','Optimization'], engine: 'topology', lore: 'continuous forms are tiled, relaxed, refined, and simplified', items: names(`Delaunay Refinement|Ruppert's Algorithm|Chew's Second Algorithm|Advancing Front Meshing|Centroidal Voronoi Tessellation|Lloyd Relaxation|Quadric Error Mesh Decimation|Loop Subdivision|Catmull-Clark Subdivision|Butterfly Subdivision`) },
      { name: 'Light Transport', tags: ['Geometry','Physics'], engine: 'quantum', lore: 'photons become estimators and rendering becomes statistical necromancy', items: names(`Path Tracing|Metropolis Light Transport|Irradiance Caching|Photon Mapping|ReSTIR|Manifold Next Event Estimation|Radiosity|Beam Tracing|Cone Tracing|Spherical Harmonics Lighting`) },
      { name: 'Robotics and Control', tags: ['Optimization','Physics'], engine: 'flow', lore: 'motion is planned through state spaces, residuals, and control gradients', items: names(`TEB Timed Elastic Band|DWA Dynamic Window Approach|GraphSLAM|Bundle Adjustment|Levenberg-Marquardt|iLQR|Differential Dynamic Programming|RRT|EST Expansive Space Trees|Probabilistic Roadmap`) }
    ]
  },
  {
    page: 10,
    title: 'Data Structures, Sketches, Indexes & Compression Grimoires',
    short: 'Data Relics',
    subtitle: 'Indexes, succinct structures, entropy coders, priority queues, and streaming sketches that bend storage into weird shapes.',
    groups: [
      { name: 'Tree Indexes', tags: ['Search','Data'], engine: 'graph', lore: 'ordered data hides behind fanout, bounding boxes, and metric pivots', items: names(`B-Tree|LSM-Tree|Fractal Tree Index|R-Tree|KD-Tree|GNAT Metric Tree|VP-Tree|Cover Tree|BK-Tree|M-Tree`) },
      { name: 'Ordered Dynamic Structures', tags: ['Data','Optimization'], engine: 'graph', lore: 'updates restructure order so queries stay unnaturally fast', items: names(`Fenwick Tree|Segment Tree|Interval Tree|Treap|Red-Black Tree|AVL Tree|Scapegoat Tree|Cartesian Tree|Link-Cut Tree|Euler Tour Tree`) },
      { name: 'Heaps and Queues', tags: ['Data','Optimization'], engine: 'optimization', lore: 'priorities are merged, softened, bucketed, and amortized', items: names(`Fibonacci Heap|Pairing Heap|Binomial Heap|Brodal Queue|Soft Heap|Radix Heap|Calendar Queue|Bucket Queue|Skew Heap|Leftist Heap`) },
      { name: 'Succinct Structures', tags: ['Compression','Data'], engine: 'sketch', lore: 'queries survive after pointers are crushed into bit-level geometry', items: names(`Wavelet Tree|Succinct Bitvector Rank Select|Elias-Fano Encoding|LOUDS Trie|DAC Directly Addressable Codes|RRR Bitvector|K2-Tree|Grammar-Compressed Tree|Range Minimum Query Sparse Table|Fischer-Heun RMQ`) },
      { name: 'Editor and Persistent Structures', tags: ['Data','Search'], engine: 'graph', lore: 'history, locality, and structural sharing make mutation less destructive', items: names(`Rope|Piece Table|Gap Buffer|Finger Tree|RRB-Vector|Zipper|HAMT|Judy Array|Crit-bit Tree|Ternary Search Tree`) },
      { name: 'Hash Table Sorcery', tags: ['Hashing','Data'], engine: 'sketch', lore: 'collisions are displaced, stolen, bucketed, or precomputed away', items: names(`Robin Hood Hashing|Hopscotch Hashing|Perfect Hashing|FKS Hashing|SwissTable Probing|Coalesced Hashing|Extendible Hashing|Cichelli Hashing|Two-Choice Hashing|Tabulation Hashing`) },
      { name: 'Streaming Sketches', tags: ['Sketch','Streaming'], engine: 'sketch', lore: 'streams are summarized before memory realizes what happened', items: names(`KLL Quantile Sketch|Misra-Gries|Space-Saving|Lossy Counting|Flajolet-Martin|Morris Counter|HeavyKeeper|Frequent Directions|Priority Sampling|Distinct Sampling`) },
      { name: 'Compression Classics', tags: ['Compression','Data'], engine: 'sketch', lore: 'redundancy is hunted through dictionaries, contexts, and entropy models', items: names(`Huffman Coding|LZ77|DEFLATE|Brotli|Zstandard|PPM|Range Coding|BWT Move-To-Front|Context Mixing PAQ|Finite-State Entropy`) },
      { name: 'Entropy and Integer Codes', tags: ['Compression','Math'], engine: 'sketch', lore: 'probabilities and integers are packed until every bit has a job', items: names(`Arithmetic Coding|Asymmetric Numeral Systems|Elias Gamma Coding|Interpolative Coding|Golomb Coding|Levenshtein Coding|Comma Code|Tunstall Coding|Enumerative Coding|Combinatorial Number System`) },
      { name: 'Storage Engine Oddities', tags: ['Data','BlackMagic'], engine: 'graph', lore: 'disk, cache, and memory layouts are rearranged to cheat latency', items: names(`COLA Cache-Oblivious Lookahead Array|PebblesDB FLSM|Masstree|ART Adaptive Radix Tree|Zone Maps|Van Emde Boas Layout|Packed Memory Array|BetrFS Layout|Tiered Vector|Succinct Dynamic Strings`) }
    ]
  }
];

const VISUAL_MODES = [
  { label: 'Adjacency Lattice', family: 'matrix', metric: 'constraint density' },
  { label: 'Failure Cone', family: 'proof', metric: 'counterexample pressure' },
  { label: 'Witness Network', family: 'network', metric: 'dependency degree' },
  { label: 'Phase Ledger', family: 'ledger', metric: 'state transition count' },
  { label: 'Entropy Spectrum', family: 'spectrum', metric: 'uncertainty gradient' },
  { label: 'Reachability Atlas', family: 'geometry', metric: 'reachable region' },
  { label: 'Temporal Lanes', family: 'timeline', metric: 'event ordering' },
  { label: 'Automaton Strand', family: 'automata', metric: 'state class' },
  { label: 'Memory Cartogram', family: 'memory', metric: 'address locality' },
  { label: 'Flow Residual Map', family: 'flow', metric: 'residual imbalance' },
  { label: 'Dual Complex', family: 'geometry', metric: 'cell incidence' },
  { label: 'Consensus Trace', family: 'ledger', metric: 'quorum visibility' },
  { label: 'Sampling Field', family: 'spectrum', metric: 'estimator variance' },
  { label: 'Type Judgment Tree', family: 'proof', metric: 'rule depth' },
  { label: 'Index Fanout Map', family: 'memory', metric: 'branch fanout' },
  { label: 'Collision Constellation', family: 'network', metric: 'hash displacement' },
  { label: 'Search Frontier', family: 'flow', metric: 'frontier breadth' },
  { label: 'Circuit Skeleton', family: 'automata', metric: 'gate layer' },
  { label: 'Curvature Tiles', family: 'matrix', metric: 'local curvature' },
  { label: 'Causal Ribbon', family: 'timeline', metric: 'happens-before span' },
  { label: 'Recurrence Loom', family: 'proof', metric: 'recursive obligation' },
  { label: 'Residual Orbit', family: 'geometry', metric: 'fixed-point drift' },
  { label: 'Bucket Cosmogram', family: 'memory', metric: 'bucket load' },
  { label: 'Gradient Weather', family: 'spectrum', metric: 'objective slope' },
  { label: 'Protocol Chord', family: 'network', metric: 'message route' },
  { label: 'Compression Barcode', family: 'ledger', metric: 'bit budget' },
  { label: 'Parser Wake', family: 'flow', metric: 'lookahead tension' },
  { label: 'Belief Manifold', family: 'geometry', metric: 'posterior mass' },
  { label: 'Heap Seismograph', family: 'timeline', metric: 'priority churn' },
  { label: 'Verifier Grid', family: 'matrix', metric: 'invariant coverage' },
  { label: 'Bezier Control Cage', family: 'bezier', metric: 'control-point tension' },
  { label: 'Manim Axes Plot', family: 'axes', metric: 'function trace' },
  { label: 'Number Plane Warp', family: 'plane', metric: 'coordinate distortion' },
  { label: 'Pseudo-3D Mesh', family: 'mesh3d', metric: 'projected depth' },
  { label: 'Implicit Contour Field', family: 'implicit', metric: 'zero-set pressure' },
  { label: 'Voronoi Territory Map', family: 'voronoi', metric: 'nearest-site partition' },
  { label: 'Sankey Capacity Weave', family: 'sankey', metric: 'weighted transfer' },
  { label: 'Chord Dependency Ring', family: 'chord', metric: 'cross-link tension' },
  { label: 'Quiver Vector Field', family: 'quiver', metric: 'directional derivative' },
  { label: 'Phase Portrait', family: 'phase', metric: 'state-space drift' },
  { label: 'Tensor Slice Stack', family: 'tensor', metric: 'layer activation' },
  { label: 'Treemap Allocation', family: 'treemap', metric: 'area budget' },
  { label: 'Sunburst Partition', family: 'sunburst', metric: 'hierarchy share' },
  { label: 'Recursion Spiral', family: 'spiral', metric: 'self-call depth' },
  { label: 'Braid Trace', family: 'braid', metric: 'interleaving order' },
  { label: 'Radar Polytope', family: 'radar', metric: 'multi-axis profile' },
  { label: 'Gantt Fault Window', family: 'gantt', metric: 'schedule overlap' },
  { label: 'Decision Boundary', family: 'boundary', metric: 'classification margin' },
  { label: 'Riemann Accumulator', family: 'riemann', metric: 'area approximation' },
  { label: 'Cayley Operation Table', family: 'cayley', metric: 'closure pattern' }
];

const VISUAL_FAMILIES = [
  'matrix', 'network', 'timeline', 'ledger', 'spectrum', 'geometry', 'proof', 'memory', 'automata', 'flow',
  'bezier', 'axes', 'plane', 'mesh3d', 'implicit', 'voronoi', 'sankey', 'chord', 'quiver', 'phase',
  'tensor', 'treemap', 'sunburst', 'spiral', 'braid', 'radar', 'gantt', 'boundary', 'riemann', 'cayley'
];

const MECHANISM_BY_ENGINE = {
  undecidable: 'reduces a decision question to formal states, encodings, or proof obligations',
  quantum: 'uses amplitudes, sampling, paths, or physically inspired estimators to expose hidden structure',
  logic: 'expresses the problem as constraints, clauses, terms, rules, or proof search',
  graph: 'models entities as vertices and relationships, cuts, traversals, or connectivity predicates',
  flow: 'moves quantities, information, control, or residual error through an explicit state space',
  probability: 'uses distributions, estimators, random choices, or Bayesian updates to survive uncertainty',
  sketch: 'compresses evidence into approximate summaries with measurable error or bit budgets',
  automata: 'tracks legal states and transitions with a machine, grammar, or symbolic recognizer',
  evolution: 'iterates candidate populations, local changes, or selection pressure across generations',
  optimization: 'searches an objective landscape with relaxations, bounds, gradients, or heuristics',
  distributed: 'coordinates independent participants under latency, partial knowledge, or failure',
  crypto: 'depends on hard problems, commitments, proofs, keys, or adversarial security assumptions',
  topology: 'preserves shape, adjacency, incidence, or continuity while transforming representation',
  parsing: 'turns symbol streams into structure using grammar, automata, lookahead, or compression'
};

const VERIFY_BY_ENGINE = {
  undecidable: 'look for a reduction, formal model, or theorem statement in the primary literature',
  quantum: 'look for circuit, amplitude, sampler, or quantum-walk definitions and stated assumptions',
  logic: 'look for the constraint language, inference rule, or proof procedure it actually uses',
  graph: 'look for graph primitives, graph class assumptions, and stated complexity guarantees',
  flow: 'look for the conservation law, recurrence, update equation, or control state definition',
  probability: 'look for the distributional assumption, estimator, sampling rule, and failure bound',
  sketch: 'look for the summary structure, error guarantee, and update/query operations',
  automata: 'look for the state set, transition rule, accepted language, or recognizer invariant',
  evolution: 'look for the mutation/selection operator and convergence or empirical evaluation claim',
  optimization: 'look for the objective, constraints, approximation ratio, or convergence condition',
  distributed: 'look for the failure model, timing model, quorum rule, and safety/liveness claim',
  crypto: 'look for the adversary model, hardness assumption, proof sketch, and parameter limits',
  topology: 'look for the geometric/topological invariant and the discretization assumptions',
  parsing: 'look for grammar class, token model, parse action, and ambiguity handling'
};

const PROOF_VERBS = [
  'models', 'indexes', 'bounds', 'samples', 'relaxes', 'factorizes', 'coordinates', 'compresses',
  'recognizes', 'reconstructs', 'schedules', 'estimates', 'verifies', 'partitions', 'stabilizes'
];

const BUTTON_VERBS = [
  'Trace', 'Probe', 'Audit', 'Map', 'Stress', 'Decode', 'Fold', 'Walk', 'Split', 'Rank',
  'Hash', 'Sample', 'Bind', 'Check', 'Sketch', 'Balance', 'Pulse', 'Lift', 'Cut', 'Pack',
  'Route', 'Compile', 'Mirror', 'Bound', 'Solve', 'Witness', 'Seal', 'Index', 'Project', 'Distill'
];

const VISUAL_LAYOUTS = [
  'full-field', 'left-index', 'right-index', 'top-ledger', 'bottom-ledger', 'split-diagonal',
  'center-orbit', 'wide-core', 'narrow-core', 'corner-proof', 'two-chamber', 'three-band',
  'radial-cabinet', 'offset-stack', 'cross-section', 'windowed-inset', 'tilted-frame', 'deep-margin'
];

const VISUAL_MARKS = [
  'anchor', 'aperture', 'blade', 'bridge', 'cairn', 'cipher', 'comet', 'delta', 'facet', 'forge',
  'hinge', 'iris', 'keel', 'lens', 'mantle', 'needle', 'obelisk', 'prism', 'quartz', 'rake',
  'saddle', 'tesseract', 'umbra', 'vector', 'well', 'xiphos', 'yoke', 'zenith', 'quorum', 'witness'
];

const VISUAL_PALETTES = [
  [172, 42, 286], [204, 18, 86], [138, 316, 48], [28, 188, 258], [96, 226, 340],
  [252, 54, 162], [14, 148, 216], [332, 84, 194], [118, 278, 8], [224, 4, 132],
  [72, 198, 312], [294, 34, 178], [156, 246, 24], [342, 206, 94], [186, 62, 270],
  [44, 164, 304], [264, 110, 22], [6, 232, 122], [318, 150, 60], [210, 330, 116]
];

const TITLE_CUES = [
  { re: /tree|trie|forest|heap|queue|list|array|vector|buffer|table/i, text: 'uses shape, order, or locality as the working object' },
  { re: /hash|bloom|sketch|fingerprint|sample|counter|quantile|minhash|simhash/i, text: 'compresses evidence into a checkable summary or probabilistic fingerprint' },
  { re: /sat|smt|proof|sequent|logic|type|unification|theorem|verifier/i, text: 'moves through proof obligations, symbolic constraints, or model witnesses' },
  { re: /quantum|qaoa|grover|shor|phase|amplitude|hamiltonian/i, text: 'depends on amplitude, phase, measurement, or quantum-inspired state evolution' },
  { re: /flow|cut|matching|path|route|shortest|max-flow|augment/i, text: 'turns structure into paths, cuts, matchings, or residual pressure' },
  { re: /crypto|zk|snark|stark|rsa|cipher|signature|commitment|encryption/i, text: 'depends on adversarial assumptions, witnesses, secrets, or verifiable commitments' },
  { re: /parser|grammar|earley|cyk|automata|regex|suffix|bwt|lzw/i, text: 'recognizes or transforms symbol streams through grammar, states, or compression' },
  { re: /monte|mcmc|particle|bayes|belief|markov|sampling|random|probabilistic/i, text: 'uses probability mass, resampling, or stochastic evidence instead of exact enumeration' },
  { re: /mesh|surface|hull|voronoi|delaunay|marching|geometry|contour|subdivision/i, text: 'preserves geometry, adjacency, or incidence while changing representation' },
  { re: /neural|gradient|diffusion|transformer|vae|gan|attention|learning/i, text: 'learns a representation, score, policy, or latent map from data' },
  { re: /consensus|paxos|raft|byzantine|gossip|clock|crdt|distributed/i, text: 'coordinates partial knowledge across nodes, messages, and failure assumptions' },
  { re: /anneal|evolution|swarm|colony|genetic|immune|search|optimization/i, text: 'searches a hostile objective landscape with heuristics, relaxation, or adaptation' }
];

const SECTION_LETTERS = 'ABCDEFGHIJ'.split('');

const CONTEXT_BY_ENGINE = {
  undecidable: {
    use: 'computability limits, reductions, program-analysis impossibility results, and CS theory teaching',
    industry: 'formal-methods research, language tooling, verification education, safety analysis',
    careers: 'theoretical CS, programming-languages research, formal verification, static-analysis tooling',
    source: 'S-UND: computability/formal-methods literature; domain context only, no inventor/date assertion'
  },
  quantum: {
    use: 'quantum algorithms, quantum-inspired optimization, simulation, sampling, and amplitude/phase reasoning',
    industry: 'quantum computing, scientific computing, graphics, optimization, cryptography research',
    careers: 'quantum software, research engineering, simulation engineering, scientific computing',
    source: 'S-QNT: quantum-algorithm and simulation literature; domain context only'
  },
  logic: {
    use: 'constraint solving, theorem proving, model checking, static analysis, type systems, and compilers',
    industry: 'EDA, safety-critical software, language tooling, security, theorem-prover ecosystems',
    careers: 'formal methods, compiler engineering, verification, programming-languages research',
    source: 'S-LOG: logic/solver/formal-methods literature; domain context only'
  },
  graph: {
    use: 'routing, dependency analysis, matching, indexing, tree/trie storage, and network structure',
    industry: 'logistics, databases, search, security, infrastructure, knowledge graphs',
    careers: 'backend engineering, graph engineering, data platforms, storage/database engineering',
    source: 'S-GPH: algorithms/data-structures literature and NIST DADS-style taxonomy; domain context only'
  },
  flow: {
    use: 'capacity planning, allocation, scheduling, parser movement, residual updates, and control flow',
    industry: 'cloud infrastructure, networking, operations research, logistics, simulation',
    careers: 'optimization engineering, SRE, systems engineering, operations research',
    source: 'S-FLW: network-flow/control/scheduling literature; domain context only'
  },
  probability: {
    use: 'uncertainty modeling, forecasting, inference, filtering, resampling, and noisy decision making',
    industry: 'finance, robotics, ML, bioinformatics, telemetry, risk modeling',
    careers: 'ML engineering, data science, robotics, quantitative research, applied statistics',
    source: 'S-PRB: probability/statistical-inference literature; domain context only'
  },
  sketch: {
    use: 'stream summaries, approximate analytics, compression, deduplication, similarity search, and bit budgets',
    industry: 'observability, search, databases, ad tech, storage, data infrastructure',
    careers: 'data infrastructure, analytics engineering, database engineering, search engineering',
    source: 'S-SKT: streaming/sketching/compression literature; domain context only'
  },
  automata: {
    use: 'state machines, language recognition, model checking, cellular systems, and protocol-state reasoning',
    industry: 'compilers, networking, verification, procedural generation, security tooling',
    careers: 'compiler engineering, security tooling, protocol engineering, verification',
    source: 'S-AUT: automata/language-recognition literature; domain context only'
  },
  evolution: {
    use: 'black-box optimization, design search, tuning, candidate populations, and emergent simulation',
    industry: 'robotics, operations research, game AI, design automation, simulation',
    careers: 'optimization, simulation, ML research, robotics, game AI',
    source: 'S-EVO: evolutionary-computation/heuristic-search literature; domain context only'
  },
  optimization: {
    use: 'objective minimization, assignment, scheduling, numerical solving, planning, and relaxations',
    industry: 'logistics, finance, ML platforms, operations, robotics, supply chains',
    careers: 'operations-research engineering, ML systems, applied math, robotics planning',
    source: 'S-OPT: optimization/OR/numerical-methods literature; domain context only'
  },
  distributed: {
    use: 'replication, consensus, clocks, messaging, fault tolerance, and partial-knowledge coordination',
    industry: 'cloud, databases, blockchain, infrastructure, edge systems, distributed storage',
    careers: 'distributed systems, SRE, platform engineering, database engineering',
    source: 'S-DST: distributed-systems literature; domain context only'
  },
  crypto: {
    use: 'privacy, authentication, zero-knowledge proofs, commitments, secure protocols, and adversarial computation',
    industry: 'security, fintech, blockchain, identity, cloud infrastructure, privacy tech',
    careers: 'security engineering, cryptography, protocol design, blockchain infrastructure',
    source: 'S-CRY: cryptography/protocol literature; domain context only'
  },
  topology: {
    use: 'shape reconstruction, meshing, GIS, geometry processing, surface reasoning, and incidence preservation',
    industry: 'CAD, robotics, graphics, scientific visualization, manufacturing, medical imaging',
    careers: 'graphics, robotics, geometry processing, simulation, scientific visualization',
    source: 'S-TOP: computational-geometry/topology literature; domain context only'
  },
  parsing: {
    use: 'grammar recognition, compression, decoding, syntax trees, automata, and text/search pipelines',
    industry: 'compilers, NLP, databases, developer tools, bioinformatics, compression systems',
    careers: 'compiler engineering, NLP, developer tooling, search, data engineering',
    source: 'S-PRS: parsing/compression/string-algorithm literature; domain context only'
  }
};

function slugifyTitle(title, page) {
  const body = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const sig = hash32(`${page}:${title}`).toString(36).slice(0, 5);
  return `v${page}-${body}-${sig}`;
}

function pick(list, seed, salt = 0) {
  return list[Math.abs(seed + salt) % list.length];
}

function spellRecordId(page, groupIndex, itemIndex) {
  return `V${String(page).padStart(2, '0')}.${String(groupIndex + 1).padStart(2, '0')}.${String(itemIndex + 1).padStart(2, '0')}`;
}

function spellNavLabel(page, groupIndex, itemIndex) {
  return `V${String(page).padStart(2, '0')}-${SECTION_LETTERS[groupIndex] || 'X'}-${String(itemIndex + 1).padStart(2, '0')}`;
}

function spellGlobalIndex(page, groupIndex, itemIndex) {
  return (page - 1) * 100 + groupIndex * 10 + itemIndex + 1;
}

function spellSignature(spell, volume, group) {
  return hash32(`${volume.page}|${group.name}|${spell.title}|${spell.engine}|${spell.tags.join(',')}`)
    .toString(16)
    .padStart(8, '0')
    .slice(0, 8)
    .toUpperCase();
}

function shortTitle(title, max = 24) {
  const compact = title
    .replace(/\b(Algorithm|Method|Solver|Protocol|Structure|Search|Coding|Encoding)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return compact.length <= max ? compact : compact.slice(0, max - 1).trimEnd() + '…';
}

function inferTitleCue(title, engine) {
  const hit = TITLE_CUES.find(cue => cue.re.test(title));
  return hit ? hit.text : (MECHANISM_BY_ENGINE[engine] || MECHANISM_BY_ENGINE.graph);
}

function makeVisualBlueprint(spell, volume, group, seed, groupIndex, itemIndex, visualMode, signature) {
  const primary = visualMode.family;
  const familyAt = (salt, disallow = []) => {
    for (let step = 0; step < VISUAL_FAMILIES.length; step++) {
      const family = VISUAL_FAMILIES[Math.abs(seed + salt + step * 37) % VISUAL_FAMILIES.length];
      if (!disallow.includes(family)) return family;
    }
    return VISUAL_FAMILIES[0];
  };
  const secondary = familyAt(groupIndex * 19 + itemIndex * 7, [primary]);
  const tertiary = familyAt(signature.charCodeAt(0) + volume.page * 29, [primary, secondary]);
  const palette = VISUAL_PALETTES[Math.abs(seed + signature.charCodeAt(1)) % VISUAL_PALETTES.length];
  return {
    layout: VISUAL_LAYOUTS[Math.abs(seed + volume.page + groupIndex) % VISUAL_LAYOUTS.length],
    mark: VISUAL_MARKS[Math.abs(seed + itemIndex * 13 + group.name.length) % VISUAL_MARKS.length],
    primary,
    secondary,
    tertiary,
    palette,
    density: 5 + (Math.abs(seed) % 9),
    tilt: ((signature.charCodeAt(2) || 55) % 17) - 8,
    variant: `${volume.page}-${groupIndex + 1}-${itemIndex + 1}-${signature.slice(0, 4)}`
  };
}

function buildSpellButton(title, seed) {
  return `${pick(BUTTON_VERBS, seed, title.length)} ${shortTitle(title, 26)}`;
}

function buildUseContext(spell, group) {
  const base = CONTEXT_BY_ENGINE[spell.engine] || CONTEXT_BY_ENGINE.graph;
  return {
    use: `${spell.title}: domain-context claim only; relevant to ${base.use}.`,
    industry: `${base.industry}; grouped here as ${group.name}.`,
    careers: base.careers,
    source: `${base.source}; see docs/SOURCE-LEDGER.md.`
  };
}

const VISUAL_RECIPE_LENSES = [
  'cartesian ticks', 'polar phase', 'temporal lanes', 'isometric depth', 'hex bin field',
  'barycentric simplex', 'contour section', 'raster memory', 'orbit clock', 'braid worldlines',
  'quiver weather', 'treemap budget', 'persistence barcode', 'event ledger', 'wavelet packet',
  'constraint polytope', 'compound graph cells', 'verlet constraint web', 'spiral microscope',
  'butterfly transform'
];

const VISUAL_RECIPE_MARKERS = [
  'circle', 'square', 'diamond', 'triangle', 'pill', 'ring', 'cross', 'notch', 'capsule', 'spark'
];

const VISUAL_RECIPE_LINES = [
  'straight', 'bezier', 'stepped', 'dashed', 'haystack', 'ribbon', 'orthogonal', 'magnetic'
];

const VISUAL_RECIPE_MOTIONS = [
  'sweep', 'pulse', 'orbit', 'settle', 'resample', 'phase', 'breathe', 'cascade', 'diffuse', 'tick'
];

const VISUAL_DATA_GRAMMARS = [
  'field-to-tick plot', 'density ridge stack', 'parallel coordinate braid', 'matrix heatmap',
  'radial bin histogram', 'contour isoline set', 'candlestick ledger', 'stream ribbon stack',
  'horizon band chart', 'small-multiple facets', 'lollipop stems', 'connected scatter path',
  'glyph swarm', 'interval barcode', 'facet strip chart', 'channel trellis'
];

const VISUAL_SIM_GRAMMARS = [
  'rigid-body stack', 'spring joint lattice', 'sensor tripwire', 'broadphase sweep',
  'collision islands', 'kinematic orbitals', 'constraint solver', 'gravity well',
  'impulse cascade', 'soft-body cloth', 'articulated arm', 'buoyancy field',
  'particle emitter', 'contact manifold', 'rope bridge', 'rolling simplex'
];

const VISUAL_PROJECTIONS = [
  'planar', 'axonometric', 'fisheye', 'spacetime', 'toroidal',
  'hyperbolic', 'stereographic', 'split-screen', 'cutaway', 'phase-space'
];

const VISUAL_INTERACTORS = [
  'pointer gravity', 'scanline', 'time scrub', 'hover lens', 'touch ripple',
  'inertial pan', 'zoom pulse', 'orbit bias', 'threshold gate', 'sensor wake'
];

const VISUAL_DIALECTS = [
  'oscilloscope lab', 'cartographer plate', 'field notebook', 'mission control',
  'xray cutaway', 'architect trace', 'signal theater', 'cloud chamber',
  'subway schematic', 'spectrogram wall', 'microscope slide', 'seismograph strip',
  'circuit reliquary', 'kinetic sculpture', 'astronomer ephemeris', 'ledger room',
  'loom draft', 'radar console', 'holographic slab', 'botanical morphology',
  'weather station', 'control-room glass', 'paper automaton', 'topographic survey',
  'clockwork phase', 'neural tissue', 'market microstructure', 'compiler trace',
  'quantum lab bench', 'orbital mechanics'
];

const VISUAL_SCENE_GRAPHS = [
  'pixi stage tree', 'masked container', 'z-index stack', 'sprite atlas sheet',
  'filter chain', 'particle layer', 'render group', 'tiling texture',
  'nested transform', 'interactive hitmap'
];

const VISUAL_CHART_SERIES = [
  'dataset encode', 'polar series', 'radar series', 'graph series', 'tree series',
  'sankey series', 'heatmap series', 'custom render item', 'timeline dataset',
  'visual map gradient'
];

const VISUAL_SPATIAL_SCENES = [
  'babylon arc camera', 'free camera cutaway', 'mesh builder grid', 'hemispheric light',
  'node material field', 'particle fountain', 'postprocess bloom', 'physics scene',
  'observables ray', 'shadow slab'
];

const VISUAL_TASTE_PALETTES = [
  [172, 34, 216, 318, 48],
  [204, 18, 78, 156, 286],
  [144, 226, 24, 328, 52],
  [28, 186, 244, 332, 96],
  [96, 212, 338, 42, 172],
  [252, 54, 158, 198, 34],
  [14, 148, 218, 286, 44],
  [332, 84, 194, 226, 28],
  [118, 278, 8, 186, 52],
  [224, 4, 132, 176, 42],
  [72, 198, 312, 24, 154],
  [294, 34, 178, 208, 56],
  [156, 246, 24, 324, 82],
  [342, 206, 94, 152, 34],
  [186, 62, 270, 126, 44],
  [44, 164, 304, 212, 82],
  [264, 110, 22, 178, 52],
  [6, 232, 122, 286, 46],
  [318, 150, 60, 206, 96],
  [210, 330, 116, 32, 176]
];

function selectFromIntent(spell, intent, choices, salt, offset = 0) {
  const title = spell?.title || '';
  const key = `${intent.kind}:${title}:${spell.signature || spell.id || ''}:${salt}`;
  return choices[(offset + hash32(key)) % choices.length];
}

function visualGrammarChoices(intent) {
  const byKind = {
    numerical: {
      data: ['contour isoline set', 'horizon band chart', 'field-to-tick plot', 'connected scatter path'],
      sim: ['kinematic orbitals', 'gravity well', 'constraint solver', 'broadphase sweep']
    },
    probability: {
      data: ['density ridge stack', 'glyph swarm', 'radial bin histogram', 'facet strip chart'],
      sim: ['particle emitter', 'buoyancy field', 'impulse cascade', 'sensor tripwire']
    },
    graph: {
      data: ['parallel coordinate braid', 'stream ribbon stack', 'channel trellis', 'connected scatter path'],
      sim: ['spring joint lattice', 'constraint solver', 'collision islands', 'rope bridge']
    },
    structure: {
      data: ['matrix heatmap', 'channel trellis', 'lollipop stems', 'interval barcode'],
      sim: ['rigid-body stack', 'spring joint lattice', 'contact manifold', 'rolling simplex']
    },
    'flow-graph': {
      data: ['stream ribbon stack', 'parallel coordinate braid', 'field-to-tick plot', 'radial bin histogram'],
      sim: ['impulse cascade', 'broadphase sweep', 'collision islands', 'constraint solver']
    },
    distributed: {
      data: ['candlestick ledger', 'parallel coordinate braid', 'facet strip chart', 'stream ribbon stack'],
      sim: ['sensor tripwire', 'collision islands', 'broadphase sweep', 'contact manifold']
    },
    logic: {
      data: ['matrix heatmap', 'small-multiple facets', 'interval barcode', 'channel trellis'],
      sim: ['constraint solver', 'spring joint lattice', 'rope bridge', 'sensor tripwire']
    },
    crypto: {
      data: ['candlestick ledger', 'interval barcode', 'matrix heatmap', 'facet strip chart'],
      sim: ['sensor tripwire', 'contact manifold', 'broadphase sweep', 'constraint solver']
    },
    sketch: {
      data: ['field-to-tick plot', 'radial bin histogram', 'matrix heatmap', 'horizon band chart'],
      sim: ['particle emitter', 'sensor tripwire', 'impulse cascade', 'rolling simplex']
    },
    string: {
      data: ['matrix heatmap', 'parallel coordinate braid', 'facet strip chart', 'interval barcode'],
      sim: ['broadphase sweep', 'sensor tripwire', 'rope bridge', 'contact manifold']
    },
    parsing: {
      data: ['small-multiple facets', 'matrix heatmap', 'channel trellis', 'lollipop stems'],
      sim: ['constraint solver', 'spring joint lattice', 'articulated arm', 'rope bridge']
    },
    dynamics: {
      data: ['connected scatter path', 'contour isoline set', 'stream ribbon stack', 'horizon band chart'],
      sim: ['soft-body cloth', 'buoyancy field', 'gravity well', 'impulse cascade']
    },
    quantum: {
      data: ['radial bin histogram', 'contour isoline set', 'horizon band chart', 'glyph swarm'],
      sim: ['kinematic orbitals', 'gravity well', 'particle emitter', 'sensor tripwire']
    },
    topology: {
      data: ['contour isoline set', 'small-multiple facets', 'glyph swarm', 'matrix heatmap'],
      sim: ['soft-body cloth', 'spring joint lattice', 'contact manifold', 'rolling simplex']
    },
    mesh: {
      data: ['contour isoline set', 'matrix heatmap', 'glyph swarm', 'connected scatter path'],
      sim: ['soft-body cloth', 'spring joint lattice', 'contact manifold', 'rolling simplex']
    },
    optimization: {
      data: ['contour isoline set', 'connected scatter path', 'horizon band chart', 'lollipop stems'],
      sim: ['gravity well', 'constraint solver', 'particle emitter', 'impulse cascade']
    }
  };
  return byKind[intent.kind] || {
    data: VISUAL_DATA_GRAMMARS,
    sim: VISUAL_SIM_GRAMMARS
  };
}

function recordVisualRecipe(spell, intent = semanticVisualIntent(spell)) {
  const global = spell.globalIndex || (hash32(`${spell.page || 1}:${spell.title}`) % 1000) + 1;
  const local = spell.localIndex || ((global - 1) % 100) + 1;
  const sig = spell.signature || hash32(spell.id || spell.title).toString(16).padStart(8, '0').toUpperCase();
  const base = hash32(`${sig}:${intent.kind}:${global}:${spell.title}`);
  const lens = VISUAL_RECIPE_LENSES[(global + sigInt(spell, 1, VISUAL_RECIPE_LENSES.length, 'lens')) % VISUAL_RECIPE_LENSES.length];
  const marker = VISUAL_RECIPE_MARKERS[(Math.floor(global / 3) + sigInt(spell, 2, VISUAL_RECIPE_MARKERS.length, 'marker')) % VISUAL_RECIPE_MARKERS.length];
  const line = VISUAL_RECIPE_LINES[(Math.floor(global / 5) + sigInt(spell, 3, VISUAL_RECIPE_LINES.length, 'line')) % VISUAL_RECIPE_LINES.length];
  const motion = VISUAL_RECIPE_MOTIONS[(Math.floor(global / 7) + sigInt(spell, 4, VISUAL_RECIPE_MOTIONS.length, 'motion')) % VISUAL_RECIPE_MOTIONS.length];
  const paletteIndex = (global + sigInt(spell, 5, VISUAL_TASTE_PALETTES.length, 'taste')) % VISUAL_TASTE_PALETTES.length;
  const grammarChoices = visualGrammarChoices(intent);
  const dataGrammar = selectFromIntent(spell, intent, grammarChoices.data, 'data-grammar', global);
  const simGrammar = selectFromIntent(spell, intent, grammarChoices.sim, 'sim-grammar', Math.floor(global / 2));
  const projection = selectFromIntent(spell, intent, VISUAL_PROJECTIONS, 'projection', Math.floor(global / 11));
  const interactor = selectFromIntent(spell, intent, VISUAL_INTERACTORS, 'interactor', Math.floor(global / 13));
  const visualDialect = selectFromIntent(spell, intent, VISUAL_DIALECTS, 'visual-dialect', Math.floor(global / 17));
  const sceneGraph = selectFromIntent(spell, intent, VISUAL_SCENE_GRAPHS, 'scene-graph', Math.floor(global / 19));
  const chartSeries = selectFromIntent(spell, intent, VISUAL_CHART_SERIES, 'chart-series', Math.floor(global / 23));
  const spatialScene = selectFromIntent(spell, intent, VISUAL_SPATIAL_SCENES, 'spatial-scene', Math.floor(global / 29));
  const density = 0.75 + sigUnit(spell, 6, 'density') * 0.9;
  const tension = 0.25 + sigUnit(spell, 7, 'tension') * 0.7;
  const tempo = 0.65 + sigUnit(spell, 8, 'tempo') * 1.15;
  return {
    code: `VR-${String(global).padStart(4, '0')}-${sig.slice(0, 4)}`,
    lens,
    marker,
    line,
    motion,
    dataGrammar,
    simGrammar,
    projection,
    interactor,
    visualDialect,
    sceneGraph,
    chartSeries,
    spatialScene,
    paletteIndex,
    density,
    tension,
    tempo,
    phase: (base % 6283) / 1000,
    local,
    label: `${lens}; ${marker} marks; ${line} links; ${motion} motion; ${dataGrammar}; ${simGrammar}; ${projection}; ${interactor}; ${visualDialect}; ${sceneGraph}; ${chartSeries}; ${spatialScene}`
  };
}

const SONIC_KIND_CONFIG = {
  quantum: {
    kernel: 'phase-vector amplitude sonification',
    wave: 'sine',
    ratios: [1, Math.SQRT2, 1.5, (1 + Math.sqrt(5)) / 2]
  },
  crypto: {
    kernel: 'modular-residue ladder',
    wave: 'square',
    ratios: [1, 17 / 13, 19 / 13, 23 / 13]
  },
  distributed: {
    kernel: 'quorum pulse train',
    wave: 'triangle',
    ratios: [1, 4 / 3, 3 / 2, 2]
  },
  probability: {
    kernel: 'cumulative-sampler density trace',
    wave: 'sine',
    ratios: [1, 9 / 8, 4 / 3, 5 / 3]
  },
  optimization: {
    kernel: 'objective-descent residual trace',
    wave: 'sawtooth',
    ratios: [1, 6 / 5, 3 / 2, 9 / 5]
  },
  graph: {
    kernel: 'degree-walk adjacency trace',
    wave: 'triangle',
    ratios: [1, 5 / 4, 3 / 2, 7 / 4]
  },
  'flow-graph': {
    kernel: 'residual-capacity flow trace',
    wave: 'triangle',
    ratios: [1, 7 / 6, 4 / 3, 8 / 5]
  },
  string: {
    kernel: 'failure-link automaton trace',
    wave: 'square',
    ratios: [1, 10 / 9, 4 / 3, 16 / 9]
  },
  parsing: {
    kernel: 'parse-stack action trace',
    wave: 'triangle',
    ratios: [1, 9 / 8, 5 / 4, 3 / 2]
  },
  logic: {
    kernel: 'constraint-witness proof trace',
    wave: 'square',
    ratios: [1, 6 / 5, 4 / 3, 8 / 5]
  },
  structure: {
    kernel: 'pointer-locality access trace',
    wave: 'triangle',
    ratios: [1, 5 / 4, 4 / 3, 5 / 3]
  },
  numerical: {
    kernel: 'error-residual transform trace',
    wave: 'sine',
    ratios: [1, 81 / 64, 3 / 2, 2]
  },
  topology: {
    kernel: 'incidence-preserving contour trace',
    wave: 'sine',
    ratios: [1, 7 / 6, 10 / 7, 12 / 7]
  },
  mesh: {
    kernel: 'iso-threshold surface trace',
    wave: 'triangle',
    ratios: [1, 8 / 7, 11 / 8, 13 / 8]
  },
  light: {
    kernel: 'path-integral radiance trace',
    wave: 'sine',
    ratios: [1, 11 / 10, 3 / 2, 19 / 10]
  },
  cellular: {
    kernel: 'spacetime-neighborhood state trace',
    wave: 'square',
    ratios: [1, 9 / 7, 11 / 7, 13 / 7]
  },
  automata: {
    kernel: 'finite-state transition trace',
    wave: 'square',
    ratios: [1, 6 / 5, 3 / 2, 7 / 4]
  },
  evolution: {
    kernel: 'population-fitness mutation trace',
    wave: 'sawtooth',
    ratios: [1, 5 / 4, 7 / 5, 9 / 5]
  }
};

const SONIC_DEFAULT_CONFIG = {
  kernel: 'metadata-state vector trace',
  wave: 'triangle',
  ratios: [1, 5 / 4, 3 / 2, 2]
};

function midiToHz(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function sonicVector(spell, count = 8) {
  const key = `${spell.signature || spell.id || spell.title}:${spell.title}:${(spell.tags || []).join('|')}:sonic`;
  return Array.from({ length: count }, (_, i) => 1 + (hash32(`${key}:${i}`) % 9));
}

function inversionCount(values) {
  let count = 0;
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      if (values[i] > values[j]) count++;
    }
  }
  return count;
}

function isSortingSpell(spell) {
  const text = `${spell.title || ''} ${(spell.tags || []).join(' ')} ${spell.id || ''}`.toLowerCase();
  return /\bsort\b|sorting|timsort|bogosort|stooge|cycle sort|sleep sort|cocktail|heap sort|merge sort|quick sort|radix sort|bitonic|odd-even|insertion|selection|bubble/.test(text);
}

function recordAudioRecipe(spell, intent = semanticVisualIntent(spell), visual = recordVisualRecipe(spell, intent)) {
  const global = spell.globalIndex || (hash32(`${spell.page || 1}:${spell.title}`) % 1000) + 1;
  const local = spell.localIndex || ((global - 1) % 100) + 1;
  const signature = spell.signature || hash32(spell.id || spell.title).toString(16).padStart(8, '0').toUpperCase();
  const config = SONIC_KIND_CONFIG[intent.kind] || SONIC_KIND_CONFIG[spell.engine] || SONIC_DEFAULT_CONFIG;
  const vector = sonicVector({ ...spell, signature, globalIndex: global }, 8);
  const sort = isSortingSpell(spell);
  const inv = inversionCount(vector);
  const baseHash = hash32(`${signature}:${spell.title}:${intent.kind}:${visual.code}:audio`);
  const rootMidi = 36 + ((global * 7 + baseHash) % 38);
  const rootHz = Number(midiToHz(rootMidi).toFixed(2));
  const modHz = Number((0.45 + (hash32(`${signature}:mod`) % 900) / 100).toFixed(2));
  const tempoBpm = 72 + (baseHash % 83);
  const hue = (hash32(`${visual.code}:sonic-hue`) + global * 23) % 360;
  const intensity = Number((0.42 + (hash32(`${signature}:intensity`) % 42) / 100).toFixed(2));
  const shimmerHz = Number((rootHz * (2.5 + (hash32(`${signature}:shimmer`) % 70) / 100)).toFixed(2));
  const ratios = config.ratios.map((ratio, i) => Number((ratio + (vector[i % vector.length] - 5) * 0.006).toFixed(3)));
  const fingerprint = hash32(`${global}:${signature}:${intent.kind}:${config.kernel}:${visual.code}:${vector.join(',')}:${ratios.join(',')}`)
    .toString(16)
    .padStart(8, '0')
    .toUpperCase();
  const code = `SR-${String(global).padStart(4, '0')}-${fingerprint.slice(0, 4)}`;
  const kernel = sort ? 'comparison-sort inversion/write trace' : config.kernel;
  const dataset = vector.join('-');
  return {
    code,
    fingerprint,
    kind: intent.kind,
    kernel,
    waveform: sort ? 'triangle' : config.wave,
    rootHz,
    modHz,
    shimmerHz,
    tempoBpm,
    hue,
    intensity,
    ratios,
    vector,
    inversionCount: inv,
    local,
    global,
    isSorting: sort,
    dataset,
    proof: `${code}; ${kernel}; root ${rootHz}Hz; vector [${dataset}] from title/tags/signature; hover plays the first three mapped states; click plays the full vector with ${sort ? `${inv} inversions as write pressure` : `${intent.kind} ratio set ${ratios.join('/')}`}; Run starts a continuous frame-tick score from tempo/vector/kernel${sort ? ', with hand-built sorting demos adding live state events' : ''}; shimmer ${Math.round(shimmerHz)}Hz is tied to the same hash.`
  };
}

function applyCardAudioMetadata(card, audio) {
  if (!card || !audio) return;
  card.dataset.audioCode = audio.code;
  card.dataset.audioFingerprint = audio.fingerprint;
  card.dataset.audioKind = audio.kind;
  card.dataset.audioKernel = audio.kernel;
  card.dataset.audioRoot = String(audio.rootHz);
  card.dataset.audioMod = String(audio.modHz);
  card.dataset.audioShimmer = String(audio.shimmerHz);
  card.dataset.audioTempo = String(audio.tempoBpm);
  card.dataset.audioWave = audio.waveform;
  card.dataset.audioRatios = audio.ratios.join(',');
  card.dataset.audioVector = audio.dataset;
  card.dataset.audioSort = audio.isSorting ? 'true' : 'false';
  card.style.setProperty('--sonic-hue', String(audio.hue));
  card.style.setProperty('--sonic-intensity', String(audio.intensity));
  card.style.setProperty('--sonic-spark', `${Math.max(0.16, Math.min(0.82, audio.intensity))}`);
  const canvas = card.querySelector('canvas');
  if (canvas) canvas.dataset.audioCode = audio.code;
}

const DESCRIPTION_FRAMES = [
  ({ title, group, cue, recordId, signature, visualMode, semantic, recipe }) => `${title} is filed under ${group.name} because it ${cue}. The narrow claim is ${group.lore}; record ${recordId} carries ${signature}, ${semantic.label}, and recipe ${recipe.code}.`,
  ({ title, group, cue, recordId, signature, visualMode, semantic, recipe }) => `Record ${recordId} treats ${title} as ${group.name} work: it ${cue}. The canvas uses ${semantic.label} through ${recipe.label}, seeded by ${signature}, so the structure is inspectable instead of ornamental.`,
  ({ title, group, cue, recordId, signature, visualMode, semantic, recipe }) => `${title} belongs here only if its real technical role matches ${group.name}. In this catalog it ${cue}; ${visualMode.label} resolves into ${semantic.label} with ${recipe.code}.`,
  ({ title, group, cue, recordId, signature, visualMode, semantic, recipe }) => `${title}: ${group.lore}. Its factual hook is that it ${cue}; record ${recordId} draws ${semantic.label} with ${recipe.lens}, ${recipe.marker} marks, and record-specific state.`,
  ({ title, group, cue, recordId, signature, visualMode, semantic, recipe }) => `The ${group.name} assignment for ${title} is deliberately falsifiable: it should ${cue}. Signature ${signature} binds this prose to ${semantic.label} and visual recipe ${recipe.code}.`,
  ({ title, group, cue, recordId, signature, visualMode, semantic, recipe }) => `${title} is not decoration here; it is record ${recordId}. It ${cue}, while the renderer maps ${semantic.label} and ${recipe.label} from title, engine, tags, and signature ${signature}.`
];

function buildSpellDescription(spell, volume, group, seed, recordId, signature, visualMode, visualBlueprint, globalIndex) {
  const mechanism = MECHANISM_BY_ENGINE[spell.engine] || MECHANISM_BY_ENGINE.graph;
  const cue = inferTitleCue(spell.title, spell.engine);
  const semantic = semanticVisualIntent(spell);
  const recipe = recordVisualRecipe({ ...spell, signature, globalIndex }, semantic);
  const frame = pick(DESCRIPTION_FRAMES, seed, spell.title.length);
  return frame({ title: spell.title, group, cue, recordId, signature, visualMode, visualBlueprint, mechanism, semantic, recipe });
}

function enrichSpellRecord(spell, volume, group, groupIndex, itemIndex) {
  const seed = hash32(`${volume.page}:${group.name}:${spell.title}:${spell.engine}`);
  const recordId = spellRecordId(volume.page, groupIndex, itemIndex);
  const navLabel = spellNavLabel(volume.page, groupIndex, itemIndex);
  const localIndex = groupIndex * 10 + itemIndex + 1;
  const globalIndex = spellGlobalIndex(volume.page, groupIndex, itemIndex);
  const signature = spellSignature(spell, volume, group);
  const visualMode = VISUAL_MODES[Math.abs(seed + volume.page * 17 + groupIndex * 11 + itemIndex * 5) % VISUAL_MODES.length];
  const visualBlueprint = makeVisualBlueprint(spell, volume, group, seed, groupIndex, itemIndex, visualMode, signature);
  const mechanism = MECHANISM_BY_ENGINE[spell.engine] || MECHANISM_BY_ENGINE.graph;
  const verify = VERIFY_BY_ENGINE[spell.engine] || VERIFY_BY_ENGINE.graph;
  const cue = inferTitleCue(spell.title, spell.engine);
  const semanticSpell = { ...spell, page: volume.page, group: group.name, signature, globalIndex, localIndex };
  const semantic = semanticVisualIntent(semanticSpell);
  const recipe = recordVisualRecipe(semanticSpell, semantic);
  const audio = recordAudioRecipe(semanticSpell, semantic, recipe);

  return {
    ...spell,
    page: spell.page || volume.page,
    volumeTitle: spell.volumeTitle || volume.title,
    group: spell.group || group.name,
    visualMode,
    visualBlueprint,
    signature,
    recordId,
    navLabel,
    sectionLetter: SECTION_LETTERS[groupIndex] || 'X',
    sectionIndex: itemIndex + 1,
    localIndex,
    globalIndex,
    button: buildSpellButton(spell.title, seed),
    desc: spell.desc || buildSpellDescription(spell, volume, group, seed, recordId, signature, visualMode, visualBlueprint, globalIndex),
    context: spell.context || buildUseContext(spell, group),
    audio,
    proof: {
      record: `${recordId} / ${signature}`,
      mechanism: `${spell.title}: ${cue}; engine check: ${mechanism}`,
      visual: `${semantic.label}; ${recipe.code}; ${recipe.label}; base mode ${visualMode.label}; palette ${visualBlueprint.palette.join('-')}; responsive canvas signature ${signature}`,
      sonic: audio.proof,
      verify: `Verify ${spell.title}: ${verify}; expected group is ${group.name}.`,
      falsify: `Reject ${recordId} if ${spell.title} is unsourceable, categorized outside ${group.name}, duplicates another title, or its canvas hash disagrees with ${signature}.`
    }
  };
}

function buildVolumeSpells() {
  return VOLUME_BLUEPRINTS.flatMap((volume) => volume.groups.flatMap((group, groupIndex) =>
    group.items.map((title, itemIndex) => {
      const seed = hash32(`${volume.page}:${group.name}:${title}`);
      const spell = {
        id: slugifyTitle(title, volume.page),
        page: volume.page,
        volumeTitle: volume.title,
        group: group.name,
        title,
        tags: group.tags,
        engine: group.engine
      };
      return enrichSpellRecord(spell, volume, group, groupIndex, itemIndex);
    })
  ));
}

const GENERATED_VOLUME_SPELLS = buildVolumeSpells();
const EXTRA_SPELL_RECORDS = EXTRA_SPELLS.map((spell, index) => enrichSpellRecord(
  {
    ...spell,
    page: 1,
    volumeTitle: 'The Original 100: Classical Rites, Forbidden Texts, and First Apocrypha',
    group: 'Volume I Apocrypha'
  },
  {
    page: 1,
    title: 'The Original 100: Classical Rites, Forbidden Texts, and First Apocrypha'
  },
  {
    name: 'Volume I Apocrypha',
    tags: spell.tags,
    engine: spell.engine,
    lore: 'hand-curated addenda to the original set'
  },
  Math.floor(index / 10),
  index % 10
));

function createSpellCard(spell, index = 0) {
  const article = document.createElement('article');
  article.className = 'spell-card';
  article.dataset.algo = spell.id;
  article.id = 'record-' + spell.id;
  article.dataset.volumePage = String(spell.page || 1);
  article.dataset.localIndex = String(spell.localIndex || index + 1);
  article.dataset.globalIndex = String(spell.globalIndex || index + 1);
  article.dataset.navLabel = spell.navLabel || spellNavLabel(spell.page || 1, Math.floor(index / 10), index % 10);
  article.dataset.title = spell.title;
  article.dataset.engine = spell.engine || 'graph';
  applyCardAudioMetadata(article, spell.audio || recordAudioRecipe(spell));
  if ((index + 1) % 17 === 0) article.classList.add('featured');

  const glyph = document.createElement('div');
  glyph.className = 'card-glyph';
  const canvas = document.createElement('canvas');
  canvas.id = 'c-' + spell.id;
  canvas.width = 340;
  canvas.height = 200;
  glyph.appendChild(canvas);

  const body = document.createElement('div');
  body.className = 'card-body';
  const badge = document.createElement('div');
  badge.className = 'record-label';
  badge.textContent = `${article.dataset.navLabel} · ${String(article.dataset.globalIndex).padStart(3, '0')}/1000`;
  const meta = document.createElement('div');
  meta.className = 'card-meta';
  for (const tag of spell.tags) {
    const span = document.createElement('span');
    span.className = 'tag ' + (EXTRA_TAG_CLASS[tag] || 'tag-magic');
    span.textContent = tag;
    meta.appendChild(span);
  }

  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = spell.title;
  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = spell.desc;

  const proof = document.createElement('div');
  proof.className = 'spell-proof';
  if (spell.proof) {
    const rows = [
      ['Record', spell.proof.record],
      ['Mechanism', spell.proof.mechanism],
      ['Visual', spell.proof.visual],
      ['Sonic', spell.proof.sonic || (spell.audio && spell.audio.proof) || recordAudioRecipe(spell).proof],
      ['Verify', spell.proof.verify],
      ['Falsify', spell.proof.falsify]
    ];
    for (const [label, value] of rows) {
      const row = document.createElement('p');
      row.className = 'proof-row';
      const strong = document.createElement('strong');
      strong.textContent = label;
      const span = document.createElement('span');
      span.textContent = value;
      row.append(strong, span);
      proof.appendChild(row);
    }
  }

  const context = document.createElement('div');
  context.className = 'spell-context';
  if (spell.context) {
    const rows = [
      ['Use', spell.context.use],
      ['Industry', spell.context.industry],
      ['Careers', spell.context.careers],
      ['Source', spell.context.source]
    ];
    for (const [label, value] of rows) {
      const row = document.createElement('p');
      row.className = 'context-row';
      const strong = document.createElement('strong');
      strong.textContent = label;
      const span = document.createElement('span');
      span.textContent = value;
      row.append(strong, span);
      context.appendChild(row);
    }
  }

  const controls = document.createElement('div');
  controls.className = 'card-controls';
  controls.append(
    createCardButton('btn-run', spell.id, '⟳ ' + spell.button),
    createCardButton('btn-stop', spell.id, 'Stop'),
    createCardButton('btn-reset', spell.id, 'Reset')
  );

  if (spell.proof) body.append(badge, meta, title, desc, proof, context, controls);
  else body.append(badge, meta, title, desc, controls);
  article.append(glyph, body);
  applyRecordAuditMetadata(article);
  ensureCardTechnicalPanel(article);
  return article;
}

function mountExtraSpells() {
  const grid = document.querySelector('[data-extra-grid]');
  if (!grid || grid.dataset.mounted === 'true') return;
  const frag = document.createDocumentFragment();
  EXTRA_SPELL_RECORDS.forEach((spell, index) => frag.appendChild(createSpellCard(spell, index)));
  grid.appendChild(frag);
  grid.dataset.mounted = 'true';
}

function appendProofRows(container, rows) {
  for (const [label, value] of rows) {
    const row = document.createElement('p');
    row.className = 'proof-row';
    const strong = document.createElement('strong');
    strong.textContent = label;
    const span = document.createElement('span');
    span.textContent = value;
    row.append(strong, span);
    container.appendChild(row);
  }
}

function upsertProofRows(container, rows) {
  const existingRows = [...container.querySelectorAll('.proof-row')];
  for (const [label, value] of rows) {
    let row = existingRows.find(item => item.querySelector('strong')?.textContent === label);
    if (!row) {
      row = document.createElement('p');
      row.className = 'proof-row';
      const strong = document.createElement('strong');
      strong.textContent = label;
      const span = document.createElement('span');
      row.append(strong, span);
      container.appendChild(row);
      existingRows.push(row);
    }
    row.querySelector('span').textContent = value;
  }
}

function appendContextRows(container, rows) {
  for (const [label, value] of rows) {
    const row = document.createElement('p');
    row.className = 'context-row';
    const strong = document.createElement('strong');
    strong.textContent = label;
    const span = document.createElement('span');
    span.textContent = value;
    row.append(strong, span);
    container.appendChild(row);
  }
}

function facetSlug(value) {
  return String(value || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'unknown';
}

function facetLabel(value) {
  return String(value || 'Unknown')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function rowsToObject(card, selector) {
  const rows = {};
  for (const row of card.querySelectorAll(selector)) {
    const key = row.querySelector('strong')?.textContent.trim() || '';
    const value = row.querySelector('span')?.textContent.trim() || '';
    if (key) rows[key] = value;
  }
  return rows;
}

function sourceStatusFromContext(sourceText) {
  if (/record-specific/i.test(sourceText)) return 'record-specific';
  if (/source-class|domain context only|domain-context/i.test(sourceText)) return 'source-class-only';
  return 'needs-review';
}

function visualFamilyFromProof(visualText, engine) {
  const firstClause = String(visualText || '').split(';')[0].trim();
  if (firstClause) return facetSlug(firstClause);
  return facetSlug(engine || 'visual');
}

function ensureSourceStatusBadge(card) {
  const body = card.querySelector('.card-body');
  if (!body) return;
  const status = card.dataset.sourceStatus || 'needs-review';
  const ledger = card.dataset.sourceLedgerId || 'S-???';
  let badge = body.querySelector('.source-status-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.className = 'source-status-badge';
    const label = body.querySelector('.record-label');
    if (label) label.after(badge);
    else body.prepend(badge);
  }
  badge.dataset.sourceStatus = status;
  badge.textContent = status === 'record-specific'
    ? `Source: record-cited · ${ledger}`
    : `Source: class-ledger only · ${ledger}`;
  badge.title = status === 'record-specific'
    ? 'This record has record-specific bibliography.'
    : 'Domain context only. Inventor, first-publication, primary-user, and deployment claims still require record-specific citations.';
}

function applyRecordAuditMetadata(card) {
  const context = rowsToObject(card, '.context-row');
  const proof = rowsToObject(card, '.proof-row');
  const source = context.Source || '';
  card.dataset.sourceLedgerId = source.match(/S-[A-Z]{3}/)?.[0] || '';
  card.dataset.sourceStatus = sourceStatusFromContext(source);
  card.dataset.visualFamily = visualFamilyFromProof(proof.Visual || '', card.dataset.engine || '');
  card.dataset.visualFamilyLabel = facetLabel(card.dataset.visualFamily);
  card.dataset.sonicFamily = card.dataset.audioKind || facetSlug(card.dataset.audioKernel || 'sonic');
  card.dataset.sonicFamilyLabel = facetLabel(card.dataset.sonicFamily);
  ensureSourceStatusBadge(card);
}

function inferEngineForStaticCard(title, tags, id) {
  const text = `${title} ${tags.join(' ')} ${id}`.toLowerCase();
  if (/rsa|shor|crypto|cipher|zero|zk|garbled|commitment|hash/.test(text)) return text.includes('hash') ? 'sketch' : 'crypto';
  if (/quantum|diffusion/.test(text)) return 'quantum';
  if (/proof|logic|sat|algorithm x|dlx|constraint|bayes/.test(text)) return /bayes/.test(text) ? 'probability' : 'logic';
  if (/graph|tree|path|a\*|mcts|search|boyer|moore|suffix|reservoir/.test(text)) return /reservoir/.test(text) ? 'probability' : 'graph';
  if (/sort|anneal|optimization|inverse square|kalman/.test(text)) return /kalman/.test(text) ? 'probability' : 'optimization';
  if (/byzantine|pbft|consensus|distributed|sleep/.test(text)) return 'distributed';
  if (/automata|life|l-system|wave function/.test(text)) return 'automata';
  if (/marching|cubes|perlin|barnes|geometry|physics|voronoi|delaunay/.test(text)) return 'topology';
  if (/bloom|hyperloglog|merkle|minhash|compression|sketch/.test(text)) return 'sketch';
  return 'graph';
}

function buildStaticUseContext(title, tags, id) {
  const engine = inferEngineForStaticCard(title, tags, id);
  const base = CONTEXT_BY_ENGINE[engine] || CONTEXT_BY_ENGINE.graph;
  return [
    ['Use', `${title}: domain-context claim only; relevant to ${base.use}.`],
    ['Industry', base.industry],
    ['Careers', base.careers],
    ['Source', `${base.source}; see docs/SOURCE-LEDGER.md.`]
  ];
}

function buildStaticProofRows(title, tags, id, index) {
  const groupIndex = Math.floor(index / 10);
  const itemIndex = index % 10;
  const recordId = spellRecordId(1, groupIndex, itemIndex);
  const globalIndex = spellGlobalIndex(1, groupIndex, itemIndex);
  const signature = hash32(`static:${id}:${title}:${tags.join('|')}`).toString(16).padStart(8, '0').slice(0, 8).toUpperCase();
  const engine = inferEngineForStaticCard(title, tags, id);
  const group = {
    name: 'Original Hand-Built Rites',
    tags,
    engine,
    lore: 'hand-authored first-volume canvas record'
  };
  const volume = {
    page: 1,
    title: 'The Original 100: Classical Rites, Forbidden Texts, and First Apocrypha'
  };
  const seed = hash32(`static-proof:${id}:${title}:${tags.join('|')}`);
  const visualMode = VISUAL_MODES[Math.abs(seed + groupIndex * 13 + itemIndex * 7) % VISUAL_MODES.length];
  const staticSpell = {
    id,
    page: 1,
    title,
    tags,
    engine,
    group: group.name,
    signature,
    globalIndex,
    localIndex: index + 1
  };
  const visualBlueprint = makeVisualBlueprint(staticSpell, volume, group, seed, groupIndex, itemIndex, visualMode, signature);
  const semantic = semanticVisualIntent(staticSpell);
  const recipe = recordVisualRecipe(staticSpell, semantic);
  const audio = recordAudioRecipe(staticSpell, semantic, recipe);
  const mechanism = MECHANISM_BY_ENGINE[engine] || MECHANISM_BY_ENGINE.graph;
  const verify = VERIFY_BY_ENGINE[engine] || VERIFY_BY_ENGINE.graph;
  return [
    ['Record', `${recordId} / ${signature}`],
    ['Mechanism', `${title}: ${inferTitleCue(title, engine)}; hand-authored canvas routine registered as ${id}; engine check: ${mechanism}; signature ${signature}`],
    ['Visual', `${semantic.label}; ${recipe.code}; ${recipe.label}; hand-authored canvas ${id}; base mode ${visualMode.label}; palette ${visualBlueprint.palette.join('-')}; responsive canvas signature ${signature}`],
    ['Sonic', audio.proof],
    ['Verify', `Verify ${title}: ${verify}; primary record is the Volume I hand-built canvas ${id}.`],
    ['Falsify', `Reject ${recordId} if ${title} is unsourceable, tags misclassify it, signature ${signature} collides, or canvas ${id} does not render.`]
  ];
}

function buildStaticAudioRecipe(title, tags, id, index) {
  const groupIndex = Math.floor(index / 10);
  const itemIndex = index % 10;
  const globalIndex = spellGlobalIndex(1, groupIndex, itemIndex);
  const signature = hash32(`static:${id}:${title}:${tags.join('|')}`).toString(16).padStart(8, '0').slice(0, 8).toUpperCase();
  const engine = inferEngineForStaticCard(title, tags, id);
  const staticSpell = {
    id,
    page: 1,
    title,
    tags,
    engine,
    group: 'Original Hand-Built Rites',
    signature,
    globalIndex,
    localIndex: index + 1
  };
  const semantic = semanticVisualIntent(staticSpell);
  const recipe = recordVisualRecipe(staticSpell, semantic);
  return recordAudioRecipe(staticSpell, semantic, recipe);
}

const MATH_BY_ENGINE = {
  automata: 'State update: x[t+1] = F(N(x[t]), constraints, entropy). WFC stores possible tile states and repeatedly collapses the lowest-entropy cell while propagating neighbor constraints.',
  quantum: 'Amplitude update: |psi[t+1]> = U|psi[t]>, with observable probabilities P(i)=|alpha_i|^2. Phase, interference, and measurement drive the visual/audio rhythm.',
  optimization: 'Search update: candidate[t+1] = perturb(candidate[t]); accept if dE <= 0 or exp(-dE/T) > u. Sorting variants expose comparison, displacement, merge, and inversion events.',
  crypto: 'Trapdoor/security sketch: public transform y=f(x) is cheap; inversion without witness/key is hard. Sound uses residue class, witness, bit-length, and hash-derived state vectors.',
  distributed: 'Consensus sketch: nodes exchange messages until quorum or fault threshold condition holds, typically n >= 3f+1 for Byzantine agreement families.',
  graph: 'Traversal/search sketch: frontier[t+1] = expand(frontier[t]) under cost, heuristic, or adjacency constraints; priorities and backtracking alter cadence.',
  topology: 'Geometry/topology sketch: sample scalar or combinatorial structure, classify local cells/simplices, then stitch compatible boundaries into a global object.',
  probability: 'Estimator update: posterior or sample state changes by observation; variance, sample count, and confidence are the measurable invariants.',
  logic: 'Exact-cover / constraint sketch: choose constrained column, enumerate compatible rows, cover conflicts, recurse, and uncover on backtrack.',
  sketch: 'Streaming sketch update: compact state S receives item x through hashes/projections; queries trade exactness for bounded memory and known error behavior.'
};

function cardTitle(card) {
  return card.querySelector('.card-title')?.textContent?.trim() || card.dataset.title || card.dataset.algo || 'Untitled';
}

function cardTags(card) {
  return [...card.querySelectorAll('.tag')].map(tag => tag.textContent.trim()).filter(Boolean);
}

function cardAudioVector(card) {
  return (card.dataset.audioVector || '')
    .split('-')
    .map(value => Number(value))
    .filter(value => Number.isFinite(value));
}

function cardAudioRatios(card) {
  return (card.dataset.audioRatios || '')
    .split(',')
    .map(value => Number(value))
    .filter(value => Number.isFinite(value));
}

function buildCodePanelText(card) {
  const id = card.dataset.algo || 'unknown';
  const title = cardTitle(card);
  const nav = card.dataset.navLabel || 'unlabeled';
  const engine = card.dataset.engine || inferEngineForStaticCard(title, cardTags(card), id);
  const sourceKind = HAND_BUILT_ALGO_IDS.includes(id)
    ? 'hand-built canvas runner registered in runners[id]'
    : 'generated semantic renderer registered through runExtraSpell(c, spell)';
  const fingerprint = card.dataset.audioFingerprint || 'pending';
  const kernel = card.dataset.audioKernel || 'metadata-state vector trace';
  const vector = cardAudioVector(card);
  const ratios = cardAudioRatios(card);
  return [
    `// ${nav} · ${title}`,
    `// Real runtime path on this page. This snippet can be run in DevTools.`,
    `const id = ${JSON.stringify(id)};`,
    `const card = document.querySelector('.spell-card[data-algo="${id}"]');`,
    `window.__grimoireRuntime.runRecord(id, { audible: true, source: "code-tab" });`,
    `window.__grimoireRuntime.stopRecord(id);`,
    ``,
    `// Visual engine: ${sourceKind}`,
    `// Evidence fields wired into the DOM and Web Audio scheduler:`,
    `const record = {`,
    `  nav: ${JSON.stringify(nav)},`,
    `  title: ${JSON.stringify(title)},`,
    `  engine: ${JSON.stringify(engine)},`,
    `  audioCode: card.dataset.audioCode,`,
    `  fingerprint: ${JSON.stringify(fingerprint)},`,
    `  kernel: ${JSON.stringify(kernel)},`,
    `  vector: ${JSON.stringify(vector)},`,
    `  ratios: ${JSON.stringify(ratios)},`,
    `  rootHz: Number(card.dataset.audioRoot),`,
    `  tempoBpm: Number(card.dataset.audioTempo)`,
    `};`,
    ``,
    `// Honesty boundary: generated records are deterministic visual/sonic`,
    `// reconstructions from curated metadata, not full reference libraries.`
  ].join('\n');
}

function buildMathPanelText(card) {
  const id = card.dataset.algo || 'unknown';
  const title = cardTitle(card);
  const engine = card.dataset.engine || inferEngineForStaticCard(title, cardTags(card), id);
  const root = Number(card.dataset.audioRoot || 220);
  const tempo = Number(card.dataset.audioTempo || 96);
  const mod = Number(card.dataset.audioMod || 3);
  const shimmer = Number(card.dataset.audioShimmer || 880);
  const vector = cardAudioVector(card);
  const ratios = cardAudioRatios(card);
  const fingerprint = card.dataset.audioFingerprint || hash32(`${id}:${title}`).toString(16).toUpperCase();
  return [
    `${title} · ${card.dataset.navLabel || id}`,
    ``,
    `Core math family:`,
    MATH_BY_ENGINE[engine] || MATH_BY_ENGINE.graph,
    ``,
    `Live sonification used by this page:`,
    `v = [${vector.join(', ')}]`,
    `r = [${ratios.map(value => Number(value.toFixed ? value.toFixed(4) : value)).join(', ')}]`,
    `rootHz = ${root.toFixed(2)}, tempoBpm = ${tempo.toFixed(2)}, modHz = ${mod.toFixed(2)}, shimmerHz = ${shimmer.toFixed(2)}`,
    `beatIndex = (beat * stride + frame + hash(kernel)) mod |v|`,
    `f_beat = rootHz * r[k] * octave * (1 + v[k]/78 + framePhase/42 + variance/190)`,
    `dt = clamp((60/tempoBpm) / familyDivisor * rhythmBend / cadenceRatio, 0.052, 0.34)`,
    `gain = clamp(base + intensity + liveEnergy + variance, bounded for browser safety)`,
    ``,
    `Fingerprint: ${fingerprint}`,
    `Falsifiable check: if the DOM vector, kernel, frequency fields, or scheduler equations above do not match viz.js, this tab is wrong.`
  ].join('\n');
}

function buildVisualPanelText(card) {
  const id = card.dataset.algo || 'unknown';
  const title = cardTitle(card);
  return [
    `${card.dataset.navLabel || id} · ${String(card.dataset.globalIndex || '?').padStart(3, '0')}/1000`,
    `${title}`,
    ``,
    `Visual canvas: #c-${id}`,
    `Audio code: ${card.dataset.audioCode || 'pending'}`,
    `Kernel: ${card.dataset.audioKernel || 'pending'}`,
    `Mode: run canvas frames; emit live events where the hand-built runner exposes algorithmic operations.`
  ].join('\n');
}

function createCardButton(className, target, text) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.dataset.target = target;
  button.textContent = text;
  return button;
}

function ensureCardControls(card, runLabel) {
  const id = card.dataset.algo;
  if (!id) return;
  let controls = card.querySelector('.card-controls');
  const body = card.querySelector('.card-body');
  if (!controls && body) {
    controls = document.createElement('div');
    controls.className = 'card-controls';
    body.appendChild(controls);
  }
  if (!controls) return;
  let runButton = controls.querySelector('.btn-run');
  if (!runButton) {
    runButton = createCardButton('btn-run', id, runLabel || 'Run');
    controls.prepend(runButton);
  }
  runButton.type = 'button';
  runButton.dataset.target = id;
  if (runLabel) runButton.textContent = runLabel;
  if (!controls.querySelector('.btn-stop')) controls.appendChild(createCardButton('btn-stop', id, 'Stop'));
  if (!controls.querySelector('.btn-reset')) controls.appendChild(createCardButton('btn-reset', id, 'Reset'));
}

function ensureCardTechnicalPanel(card) {
  const body = card.querySelector('.card-body');
  if (!body) return;
  const existingPanel = card.querySelector('.card-technical');
  if (existingPanel) {
    const refreshed = {
      visual: buildVisualPanelText(card),
      code: buildCodePanelText(card),
      math: buildMathPanelText(card)
    };
    for (const [key, text] of Object.entries(refreshed)) {
      const pre = existingPanel.querySelector(`[data-tech-panel="${key}"] pre`);
      if (pre) pre.textContent = text;
    }
    return;
  }
  const panel = document.createElement('div');
  panel.className = 'card-technical';
  panel.dataset.techFor = card.dataset.algo || '';

  const tabs = document.createElement('div');
  tabs.className = 'card-tabs';
  tabs.setAttribute('role', 'tablist');
  const content = document.createElement('div');
  content.className = 'tech-panels';

  const tabSpecs = [
    ['visual', 'Visual', buildVisualPanelText(card)],
    ['code', 'Code', buildCodePanelText(card)],
    ['math', 'Math', buildMathPanelText(card)]
  ];

  for (const [key, label, text] of tabSpecs) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.dataset.techTab = key;
    tab.textContent = label;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(key === 'visual'));
    tab.classList.toggle('active', key === 'visual');

    const section = document.createElement('div');
    section.className = 'tech-panel';
    section.dataset.techPanel = key;
    section.classList.toggle('active', key === 'visual');
    section.setAttribute('role', 'tabpanel');
    const pre = document.createElement('pre');
    pre.textContent = text;
    section.appendChild(pre);
    tabs.appendChild(tab);
    content.appendChild(section);
  }

  panel.append(tabs, content);
  body.appendChild(panel);
}

function applyStaticCardIdentity(card, index) {
  const groupIndex = Math.floor(index / 10);
  const itemIndex = index % 10;
  const navLabel = spellNavLabel(1, groupIndex, itemIndex);
  const globalIndex = spellGlobalIndex(1, groupIndex, itemIndex);
  card.id = card.id || 'record-' + (card.dataset.algo || `v1-${index + 1}`);
  card.dataset.volumePage = '1';
  card.dataset.localIndex = String(index + 1);
  card.dataset.globalIndex = String(globalIndex);
  card.dataset.navLabel = navLabel;
  const title = cardTitle(card);
  const tags = cardTags(card);
  card.dataset.title = title;
  card.dataset.engine = inferEngineForStaticCard(title, tags, card.dataset.algo || `v1-${index + 1}`);

  const glyph = card.querySelector('.card-glyph');
  glyph?.querySelector('.record-label')?.remove();
  const body = card.querySelector('.card-body');
  if (body && !body.querySelector('.record-label')) {
    const badge = document.createElement('div');
    badge.className = 'record-label';
    badge.textContent = `${navLabel} · ${String(globalIndex).padStart(3, '0')}/1000`;
    body.prepend(badge);
  }

  const recordRow = [...card.querySelectorAll('.proof-row')].find(row => row.querySelector('strong')?.textContent === 'Record');
  if (recordRow) {
    const span = recordRow.querySelector('span');
    const existing = span?.textContent || '';
    const signature = existing.includes('/') ? existing.split('/').pop().trim() : hash32(`static-record:${card.dataset.algo}:${navLabel}`).toString(16).padStart(8, '0').slice(0, 8).toUpperCase();
    span.textContent = `${spellRecordId(1, groupIndex, itemIndex)} / ${signature}`;
  }
}

function mountStaticProofPanels() {
  document.querySelectorAll('[data-volume-one] .spell-card').forEach((card, index) => {
    applyStaticCardIdentity(card, index);
    const title = card.querySelector('.card-title')?.textContent?.trim() || card.dataset.algo || 'Untitled';
    const tags = [...card.querySelectorAll('.tag')].map(tag => tag.textContent.trim()).filter(Boolean);
    const id = card.dataset.algo || slugifyTitle(title, 1);
    applyCardAudioMetadata(card, buildStaticAudioRecipe(title, tags, id, index));
    ensureCardControls(card, '⟳ ' + buildSpellButton(title, hash32(`static-button:${id}:${title}`)));
    const proofRows = buildStaticProofRows(title, tags, id, index);
    if (card.querySelector('.spell-proof')) {
      upsertProofRows(card.querySelector('.spell-proof'), proofRows);
      if (!card.querySelector('.spell-context')) {
        const context = document.createElement('div');
        context.className = 'spell-context';
        appendContextRows(context, buildStaticUseContext(title, tags, id));
        card.querySelector('.spell-proof')?.after(context);
      }
      applyRecordAuditMetadata(card);
      ensureCardTechnicalPanel(card);
      return;
    }
    const proof = document.createElement('div');
    proof.className = 'spell-proof';
    appendProofRows(proof, proofRows);
    card.querySelector('.card-desc')?.after(proof);
    if (!card.querySelector('.spell-context')) {
      const context = document.createElement('div');
      context.className = 'spell-context';
      appendContextRows(context, buildStaticUseContext(title, tags, id));
      proof.after(context);
    }
    applyRecordAuditMetadata(card);
    ensureCardTechnicalPanel(card);
  });
}

function drawExtraCaption(ctx, W, H, spell, text) {
  ctx.fillStyle = 'rgba(10,9,12,0.62)';
  ctx.fillRect(0, H - 24, W, 24);
  ctx.fillStyle = '#ffd700';
  ctx.font = '9px Space Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(text + ' | ' + spell.title, 8, H - 9);
}

function extraBg(ctx, W, H) {
  ctx.fillStyle = getThemeColor('#0a0b0f', '#f4f0ff');
  ctx.fillRect(0, 0, W, H);
}

function extraRand(seed, i) {
  return (hash32(seed + ':' + i) % 10000) / 10000;
}

function drawUndecidable(ctx, W, H, t, seed, spell) {
  extraBg(ctx, W, H);
  const cols = 18, rows = 8;
  const cell = Math.min((W - 24) / cols, (H - 44) / rows);
  const ox = (W - cols * cell) / 2;
  const oy = 12;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const bit = (hash32(seed + x * 31 + y * 997 + Math.floor(t / 18)) >>> ((x + y) % 12)) & 1;
      const diagonal = x === (y * 2 + Math.floor(t / 16)) % cols;
      ctx.fillStyle = diagonal ? '#ffd700' : bit ? 'rgba(255,60,172,0.7)' : 'rgba(157,92,255,0.14)';
      ctx.fillRect(ox + x * cell + 1, oy + y * cell + 1, cell - 2, cell - 2);
    }
  }
  ctx.strokeStyle = '#ff3cac';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox + cols * cell, oy + rows * cell);
  ctx.stroke();
  drawExtraCaption(ctx, W, H, spell, 'diagonalization eats the oracle');
}

function drawQuantumWeb(ctx, W, H, t, seed, spell) {
  extraBg(ctx, W, H);
  const cx = W / 2, cy = (H - 20) / 2;
  for (let r = 12; r < Math.max(W, H); r += 16) {
    const phase = t * 0.04 + r * 0.08 + seed * 0.001;
    ctx.strokeStyle = `hsla(${190 + Math.sin(phase) * 90},85%,62%,0.42)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.1, r * 0.45, Math.sin(phase) * 0.7, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2 + t * 0.025;
    const rr = 48 + Math.sin(t * 0.05 + i + seed) * 28;
    ctx.fillStyle = i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#3cffd5' : '#ff3cac';
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.65, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }
  drawExtraCaption(ctx, W, H, spell, 'amplitudes interfere before observation');
}

function drawLogicMatrix(ctx, W, H, t, seed, spell) {
  extraBg(ctx, W, H);
  const cols = 10, rows = 6;
  const cell = Math.min((W - 32) / cols, (H - 54) / rows);
  const ox = (W - cols * cell) / 2;
  const oy = 18;
  const activeCol = Math.floor(t / 14) % cols;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const hot = x === activeCol || ((hash32(seed + y * 41 + x) + Math.floor(t / 9)) % 17 === 0);
      ctx.fillStyle = hot ? '#ffd700' : ((x + y + seed) % 3 === 0 ? 'rgba(60,255,213,0.34)' : 'rgba(157,92,255,0.15)');
      ctx.strokeStyle = '#352f45';
      ctx.fillRect(ox + x * cell, oy + y * cell, cell - 2, cell - 2);
      ctx.strokeRect(ox + x * cell, oy + y * cell, cell - 2, cell - 2);
    }
  }
  ctx.strokeStyle = '#ff3cac';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ox + activeCol * cell + cell / 2, oy);
  ctx.lineTo(ox + ((activeCol + 3) % cols) * cell + cell / 2, oy + rows * cell);
  ctx.stroke();
  drawExtraCaption(ctx, W, H, spell, 'constraints propagate until contradiction blinks');
}

function drawGraphGlyph(ctx, W, H, t, seed, spell) {
  extraBg(ctx, W, H);
  const N = 14;
  const nodes = [];
  const cx = W / 2, cy = (H - 24) / 2;
  for (let i = 0; i < N; i++) {
    const a = i / N * Math.PI * 2 + Math.sin(t * 0.01 + seed) * 0.15;
    const r = 62 + extraRand(seed, i) * 24;
    nodes.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.75 });
  }
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      if ((hash32(seed + i * 101 + j * 17) % 100) > 72) continue;
      const pulse = (i + j + Math.floor(t / 10)) % 7 === 0;
      ctx.strokeStyle = pulse ? '#ffd700' : 'rgba(157,92,255,0.22)';
      ctx.lineWidth = pulse ? 1.8 : 0.8;
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.lineTo(nodes[j].x, nodes[j].y);
      ctx.stroke();
    }
  }
  for (let i = 0; i < N; i++) {
    ctx.fillStyle = i === Math.floor(t / 8) % N ? '#ff3cac' : '#3cffd5';
    ctx.beginPath();
    ctx.arc(nodes[i].x, nodes[i].y, 3.5 + extraRand(seed, i + 90) * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  drawExtraCaption(ctx, W, H, spell, 'structure hides in edges, cuts, and cycles');
}

function drawFlowGlyph(ctx, W, H, t, seed, spell) {
  extraBg(ctx, W, H);
  const layers = [3, 5, 5, 3];
  const nodes = [];
  layers.forEach((count, li) => {
    for (let i = 0; i < count; i++) {
      nodes.push({ layer: li, i, x: 28 + li * ((W - 56) / (layers.length - 1)), y: 24 + (i + 1) * ((H - 62) / (count + 1)) });
    }
  });
  for (let li = 0; li < layers.length - 1; li++) {
    const a = nodes.filter(n => n.layer === li);
    const b = nodes.filter(n => n.layer === li + 1);
    for (const u of a) for (const v of b) {
      if ((hash32(seed + u.i * 17 + v.i * 43 + li) % 100) > 56) continue;
      const cap = 0.25 + (hash32(seed + u.i + v.i) % 7) / 7;
      ctx.strokeStyle = `rgba(60,255,213,${cap})`;
      ctx.lineWidth = 0.8 + cap * 2.4;
      ctx.beginPath();
      ctx.moveTo(u.x, u.y);
      ctx.lineTo(v.x, v.y);
      ctx.stroke();
      const p = ((t * 0.02 + cap + li * 0.2) % 1);
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(lerp(u.x, v.x, p), lerp(u.y, v.y, p), 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (const n of nodes) {
    ctx.fillStyle = n.layer === 0 ? '#ff3cac' : n.layer === layers.length - 1 ? '#ffd700' : '#9d5cff';
    ctx.beginPath();
    ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  drawExtraCaption(ctx, W, H, spell, 'capacity pressure searches for a cut');
}

function drawProbabilityGlyph(ctx, W, H, t, seed, spell) {
  extraBg(ctx, W, H);
  const cols = 22;
  for (let i = 0; i < cols; i++) {
    const base = extraRand(seed, i);
    const wave = Math.sin(t * 0.05 + i * 0.65 + seed) * 0.35 + 0.5;
    const v = clamp(base * 0.55 + wave * 0.65, 0, 1);
    const x = 12 + i * ((W - 24) / cols);
    const h = v * (H - 58);
    ctx.fillStyle = `hsla(${180 + v * 95},85%,58%,0.72)`;
    ctx.fillRect(x, H - 32 - h, (W - 30) / cols, h);
  }
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < cols; i++) {
    const x = 12 + i * ((W - 24) / cols);
    const y = 34 + Math.sin(t * 0.06 + i * 0.45 + seed) * 22;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  drawExtraCaption(ctx, W, H, spell, 'belief mass moves through uncertainty');
}

function drawSketchGlyph(ctx, W, H, t, seed, spell) {
  extraBg(ctx, W, H);
  const cols = 16, rows = 4;
  const cell = Math.min((W - 28) / cols, (H - 58) / rows);
  const ox = (W - cols * cell) / 2, oy = 24;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const hit = (hash32(seed + x * 13 + y * 97 + Math.floor(t / 16)) % 100) < 34;
      const probe = (x + y * 3 + Math.floor(t / 12)) % 16 === 0;
      ctx.fillStyle = probe ? '#ffd700' : hit ? 'rgba(60,255,213,0.72)' : 'rgba(157,92,255,0.12)';
      ctx.fillRect(ox + x * cell + 1, oy + y * cell + 1, cell - 2, cell - 2);
    }
  }
  for (let i = 0; i < 7; i++) {
    const x = ox + ((hash32(seed + i + Math.floor(t / 30)) % cols) + 0.5) * cell;
    const y = oy - 9 + (i % rows) * cell;
    ctx.strokeStyle = '#ff3cac';
    ctx.beginPath();
    ctx.moveTo(W / 2, 10);
    ctx.lineTo(x, y + 10);
    ctx.stroke();
  }
  drawExtraCaption(ctx, W, H, spell, 'tiny memory trades exact truth for bounded lies');
}

function drawAutomataGlyph(ctx, W, H, t, seed, spell) {
  extraBg(ctx, W, H);
  const cols = 44, rows = 18;
  const cell = Math.min((W - 20) / cols, (H - 42) / rows);
  const ox = (W - cols * cell) / 2;
  const rule = 30 + (seed % 197);
  let row = new Array(cols).fill(0);
  row[Math.floor(cols / 2)] = 1;
  row[(seed % cols)] = 1;
  for (let y = 0; y < rows; y++) {
    const phaseRow = (y + Math.floor(t / 5)) % rows;
    for (let x = 0; x < cols; x++) {
      if (row[x]) {
        ctx.fillStyle = `hsla(${170 + phaseRow * 8},85%,60%,0.82)`;
        ctx.fillRect(ox + x * cell, 10 + y * cell, cell + 0.5, cell + 0.5);
      }
    }
    const next = new Array(cols).fill(0);
    for (let x = 0; x < cols; x++) {
      const pat = (row[(x - 1 + cols) % cols] << 2) | (row[x] << 1) | row[(x + 1) % cols];
      next[x] = (rule >> pat) & 1;
    }
    row = next;
  }
  drawExtraCaption(ctx, W, H, spell, `local rule ${rule} grows global weirdness`);
}

function drawEvolutionGlyph(ctx, W, H, t, seed, spell) {
  extraBg(ctx, W, H);
  const N = 24;
  for (let i = 0; i < N; i++) {
    const fitness = clamp(extraRand(seed + Math.floor(t / 20), i) * 0.7 + i / N * 0.35, 0, 1);
    const x = 16 + i * ((W - 32) / N);
    const y = 22 + Math.sin(t * 0.05 + i) * 18 + (1 - fitness) * 55;
    ctx.fillStyle = `hsla(${300 - fitness * 130},85%,60%,0.78)`;
    ctx.beginPath();
    ctx.arc(x, y, 3 + fitness * 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,215,0,0.22)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(W / 2, H - 40);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,215,0,0.16)';
  ctx.fillRect(10, H - 58, W - 20, 24);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(10, H - 58, ((t % 120) / 120) * (W - 20), 24);
  drawExtraCaption(ctx, W, H, spell, 'selection pressure reshapes the population');
}

function drawOptimizationGlyph(ctx, W, H, t, seed, spell) {
  extraBg(ctx, W, H);
  const baseY = H - 36;
  ctx.strokeStyle = '#3cffd5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const nx = x / W * Math.PI * 5;
    const y = baseY - (Math.sin(nx + seed) * 25 + Math.sin(nx * 2.7) * 14 + 58);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const p = (t * (0.006 + i * 0.001) + extraRand(seed, i)) % 1;
    const x = p * W;
    const nx = x / W * Math.PI * 5;
    const y = baseY - (Math.sin(nx + seed) * 25 + Math.sin(nx * 2.7) * 14 + 58);
    ctx.fillStyle = i === 0 ? '#ffd700' : '#ff3cac';
    ctx.beginPath();
    ctx.arc(x, y - 5, i === 0 ? 6 : 3, 0, Math.PI * 2);
    ctx.fill();
  }
  drawExtraCaption(ctx, W, H, spell, 'walkers hunt low energy through cursed terrain');
}

function drawDistributedGlyph(ctx, W, H, t, seed, spell) {
  extraBg(ctx, W, H);
  const N = 10;
  const nodes = [];
  const cx = W / 2, cy = (H - 22) / 2;
  for (let i = 0; i < N; i++) {
    const a = i / N * Math.PI * 2;
    nodes.push({ x: cx + Math.cos(a) * 96, y: cy + Math.sin(a) * 58 });
  }
  for (let i = 0; i < N; i++) {
    const j = (i + 1 + (hash32(seed + i) % 4)) % N;
    ctx.strokeStyle = 'rgba(157,92,255,0.28)';
    ctx.beginPath();
    ctx.moveTo(nodes[i].x, nodes[i].y);
    ctx.lineTo(nodes[j].x, nodes[j].y);
    ctx.stroke();
    const p = (t * 0.025 + i / N) % 1;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(lerp(nodes[i].x, nodes[j].x, p), lerp(nodes[i].y, nodes[j].y, p), 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < N; i++) {
    ctx.fillStyle = i === Math.floor(t / 20) % N ? '#ff3cac' : '#3cffd5';
    ctx.beginPath();
    ctx.arc(nodes[i].x, nodes[i].y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  drawExtraCaption(ctx, W, H, spell, 'causality leaks through unreliable messages');
}

function drawCryptoGlyph(ctx, W, H, t, seed, spell) {
  extraBg(ctx, W, H);
  const cols = 8;
  for (let i = 0; i < cols; i++) {
    const x = 18 + i * ((W - 36) / cols);
    const h = 26 + (hash32(seed + i + Math.floor(t / 24)) % 70);
    ctx.fillStyle = i % 2 ? 'rgba(255,60,172,0.58)' : 'rgba(60,255,213,0.58)';
    ctx.fillRect(x, H - 34 - h, (W - 48) / cols, h);
    ctx.fillStyle = '#ffd700';
    ctx.font = '8px Space Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(hash32(seed, i).toString(16).slice(0, 3), x + (W - 48) / cols / 2, H - 38 - h);
  }
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const x1 = 18 + i * ((W - 36) / cols) + 15;
    const x2 = 18 + (i + 1) * ((W - 36) / cols) + 15;
    ctx.moveTo(x1, 32 + Math.sin(t * 0.04 + i) * 10);
    ctx.lineTo(x2, 32 + Math.sin(t * 0.04 + i + 1) * 10);
  }
  ctx.stroke();
  drawExtraCaption(ctx, W, H, spell, 'secrets transform while witnesses verify shadows');
}

function drawTopologyGlyph(ctx, W, H, t, seed, spell) {
  extraBg(ctx, W, H);
  const cx = W / 2, cy = 74;
  for (let k = 0; k < 4; k++) {
    ctx.strokeStyle = `hsla(${170 + k * 45},85%,60%,0.65)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 160; i++) {
      const a = i / 160 * Math.PI * 2;
      const r = 32 + Math.sin(a * (k + 2) + t * 0.03 + seed) * 10;
      const x = cx + Math.cos(a) * (r + k * 12);
      const y = cy + Math.sin(a) * (r * 0.55 + k * 4);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  for (let i = 0; i < 7; i++) {
    const x = 24 + i * 42;
    ctx.strokeStyle = i % 2 ? '#ff3cac' : '#ffd700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, H - 44 - (i % 3) * 7);
    ctx.lineTo(x + 24 + (seed % 13), H - 44 - (i % 3) * 7);
    ctx.stroke();
  }
  drawExtraCaption(ctx, W, H, spell, 'shape persists while coordinates lie');
}

function drawParsingGlyph(ctx, W, H, t, seed, spell) {
  extraBg(ctx, W, H);
  const n = 9;
  const cell = Math.min((W - 28) / n, (H - 46) / n);
  const ox = (W - n * cell) / 2;
  const oy = 14;
  for (let span = 1; span <= n; span++) {
    for (let start = 0; start <= n - span; start++) {
      const x = ox + start * cell + span * cell / 2;
      const y = oy + (span - 1) * cell;
      const hot = (start + span + Math.floor(t / 10)) % 5 === 0;
      ctx.fillStyle = hot ? '#ffd700' : ((hash32(seed + start * 19 + span * 7) % 100) < 42 ? 'rgba(60,255,213,0.46)' : 'rgba(157,92,255,0.12)');
      ctx.fillRect(x - cell / 2 + 1, y + 1, cell - 2, cell - 2);
    }
  }
  drawExtraCaption(ctx, W, H, spell, 'all substrings become possible worlds');
}

function signatureByte(spell, index) {
  const sig = (spell.signature || hash32(spell.id).toString(16).padStart(8, '0')).padEnd(8, '0');
  return parseInt(sig.slice((index * 2) % 8, ((index * 2) % 8) + 2), 16) || 0;
}

function areaForLayout(layout, W, H) {
  const footer = 36;
  const full = { x: 14, y: 12, w: W - 28, h: H - footer - 16 };
  const inset = { x: W - 104, y: 18, w: 86, h: 58 };
  const map = {
    'left-index': [{ x: 70, y: 14, w: W - 88, h: H - footer - 18 }, { x: 16, y: 20, w: 42, h: H - footer - 28 }],
    'right-index': [{ x: 14, y: 14, w: W - 86, h: H - footer - 18 }, { x: W - 60, y: 20, w: 42, h: H - footer - 28 }],
    'top-ledger': [{ x: 16, y: 46, w: W - 32, h: H - footer - 54 }, { x: 18, y: 14, w: W - 36, h: 24 }],
    'bottom-ledger': [{ x: 16, y: 12, w: W - 32, h: H - footer - 54 }, { x: 18, y: H - footer - 36, w: W - 36, h: 24 }],
    'split-diagonal': [{ x: 18, y: 16, w: W * 0.62, h: H - footer - 22 }, { x: W * 0.55, y: 30, w: W * 0.34, h: H - footer - 48 }],
    'center-orbit': [{ x: 42, y: 16, w: W - 84, h: H - footer - 22 }, { x: W - 102, y: H - footer - 78, w: 82, h: 48 }],
    'wide-core': [{ x: 10, y: 34, w: W - 20, h: H - footer - 62 }, { x: 28, y: 12, w: W - 56, h: 18 }],
    'narrow-core': [{ x: W * 0.24, y: 12, w: W * 0.52, h: H - footer - 16 }, { x: 18, y: 24, w: W * 0.18, h: H - footer - 40 }],
    'corner-proof': [{ x: 20, y: 20, w: W - 126, h: H - footer - 30 }, { x: W - 96, y: 20, w: 78, h: 78 }],
    'two-chamber': [{ x: 16, y: 14, w: W * 0.46, h: H - footer - 20 }, { x: W * 0.53, y: 14, w: W * 0.41, h: H - footer - 20 }],
    'three-band': [{ x: 16, y: 54, w: W - 32, h: H - footer - 86 }, { x: 18, y: 16, w: W - 36, h: 28 }],
    'radial-cabinet': [{ x: 52, y: 12, w: W - 104, h: H - footer - 16 }, { x: 20, y: 26, w: 62, h: 62 }],
    'offset-stack': [{ x: 36, y: 20, w: W - 72, h: H - footer - 34 }, { x: 16, y: H - footer - 74, w: 92, h: 44 }],
    'cross-section': [{ x: 18, y: 18, w: W - 36, h: H - footer - 28 }, { x: W / 2 - 42, y: 20, w: 84, h: H - footer - 32 }],
    'windowed-inset': [full, inset],
    'tilted-frame': [{ x: 30, y: 16, w: W - 60, h: H - footer - 24 }, { x: W - 118, y: 26, w: 94, h: 66 }],
    'deep-margin': [{ x: 44, y: 28, w: W - 88, h: H - footer - 48 }, { x: 14, y: 16, w: 22, h: H - footer - 24 }]
  };
  return map[layout] || [full, inset];
}

function drawMiniFamily(ctx, area, family, t, seed, spell, hues) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(area.x, area.y, area.w, area.h);
  ctx.clip();
  ctx.fillStyle = 'rgba(10,9,12,0.34)';
  ctx.fillRect(area.x, area.y, area.w, area.h);
  ctx.strokeStyle = `hsla(${hues[0]},86%,62%,0.45)`;
  ctx.strokeRect(area.x, area.y, area.w, area.h);

  const advancedFamilies = new Set(['bezier', 'axes', 'plane', 'mesh3d', 'implicit', 'voronoi', 'sankey', 'chord', 'quiver', 'phase', 'tensor', 'treemap', 'sunburst', 'spiral', 'braid', 'radar', 'gantt', 'boundary', 'riemann', 'cayley']);
  if (advancedFamilies.has(family)) {
    drawAdvancedFamily(ctx, family, area, t, seed, spell, { density: 4 + signatureByte(spell, 1) % 5, mark: family }, hues);
    ctx.restore();
    return;
  }

  if (family === 'network' || family === 'flow') {
    const n = 4 + (signatureByte(spell, 2) % 5);
    const pts = [];
    for (let i = 0; i < n; i++) {
      pts.push({
        x: area.x + 8 + (signatureByte(spell, i) / 255) * (area.w - 16),
        y: area.y + 8 + (signatureByte(spell, i + 3) / 255) * (area.h - 16)
      });
    }
    for (let i = 0; i < pts.length - 1; i++) {
      ctx.strokeStyle = `hsla(${hues[(i + 1) % hues.length]},86%,62%,0.48)`;
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
      ctx.stroke();
    }
    pts.forEach((p, i) => {
      ctx.fillStyle = i === Math.floor(t / 18) % pts.length ? '#ffd700' : `hsla(${hues[i % hues.length]},86%,62%,0.82)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (family === 'matrix' || family === 'memory') {
    const cols = 5 + (signatureByte(spell, 1) % 5);
    const rows = 3 + (signatureByte(spell, 2) % 4);
    const cw = area.w / cols;
    const ch = area.h / rows;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const v = hash32(`${spell.signature}:${family}:${x}:${y}`) % 100;
      ctx.fillStyle = v < 35 ? `hsla(${hues[(x + y) % hues.length]},86%,62%,0.66)` : 'rgba(255,255,255,0.07)';
      ctx.fillRect(area.x + x * cw + 1, area.y + y * ch + 1, cw - 2, ch - 2);
    }
  } else if (family === 'proof' || family === 'automata') {
    const n = 5 + (signatureByte(spell, 0) % 5);
    let px = area.x + 8, py = area.y + area.h / 2;
    for (let i = 0; i < n; i++) {
      const x = area.x + 8 + i * ((area.w - 16) / Math.max(1, n - 1));
      const y = area.y + area.h / 2 + Math.sin(t * 0.04 + i + seed) * (area.h * 0.24);
      ctx.strokeStyle = `hsla(${hues[i % hues.length]},86%,62%,0.54)`;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = i % 2 ? '#ffd700' : `hsla(${hues[(i + 1) % hues.length]},86%,62%,0.78)`;
      ctx.fillRect(x - 3, y - 3, 6, 6);
      px = x; py = y;
    }
  } else {
    const bars = 8 + (signatureByte(spell, 1) % 8);
    for (let i = 0; i < bars; i++) {
      const h = 4 + (signatureByte(spell, i) / 255) * (area.h - 8);
      ctx.fillStyle = `hsla(${hues[i % hues.length]},86%,62%,0.68)`;
      ctx.fillRect(area.x + i * area.w / bars + 1, area.y + area.h - h, area.w / bars - 2, h);
    }
  }
  ctx.restore();
}

function drawArrow(ctx, x1, y1, x2, y2, color) {
  const recipe = ctx.__visualRecipe;
  ctx.save();
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color;
  if (recipe?.line === 'dashed') ctx.setLineDash([5, 4]);
  if (recipe?.line === 'haystack') {
    ctx.globalAlpha *= 0.72;
    ctx.lineWidth = Math.max(1, ctx.lineWidth * 0.75);
  }
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  if (recipe?.line === 'bezier' || recipe?.line === 'ribbon' || recipe?.line === 'magnetic') {
    const bend = recipe.line === 'magnetic' ? 0.34 : 0.22;
    const mx = (x1 + x2) / 2 + Math.sin(recipe.phase || 0) * (y2 - y1) * bend;
    const my = (y1 + y2) / 2 - Math.cos(recipe.phase || 0) * (x2 - x1) * bend;
    ctx.quadraticCurveTo(mx, my, x2, y2);
  } else if (recipe?.line === 'stepped' || recipe?.line === 'orthogonal') {
    const mx = recipe.line === 'orthogonal' ? x1 : (x1 + x2) / 2;
    ctx.lineTo(mx, y1);
    ctx.lineTo(mx, y2);
    ctx.lineTo(x2, y2);
  } else {
    ctx.lineTo(x2, y2);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(a - 0.55) * 5, y2 - Math.sin(a - 0.55) * 5);
  ctx.lineTo(x2 - Math.cos(a + 0.55) * 5, y2 - Math.sin(a + 0.55) * 5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function projectIso(x, y, z, area, spin = 0) {
  const sx = Math.cos(spin) * x - Math.sin(spin) * y;
  const sy = Math.sin(spin) * x + Math.cos(spin) * y;
  return {
    x: area.x + area.w / 2 + (sx - sy) * area.w * 0.24,
    y: area.y + area.h * 0.55 + (sx + sy) * area.h * 0.12 - z * area.h * 0.18
  };
}

function drawAdvancedFamily(ctx, family, area, t, seed, spell, blueprint, hues) {
  const baseHue = (hues[0] + signatureByte(spell, 0)) % 360;
  const hot = `hsla(${baseHue},88%,62%,0.82)`;
  const warm = `hsla(${(hues[1] + 24) % 360},88%,62%,0.70)`;
  const gold = 'rgba(255,215,0,0.84)';
  const faint = `hsla(${baseHue},80%,60%,0.17)`;
  const density = Math.max(4, blueprint.density || 7);
  const ox = area.x, oy = area.y, bw = area.w, bh = area.h;

  ctx.save();
  ctx.beginPath();
  ctx.rect(ox, oy, bw, bh);
  ctx.clip();

  switch (family) {
    case 'bezier': {
      const curves = 3 + signatureByte(spell, 1) % 4;
      for (let i = 0; i < curves; i++) {
        const y1 = oy + (i + 1) * bh / (curves + 1);
        const c1x = ox + bw * (0.2 + (signatureByte(spell, i) / 255) * 0.25);
        const c2x = ox + bw * (0.62 + (signatureByte(spell, i + 2) / 255) * 0.25);
        const wobble = Math.sin(t * 0.025 + i + seed) * bh * 0.18;
        ctx.strokeStyle = i % 2 ? warm : hot;
        ctx.lineWidth = 1.4 + i * 0.2;
        ctx.beginPath();
        ctx.moveTo(ox + 8, y1);
        ctx.bezierCurveTo(c1x, oy + bh * 0.15 + wobble, c2x, oy + bh * 0.85 - wobble, ox + bw - 8, y1);
        ctx.stroke();
        ctx.fillStyle = gold;
        [c1x, c2x].forEach((x, k) => {
          ctx.beginPath();
          ctx.arc(x, k ? oy + bh * 0.85 - wobble : oy + bh * 0.15 + wobble, 2.8, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      break;
    }
    case 'axes':
    case 'riemann': {
      const x0 = ox + 14;
      const y0 = oy + bh - 14;
      ctx.strokeStyle = faint;
      for (let i = 0; i <= 6; i++) {
        const x = ox + 12 + i * (bw - 24) / 6;
        ctx.beginPath();
        ctx.moveTo(x, oy + 8);
        ctx.lineTo(x, y0);
        ctx.stroke();
      }
      for (let i = 0; i <= 4; i++) {
        const y = oy + 8 + i * (bh - 22) / 4;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(ox + bw - 8, y);
        ctx.stroke();
      }
      ctx.strokeStyle = gold;
      ctx.beginPath();
      ctx.moveTo(x0, oy + 8);
      ctx.lineTo(x0, y0);
      ctx.lineTo(ox + bw - 8, y0);
      ctx.stroke();
      if (family === 'riemann') {
        const bars = 8 + signatureByte(spell, 2) % 9;
        for (let i = 0; i < bars; i++) {
          const x = x0 + i * (bw - 28) / bars;
          const v = 0.35 + 0.5 * (Math.sin(i * 0.75 + seed + t * 0.018) * 0.5 + 0.5);
          ctx.fillStyle = `hsla(${baseHue + i * 14},86%,60%,0.38)`;
          ctx.fillRect(x, y0 - v * (bh - 28), (bw - 30) / bars - 2, v * (bh - 28));
        }
      }
      ctx.strokeStyle = hot;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const u = i / 80;
        const x = x0 + u * (bw - 28);
        const y = y0 - (0.45 + 0.32 * Math.sin(u * Math.PI * 2 + seed) + 0.12 * Math.cos(u * 10 + t * 0.02)) * (bh - 28);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      break;
    }
    case 'plane': {
      const cols = 9, rows = 6;
      ctx.strokeStyle = faint;
      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        for (let j = 0; j <= rows; j++) {
          const x = ox + i * bw / cols;
          const y = oy + j * bh / rows;
          const wx = x + Math.sin((y + t) * 0.035 + seed) * 8;
          const wy = y + Math.sin((x - t) * 0.026 + seed) * 6;
          if (j === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }
      for (let j = 0; j <= rows; j++) {
        ctx.beginPath();
        for (let i = 0; i <= cols; i++) {
          const x = ox + i * bw / cols;
          const y = oy + j * bh / rows;
          const wx = x + Math.sin((y + t) * 0.035 + seed) * 8;
          const wy = y + Math.sin((x - t) * 0.026 + seed) * 6;
          if (i === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }
      break;
    }
    case 'mesh3d': {
      const n = 6;
      const pts = [];
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const nx = (x / (n - 1) - 0.5) * 2;
        const ny = (y / (n - 1) - 0.5) * 2;
        const z = Math.sin(nx * 3 + t * 0.025 + seed) * Math.cos(ny * 3 + seed) * 0.9;
        pts.push(projectIso(nx, ny, z, area, t * 0.004));
      }
      ctx.strokeStyle = faint;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const p = pts[y * n + x];
        if (x < n - 1) { const q = pts[y * n + x + 1]; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        if (y < n - 1) { const q = pts[(y + 1) * n + x]; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      pts.forEach((p, i) => {
        ctx.fillStyle = i % 7 === Math.floor(t / 18) % 7 ? gold : hot;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      });
      break;
    }
    case 'implicit':
    case 'boundary': {
      const cols = 18, rows = 10;
      const cw = bw / cols, ch = bh / rows;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const nx = x / cols * 2 - 1;
        const ny = y / rows * 2 - 1;
        const v = Math.sin(nx * (3 + signatureByte(spell, 1) % 4) + seed) + Math.cos(ny * (4 + signatureByte(spell, 2) % 4) + t * 0.018);
        ctx.fillStyle = family === 'boundary'
          ? (v > 0 ? `hsla(${baseHue},86%,58%,0.34)` : `hsla(${hues[2]},86%,58%,0.20)`)
          : (Math.abs(v) < 0.24 ? gold : `hsla(${baseHue + v * 30},86%,58%,0.18)`);
        ctx.fillRect(ox + x * cw + 1, oy + y * ch + 1, cw - 2, ch - 2);
      }
      break;
    }
    case 'voronoi': {
      const sites = Array.from({ length: 6 + signatureByte(spell, 2) % 5 }, (_, i) => ({
        x: ox + 10 + (signatureByte(spell, i) / 255) * (bw - 20),
        y: oy + 10 + (signatureByte(spell, i + 4) / 255) * (bh - 20)
      }));
      const step = Math.max(8, Math.min(18, bw / 18));
      for (let y = oy; y < oy + bh; y += step) for (let x = ox; x < ox + bw; x += step) {
        let best = 0, bd = Infinity;
        sites.forEach((s, i) => {
          const d = (s.x - x) ** 2 + (s.y - y) ** 2;
          if (d < bd) { bd = d; best = i; }
        });
        ctx.fillStyle = `hsla(${hues[best % hues.length] + best * 18},86%,58%,0.24)`;
        ctx.fillRect(x, y, step - 1, step - 1);
      }
      sites.forEach((s, i) => {
        ctx.fillStyle = i === Math.floor(t / 22) % sites.length ? gold : hot;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }
    case 'sankey': {
      const layers = 4;
      const nodesPer = [2, 3, 3, 2];
      const layersPts = nodesPer.map((count, layer) => Array.from({ length: count }, (_, i) => ({
        x: ox + 18 + layer * (bw - 36) / (layers - 1),
        y: oy + 18 + (i + 1) * (bh - 36) / (count + 1)
      })));
      for (let l = 0; l < layers - 1; l++) {
        layersPts[l].forEach((a, i) => layersPts[l + 1].forEach((b, j) => {
          if ((hash32(`${spell.signature}:${l}:${i}:${j}`) % 100) > 46) return;
          ctx.strokeStyle = `hsla(${hues[(i + j + l) % hues.length]},86%,62%,0.22)`;
          ctx.lineWidth = 2 + (signatureByte(spell, i + j + l) % 5);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.bezierCurveTo(a.x + bw * 0.12, a.y, b.x - bw * 0.12, b.y, b.x, b.y);
          ctx.stroke();
        }));
      }
      layersPts.flat().forEach((p) => { ctx.fillStyle = gold; ctx.fillRect(p.x - 4, p.y - 8, 8, 16); });
      ctx.lineWidth = 1;
      break;
    }
    case 'chord': {
      const cx = ox + bw / 2, cy = oy + bh / 2;
      const r = Math.min(bw, bh) * 0.38;
      const n = 8 + signatureByte(spell, 1) % 7;
      const pts = Array.from({ length: n }, (_, i) => ({ x: cx + Math.cos(i / n * Math.PI * 2) * r, y: cy + Math.sin(i / n * Math.PI * 2) * r }));
      ctx.strokeStyle = faint;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        if ((hash32(`${spell.signature}:chord:${i}:${j}`) % 100) > 24) continue;
        ctx.strokeStyle = `hsla(${baseHue + i * 13},86%,62%,0.28)`;
        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.quadraticCurveTo(cx, cy, pts[j].x, pts[j].y); ctx.stroke();
      }
      pts.forEach((p, i) => { ctx.fillStyle = i % 2 ? hot : gold; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill(); });
      break;
    }
    case 'quiver':
    case 'phase': {
      const cols = 8, rows = 5;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const px = ox + (x + 0.5) * bw / cols;
        const py = oy + (y + 0.5) * bh / rows;
        const dx = Math.sin(y + seed + t * 0.02) * 10 + (family === 'phase' ? -(py - oy - bh / 2) * 0.08 : 0);
        const dy = Math.cos(x + seed - t * 0.018) * 8 + (family === 'phase' ? (px - ox - bw / 2) * 0.06 : 0);
        drawArrow(ctx, px - dx * 0.35, py - dy * 0.35, px + dx * 0.35, py + dy * 0.35, `hsla(${baseHue + x * 12 + y * 18},86%,62%,0.62)`);
      }
      break;
    }
    case 'tensor': {
      const slices = 4 + signatureByte(spell, 1) % 4;
      for (let s = 0; s < slices; s++) {
        const x = ox + 12 + s * 14;
        const y = oy + 10 + s * 9;
        const w = bw - 30 - s * 18;
        const h = bh - 28 - s * 12;
        ctx.strokeStyle = `hsla(${hues[s % hues.length]},86%,62%,0.54)`;
        ctx.strokeRect(x, y, w, h);
        for (let i = 0; i < 8; i++) {
          ctx.fillStyle = `hsla(${baseHue + i * 20},86%,60%,0.22)`;
          ctx.fillRect(x + 4 + (i % 4) * w / 5, y + 4 + Math.floor(i / 4) * h / 3, w / 6, h / 5);
        }
      }
      break;
    }
    case 'treemap': {
      let rects = [{ x: ox + 4, y: oy + 4, w: bw - 8, h: bh - 8, depth: 0 }];
      for (let step = 0; step < 18; step++) {
        const r = rects.shift();
        if (!r) break;
        const split = 0.32 + (signatureByte(spell, step) / 255) * 0.36;
        if (r.w > r.h) {
          rects.push({ x: r.x, y: r.y, w: r.w * split, h: r.h, depth: r.depth + 1 }, { x: r.x + r.w * split, y: r.y, w: r.w * (1 - split), h: r.h, depth: r.depth + 1 });
        } else {
          rects.push({ x: r.x, y: r.y, w: r.w, h: r.h * split, depth: r.depth + 1 }, { x: r.x, y: r.y + r.h * split, w: r.w, h: r.h * (1 - split), depth: r.depth + 1 });
        }
      }
      rects.forEach((r, i) => {
        ctx.fillStyle = `hsla(${hues[i % hues.length] + r.depth * 16},86%,58%,${0.18 + (i % 5) * 0.08})`;
        ctx.fillRect(r.x + 1, r.y + 1, Math.max(1, r.w - 2), Math.max(1, r.h - 2));
      });
      break;
    }
    case 'sunburst': {
      const cx = ox + bw / 2, cy = oy + bh / 2;
      const rings = 3;
      for (let ring = 0; ring < rings; ring++) {
        const parts = 5 + ring * 3 + signatureByte(spell, ring) % 4;
        for (let i = 0; i < parts; i++) {
          const a0 = i / parts * Math.PI * 2 + t * 0.002 * (ring + 1);
          const a1 = (i + 0.78) / parts * Math.PI * 2 + t * 0.002 * (ring + 1);
          ctx.fillStyle = `hsla(${hues[(i + ring) % hues.length] + i * 8},86%,58%,0.26)`;
          ctx.beginPath();
          ctx.arc(cx, cy, Math.min(bw, bh) * (0.13 + ring * 0.11), a0, a1);
          ctx.arc(cx, cy, Math.min(bw, bh) * (0.07 + ring * 0.11), a1, a0, true);
          ctx.closePath();
          ctx.fill();
        }
      }
      break;
    }
    case 'spiral': {
      ctx.strokeStyle = hot;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i < 150; i++) {
        const a = i * 0.22 + t * 0.012;
        const r = i / 150 * Math.min(bw, bh) * 0.45;
        const x = ox + bw / 2 + Math.cos(a) * r;
        const y = oy + bh / 2 + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      break;
    }
    case 'braid': {
      const strands = 4 + signatureByte(spell, 1) % 4;
      for (let s = 0; s < strands; s++) {
        ctx.strokeStyle = `hsla(${hues[s % hues.length] + s * 20},86%,62%,0.68)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= 90; i++) {
          const u = i / 90;
          const x = ox + u * bw;
          const y = oy + bh * (0.18 + 0.64 * ((s + 0.45 * Math.sin(u * Math.PI * 4 + t * 0.025 + s)) / strands));
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.lineWidth = 1;
      break;
    }
    case 'radar': {
      const cx = ox + bw / 2, cy = oy + bh / 2;
      const axes = 6 + signatureByte(spell, 1) % 5;
      ctx.strokeStyle = faint;
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        for (let i = 0; i <= axes; i++) {
          const a = i / axes * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(a) * Math.min(bw, bh) * 0.13 * r;
          const y = cy + Math.sin(a) * Math.min(bw, bh) * 0.13 * r;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.fillStyle = `hsla(${baseHue},86%,58%,0.28)`;
      ctx.strokeStyle = gold;
      ctx.beginPath();
      for (let i = 0; i <= axes; i++) {
        const v = 0.32 + signatureByte(spell, i) / 255 * 0.62;
        const a = i / axes * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * Math.min(bw, bh) * 0.39 * v;
        const y = cy + Math.sin(a) * Math.min(bw, bh) * 0.39 * v;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
    }
    case 'gantt': {
      const lanes = 5 + signatureByte(spell, 1) % 5;
      for (let lane = 0; lane < lanes; lane++) {
        const y = oy + 10 + lane * (bh - 20) / lanes;
        ctx.strokeStyle = faint;
        ctx.beginPath(); ctx.moveTo(ox + 4, y + 7); ctx.lineTo(ox + bw - 4, y + 7); ctx.stroke();
        for (let b = 0; b < 3; b++) {
          const start = (signatureByte(spell, lane + b) / 255) * 0.68;
          const len = 0.08 + (signatureByte(spell, lane + b + 3) / 255) * 0.18;
          ctx.fillStyle = b === lane % 3 ? gold : `hsla(${baseHue + b * 40},86%,60%,0.54)`;
          ctx.fillRect(ox + 6 + start * (bw - 12), y, len * bw, 12);
        }
      }
      break;
    }
    case 'cayley': {
      const n = 5 + signatureByte(spell, 1) % 5;
      const cell = Math.min(bw / n, bh / n);
      const sx = ox + (bw - n * cell) / 2;
      const sy = oy + (bh - n * cell) / 2;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const v = (x * y + signatureByte(spell, x + y)) % n;
        ctx.fillStyle = `hsla(${hues[v % hues.length] + v * 17},86%,58%,${0.18 + v / (n * 1.6)})`;
        ctx.fillRect(sx + x * cell + 1, sy + y * cell + 1, cell - 2, cell - 2);
      }
      break;
    }
    default:
      return false;
  }
  ctx.restore();
  return true;
}

function sigUnit(spell, index, salt = '') {
  return (hash32(`${spell.signature || spell.id || spell.title}:${salt}:${index}`) % 10000) / 10000;
}

function sigInt(spell, index, mod, salt = '') {
  return Math.floor(sigUnit(spell, index, salt) * mod);
}

function hsl(h, s = 86, l = 60, a = 1) {
  return `hsla(${((h % 360) + 360) % 360},${s}%,${l}%,${a})`;
}

function semanticVisualIntent(spell) {
  const title = spell?.title || '';
  const text = `${title} ${spell?.group || ''} ${(spell?.tags || []).join(' ')}`.toLowerCase();
  const engine = spell?.engine || 'graph';
  if (/path tracing|metropolis light|irradiance|photon|restir|radiosity|beam tracing|cone tracing|lighting/.test(text)) return { kind: 'light', label: 'light-transport estimator diagram' };
  if (/suffix|aho|kmp|rabin|karp|bitap|string|bwt|fm-index|burrows|lcp|lyndon|manacher|duval/.test(text)) return { kind: 'string', label: 'string-index automaton and failure-link diagram' };
  if (/cellular|rule 30|rule 90|wireworld|brain|smoothlife|hodgepodge|greenberg|margolus|larger than life/.test(text)) return { kind: 'cellular', label: 'cellular-automata spacetime diagram' };
  if (/voronoi|delaunay|lloyd|centroidal/.test(text)) return { kind: 'voronoi', label: 'nearest-site geometry partition' };
  if (/mesh|surface|marching|contour|poisson|subdivision|tetrahedra|voxel|alpha|crust|pivoting|icp|ransac/.test(text)) return { kind: 'mesh', label: 'projected surface and incidence mesh' };
  if (/hull|clipping|calipers|sweep|intersection|polygon|douglas|visvalingam/.test(text)) return { kind: 'geometry-sweep', label: 'computational-geometry sweep diagram' };
  if (/zk|snark|stark|commit|signature|cipher|rsa|diffie|merkle|verkle|hashcash|secret|zero-knowledge/.test(text) || (engine === 'crypto' && /proof|transcript|protocol|commit/.test(text))) return { kind: 'crypto', label: 'cryptographic witness and transcript diagram' };
  if (/paxos|raft|byzantine|pbft|gossip|crdt|clock|consensus|quorum|dht|chord|kademlia|vector clock|lamport|distributed/.test(text)) return { kind: 'distributed', label: 'distributed quorum and message-timeline diagram' };
  if (/sat|smt|\blogic\b|prolog|unification|e-graph|egraph|theorem|proof|sequent|resolution|warren|rete|treat|constraint|horn|datalog|rule/.test(text)) return { kind: 'logic', label: 'constraint/proof-state diagram' };
  if (/\bparser\b|\bparse\b|grammar|\blr\b|\blalr\b|\bglr\b|earley|cyk|\bpeg\b|\bll\b|\bll\(\*\)|\bgll\b|combinator|shunting|pratt/.test(text)) return { kind: 'parsing', label: 'parse-chart and automaton diagram' };
  if (/fft|transform|spectra|spectral|dct|goertzel|radon|mellin|hilbert|prony|cordic|\bqr\b|jacobi|lanczos|arnoldi|gmres|bicgstab|minres|power iteration|svd|cur decomposition|summation|twosum|shewchuk|dekker|remez|chebyshev|clenshaw|casteljau|horner|predicates/.test(title.toLowerCase())) return { kind: 'numerical', label: 'numerical transform and error-propagation diagram' };
  if (/tree|trie|heap|queue|index|array|bitvector|rank|select|rope|buffer|table|lsm|b-tree|r-tree|kd-tree|vp-tree|cover tree|fenwick|segment/.test(text)) return { kind: 'structure', label: 'data-structure topology diagram' };
  if (/bloom|sketch|count|hash|hyperloglog|minhash|simhash|quantile|counter|sampling|distinct|stream|compression|coding|\blz\d*\b|huffman|entropy|deflate|brotli|zstd|range coding|\bans\b|elias|golomb/.test(text)) return { kind: 'sketch', label: 'streaming sketch or compression-state diagram' };
  if (/markov|mcmc|monte|particle|bayes|belief|gibbs|sampling|random|reservoir|probabilistic|posterior|kalman/.test(text)) return { kind: 'probability', label: 'probability mass and sampler-state diagram' };
  if (/quantum|qaoa|grover|\bshor\b|shor's|\bphase\b|amplitude|hamiltonian|tensor network|annealer/.test(text) || engine === 'quantum') return { kind: 'quantum', label: 'quantum circuit and amplitude-phase diagram' };
  if (/flow|cut|matching|path|route|shortest|max-flow|augment|network simplex|min-cost|residual/.test(text)) return { kind: 'flow-graph', label: 'residual-flow and path diagram' };
  if (/gradient|simplex|anneal|optimization|allocation|scheduling|linear scan|register|objective|krylov|qr|eigen|svd|newton|descent|levenberg|marquardt/.test(text)) return { kind: 'optimization', label: 'objective-landscape and solver-step diagram' };
  if (/particle|fluid|physics|dynamics|euler|runge|verlet|lattice|boltzmann|finite element|finite volume|control|slamd|rrt|roadmap|trajectory/.test(text) || engine === 'flow') return { kind: 'dynamics', label: 'state-space flow and trajectory diagram' };
  if (/evolution|genetic|swarm|colony|immune|population|selection|mutation|lsystem|l-system/.test(text) || engine === 'evolution') return { kind: 'evolution', label: 'population-search and fitness diagram' };
  if (/undecidable|turing|halting|lambda|tag system|combinator|fractran|post|collatz|minimal/.test(text) || engine === 'undecidable') return { kind: 'undecidable', label: 'formal-machine and diagonalization diagram' };
  return { kind: engine, label: `${engine} semantic diagram` };
}

function semanticPalette(spell, blueprint, seed, recipe = recordVisualRecipe(spell)) {
  const enginePalettes = {
    undecidable: [358, 44, 214, 286],
    quantum: [196, 282, 52, 324],
    logic: [46, 174, 266, 12],
    graph: [166, 216, 34, 330],
    flow: [188, 126, 38, 256],
    probability: [258, 24, 146, 208],
    sketch: [138, 32, 210, 296],
    automata: [84, 180, 332, 224],
    evolution: [108, 24, 332, 176],
    optimization: [30, 204, 344, 92],
    distributed: [24, 206, 52, 164],
    crypto: [148, 286, 42, 212],
    topology: [178, 224, 38, 310],
    parsing: [272, 32, 188, 78]
  };
  const taste = VISUAL_TASTE_PALETTES[recipe.paletteIndex % VISUAL_TASTE_PALETTES.length];
  const source = enginePalettes[spell.engine] || blueprint?.palette || taste || [180, 44, 286, 212];
  const shift = sigInt(spell, 0, 55, 'palette') - 22;
  const hues = source.map((hue, index) => {
    const tasteHue = taste[index % taste.length];
    return (Math.round(lerp(hue, tasteHue, 0.42)) + shift + index * sigInt(spell, index + 1, 11, 'palette')) % 360;
  });
  return {
    hues,
    hot: hsl(hues[0], 72, 60, 0.88),
    warm: hsl(hues[1], 68, 58, 0.74),
    cool: hsl(hues[2], 66, 59, 0.70),
    violet: hsl(hues[3] || hues[0] + 128, 62, 60, 0.58),
    gold: 'rgba(232,190,83,0.90)',
    faint: hsl(hues[0], 58, 58, 0.16),
    softer: hsl(hues[1], 46, 54, 0.10),
    line: getThemeColor('rgba(239,235,255,0.34)', 'rgba(22,18,34,0.32)'),
    text: getThemeColor('rgba(244,240,255,0.78)', 'rgba(24,18,34,0.72)'),
    dim: getThemeColor('rgba(244,240,255,0.14)', 'rgba(24,18,34,0.12)')
  };
}

function glyphArea(W, H) {
  return { x: 13, y: 11, w: Math.max(1, W - 26), h: Math.max(1, H - 22) };
}

function pointerPoint(area, strength = 1) {
  const x = area.x + area.w * (visualPointer.active ? visualPointer.x : 0.5);
  const y = area.y + area.h * (visualPointer.active ? visualPointer.y : 0.5);
  return {
    x: lerp(area.x + area.w / 2, x, strength),
    y: lerp(area.y + area.h / 2, y, strength),
    dx: (visualPointer.active ? visualPointer.x - 0.5 : 0) * strength,
    dy: (visualPointer.active ? visualPointer.y - 0.5 : 0) * strength
  };
}

function semanticClip(ctx, area) {
  ctx.beginPath();
  ctx.rect(area.x, area.y, area.w, area.h);
  ctx.clip();
}

function semanticPoint(area, spell, index, salt = 'pt') {
  return {
    x: area.x + area.w * (0.06 + sigUnit(spell, index, salt) * 0.88),
    y: area.y + area.h * (0.08 + sigUnit(spell, index + 17, salt) * 0.84)
  };
}

function drawGlyphDot(ctx, x, y, r, fill, stroke) {
  const marker = ctx.__visualRecipe?.marker || 'circle';
  ctx.beginPath();
  if (marker === 'square') {
    ctx.rect(x - r, y - r, r * 2, r * 2);
  } else if (marker === 'diamond') {
    ctx.moveTo(x, y - r * 1.35);
    ctx.lineTo(x + r * 1.35, y);
    ctx.lineTo(x, y + r * 1.35);
    ctx.lineTo(x - r * 1.35, y);
    ctx.closePath();
  } else if (marker === 'triangle') {
    ctx.moveTo(x, y - r * 1.45);
    ctx.lineTo(x + r * 1.28, y + r * 0.92);
    ctx.lineTo(x - r * 1.28, y + r * 0.92);
    ctx.closePath();
  } else if (marker === 'pill' || marker === 'capsule') {
    const w = r * (marker === 'capsule' ? 3.2 : 2.6);
    const h = r * 1.55;
    if (ctx.roundRect) ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
    else ctx.rect(x - w / 2, y - h / 2, w, h);
  } else if (marker === 'cross') {
    ctx.rect(x - r * 0.36, y - r * 1.45, r * 0.72, r * 2.9);
    ctx.rect(x - r * 1.45, y - r * 0.36, r * 2.9, r * 0.72);
  } else if (marker === 'notch') {
    ctx.moveTo(x - r, y - r);
    ctx.lineTo(x + r, y - r * 0.45);
    ctx.lineTo(x + r * 0.45, y + r);
    ctx.lineTo(x - r, y + r * 0.75);
    ctx.closePath();
  } else if (marker === 'spark') {
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      const rr = i % 2 ? r * 0.55 : r * 1.45;
      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else {
    ctx.arc(x, y, r, 0, TAU);
  }
  ctx.fillStyle = fill;
  ctx.fill();
  if (marker === 'ring') {
    ctx.beginPath();
    ctx.arc(x, y, r * 1.55, 0, TAU);
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

function drawGlyphText(ctx, text, x, y, color, size = 8, maxWidth = 96) {
  ctx.save();
  ctx.font = `${size}px Space Mono, monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(String(text), x, y, maxWidth);
  ctx.restore();
}

function projectSemantic3D(x, y, z, area, spin = 0, tilt = 0.62) {
  const cs = Math.cos(spin);
  const sn = Math.sin(spin);
  const rx = x * cs - z * sn;
  const rz = x * sn + z * cs;
  const ry = y * Math.cos(tilt) - rz * Math.sin(tilt);
  const depth = y * Math.sin(tilt) + rz * Math.cos(tilt);
  const scale = 1.75 / (2.45 + depth);
  return {
    x: area.x + area.w / 2 + rx * area.w * 0.34 * scale,
    y: area.y + area.h / 2 + ry * area.h * 0.48 * scale,
    z: depth
  };
}

function drawSemanticGraph(ctx, area, t, seed, spell, colors, mode = 'network') {
  ctx.save();
  semanticClip(ctx, area);
  if (mode === 'structure') {
    const levels = 3 + sigInt(spell, 1, 2, 'tree');
    const fanout = 2 + sigInt(spell, 2, 3, 'tree');
    const byLevel = [];
    for (let level = 0; level < levels; level++) {
      const count = Math.min(14, Math.max(1, level === 0 ? 1 : Math.pow(fanout, level)));
      const y = area.y + area.h * (0.12 + level * 0.78 / Math.max(1, levels - 1));
      const row = [];
      for (let i = 0; i < count; i++) {
        row.push({
          x: area.x + area.w * ((i + 1) / (count + 1)),
          y,
          w: 12 + sigInt(spell, i + level, 16, 'node'),
          h: 9 + sigInt(spell, i + level + 9, 10, 'node')
        });
      }
      byLevel.push(row);
    }
    for (let level = 1; level < byLevel.length; level++) {
      byLevel[level].forEach((node, i) => {
        const parent = byLevel[level - 1][Math.floor(i / Math.max(1, Math.ceil(byLevel[level].length / byLevel[level - 1].length))) % byLevel[level - 1].length];
        ctx.strokeStyle = colors.faint;
        ctx.beginPath();
        ctx.moveTo(parent.x, parent.y + parent.h / 2);
        ctx.lineTo(node.x, node.y - node.h / 2);
        ctx.stroke();
      });
    }
    byLevel.flat().forEach((node, i) => {
      const active = i === Math.floor(t / 18) % byLevel.flat().length;
      ctx.fillStyle = active ? colors.gold : (i % 3 ? colors.cool : colors.hot);
      ctx.fillRect(node.x - node.w / 2, node.y - node.h / 2, node.w, node.h);
      ctx.strokeStyle = colors.line;
      ctx.strokeRect(node.x - node.w / 2, node.y - node.h / 2, node.w, node.h);
    });
    ctx.restore();
    return;
  }

  if (mode === 'flow-graph') {
    const layers = 4;
    const layerCounts = [2, 3 + sigInt(spell, 1, 2, 'flow'), 3 + sigInt(spell, 2, 2, 'flow'), 2];
    const nodes = layerCounts.map((count, layer) => Array.from({ length: count }, (_, i) => ({
      x: area.x + area.w * (0.08 + layer * 0.84 / (layers - 1)),
      y: area.y + area.h * ((i + 1) / (count + 1))
    })));
    for (let layer = 0; layer < layers - 1; layer++) {
      nodes[layer].forEach((a, i) => nodes[layer + 1].forEach((b, j) => {
        if (sigUnit(spell, layer * 13 + i * 7 + j, 'edge') < 0.34) return;
        const capacity = 1 + sigInt(spell, i + j + layer, 7, 'cap');
        ctx.strokeStyle = hsl(colors.hues[(layer + i + j) % colors.hues.length], 82, 60, 0.18 + capacity * 0.045);
        ctx.lineWidth = 1 + capacity * 0.45;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.bezierCurveTo(a.x + area.w * 0.08, a.y, b.x - area.w * 0.08, b.y, b.x, b.y);
        ctx.stroke();
      }));
    }
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = colors.gold;
    ctx.beginPath();
    nodes.forEach((layer, i) => {
      const node = layer[(Math.floor(t / 16) + i + sigInt(spell, i, 3, 'path')) % layer.length];
      if (i === 0) ctx.moveTo(node.x, node.y);
      else ctx.lineTo(node.x, node.y);
    });
    ctx.stroke();
    ctx.lineWidth = 1;
    nodes.flat().forEach((node, i) => drawGlyphDot(ctx, node.x, node.y, 4 + sigInt(spell, i, 4, 'dot'), i % 2 ? colors.hot : colors.cool, colors.line));
    ctx.restore();
    return;
  }

  const n = 8 + sigInt(spell, 1, 8, 'graph');
  const pointer = pointerPoint(area, 0.22);
  const nodes = Array.from({ length: n }, (_, i) => {
    const a = i / n * TAU + sigUnit(spell, i, 'phase') * 0.45 + t * 0.002;
    const r = 0.22 + sigUnit(spell, i + 3, 'radius') * 0.24;
    return {
      x: area.x + area.w / 2 + Math.cos(a) * area.w * r + pointer.dx * area.w * 0.08 * Math.sin(i),
      y: area.y + area.h / 2 + Math.sin(a) * area.h * r * 0.82 + pointer.dy * area.h * 0.08 * Math.cos(i)
    };
  });
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const linked = sigUnit(spell, i * 31 + j * 17, 'link');
    if (linked > (mode === 'flow-graph' ? 0.52 : 0.30)) continue;
    ctx.strokeStyle = hsl(colors.hues[(i + j) % colors.hues.length], 76, 60, 0.17 + (0.34 - linked) * 0.36);
    ctx.beginPath();
    ctx.moveTo(nodes[i].x, nodes[i].y);
    ctx.quadraticCurveTo(pointer.x, pointer.y, nodes[j].x, nodes[j].y);
    ctx.stroke();
  }
  nodes.forEach((node, i) => {
    const active = i === Math.floor(t / 20) % n;
    drawGlyphDot(ctx, node.x, node.y, active ? 7 : 4 + sigInt(spell, i, 5, 'size'), active ? colors.gold : (i % 2 ? colors.hot : colors.cool), colors.line);
  });
  ctx.restore();
}

function drawSemanticLogic(ctx, area, t, seed, spell, colors) {
  ctx.save();
  semanticClip(ctx, area);
  const title = (spell.title || '').toLowerCase();
  if (/e-graph|egraph|equality|rewrite|interaction|graph reduction|term graph/.test(title)) {
    const classes = 4 + sigInt(spell, 1, 3, 'eg');
    for (let c = 0; c < classes; c++) {
      const x = area.x + area.w * (0.12 + (c % 3) * 0.36);
      const y = area.y + area.h * (0.18 + Math.floor(c / 3) * 0.42);
      const w = area.w * (0.22 + sigUnit(spell, c, 'egw') * 0.08);
      const h = area.h * (0.22 + sigUnit(spell, c, 'egh') * 0.07);
      ctx.strokeStyle = c === Math.floor(t / 24) % classes ? colors.gold : colors.cool;
      ctx.fillStyle = colors.softer;
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      const terms = 3 + sigInt(spell, c, 4, 'term');
      for (let i = 0; i < terms; i++) {
        const px = x + 10 + (i % 3) * w / 3;
        const py = y + 14 + Math.floor(i / 3) * h / 3;
        drawGlyphDot(ctx, px, py, 3, i % 2 ? colors.hot : colors.warm);
      }
    }
    for (let i = 0; i < classes - 1; i++) {
      drawArrow(ctx, area.x + area.w * (0.22 + i * 0.15), area.y + area.h * 0.78, area.x + area.w * (0.34 + i * 0.15), area.y + area.h * 0.62, hsl(colors.hues[i % colors.hues.length], 80, 62, 0.42));
    }
    ctx.restore();
    return;
  }

  const cols = 7 + sigInt(spell, 1, 5, 'vars');
  const rows = 5 + sigInt(spell, 2, 5, 'clauses');
  const cw = area.w * 0.56 / cols;
  const ch = area.h * 0.72 / rows;
  const ox = area.x + area.w * 0.06;
  const oy = area.y + area.h * 0.1;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const v = sigInt(spell, x + y * cols, 5, 'lit') - 2;
    ctx.fillStyle = v > 0 ? colors.hot : v < 0 ? colors.cool : colors.dim;
    ctx.fillRect(ox + x * cw + 1, oy + y * ch + 1, cw - 2, ch - 2);
    if (x === Math.floor(t / 18 + y) % cols) {
      ctx.strokeStyle = colors.gold;
      ctx.strokeRect(ox + x * cw + 1, oy + y * ch + 1, cw - 2, ch - 2);
    }
  }
  const root = { x: area.x + area.w * 0.78, y: area.y + area.h * 0.12 };
  drawGlyphDot(ctx, root.x, root.y, 5, colors.gold);
  let prev = [root];
  for (let level = 1; level <= 3; level++) {
    const count = level + 1 + sigInt(spell, level, 2, 'proof');
    const next = [];
    for (let i = 0; i < count; i++) {
      const node = {
        x: area.x + area.w * (0.62 + (i + 1) * 0.32 / (count + 1)),
        y: area.y + area.h * (0.14 + level * 0.22)
      };
      const parent = prev[i % prev.length];
      ctx.strokeStyle = colors.faint;
      ctx.beginPath();
      ctx.moveTo(parent.x, parent.y);
      ctx.lineTo(node.x, node.y);
      ctx.stroke();
      drawGlyphDot(ctx, node.x, node.y, 3.5, i === Math.floor(t / 14) % count ? colors.gold : colors.warm);
      next.push(node);
    }
    prev = next;
  }
  drawGlyphText(ctx, 'clauses', ox, oy - 4, colors.text);
  ctx.restore();
}

function drawSemanticProbability(ctx, area, t, seed, spell, colors) {
  ctx.save();
  semanticClip(ctx, area);
  const title = (spell.title || '').toLowerCase();
  const baseY = area.y + area.h * 0.78;
  if (/particle|filter|resampling/.test(title)) {
    const n = 34 + sigInt(spell, 1, 22, 'particle');
    for (let i = 0; i < n; i++) {
      const u = sigUnit(spell, i, 'px');
      const weight = 0.18 + sigUnit(spell, i + 4, 'w') * 0.82;
      const x = area.x + area.w * (0.08 + u * 0.84);
      const y = area.y + area.h * (0.16 + sigUnit(spell, i, 'py') * 0.58 + Math.sin(t * 0.02 + i) * 0.03);
      drawGlyphDot(ctx, x, y, 1.8 + weight * 4, hsl(colors.hues[i % colors.hues.length], 86, 60, 0.22 + weight * 0.52));
      if (weight > 0.74) drawArrow(ctx, x, y, area.x + area.w * (0.82 + sigUnit(spell, i, 'rx') * 0.08), baseY - weight * area.h * 0.18, colors.gold);
    }
    ctx.strokeStyle = colors.line;
    ctx.beginPath();
    ctx.moveTo(area.x + 8, baseY);
    ctx.lineTo(area.x + area.w - 8, baseY);
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (/markov|mcmc|gibbs|metropolis|random walk/.test(title)) {
    const states = 5 + sigInt(spell, 1, 5, 'mc');
    const cx = area.x + area.w * 0.38;
    const cy = area.y + area.h * 0.45;
    const r = Math.min(area.w, area.h) * 0.28;
    const pts = Array.from({ length: states }, (_, i) => ({ x: cx + Math.cos(i / states * TAU) * r, y: cy + Math.sin(i / states * TAU) * r }));
    pts.forEach((a, i) => {
      const b = pts[(i + 1 + sigInt(spell, i, Math.max(1, states - 1), 'jump')) % states];
      drawArrow(ctx, a.x, a.y, b.x, b.y, hsl(colors.hues[i % colors.hues.length], 80, 60, 0.42));
    });
    pts.forEach((p, i) => drawGlyphDot(ctx, p.x, p.y, i === Math.floor(t / 18) % states ? 7 : 4, i === Math.floor(t / 18) % states ? colors.gold : colors.hot));
    for (let i = 0; i < states; i++) {
      const h = area.h * (0.08 + sigUnit(spell, i, 'hist') * 0.34);
      ctx.fillStyle = hsl(colors.hues[i % colors.hues.length], 82, 60, 0.48);
      ctx.fillRect(area.x + area.w * 0.72 + i * area.w * 0.23 / states, baseY - h, area.w * 0.2 / states, h);
    }
    ctx.restore();
    return;
  }
  ctx.strokeStyle = colors.line;
  ctx.beginPath();
  ctx.moveTo(area.x + 8, baseY);
  ctx.lineTo(area.x + area.w - 8, baseY);
  ctx.stroke();
  for (let k = 0; k < 3; k++) {
    ctx.strokeStyle = k === 1 ? colors.gold : hsl(colors.hues[k], 80, 60, 0.54);
    ctx.lineWidth = k === 1 ? 2 : 1.4;
    ctx.beginPath();
    for (let i = 0; i <= 90; i++) {
      const u = i / 90;
      const mu = 0.25 + k * 0.2 + sigUnit(spell, k, 'mu') * 0.08;
      const sigma = 0.08 + sigUnit(spell, k, 'sigma') * 0.06;
      const v = Math.exp(-((u - mu) ** 2) / (2 * sigma ** 2));
      const x = area.x + area.w * (0.06 + u * 0.88);
      const y = baseY - v * area.h * (0.3 + k * 0.05);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.lineWidth = 1;
  for (let i = 0; i < 24; i++) {
    const u = sigUnit(spell, i, 'sample');
    drawGlyphDot(ctx, area.x + area.w * (0.06 + u * 0.88), baseY + 4 + (i % 3) * 3, 1.8, i === Math.floor(t / 8) % 24 ? colors.gold : colors.cool);
  }
  ctx.restore();
}

function drawSemanticSketch(ctx, area, t, seed, spell, colors) {
  ctx.save();
  semanticClip(ctx, area);
  const title = (spell.title || '').toLowerCase();
  if (/huffman|lz|deflate|brotli|zstandard|coding|entropy|bwt|compress|grammar|ans|range/.test(title)) {
    const bars = 13 + sigInt(spell, 1, 11, 'entropy');
    for (let i = 0; i < bars; i++) {
      const p = 0.08 + sigUnit(spell, i, 'prob') * 0.86;
      const h = area.h * (0.1 + p * 0.54);
      ctx.fillStyle = hsl(colors.hues[i % colors.hues.length], 82, 60, 0.34 + p * 0.42);
      ctx.fillRect(area.x + area.w * 0.05 + i * area.w * 0.52 / bars, area.y + area.h * 0.78 - h, area.w * 0.48 / bars, h);
    }
    const nodes = Array.from({ length: 7 }, (_, i) => ({
      x: area.x + area.w * (0.68 + (i % 4) * 0.075),
      y: area.y + area.h * (0.2 + Math.floor(i / 4) * 0.33)
    }));
    nodes.forEach((node, i) => {
      if (i > 0) {
        const parent = nodes[Math.floor((i - 1) / 2)];
        ctx.strokeStyle = colors.faint;
        ctx.beginPath();
        ctx.moveTo(parent.x, parent.y);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();
      }
      drawGlyphDot(ctx, node.x, node.y, i === Math.floor(t / 22) % nodes.length ? 5 : 3.5, i % 2 ? colors.hot : colors.cool);
    });
    ctx.restore();
    return;
  }
  const rows = 4 + sigInt(spell, 0, 3, 'rows');
  const cols = 20 + sigInt(spell, 1, 16, 'bits');
  const cell = Math.min(area.w * 0.78 / cols, area.h * 0.48 / rows);
  const ox = area.x + area.w * 0.15;
  const oy = area.y + area.h * 0.24;
  for (let r = 0; r < rows; r++) {
    const sourceX = area.x + area.w * 0.05;
    const sourceY = oy + r * cell + cell * 0.5;
    drawGlyphDot(ctx, sourceX, sourceY, 3.5, colors.gold);
    for (let k = 0; k < 3; k++) {
      const hit = sigInt(spell, r * 7 + k + Math.floor(t / 24), cols, 'hash');
      drawArrow(ctx, sourceX + 4, sourceY, ox + hit * cell + cell / 2, oy + r * cell + cell / 2, hsl(colors.hues[k % colors.hues.length], 84, 60, 0.26));
    }
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const active = sigUnit(spell, c + r * cols, 'bit') > 0.68 || c === (Math.floor(t / 16) + r * 3) % cols;
    ctx.fillStyle = active ? hsl(colors.hues[(c + r) % colors.hues.length], 84, 60, 0.62) : colors.dim;
    ctx.fillRect(ox + c * cell + 0.6, oy + r * cell + 0.6, Math.max(1, cell - 1.2), Math.max(1, cell - 1.2));
  }
  const errY = area.y + area.h * 0.82;
  ctx.strokeStyle = colors.gold;
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const u = i / 60;
    const y = errY - Math.log(1 + u * (3 + sigInt(spell, 1, 7, 'err'))) * area.h * 0.08;
    const x = area.x + area.w * (0.1 + u * 0.8);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawSemanticAutomata(ctx, area, t, seed, spell, colors, cellular = false) {
  ctx.save();
  semanticClip(ctx, area);
  if (cellular) {
    const cols = 32;
    const rows = 14;
    const cw = area.w / cols;
    const ch = area.h / rows;
    const rule = /90/.test(spell.title || '') ? 90 : /30/.test(spell.title || '') ? 30 : (30 + sigInt(spell, 1, 196, 'rule')) & 255;
    let state = Array.from({ length: cols }, (_, i) => i === Math.floor(cols / 2) || sigUnit(spell, i, 'ca') > 0.83 ? 1 : 0);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const hot = x === (Math.floor(t / 3) + y * 2) % cols;
        ctx.fillStyle = state[x] ? (hot ? colors.gold : hsl(colors.hues[(x + y) % colors.hues.length], 86, 60, 0.68)) : colors.dim;
        ctx.fillRect(area.x + x * cw + 0.5, area.y + y * ch + 0.5, Math.max(1, cw - 1), Math.max(1, ch - 1));
      }
      state = state.map((_, x) => {
        const left = state[(x - 1 + cols) % cols];
        const mid = state[x];
        const right = state[(x + 1) % cols];
        return (rule >> ((left << 2) | (mid << 1) | right)) & 1;
      });
    }
    drawGlyphText(ctx, `rule ${rule}`, area.x + 5, area.y + 12, colors.text);
    ctx.restore();
    return;
  }
  const states = 5 + sigInt(spell, 1, 7, 'dfa');
  const r = Math.min(area.w, area.h) * 0.32;
  const cx = area.x + area.w * 0.5;
  const cy = area.y + area.h * 0.52;
  const nodes = Array.from({ length: states }, (_, i) => ({
    x: cx + Math.cos(i / states * TAU + t * 0.001) * r * (1 + sigUnit(spell, i, 'rx') * 0.18),
    y: cy + Math.sin(i / states * TAU + t * 0.001) * r * 0.78
  }));
  nodes.forEach((a, i) => {
    const b = nodes[(i + 1 + sigInt(spell, i, Math.max(1, states - 1), 'next')) % states];
    ctx.strokeStyle = hsl(colors.hues[i % colors.hues.length], 80, 60, 0.42);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(cx, cy, b.x, b.y);
    ctx.stroke();
    if (i % 3 === 0) {
      ctx.beginPath();
      ctx.arc(a.x, a.y - 7, 9, -0.4, TAU - 0.6);
      ctx.stroke();
    }
  });
  nodes.forEach((node, i) => {
    const active = i === Math.floor(t / 18) % states;
    drawGlyphDot(ctx, node.x, node.y, active ? 8 : 5, active ? colors.gold : (i % 2 ? colors.hot : colors.cool), colors.line);
    if (i === 0 || i === states - 1) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, active ? 11 : 8, 0, TAU);
      ctx.strokeStyle = colors.line;
      ctx.stroke();
    }
  });
  ctx.restore();
}

function drawSemanticParsing(ctx, area, t, seed, spell, colors, stringMode = false) {
  ctx.save();
  semanticClip(ctx, area);
  if (stringMode) {
    const letters = (spell.title || 'pattern').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 12).padEnd(8, 'TEXT');
    const n = Math.min(12, letters.length);
    const cell = area.w * 0.72 / n;
    const ox = area.x + area.w * 0.08;
    const y = area.y + area.h * 0.42;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i === Math.floor(t / 12) % n ? colors.gold : colors.softer;
      ctx.fillRect(ox + i * cell, y, cell - 2, 22);
      drawGlyphText(ctx, letters[i], ox + i * cell + 4, y + 15, colors.text, 9, cell - 4);
      const jump = sigInt(spell, i, Math.max(1, i + 1), 'fail');
      if (i > 1 && jump < i) {
        ctx.strokeStyle = hsl(colors.hues[i % colors.hues.length], 82, 60, 0.40);
        ctx.beginPath();
        ctx.moveTo(ox + i * cell + cell / 2, y);
        ctx.quadraticCurveTo(ox + (i + jump) * cell / 2, area.y + area.h * 0.14, ox + jump * cell + cell / 2, y);
        ctx.stroke();
      }
    }
    const states = 6 + sigInt(spell, 1, 5, 'suffix');
    for (let i = 0; i < states; i++) {
      const x = area.x + area.w * (0.12 + i * 0.76 / Math.max(1, states - 1));
      const yy = area.y + area.h * (0.75 + Math.sin(i + t * 0.03) * 0.05);
      if (i) drawArrow(ctx, area.x + area.w * (0.12 + (i - 1) * 0.76 / Math.max(1, states - 1)), yy, x, yy, colors.faint);
      drawGlyphDot(ctx, x, yy, 3.8, i === Math.floor(t / 16) % states ? colors.gold : colors.cool);
    }
    ctx.restore();
    return;
  }
  const n = 8 + sigInt(spell, 1, 5, 'chart');
  const cell = Math.min(area.w * 0.68 / n, area.h * 0.68 / n);
  const ox = area.x + area.w * 0.08;
  const oy = area.y + area.h * 0.12;
  for (let span = 1; span <= n; span++) {
    for (let start = 0; start <= n - span; start++) {
      const x = ox + start * cell + span * cell * 0.5;
      const y = oy + (span - 1) * cell;
      const filled = sigUnit(spell, start + span * 17, 'parse') > 0.48;
      ctx.fillStyle = filled ? hsl(colors.hues[span % colors.hues.length], 82, 60, 0.36 + span / n * 0.26) : colors.dim;
      ctx.fillRect(x, y, Math.max(1, cell - 2), Math.max(1, cell - 2));
    }
  }
  const stackX = area.x + area.w * 0.82;
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = i === Math.floor(t / 13) % 7 ? colors.gold : (i % 2 ? colors.hot : colors.cool);
    ctx.fillRect(stackX, area.y + area.h * (0.75 - i * 0.08), area.w * 0.11, area.h * 0.045);
  }
  drawGlyphText(ctx, 'chart', ox, oy - 4, colors.text);
  ctx.restore();
}

function drawSemanticTopology(ctx, area, t, seed, spell, colors, mode = 'mesh') {
  ctx.save();
  semanticClip(ctx, area);
  if (mode === 'voronoi') {
    const sites = Array.from({ length: 7 + sigInt(spell, 1, 6, 'site') }, (_, i) => semanticPoint(area, spell, i, 'site'));
    const step = Math.max(7, Math.min(15, area.w / 22));
    for (let y = area.y; y < area.y + area.h; y += step) for (let x = area.x; x < area.x + area.w; x += step) {
      let best = 0;
      let bestD = Infinity;
      sites.forEach((site, i) => {
        const d = (site.x - x) ** 2 + (site.y - y) ** 2;
        if (d < bestD) { best = i; bestD = d; }
      });
      ctx.fillStyle = hsl(colors.hues[best % colors.hues.length] + best * 9, 80, 58, 0.18 + (best % 4) * 0.035);
      ctx.fillRect(x, y, step - 1, step - 1);
    }
    sites.forEach((site, i) => drawGlyphDot(ctx, site.x, site.y, i === Math.floor(t / 18) % sites.length ? 5.5 : 3.5, i === Math.floor(t / 18) % sites.length ? colors.gold : colors.hot));
    ctx.restore();
    return;
  }
  if (mode === 'geometry-sweep') {
    const pts = Array.from({ length: 9 + sigInt(spell, 1, 6, 'poly') }, (_, i) => {
      const a = i / (9 + sigInt(spell, 1, 6, 'poly')) * TAU;
      return { x: area.x + area.w * (0.48 + Math.cos(a) * (0.24 + sigUnit(spell, i, 'rr') * 0.08)), y: area.y + area.h * (0.5 + Math.sin(a) * (0.3 + sigUnit(spell, i, 'rr2') * 0.06)) };
    });
    ctx.fillStyle = colors.softer;
    ctx.strokeStyle = colors.hot;
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    const sx = area.x + ((t * 0.35 + sigInt(spell, 0, 50, 'sweep')) % Math.max(1, area.w));
    ctx.strokeStyle = colors.gold;
    ctx.beginPath();
    ctx.moveTo(sx, area.y + 3);
    ctx.lineTo(sx, area.y + area.h - 3);
    ctx.stroke();
    pts.forEach((p, i) => drawGlyphDot(ctx, p.x, p.y, 3, i % 2 ? colors.cool : colors.warm));
    ctx.restore();
    return;
  }
  const n = 7;
  const spin = t * 0.004 + pointerPoint(area, 0.5).dx * 0.9 + seed * 0.0001;
  const grid = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const nx = (x / (n - 1) - 0.5) * 2;
    const ny = (y / (n - 1) - 0.5) * 2;
    const z = Math.sin(nx * (2.5 + sigUnit(spell, 1, 'freq') * 2) + seed) * Math.cos(ny * 2.4 + t * 0.02) * 0.55;
    grid.push(projectSemantic3D(nx, ny * 0.75, z, area, spin));
  }
  const drawEdge = (a, b, color) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  };
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const p = grid[y * n + x];
    if (x < n - 1) drawEdge(p, grid[y * n + x + 1], colors.faint);
    if (y < n - 1) drawEdge(p, grid[(y + 1) * n + x], colors.faint);
  }
  grid.forEach((p, i) => drawGlyphDot(ctx, p.x, p.y, i === Math.floor(t / 9) % grid.length ? 3.6 : 1.9, i === Math.floor(t / 9) % grid.length ? colors.gold : hsl(colors.hues[i % colors.hues.length], 82, 60, 0.62)));
  ctx.restore();
}

function drawSemanticOptimization(ctx, area, t, seed, spell, colors) {
  ctx.save();
  semanticClip(ctx, area);
  const title = (spell.title || '').toLowerCase();
  if (/register|allocation|scheduling|trace|superblock|dominator|globalisel/.test(title)) {
    drawSemanticGraph(ctx, area, t, seed, spell, colors, 'network');
    const cols = 5 + sigInt(spell, 1, 4, 'reg');
    for (let i = 0; i < cols; i++) {
      ctx.fillStyle = hsl(colors.hues[i % colors.hues.length], 82, 60, 0.42);
      ctx.fillRect(area.x + area.w * (0.08 + i * 0.82 / cols), area.y + area.h * 0.84, area.w * 0.7 / cols, 8 + sigInt(spell, i, 16, 'live'));
    }
    ctx.restore();
    return;
  }
  const cx = area.x + area.w * 0.46;
  const cy = area.y + area.h * 0.5;
  for (let r = 5; r >= 1; r--) {
    ctx.strokeStyle = hsl(colors.hues[r % colors.hues.length], 76, 58, 0.18 + r * 0.04);
    ctx.beginPath();
    ctx.ellipse(cx, cy, area.w * 0.08 * r, area.h * 0.052 * r, sigUnit(spell, r, 'rot') * 0.7, 0, TAU);
    ctx.stroke();
  }
  let x = area.x + area.w * (0.1 + sigUnit(spell, 1, 'start') * 0.18);
  let y = area.y + area.h * (0.18 + sigUnit(spell, 2, 'start') * 0.62);
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  const steps = 9 + sigInt(spell, 1, 7, 'steps');
  for (let i = 0; i < steps; i++) {
    const rate = 0.18 + sigUnit(spell, i, 'rate') * 0.16;
    x = lerp(x, cx + Math.sin(i + seed) * area.w * 0.02, rate);
    y = lerp(y, cy + Math.cos(i + seed) * area.h * 0.02, rate);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.lineWidth = 1;
  for (let i = 0; i < steps; i++) {
    const u = i / Math.max(1, steps - 1);
    drawGlyphDot(ctx, lerp(area.x + area.w * 0.12, cx, u), lerp(area.y + area.h * 0.2, cy, Math.pow(u, 0.9)), i === Math.floor(t / 10) % steps ? 4 : 2.5, i === Math.floor(t / 10) % steps ? colors.gold : colors.cool);
  }
  ctx.restore();
}

function drawSemanticNumerical(ctx, area, t, seed, spell, colors) {
  ctx.save();
  semanticClip(ctx, area);
  const title = (spell.title || '').toLowerCase();
  if (/fft|transform|spectra|spectral|dct|goertzel|radon|mellin|hilbert|prony/.test(title)) {
    const mid = area.x + area.w * 0.48;
    const baseY = area.y + area.h * 0.64;
    ctx.strokeStyle = colors.line;
    ctx.beginPath();
    ctx.moveTo(area.x + 8, baseY);
    ctx.lineTo(mid - 12, baseY);
    ctx.moveTo(mid + 22, baseY);
    ctx.lineTo(area.x + area.w - 8, baseY);
    ctx.stroke();
    ctx.strokeStyle = colors.hot;
    ctx.beginPath();
    for (let i = 0; i <= 90; i++) {
      const u = i / 90;
      const x = area.x + area.w * (0.06 + u * 0.34);
      const y = baseY - Math.sin(u * TAU * (2 + sigInt(spell, 1, 4, 'freq')) + t * 0.025) * area.h * 0.18
        - Math.sin(u * TAU * (5 + sigInt(spell, 2, 5, 'freq')) + seed) * area.h * 0.08;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    drawArrow(ctx, mid - 4, baseY - 2, mid + 18, baseY - 2, colors.gold);
    const bars = 12 + sigInt(spell, 1, 8, 'bins');
    for (let i = 0; i < bars; i++) {
      const amp = Math.abs(Math.sin(i * 0.74 + seed)) * (0.35 + sigUnit(spell, i, 'amp') * 0.65);
      const h = area.h * (0.08 + amp * 0.42);
      ctx.fillStyle = i === Math.floor(t / 11) % bars ? colors.gold : hsl(colors.hues[i % colors.hues.length], 84, 60, 0.38 + amp * 0.36);
      ctx.fillRect(mid + 28 + i * area.w * 0.4 / bars, baseY - h, area.w * 0.33 / bars, h);
    }
    drawGlyphText(ctx, 'time', area.x + area.w * 0.08, area.y + area.h * 0.18, colors.text);
    drawGlyphText(ctx, 'frequency', mid + 28, area.y + area.h * 0.18, colors.text);
    ctx.restore();
    return;
  }
  if (/cordic/.test(title)) {
    const cx = area.x + area.w * 0.48;
    const cy = area.y + area.h * 0.52;
    const r = Math.min(area.w, area.h) * 0.34;
    ctx.strokeStyle = colors.faint;
    for (let ring = 1; ring <= 3; ring++) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * ring / 3, 0, TAU);
      ctx.stroke();
    }
    let angle = -0.82 + sigUnit(spell, 1, 'target') * 1.64;
    for (let i = 0; i < 10; i++) {
      const step = Math.atan(Math.pow(2, -i));
      angle += ((sigInt(spell, i, 2, 'dir') ? 1 : -1) * step) * (0.2 + i / 10);
      const x = cx + Math.cos(angle) * r * (0.28 + i * 0.07);
      const y = cy + Math.sin(angle) * r * (0.28 + i * 0.07);
      drawArrow(ctx, cx, cy, x, y, i === Math.floor(t / 9) % 10 ? colors.gold : hsl(colors.hues[i % colors.hues.length], 84, 60, 0.44));
    }
    drawGlyphDot(ctx, cx, cy, 4.5, colors.gold);
    drawGlyphText(ctx, 'shift-add rotations', area.x + 8, area.y + 14, colors.text);
    ctx.restore();
    return;
  }
  const n = 8 + sigInt(spell, 1, 4, 'matrix');
  const cell = Math.min(area.w * 0.34 / n, area.h * 0.54 / n);
  const ox = area.x + area.w * 0.08;
  const oy = area.y + area.h * 0.18;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const v = Math.sin((x + 1) * (y + 1) + seed * 0.01);
    ctx.fillStyle = hsl(colors.hues[(x + y) % colors.hues.length], 74, 58, 0.12 + Math.abs(v) * 0.42);
    ctx.fillRect(ox + x * cell, oy + y * cell, cell - 1, cell - 1);
  }
  ctx.strokeStyle = colors.gold;
  ctx.beginPath();
  for (let i = 0; i <= 70; i++) {
    const u = i / 70;
    const x = area.x + area.w * (0.52 + u * 0.38);
    const y = area.y + area.h * (0.78 - Math.exp(-u * (2.4 + sigUnit(spell, 1, 'conv') * 4)) * 0.52 + Math.sin(u * TAU * 4 + t * 0.02) * 0.02);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const u = i / 8;
    drawGlyphDot(ctx, area.x + area.w * (0.52 + u * 0.38), area.y + area.h * (0.78 - Math.exp(-u * 3) * 0.52), i === Math.floor(t / 10) % 9 ? 4 : 2.5, i === Math.floor(t / 10) % 9 ? colors.gold : colors.cool);
  }
  drawGlyphText(ctx, 'matrix', ox, oy - 5, colors.text);
  drawGlyphText(ctx, 'residual', area.x + area.w * 0.52, area.y + area.h * 0.16, colors.text);
  ctx.restore();
}

function drawSemanticDynamics(ctx, area, t, seed, spell, colors) {
  ctx.save();
  semanticClip(ctx, area);
  const cols = 9;
  const rows = 6;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const px = area.x + (x + 0.5) * area.w / cols;
    const py = area.y + (y + 0.5) * area.h / rows;
    const dx = Math.sin(y * 0.7 + seed + t * 0.018) * 13 - (py - area.y - area.h / 2) * 0.045;
    const dy = Math.cos(x * 0.8 + seed - t * 0.016) * 10 + (px - area.x - area.w / 2) * 0.035;
    drawArrow(ctx, px - dx * 0.32, py - dy * 0.32, px + dx * 0.32, py + dy * 0.32, hsl(colors.hues[(x + y) % colors.hues.length], 78, 60, 0.48));
  }
  const paths = 4 + sigInt(spell, 1, 4, 'traj');
  for (let p = 0; p < paths; p++) {
    ctx.strokeStyle = p === 1 ? colors.gold : hsl(colors.hues[p % colors.hues.length], 82, 60, 0.52);
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const u = i / 80;
      const x = area.x + area.w * (0.12 + u * 0.78);
      const y = area.y + area.h * (0.5 + Math.sin(u * TAU * (0.7 + p * 0.14) + p + seed * 0.001) * (0.22 + p * 0.02) * Math.exp(-u * 0.35));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  for (let i = 0; i < 18; i++) {
    const u = (sigUnit(spell, i, 'fluid') + t * 0.0015) % 1;
    drawGlyphDot(ctx, area.x + area.w * u, area.y + area.h * (0.16 + sigUnit(spell, i + 5, 'fluid') * 0.68), 1.8 + sigUnit(spell, i, 'mass') * 2, i % 3 ? colors.cool : colors.hot);
  }
  ctx.restore();
}

function drawSemanticDistributed(ctx, area, t, seed, spell, colors) {
  ctx.save();
  semanticClip(ctx, area);
  const title = (spell.title || '').toLowerCase();
  if (/clock|timestamp|vector/.test(title)) {
    const nodes = 5 + sigInt(spell, 1, 4, 'clock');
    const cell = Math.min(area.w * 0.56 / nodes, area.h * 0.52 / nodes);
    const ox = area.x + area.w * 0.08;
    const oy = area.y + area.h * 0.16;
    for (let y = 0; y < nodes; y++) for (let x = 0; x < nodes; x++) {
      const v = (x === y ? 0.9 : sigUnit(spell, x + y * nodes + Math.floor(t / 20), 'vc'));
      ctx.fillStyle = v > 0.72 ? colors.gold : hsl(colors.hues[(x + y) % colors.hues.length], 80, 60, 0.16 + v * 0.38);
      ctx.fillRect(ox + x * cell, oy + y * cell, cell - 1, cell - 1);
    }
    drawSemanticGraph(ctx, { x: area.x + area.w * 0.66, y: area.y + area.h * 0.14, w: area.w * 0.28, h: area.h * 0.64 }, t, seed, spell, colors, 'network');
    ctx.restore();
    return;
  }
  const lanes = 5 + sigInt(spell, 1, 4, 'nodes');
  const laneY = Array.from({ length: lanes }, (_, i) => area.y + area.h * (0.12 + i * 0.76 / Math.max(1, lanes - 1)));
  laneY.forEach((y, i) => {
    ctx.strokeStyle = i === Math.floor(t / 22) % lanes ? colors.gold : colors.faint;
    ctx.beginPath();
    ctx.moveTo(area.x + 8, y);
    ctx.lineTo(area.x + area.w - 8, y);
    ctx.stroke();
    drawGlyphDot(ctx, area.x + 10, y, 4, i % 2 ? colors.hot : colors.cool);
  });
  for (let m = 0; m < 14; m++) {
    const from = sigInt(spell, m, lanes, 'from');
    const to = (from + 1 + sigInt(spell, m, Math.max(1, lanes - 1), 'to')) % lanes;
    const x1 = area.x + area.w * (0.16 + ((sigUnit(spell, m, 'time') + t * 0.0007) % 0.68));
    const x2 = x1 + area.w * (0.06 + sigUnit(spell, m, 'latency') * 0.12);
    drawArrow(ctx, x1, laneY[from], Math.min(area.x + area.w - 10, x2), laneY[to], hsl(colors.hues[m % colors.hues.length], 82, 60, 0.40));
  }
  const qx = area.x + area.w * 0.79;
  ctx.strokeStyle = colors.gold;
  ctx.beginPath();
  ctx.ellipse(qx, area.y + area.h * 0.5, area.w * 0.13, area.h * 0.34, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawSemanticCrypto(ctx, area, t, seed, spell, colors) {
  ctx.save();
  semanticClip(ctx, area);
  const title = (spell.title || '').toLowerCase();
  if (/zk|snark|stark|proof|circuit|plonk|fri|sumcheck|commit/.test(title)) {
    const cols = 5 + sigInt(spell, 1, 4, 'circuit');
    const rows = 4 + sigInt(spell, 2, 3, 'circuit');
    const x0 = area.x + area.w * 0.1;
    for (let r = 0; r < rows; r++) {
      const y = area.y + area.h * (0.15 + r * 0.7 / Math.max(1, rows - 1));
      ctx.strokeStyle = colors.faint;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(area.x + area.w * 0.9, y);
      ctx.stroke();
    }
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * area.w * 0.78 / Math.max(1, cols - 1);
      for (let r = 0; r < rows; r++) {
        if (sigUnit(spell, c * rows + r, 'gate') < 0.45) continue;
        const y = area.y + area.h * (0.15 + r * 0.7 / Math.max(1, rows - 1));
        ctx.fillStyle = c === Math.floor(t / 18) % cols ? colors.gold : hsl(colors.hues[(c + r) % colors.hues.length], 80, 60, 0.62);
        ctx.fillRect(x - 5, y - 5, 10, 10);
      }
    }
    ctx.strokeStyle = colors.hot;
    ctx.beginPath();
    for (let i = 0; i <= 70; i++) {
      const u = i / 70;
      const x = area.x + area.w * (0.1 + u * 0.8);
      const y = area.y + area.h * (0.82 - (0.34 + 0.18 * Math.sin(u * TAU * 2 + seed)) * Math.pow(u, 1.4));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
    return;
  }
  const labels = ['pub', 'msg', 'sig', 'ver'];
  const pts = labels.map((_, i) => ({ x: area.x + area.w * (0.15 + i * 0.24), y: area.y + area.h * (0.45 + Math.sin(i + t * 0.018) * 0.18) }));
  for (let i = 0; i < pts.length - 1; i++) drawArrow(ctx, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, i === Math.floor(t / 20) % 3 ? colors.gold : colors.faint);
  pts.forEach((p, i) => {
    drawGlyphDot(ctx, p.x, p.y, 9, i === Math.floor(t / 20) % pts.length ? colors.gold : (i % 2 ? colors.hot : colors.cool), colors.line);
    drawGlyphText(ctx, labels[i], p.x - 8, p.y + 3, getThemeColor('#0a0b0f', '#fff9d8'), 7, 22);
  });
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 ? colors.softer : colors.dim;
    ctx.fillRect(area.x + area.w * 0.12 + i * area.w * 0.076, area.y + area.h * 0.78, area.w * 0.052, 5 + sigInt(spell, i, 18, 'bits'));
  }
  ctx.restore();
}

function drawSemanticQuantum(ctx, area, t, seed, spell, colors, light = false) {
  ctx.save();
  semanticClip(ctx, area);
  if (light) {
    const emitter = { x: area.x + area.w * 0.1, y: area.y + area.h * 0.3 };
    const sensor = { x: area.x + area.w * 0.9, y: area.y + area.h * 0.72 };
    ctx.fillStyle = colors.gold;
    ctx.fillRect(emitter.x - 5, emitter.y - 5, 10, 10);
    drawGlyphDot(ctx, sensor.x, sensor.y, 9, colors.cool, colors.line);
    for (let path = 0; path < 9; path++) {
      const b1 = semanticPoint(area, spell, path, 'bounce');
      const b2 = semanticPoint(area, spell, path + 11, 'bounce');
      ctx.strokeStyle = path === Math.floor(t / 11) % 9 ? colors.gold : hsl(colors.hues[path % colors.hues.length], 84, 62, 0.22 + sigUnit(spell, path, 'energy') * 0.26);
      ctx.beginPath();
      ctx.moveTo(emitter.x, emitter.y);
      ctx.lineTo(b1.x, b1.y);
      ctx.lineTo(b2.x, b2.y);
      ctx.lineTo(sensor.x, sensor.y);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }
  const wires = 4 + sigInt(spell, 1, 3, 'wire');
  const gates = 6 + sigInt(spell, 2, 5, 'gateq');
  const ox = area.x + area.w * 0.08;
  for (let w = 0; w < wires; w++) {
    const y = area.y + area.h * (0.16 + w * 0.68 / Math.max(1, wires - 1));
    ctx.strokeStyle = colors.faint;
    ctx.beginPath();
    ctx.moveTo(ox, y);
    ctx.lineTo(area.x + area.w * 0.68, y);
    ctx.stroke();
  }
  for (let g = 0; g < gates; g++) {
    const x = ox + g * area.w * 0.58 / Math.max(1, gates - 1);
    const w = sigInt(spell, g, wires, 'wg');
    const y = area.y + area.h * (0.16 + w * 0.68 / Math.max(1, wires - 1));
    ctx.fillStyle = g === Math.floor(t / 16) % gates ? colors.gold : hsl(colors.hues[g % colors.hues.length], 84, 60, 0.68);
    if (g % 3 === 0 && wires > 1) {
      const y2 = area.y + area.h * (0.16 + ((w + 1) % wires) * 0.68 / Math.max(1, wires - 1));
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y2, 4, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = ctx.fillStyle;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y2);
      ctx.stroke();
    } else {
      ctx.fillRect(x - 6, y - 6, 12, 12);
    }
  }
  const cx = area.x + area.w * 0.83;
  const cy = area.y + area.h * 0.48;
  for (let i = 0; i < 12; i++) {
    const phase = i / 12 * TAU + t * 0.02 + seed * 0.001;
    const amp = area.h * (0.08 + sigUnit(spell, i, 'amp') * 0.16);
    ctx.strokeStyle = hsl(colors.hues[i % colors.hues.length], 84, 62, 0.5);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(phase) * amp, cy + Math.sin(phase) * amp);
    ctx.stroke();
  }
  drawGlyphDot(ctx, cx, cy, 4, colors.gold);
  ctx.restore();
}

function drawSemanticEvolution(ctx, area, t, seed, spell, colors) {
  ctx.save();
  semanticClip(ctx, area);
  const title = (spell.title || '').toLowerCase();
  if (/l-system|lsystem/.test(title)) {
    const base = { x: area.x + area.w * 0.5, y: area.y + area.h * 0.9 };
    function branch(x, y, len, angle, depth) {
      if (depth <= 0 || len < 4) return;
      const x2 = x + Math.cos(angle) * len;
      const y2 = y + Math.sin(angle) * len;
      ctx.strokeStyle = hsl(colors.hues[depth % colors.hues.length], 80, 58, 0.34 + depth * 0.08);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      const spread = 0.38 + sigUnit(spell, depth, 'branch') * 0.36;
      branch(x2, y2, len * 0.68, angle - spread, depth - 1);
      branch(x2, y2, len * 0.66, angle + spread * 0.82, depth - 1);
    }
    branch(base.x, base.y, area.h * 0.22, -Math.PI / 2 + Math.sin(t * 0.01) * 0.08, 6);
    ctx.restore();
    return;
  }
  ctx.strokeStyle = colors.line;
  ctx.beginPath();
  ctx.moveTo(area.x + 8, area.y + area.h * 0.82);
  ctx.lineTo(area.x + area.w - 8, area.y + area.h * 0.82);
  ctx.stroke();
  const generations = 5;
  for (let g = 0; g < generations; g++) {
    const cx = area.x + area.w * (0.12 + g * 0.78 / (generations - 1));
    const targetY = area.y + area.h * (0.72 - g * 0.1);
    for (let i = 0; i < 12; i++) {
      const fit = sigUnit(spell, i + g * 17, 'fitness');
      const x = cx + (sigUnit(spell, i, `gx${g}`) - 0.5) * area.w * 0.12;
      const y = targetY + (sigUnit(spell, i, `gy${g}`) - 0.5) * area.h * 0.18;
      drawGlyphDot(ctx, x, y, 1.8 + fit * 3.4, fit > 0.72 ? colors.gold : hsl(colors.hues[(i + g) % colors.hues.length], 84, 60, 0.28 + fit * 0.38));
    }
    if (g > 0) drawArrow(ctx, area.x + area.w * (0.12 + (g - 1) * 0.78 / (generations - 1)), targetY + area.h * 0.1, cx, targetY, colors.faint);
  }
  ctx.restore();
}

function drawSemanticUndecidable(ctx, area, t, seed, spell, colors) {
  ctx.save();
  semanticClip(ctx, area);
  const cols = 20;
  const rows = 8;
  const cell = Math.min(area.w * 0.68 / cols, area.h * 0.62 / rows);
  const ox = area.x + area.w * 0.06;
  const oy = area.y + area.h * 0.12;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const bit = (hash32(`${spell.signature}:${x}:${y}:${Math.floor(t / 20)}`) >>> ((x + y) % 13)) & 1;
    const diagonal = x === (y * 2 + Math.floor(t / 18)) % cols;
    ctx.fillStyle = diagonal ? colors.gold : bit ? colors.hot : colors.dim;
    ctx.fillRect(ox + x * cell + 1, oy + y * cell + 1, cell - 2, cell - 2);
  }
  ctx.strokeStyle = colors.gold;
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox + cols * cell, oy + rows * cell);
  ctx.stroke();
  const tapeX = area.x + area.w * 0.78;
  for (let i = 0; i < 9; i++) {
    const y = area.y + area.h * (0.14 + i * 0.076);
    ctx.fillStyle = i === Math.floor(t / 12) % 9 ? colors.gold : (sigUnit(spell, i, 'tape') > 0.5 ? colors.cool : colors.softer);
    ctx.fillRect(tapeX, y, area.w * 0.14, area.h * 0.045);
  }
  drawArrow(ctx, tapeX - 14, area.y + area.h * (0.16 + (Math.floor(t / 12) % 9) * 0.076), tapeX, area.y + area.h * (0.16 + (Math.floor(t / 12) % 9) * 0.076), colors.gold);
  drawGlyphText(ctx, 'diagonal', ox, oy - 4, colors.text);
  ctx.restore();
}

function drawHexCell(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) {
    const a = Math.PI / 6 + i / 6 * TAU;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
}

function drawRecipeScaffold(ctx, area, t, seed, spell, colors, recipe, intent) {
  ctx.save();
  semanticClip(ctx, area);
  ctx.lineWidth = 1;
  const sweep = ((t * 0.004 * recipe.tempo + sigUnit(spell, 1, 'sweep')) % 1);
  const faint = hsl(colors.hues[0], 42, 58, 0.09);
  const mid = hsl(colors.hues[1], 50, 58, 0.16);
  const hot = hsl(colors.hues[2], 60, 62, 0.24);
  switch (recipe.lens) {
    case 'cartesian ticks': {
      const cols = 5 + sigInt(spell, 0, 5, 'grid');
      const rows = 3 + sigInt(spell, 1, 4, 'grid');
      ctx.strokeStyle = faint;
      for (let x = 0; x <= cols; x++) {
        const px = area.x + x * area.w / cols;
        ctx.beginPath();
        ctx.moveTo(px, area.y);
        ctx.lineTo(px, area.y + area.h);
        ctx.stroke();
      }
      for (let y = 0; y <= rows; y++) {
        const py = area.y + y * area.h / rows;
        ctx.beginPath();
        ctx.moveTo(area.x, py);
        ctx.lineTo(area.x + area.w, py);
        ctx.stroke();
      }
      ctx.strokeStyle = mid;
      ctx.beginPath();
      ctx.moveTo(area.x + area.w * sweep, area.y);
      ctx.lineTo(area.x + area.w * sweep, area.y + area.h);
      ctx.stroke();
      break;
    }
    case 'polar phase':
    case 'orbit clock': {
      const cx = area.x + area.w / 2;
      const cy = area.y + area.h / 2;
      const r = Math.min(area.w, area.h) * 0.43;
      ctx.strokeStyle = faint;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * i / 4, r * 0.62 * i / 4, recipe.phase * 0.35, 0, TAU);
        ctx.stroke();
      }
      const rays = 8 + sigInt(spell, 2, 8, 'rays');
      for (let i = 0; i < rays; i++) {
        const a = i / rays * TAU + recipe.phase;
        ctx.strokeStyle = i === Math.floor(sweep * rays) ? hot : faint;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.62);
        ctx.stroke();
      }
      break;
    }
    case 'temporal lanes':
    case 'event ledger': {
      const lanes = 4 + sigInt(spell, 1, 5, 'lanes');
      for (let i = 0; i < lanes; i++) {
        const y = area.y + area.h * (0.1 + i * 0.8 / Math.max(1, lanes - 1));
        ctx.strokeStyle = i === Math.floor(sweep * lanes) ? hot : faint;
        ctx.beginPath();
        ctx.moveTo(area.x + 4, y);
        ctx.lineTo(area.x + area.w - 4, y);
        ctx.stroke();
        for (let k = 0; k < 4; k++) {
          const x = area.x + area.w * ((sigUnit(spell, i * 7 + k, 'event') + sweep * (0.03 + k * 0.01)) % 1);
          ctx.fillStyle = k === i % 4 ? colors.gold : mid;
          ctx.fillRect(x - 1.5, y - 4, 3, 8);
        }
      }
      break;
    }
    case 'isometric depth':
    case 'verlet constraint web': {
      const spin = recipe.phase + pointerPoint(area, 0.6).dx * 0.9;
      const cube = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
      ].map(([x, y, z]) => projectSemantic3D(x * 0.8, y * 0.55, z * 0.8, area, spin));
      const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      edges.forEach(([a, b], i) => {
        ctx.strokeStyle = i === Math.floor(sweep * edges.length) ? hot : faint;
        ctx.beginPath();
        ctx.moveTo(cube[a].x, cube[a].y);
        ctx.lineTo(cube[b].x, cube[b].y);
        ctx.stroke();
      });
      break;
    }
    case 'hex bin field': {
      const r = Math.max(5, Math.min(area.w, area.h) / (13 + sigInt(spell, 1, 5, 'hex')));
      for (let y = area.y - r; y < area.y + area.h + r; y += r * 1.5) {
        const row = Math.round((y - area.y) / (r * 1.5));
        for (let x = area.x - r; x < area.x + area.w + r; x += r * 1.72) {
          const cx = x + (row % 2) * r * 0.86;
          const active = sigUnit(spell, Math.round(cx + y), 'hex') > 0.76;
          ctx.strokeStyle = active ? mid : faint;
          drawHexCell(ctx, cx, y, r * 0.82);
          ctx.stroke();
        }
      }
      break;
    }
    case 'barycentric simplex':
    case 'constraint polytope': {
      const ax = area.x + area.w * 0.5;
      const ay = area.y + area.h * 0.12;
      const bx = area.x + area.w * 0.12;
      const by = area.y + area.h * 0.86;
      const cx = area.x + area.w * 0.88;
      const cy = area.y + area.h * 0.86;
      ctx.strokeStyle = mid;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.lineTo(cx, cy);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeStyle = faint;
      for (let i = 1; i < 6; i++) {
        const u = i / 6;
        ctx.beginPath();
        ctx.moveTo(lerp(ax, bx, u), lerp(ay, by, u));
        ctx.lineTo(lerp(ax, cx, u), lerp(ay, cy, u));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(lerp(bx, ax, u), lerp(by, ay, u));
        ctx.lineTo(lerp(bx, cx, u), lerp(by, cy, u));
        ctx.stroke();
      }
      break;
    }
    case 'contour section': {
      for (let band = 0; band < 7; band++) {
        ctx.strokeStyle = band === Math.floor(sweep * 7) ? hot : faint;
        ctx.beginPath();
        for (let i = 0; i <= 80; i++) {
          const u = i / 80;
          const x = area.x + u * area.w;
          const y = area.y + area.h * (0.16 + band * 0.11 + Math.sin(u * TAU * (1.2 + band * 0.18) + recipe.phase + t * 0.01) * 0.03);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
    }
    case 'raster memory': {
      const cols = 18 + sigInt(spell, 1, 10, 'raster');
      const rows = 6 + sigInt(spell, 2, 5, 'raster');
      const cw = area.w / cols;
      const ch = area.h / rows;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const on = sigUnit(spell, x + y * cols + Math.floor(t / 18), 'raster') > 0.86;
        if (!on) continue;
        ctx.fillStyle = hsl(colors.hues[(x + y) % colors.hues.length], 54, 56, 0.18);
        ctx.fillRect(area.x + x * cw + 1, area.y + y * ch + 1, Math.max(1, cw - 2), Math.max(1, ch - 2));
      }
      break;
    }
    case 'braid worldlines': {
      const strands = 3 + sigInt(spell, 1, 5, 'strands');
      for (let s = 0; s < strands; s++) {
        ctx.strokeStyle = s === Math.floor(sweep * strands) ? hot : faint;
        ctx.beginPath();
        for (let i = 0; i <= 70; i++) {
          const u = i / 70;
          const x = area.x + u * area.w;
          const y = area.y + area.h * (0.16 + 0.68 * ((s + 0.45 * Math.sin(u * TAU * 2 + recipe.phase + t * 0.012)) / strands));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
    }
    case 'quiver weather': {
      const cols = 7, rows = 5;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const px = area.x + (x + 0.5) * area.w / cols;
        const py = area.y + (y + 0.5) * area.h / rows;
        const a = Math.sin(x * 0.7 + seed + t * 0.01) + Math.cos(y * 0.6 + recipe.phase);
        const len = 4 + sigUnit(spell, x + y * cols, 'q') * 8;
        ctx.strokeStyle = faint;
        ctx.beginPath();
        ctx.moveTo(px - Math.cos(a) * len, py - Math.sin(a) * len);
        ctx.lineTo(px + Math.cos(a) * len, py + Math.sin(a) * len);
        ctx.stroke();
      }
      break;
    }
    case 'treemap budget': {
      let rects = [{ x: area.x + 3, y: area.y + 3, w: area.w - 6, h: area.h - 6, d: 0 }];
      for (let i = 0; i < 12; i++) {
        const r = rects.shift();
        if (!r) break;
        const split = 0.28 + sigUnit(spell, i, 'treebudget') * 0.44;
        if (r.w > r.h) {
          rects.push({ x: r.x, y: r.y, w: r.w * split, h: r.h, d: r.d + 1 }, { x: r.x + r.w * split, y: r.y, w: r.w * (1 - split), h: r.h, d: r.d + 1 });
        } else {
          rects.push({ x: r.x, y: r.y, w: r.w, h: r.h * split, d: r.d + 1 }, { x: r.x, y: r.y + r.h * split, w: r.w, h: r.h * (1 - split), d: r.d + 1 });
        }
      }
      rects.forEach((r, i) => {
        ctx.fillStyle = hsl(colors.hues[i % colors.hues.length], 48, 55, 0.06 + (i % 3) * 0.035);
        ctx.fillRect(r.x + 1, r.y + 1, Math.max(1, r.w - 2), Math.max(1, r.h - 2));
      });
      break;
    }
    case 'persistence barcode':
    case 'wavelet packet': {
      const bars = 8 + sigInt(spell, 1, 8, 'bars');
      for (let i = 0; i < bars; i++) {
        const y = area.y + area.h * (0.14 + i * 0.72 / Math.max(1, bars - 1));
        const x = area.x + area.w * (0.08 + sigUnit(spell, i, 'birth') * 0.36);
        const len = area.w * (0.12 + sigUnit(spell, i, 'death') * 0.48);
        ctx.strokeStyle = i === Math.floor(sweep * bars) ? hot : faint;
        ctx.lineWidth = recipe.lens === 'wavelet packet' ? 2 + (i % 3) : 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(Math.min(area.x + area.w - 6, x + len), y);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
      break;
    }
    case 'compound graph cells': {
      const cells = 4 + sigInt(spell, 1, 5, 'compound');
      for (let i = 0; i < cells; i++) {
        const x = area.x + area.w * (0.08 + sigUnit(spell, i, 'cx') * 0.7);
        const y = area.y + area.h * (0.08 + sigUnit(spell, i, 'cy') * 0.7);
        const w = area.w * (0.12 + sigUnit(spell, i, 'cw') * 0.14);
        const h = area.h * (0.14 + sigUnit(spell, i, 'ch') * 0.18);
        ctx.strokeStyle = i === Math.floor(sweep * cells) ? hot : faint;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, 5);
          ctx.stroke();
        } else {
          ctx.strokeRect(x, y, w, h);
        }
      }
      break;
    }
    case 'spiral microscope':
    case 'butterfly transform': {
      ctx.strokeStyle = faint;
      ctx.beginPath();
      const cx = area.x + area.w / 2;
      const cy = area.y + area.h / 2;
      for (let i = 0; i <= 150; i++) {
        const u = i / 150;
        const a = u * TAU * (recipe.lens === 'butterfly transform' ? 3.5 : 2.2) + recipe.phase + t * 0.006;
        const r = Math.min(area.w, area.h) * 0.44 * u;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a * (recipe.lens === 'butterfly transform' ? 2 : 1)) * r * 0.72;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

function recipeProjectionPoint(area, recipe, u, v, z = 0) {
  const cx = area.x + area.w / 2;
  const cy = area.y + area.h / 2;
  let x = area.x + area.w * u;
  let y = area.y + area.h * v;
  if (recipe.projection === 'axonometric' || recipe.projection === 'cutaway') {
    x += (z - 0.5) * area.w * 0.16;
    y -= (z - 0.5) * area.h * 0.18;
  } else if (recipe.projection === 'fisheye' || recipe.projection === 'hover lens') {
    const dx = x - cx;
    const dy = y - cy;
    const d = Math.hypot(dx, dy) / Math.max(1, Math.min(area.w, area.h));
    const k = 1 + 0.32 * Math.exp(-d * 4);
    x = cx + dx * k;
    y = cy + dy * k;
  } else if (recipe.projection === 'toroidal') {
    x = area.x + area.w * ((u + Math.sin(v * TAU + recipe.phase) * 0.04 + 1) % 1);
  } else if (recipe.projection === 'hyperbolic') {
    const dx = u - 0.5;
    const dy = v - 0.5;
    const d = Math.hypot(dx, dy);
    const k = Math.tanh(d * 2.2) / Math.max(0.001, d);
    x = cx + dx * k * area.w * 0.52;
    y = cy + dy * k * area.h * 0.52;
  } else if (recipe.projection === 'spacetime' || recipe.projection === 'phase-space') {
    y += Math.sin(u * TAU * 2 + recipe.phase) * area.h * 0.035;
  } else if (recipe.projection === 'split-screen') {
    x = u < 0.5 ? area.x + area.w * u * 0.92 : area.x + area.w * (0.54 + (u - 0.5) * 0.92);
  } else if (recipe.projection === 'stereographic') {
    const dx = u - 0.5;
    const dy = v - 0.5;
    const denom = 1 + dx * dx + dy * dy;
    x = cx + area.w * dx / denom;
    y = cy + area.h * dy / denom;
  }
  return { x, y };
}

function drawDataGrammarLayer(ctx, area, t, seed, spell, colors, recipe) {
  ctx.save();
  semanticClip(ctx, area);
  const phase = recipe.phase + t * 0.006 * recipe.tempo;
  const hot = hsl(colors.hues[0], 70, 62, 0.24);
  const cool = hsl(colors.hues[1], 66, 58, 0.22);
  const dim = hsl(colors.hues[2], 44, 56, 0.11);
  const gold = 'rgba(232,190,83,0.34)';
  ctx.lineWidth = 1;

  if (recipe.dataGrammar === 'matrix heatmap' || recipe.dataGrammar === 'channel trellis') {
    const cols = recipe.dataGrammar === 'channel trellis' ? 9 : 14 + sigInt(spell, 0, 7, 'matrix-cols');
    const rows = recipe.dataGrammar === 'channel trellis' ? 5 : 6 + sigInt(spell, 1, 5, 'matrix-rows');
    const cw = area.w / cols;
    const ch = area.h / rows;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const value = sigUnit(spell, x + y * cols + Math.floor(t / 18), 'data-cell');
        if (value < 0.48) continue;
        const p = recipeProjectionPoint(area, recipe, (x + 0.5) / cols, (y + 0.5) / rows, value);
        ctx.fillStyle = hsl(colors.hues[(x + y) % colors.hues.length], 56, 50 + value * 18, 0.05 + value * 0.16);
        ctx.fillRect(p.x - cw * 0.32, p.y - ch * 0.32, Math.max(1, cw * 0.64), Math.max(1, ch * 0.64));
      }
    }
  } else if (recipe.dataGrammar === 'density ridge stack' || recipe.dataGrammar === 'horizon band chart') {
    const bands = 4 + sigInt(spell, 1, 4, 'ridge-bands');
    for (let b = 0; b < bands; b++) {
      const base = area.y + area.h * (0.18 + b * 0.66 / Math.max(1, bands - 1));
      ctx.beginPath();
      for (let i = 0; i <= 64; i++) {
        const u = i / 64;
        const amp = Math.sin(u * TAU * (1.3 + b * 0.31) + phase + sigUnit(spell, b, 'ridge') * TAU);
        const y = base - Math.max(0, amp) * area.h * (0.05 + recipe.tension * 0.055);
        const p = recipeProjectionPoint(area, recipe, u, (y - area.y) / area.h, b / bands);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = b === Math.floor((phase % TAU) / TAU * bands) ? hot : dim;
      ctx.stroke();
    }
  } else if (recipe.dataGrammar === 'parallel coordinate braid') {
    const axes = 5 + sigInt(spell, 1, 4, 'parallel-axes');
    const lines = 5 + sigInt(spell, 2, 5, 'parallel-lines');
    for (let a = 0; a < axes; a++) {
      const x = area.x + area.w * (0.08 + a * 0.84 / Math.max(1, axes - 1));
      ctx.strokeStyle = dim;
      ctx.beginPath();
      ctx.moveTo(x, area.y + area.h * 0.14);
      ctx.lineTo(x, area.y + area.h * 0.86);
      ctx.stroke();
    }
    for (let l = 0; l < lines; l++) {
      ctx.strokeStyle = l === Math.floor(t / 16) % lines ? gold : hsl(colors.hues[l % colors.hues.length], 58, 58, 0.16);
      ctx.beginPath();
      for (let a = 0; a < axes; a++) {
        const u = 0.08 + a * 0.84 / Math.max(1, axes - 1);
        const v = 0.16 + sigUnit(spell, l * 17 + a, 'parallel') * 0.68;
        const p = recipeProjectionPoint(area, recipe, u, v, l / lines);
        if (a === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  } else if (recipe.dataGrammar === 'stream ribbon stack') {
    const bands = 4 + sigInt(spell, 1, 4, 'stream-bands');
    for (let b = 0; b < bands; b++) {
      ctx.fillStyle = hsl(colors.hues[b % colors.hues.length], 62, 54, 0.045 + b * 0.014);
      ctx.beginPath();
      for (let i = 0; i <= 42; i++) {
        const u = i / 42;
        const y = 0.5 + Math.sin(u * TAU * (1.2 + b * 0.15) + phase + b) * (0.04 + recipe.tension * 0.03) + (b - bands / 2) * 0.035;
        const p = recipeProjectionPoint(area, recipe, u, y, b / bands);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      for (let i = 42; i >= 0; i--) {
        const u = i / 42;
        const y = 0.55 + Math.sin(u * TAU * (1.2 + b * 0.15) + phase + b) * (0.04 + recipe.tension * 0.03) + (b - bands / 2) * 0.035;
        const p = recipeProjectionPoint(area, recipe, u, y, b / bands);
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fill();
    }
  } else if (recipe.dataGrammar === 'radial bin histogram') {
    const cx = area.x + area.w / 2;
    const cy = area.y + area.h / 2;
    const bins = 12 + sigInt(spell, 1, 8, 'radial-bins');
    for (let i = 0; i < bins; i++) {
      const a0 = i / bins * TAU + recipe.phase * 0.2;
      const a1 = (i + 0.72) / bins * TAU + recipe.phase * 0.2;
      const r = Math.min(area.w, area.h) * (0.12 + sigUnit(spell, i, 'radial') * 0.34);
      ctx.strokeStyle = i === Math.floor(t / 8) % bins ? gold : hsl(colors.hues[i % colors.hues.length], 62, 58, 0.16);
      ctx.beginPath();
      ctx.arc(cx, cy, r, a0, a1);
      ctx.stroke();
    }
  } else if (recipe.dataGrammar === 'contour isoline set') {
    for (let band = 0; band < 5; band++) {
      ctx.strokeStyle = band === Math.floor(t / 18) % 5 ? hot : dim;
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const u = i / 80;
        const v = 0.2 + band * 0.14 + Math.sin(u * TAU * (1.4 + band * 0.2) + phase) * 0.045;
        const p = recipeProjectionPoint(area, recipe, u, v, band / 5);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  } else if (recipe.dataGrammar === 'candlestick ledger' || recipe.dataGrammar === 'lollipop stems' || recipe.dataGrammar === 'field-to-tick plot' || recipe.dataGrammar === 'interval barcode') {
    const n = 10 + sigInt(spell, 1, 12, 'sticks');
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      const lo = 0.28 + sigUnit(spell, i, 'lo') * 0.42;
      const hi = Math.max(0.08, lo - 0.08 - sigUnit(spell, i, 'hi') * 0.22);
      const p1 = recipeProjectionPoint(area, recipe, u, lo, i / n);
      const p2 = recipeProjectionPoint(area, recipe, u, hi, i / n);
      ctx.strokeStyle = i === Math.floor(t / 10) % n ? gold : cool;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      if (recipe.dataGrammar === 'lollipop stems') drawGlyphDot(ctx, p2.x, p2.y, 2.4, gold);
      else if (recipe.dataGrammar === 'candlestick ledger') ctx.strokeRect(p2.x - 2, (p1.y + p2.y) / 2 - 4, 4, 8);
    }
  } else if (recipe.dataGrammar === 'small-multiple facets' || recipe.dataGrammar === 'facet strip chart') {
    const cols = 3;
    const rows = 2 + sigInt(spell, 0, 2, 'facets');
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const fx = area.x + area.w * (0.06 + x * 0.31);
        const fy = area.y + area.h * (0.08 + y * 0.78 / rows);
        const fw = area.w * 0.24;
        const fh = area.h * 0.24;
        ctx.strokeStyle = dim;
        ctx.strokeRect(fx, fy, fw, fh);
        ctx.strokeStyle = hsl(colors.hues[(x + y) % colors.hues.length], 64, 58, 0.2);
        ctx.beginPath();
        for (let i = 0; i <= 14; i++) {
          const u = i / 14;
          const py = fy + fh * (0.75 - sigUnit(spell, i + x * 13 + y * 31, 'facet') * 0.55);
          const px = fx + fw * u;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }
  } else {
    const n = 18 + sigInt(spell, 1, 12, 'scatter');
    let last = null;
    for (let i = 0; i < n; i++) {
      const u = 0.08 + sigUnit(spell, i, 'scatter-u') * 0.84;
      const v = 0.14 + sigUnit(spell, i, 'scatter-v') * 0.72;
      const p = recipeProjectionPoint(area, recipe, u, v, i / n);
      if (recipe.dataGrammar === 'connected scatter path' && last) {
        ctx.strokeStyle = dim;
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      drawGlyphDot(ctx, p.x, p.y, 1.6 + sigUnit(spell, i, 'scatter-r') * 2.4, i === Math.floor(t / 8) % n ? gold : cool);
      last = p;
    }
  }
  ctx.restore();
}

function drawSimulationGrammarLayer(ctx, area, t, seed, spell, colors, recipe) {
  ctx.save();
  semanticClip(ctx, area);
  const phase = recipe.phase + t * 0.01 * recipe.tempo;
  const faint = hsl(colors.hues[0], 44, 58, 0.11);
  const joint = hsl(colors.hues[1], 62, 58, 0.2);
  const active = 'rgba(232,190,83,0.38)';
  const body = hsl(colors.hues[2], 64, 58, 0.24);
  ctx.lineWidth = 1;

  if (recipe.simGrammar === 'spring joint lattice' || recipe.simGrammar === 'soft-body cloth' || recipe.simGrammar === 'rope bridge') {
    const cols = recipe.simGrammar === 'rope bridge' ? 9 : 5 + sigInt(spell, 1, 3, 'cloth-cols');
    const rows = recipe.simGrammar === 'rope bridge' ? 2 : 3 + sigInt(spell, 2, 3, 'cloth-rows');
    const pts = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const sag = recipe.simGrammar === 'rope bridge' ? Math.sin(x / Math.max(1, cols - 1) * Math.PI) * 0.12 : 0;
        pts.push(recipeProjectionPoint(area, recipe, 0.08 + x * 0.84 / Math.max(1, cols - 1), 0.2 + y * 0.52 / Math.max(1, rows - 1) + sag + Math.sin(phase + x + y) * 0.015, y / rows));
      }
    }
    ctx.strokeStyle = joint;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (x < cols - 1) {
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
        ctx.stroke();
      }
      if (y < rows - 1) {
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[i + cols].x, pts[i + cols].y);
        ctx.stroke();
      }
    }
    pts.forEach((p, i) => drawGlyphDot(ctx, p.x, p.y, i === Math.floor(t / 7) % pts.length ? 3 : 1.7, i === Math.floor(t / 7) % pts.length ? active : body));
  } else if (recipe.simGrammar === 'rigid-body stack' || recipe.simGrammar === 'rolling simplex') {
    const n = 7 + sigInt(spell, 1, 6, 'rigid');
    for (let i = 0; i < n; i++) {
      const layer = Math.floor(i / 4);
      const slot = i % 4;
      const u = 0.25 + slot * 0.15 + Math.sin(phase + i) * 0.012;
      const v = 0.78 - layer * 0.13;
      const p = recipeProjectionPoint(area, recipe, u, v, i / n);
      ctx.fillStyle = i === Math.floor(t / 12) % n ? active : body;
      if (recipe.marker === 'triangle' || recipe.simGrammar === 'rolling simplex') {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - 6);
        ctx.lineTo(p.x - 6, p.y + 5);
        ctx.lineTo(p.x + 6, p.y + 5);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(p.x - 5, p.y - 5, 10, 10);
      }
    }
  } else if (recipe.simGrammar === 'sensor tripwire' || recipe.simGrammar === 'broadphase sweep') {
    const sweep = (phase / TAU) % 1;
    ctx.strokeStyle = active;
    ctx.beginPath();
    ctx.moveTo(area.x + area.w * sweep, area.y + 4);
    ctx.lineTo(area.x + area.w * sweep, area.y + area.h - 4);
    ctx.stroke();
    const boxes = 7 + sigInt(spell, 1, 5, 'aabb');
    for (let i = 0; i < boxes; i++) {
      const u = 0.1 + sigUnit(spell, i, 'aabb-u') * 0.78;
      const v = 0.16 + sigUnit(spell, i, 'aabb-v') * 0.66;
      const p = recipeProjectionPoint(area, recipe, u, v, i / boxes);
      const hit = Math.abs(u - sweep) < 0.06;
      ctx.strokeStyle = hit ? active : faint;
      ctx.strokeRect(p.x - 10, p.y - 7, 20, 14);
    }
  } else if (recipe.simGrammar === 'collision islands' || recipe.simGrammar === 'contact manifold') {
    const islands = 3 + sigInt(spell, 1, 3, 'islands');
    for (let g = 0; g < islands; g++) {
      const cx = 0.18 + sigUnit(spell, g, 'island-x') * 0.64;
      const cy = 0.24 + sigUnit(spell, g, 'island-y') * 0.52;
      const count = 4 + sigInt(spell, g, 5, 'island-count');
      for (let i = 0; i < count; i++) {
        const a = i / count * TAU + phase * (0.2 + g * 0.05);
        const p = recipeProjectionPoint(area, recipe, cx + Math.cos(a) * 0.055, cy + Math.sin(a) * 0.075, g / islands);
        drawGlyphDot(ctx, p.x, p.y, 2.2, i === Math.floor(t / 8) % count ? active : body);
        if (i) {
          const q = recipeProjectionPoint(area, recipe, cx + Math.cos(a - TAU / count) * 0.055, cy + Math.sin(a - TAU / count) * 0.075, g / islands);
          ctx.strokeStyle = joint;
          ctx.beginPath();
          ctx.moveTo(q.x, q.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }
    }
  } else if (recipe.simGrammar === 'kinematic orbitals' || recipe.simGrammar === 'gravity well') {
    const cx = area.x + area.w / 2;
    const cy = area.y + area.h / 2;
    const rings = 3 + sigInt(spell, 1, 3, 'orbits');
    for (let r = 0; r < rings; r++) {
      const rx = area.w * (0.16 + r * 0.085);
      const ry = area.h * (0.09 + r * 0.045);
      ctx.strokeStyle = faint;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, recipe.phase * 0.4, 0, TAU);
      ctx.stroke();
      const a = phase * (0.6 + r * 0.23) + r;
      drawGlyphDot(ctx, cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, 3, r === Math.floor(t / 15) % rings ? active : body);
    }
  } else if (recipe.simGrammar === 'constraint solver' || recipe.simGrammar === 'articulated arm') {
    let x = area.x + area.w * 0.22;
    let y = area.y + area.h * 0.72;
    const links = 4 + sigInt(spell, 1, 4, 'arm');
    drawGlyphDot(ctx, x, y, 3, active);
    for (let i = 0; i < links; i++) {
      const a = -0.9 + i * 0.34 + Math.sin(phase + i) * 0.24;
      const len = Math.min(area.w, area.h) * (0.09 + sigUnit(spell, i, 'arm-len') * 0.035);
      const nx = x + Math.cos(a) * len;
      const ny = y + Math.sin(a) * len;
      ctx.strokeStyle = i === Math.floor(t / 10) % links ? active : joint;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      drawGlyphDot(ctx, nx, ny, 2.4, body);
      x = nx; y = ny;
    }
  } else {
    const n = 14 + sigInt(spell, 1, 12, 'particles');
    for (let i = 0; i < n; i++) {
      const u = (sigUnit(spell, i, 'part-u') + phase * (0.015 + (i % 4) * 0.004)) % 1;
      const v = 0.18 + ((sigUnit(spell, i, 'part-v') + Math.sin(phase + i) * 0.06 + 1) % 1) * 0.64;
      const p = recipeProjectionPoint(area, recipe, u, v, i / n);
      drawGlyphDot(ctx, p.x, p.y, 1.5 + sigUnit(spell, i, 'part-r') * 2.2, i === Math.floor(t / 6) % n ? active : body);
      if (recipe.simGrammar === 'impulse cascade' && i % 3 === 0) {
        const q = recipeProjectionPoint(area, recipe, (u + 0.06) % 1, v + Math.sin(i) * 0.04, i / n);
        drawArrow(ctx, p.x, p.y, q.x, q.y, joint);
      }
    }
  }
  ctx.restore();
}

function drawVisualDialectLayer(ctx, area, t, seed, spell, colors, recipe, pass = 'accent') {
  ctx.save();
  semanticClip(ctx, area);
  const phase = recipe.phase + t * 0.008 * recipe.tempo;
  const hueA = colors.hues[0];
  const hueB = colors.hues[1];
  const hueC = colors.hues[2];
  const faint = hsl(hueA, 34, 58, pass === 'ground' ? 0.07 : 0.14);
  const mid = hsl(hueB, 52, 58, pass === 'ground' ? 0.10 : 0.22);
  const hot = hsl(hueC, 66, 62, pass === 'ground' ? 0.12 : 0.34);
  const gold = pass === 'ground' ? 'rgba(232,190,83,0.10)' : 'rgba(232,190,83,0.36)';
  const d = recipe.visualDialect;
  ctx.lineWidth = 1;

  if (pass === 'ground') {
    if (/notebook|paper|architect|cartographer|topographic|botanical/.test(d)) {
      ctx.fillStyle = 'rgba(255,255,255,0.018)';
      ctx.fillRect(area.x, area.y, area.w, area.h);
      ctx.strokeStyle = faint;
      for (let y = area.y + 8; y < area.y + area.h; y += 11) {
        ctx.beginPath();
        ctx.moveTo(area.x + 5, y + Math.sin(y * 0.03 + phase) * 1.2);
        ctx.lineTo(area.x + area.w - 5, y + Math.cos(y * 0.02 + phase) * 1.1);
        ctx.stroke();
      }
      ctx.strokeStyle = gold;
      ctx.beginPath();
      ctx.moveTo(area.x + area.w * 0.13, area.y + 4);
      ctx.lineTo(area.x + area.w * 0.13, area.y + area.h - 4);
      ctx.stroke();
    } else if (/mission|control|radar|weather|oscilloscope|spectrogram|seismograph|signal/.test(d)) {
      ctx.strokeStyle = faint;
      const cols = 8, rows = 4;
      for (let x = 0; x <= cols; x++) {
        const px = area.x + x * area.w / cols;
        ctx.beginPath();
        ctx.moveTo(px, area.y);
        ctx.lineTo(px, area.y + area.h);
        ctx.stroke();
      }
      for (let y = 0; y <= rows; y++) {
        const py = area.y + y * area.h / rows;
        ctx.beginPath();
        ctx.moveTo(area.x, py);
        ctx.lineTo(area.x + area.w, py);
        ctx.stroke();
      }
    } else if (/xray|holographic|quantum|cloud|orbital|astronomer/.test(d)) {
      const cx = area.x + area.w / 2;
      const cy = area.y + area.h / 2;
      ctx.strokeStyle = faint;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, area.w * (0.12 + i * 0.08), area.h * (0.06 + i * 0.045), phase * 0.18 + i * 0.2, 0, TAU);
        ctx.stroke();
      }
    } else if (/circuit|compiler|ledger|market/.test(d)) {
      const rows = 6;
      ctx.strokeStyle = faint;
      for (let r = 0; r < rows; r++) {
        const y = area.y + area.h * (0.12 + r * 0.74 / (rows - 1));
        ctx.beginPath();
        ctx.moveTo(area.x + 8, y);
        for (let x = 0; x < 8; x++) {
          const px = area.x + area.w * (0.08 + x * 0.11);
          ctx.lineTo(px, y + ((x + r) % 2 ? -4 : 4));
        }
        ctx.lineTo(area.x + area.w - 8, y);
        ctx.stroke();
      }
    } else {
      ctx.strokeStyle = faint;
      for (let i = 0; i < 18; i++) {
        const u = i / 17;
        ctx.beginPath();
        ctx.moveTo(area.x + area.w * u, area.y + 4);
        ctx.lineTo(area.x + area.w * (1 - u), area.y + area.h - 4);
        ctx.stroke();
      }
    }
    ctx.restore();
    return;
  }

  if (/oscilloscope|signal|seismograph|spectrogram/.test(d)) {
    const traces = d === 'spectrogram wall' ? 8 : 3;
    for (let tr = 0; tr < traces; tr++) {
      ctx.strokeStyle = tr === Math.floor(t / 10) % traces ? hot : mid;
      ctx.beginPath();
      for (let i = 0; i <= 96; i++) {
        const u = i / 96;
        const amp = Math.sin(u * TAU * (2.5 + tr * 0.4) + phase + tr) * Math.cos(u * TAU + recipe.phase);
        const y = area.y + area.h * (0.22 + tr * 0.56 / Math.max(1, traces - 1)) + amp * area.h * (0.025 + recipe.tension * 0.02);
        const x = area.x + area.w * u;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (/cartographer|topographic|weather/.test(d)) {
    const lines = 7;
    for (let l = 0; l < lines; l++) {
      ctx.strokeStyle = l === Math.floor(t / 14) % lines ? hot : mid;
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const u = i / 80;
        const v = 0.14 + l * 0.11 + Math.sin(u * TAU * (1 + l * 0.13) + phase) * 0.025;
        const x = area.x + area.w * u;
        const y = area.y + area.h * v;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (let i = 0; i < 8; i++) {
      const x = area.x + area.w * (0.1 + sigUnit(spell, i, 'map-pin-x') * 0.8);
      const y = area.y + area.h * (0.12 + sigUnit(spell, i, 'map-pin-y') * 0.72);
      drawGlyphDot(ctx, x, y, 1.8, i === Math.floor(t / 12) % 8 ? gold : mid);
    }
  } else if (/field notebook|architect trace|botanical morphology|paper automaton/.test(d)) {
    ctx.strokeStyle = mid;
    for (let i = 0; i < 10; i++) {
      const x = area.x + area.w * (0.18 + sigUnit(spell, i, 'sketch-x') * 0.68);
      const y = area.y + area.h * (0.18 + sigUnit(spell, i, 'sketch-y') * 0.62);
      const r = 5 + sigUnit(spell, i, 'sketch-r') * 18;
      ctx.beginPath();
      ctx.arc(x, y, r, 0.2 + phase * 0.1, Math.PI * (0.7 + sigUnit(spell, i, 'arc') * 1.2));
      ctx.stroke();
      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.moveTo(x - r * 0.5, y + r * 0.25);
        ctx.lineTo(x + r * 0.5, y - r * 0.25);
        ctx.stroke();
      }
    }
  } else if (/mission|control-room|radar/.test(d)) {
    const cx = area.x + area.w * 0.78;
    const cy = area.y + area.h * 0.28;
    const r = Math.min(area.w, area.h) * 0.22;
    ctx.strokeStyle = mid;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * i / 3, Math.PI, TAU);
      ctx.stroke();
    }
    const a = phase % TAU;
    ctx.strokeStyle = hot;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
    for (let p = 0; p < 5; p++) {
      const px = area.x + area.w * (0.08 + p * 0.13);
      const py = area.y + area.h * (0.76 + Math.sin(phase + p) * 0.035);
      ctx.strokeStyle = p === Math.floor(t / 9) % 5 ? hot : mid;
      ctx.strokeRect(px, py, area.w * 0.08, area.h * 0.08);
    }
  } else if (/xray|holographic|cutaway/.test(d)) {
    const spin = phase * 0.25 + pointerPoint(area, 0.4).dx;
    const layers = 4;
    for (let z = 0; z < layers; z++) {
      const w = area.w * (0.18 + z * 0.06);
      const h = area.h * (0.12 + z * 0.04);
      const cx = area.x + area.w * (0.5 + (z - 1.5) * 0.055);
      const cy = area.y + area.h * (0.5 - (z - 1.5) * 0.04);
      ctx.strokeStyle = z === Math.floor(t / 16) % layers ? hot : mid;
      ctx.beginPath();
      ctx.moveTo(cx - w / 2 + Math.cos(spin) * 8, cy - h / 2);
      ctx.lineTo(cx + w / 2, cy - h / 2 + Math.sin(spin) * 6);
      ctx.lineTo(cx + w / 2 - Math.cos(spin) * 8, cy + h / 2);
      ctx.lineTo(cx - w / 2, cy + h / 2 - Math.sin(spin) * 6);
      ctx.closePath();
      ctx.stroke();
    }
  } else if (/circuit|compiler|ledger|market/.test(d)) {
    const cols = 9;
    for (let i = 0; i < cols; i++) {
      const x = area.x + area.w * (0.08 + i * 0.84 / (cols - 1));
      const v = sigUnit(spell, i + Math.floor(t / 20), 'ledger-v');
      const y = area.y + area.h * (0.75 - v * 0.5);
      ctx.strokeStyle = i === Math.floor(t / 8) % cols ? hot : mid;
      ctx.beginPath();
      ctx.moveTo(x, area.y + area.h * 0.82);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fillRect(x - 3, y - 2, 6, 4);
    }
  } else if (/cloud|quantum|orbital|astronomer/.test(d)) {
    const cx = area.x + area.w / 2;
    const cy = area.y + area.h / 2;
    for (let i = 0; i < 16; i++) {
      const a = phase * (0.3 + i * 0.02) + sigUnit(spell, i, 'orbit-a') * TAU;
      const rx = area.w * (0.08 + sigUnit(spell, i, 'orbit-rx') * 0.34);
      const ry = area.h * (0.05 + sigUnit(spell, i, 'orbit-ry') * 0.28);
      const x = cx + Math.cos(a) * rx;
      const y = cy + Math.sin(a) * ry;
      drawGlyphDot(ctx, x, y, 1.4 + sigUnit(spell, i, 'orbit-size') * 2.2, i === Math.floor(t / 5) % 16 ? gold : mid);
      if (i % 4 === 0) drawArrow(ctx, cx, cy, x, y, faint);
    }
  } else if (/subway|loom|neural|kinetic/.test(d)) {
    const lanes = 5 + sigInt(spell, 0, 4, 'dialect-lanes');
    for (let l = 0; l < lanes; l++) {
      ctx.strokeStyle = l === Math.floor(t / 13) % lanes ? hot : mid;
      ctx.beginPath();
      for (let i = 0; i <= 7; i++) {
        const u = i / 7;
        const v = 0.16 + ((l + (i % 2) * 0.38) / lanes) * 0.7 + Math.sin(phase + i + l) * 0.015;
        const x = area.x + area.w * u;
        const y = area.y + area.h * v;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        if ((i + l) % 3 === 0) drawGlyphDot(ctx, x, y, 2.1, ctx.strokeStyle);
      }
      ctx.stroke();
    }
  } else {
    const n = 10;
    for (let i = 0; i < n; i++) {
      const p = recipeProjectionPoint(area, recipe, 0.12 + sigUnit(spell, i, 'dialect-u') * 0.76, 0.14 + sigUnit(spell, i, 'dialect-v') * 0.72, i / n);
      drawGlyphDot(ctx, p.x, p.y, 2 + sigUnit(spell, i, 'dialect-r') * 2, i === Math.floor(t / 9) % n ? hot : mid);
    }
  }

  // Compact scene/series/spatial glyphs: proof metadata made visible, not decorative.
  const bx = area.x + area.w - 48;
  const by = area.y + area.h - 34;
  ctx.strokeStyle = faint;
  ctx.strokeRect(bx, by, 38, 24);
  if (/tree|container|stage|nested/.test(recipe.sceneGraph)) {
    const rootX = bx + 19, rootY = by + 6;
    drawGlyphDot(ctx, rootX, rootY, 2, gold);
    for (let i = 0; i < 3; i++) {
      const x = bx + 8 + i * 11;
      const y = by + 18;
      drawArrow(ctx, rootX, rootY + 2, x, y - 2, faint);
      drawGlyphDot(ctx, x, y, 1.8, mid);
    }
  } else if (/polar|radar/.test(recipe.chartSeries)) {
    ctx.beginPath();
    ctx.arc(bx + 19, by + 12, 8, 0, TAU);
    ctx.stroke();
    drawArrow(ctx, bx + 19, by + 12, bx + 27, by + 7, hot);
  } else {
    for (let i = 0; i < 5; i++) {
      const h = 4 + sigUnit(spell, i, 'mini-series') * 13;
      ctx.fillStyle = i === Math.floor(t / 8) % 5 ? gold : mid;
      ctx.fillRect(bx + 6 + i * 6, by + 20 - h, 3, h);
    }
  }
  if (/camera|mesh|light|babylon/.test(recipe.spatialScene)) {
    ctx.strokeStyle = hot;
    ctx.beginPath();
    ctx.moveTo(area.x + 8, area.y + area.h - 10);
    ctx.lineTo(area.x + 28, area.y + area.h - 22);
    ctx.lineTo(area.x + 46, area.y + area.h - 10);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSemanticGlyph(ctx, W, H, t, seed, spell, blueprint, fallbackHues) {
  if (!spell?.title) return false;
  const intent = semanticVisualIntent(spell);
  const recipe = recordVisualRecipe(spell, intent);
  const colors = semanticPalette(spell, blueprint, seed, recipe);
  const area = glyphArea(W, H);
  ctx.save();
  const previousRecipe = ctx.__visualRecipe;
  ctx.__visualRecipe = recipe;
  drawVisualDialectLayer(ctx, area, t, seed, spell, colors, recipe, 'ground');
  drawRecipeScaffold(ctx, area, t, seed, spell, colors, recipe, intent);
  switch (intent.kind) {
    case 'structure':
      drawSemanticGraph(ctx, area, t, seed, spell, colors, 'structure');
      break;
    case 'flow-graph':
      drawSemanticGraph(ctx, area, t, seed, spell, colors, 'flow-graph');
      break;
    case 'graph':
      drawSemanticGraph(ctx, area, t, seed, spell, colors, 'network');
      break;
    case 'logic':
      drawSemanticLogic(ctx, area, t, seed, spell, colors);
      break;
    case 'probability':
      drawSemanticProbability(ctx, area, t, seed, spell, colors);
      break;
    case 'sketch':
      drawSemanticSketch(ctx, area, t, seed, spell, colors);
      break;
    case 'cellular':
      drawSemanticAutomata(ctx, area, t, seed, spell, colors, true);
      break;
    case 'automata':
      drawSemanticAutomata(ctx, area, t, seed, spell, colors, false);
      break;
    case 'string':
      drawSemanticParsing(ctx, area, t, seed, spell, colors, true);
      break;
    case 'parsing':
      drawSemanticParsing(ctx, area, t, seed, spell, colors, false);
      break;
    case 'voronoi':
      drawSemanticTopology(ctx, area, t, seed, spell, colors, 'voronoi');
      break;
    case 'geometry-sweep':
      drawSemanticTopology(ctx, area, t, seed, spell, colors, 'geometry-sweep');
      break;
    case 'mesh':
    case 'topology':
      drawSemanticTopology(ctx, area, t, seed, spell, colors, 'mesh');
      break;
    case 'optimization':
      drawSemanticOptimization(ctx, area, t, seed, spell, colors);
      break;
    case 'numerical':
      drawSemanticNumerical(ctx, area, t, seed, spell, colors);
      break;
    case 'dynamics':
    case 'flow':
      drawSemanticDynamics(ctx, area, t, seed, spell, colors);
      break;
    case 'distributed':
      drawSemanticDistributed(ctx, area, t, seed, spell, colors);
      break;
    case 'crypto':
      drawSemanticCrypto(ctx, area, t, seed, spell, colors);
      break;
    case 'light':
      drawSemanticQuantum(ctx, area, t, seed, spell, colors, true);
      break;
    case 'quantum':
      drawSemanticQuantum(ctx, area, t, seed, spell, colors, false);
      break;
    case 'evolution':
      drawSemanticEvolution(ctx, area, t, seed, spell, colors);
      break;
    case 'undecidable':
      drawSemanticUndecidable(ctx, area, t, seed, spell, colors);
      break;
    default:
      drawSemanticGraph(ctx, area, t, seed, spell, colors, 'network');
  }
  drawDataGrammarLayer(ctx, area, t, seed, spell, colors, recipe);
  drawSimulationGrammarLayer(ctx, area, t, seed, spell, colors, recipe);
  drawVisualDialectLayer(ctx, area, t, seed, spell, colors, recipe, 'accent');
  ctx.__visualRecipe = previousRecipe;
  ctx.restore();
  return true;
}

function drawAuthenticGlyph(ctx, W, H, t, seed, spell) {
  extraBg(ctx, W, H);
  const mode = spell.visualMode || VISUAL_MODES[Math.abs(seed) % VISUAL_MODES.length];
  const blueprint = spell.visualBlueprint || {
    layout: VISUAL_LAYOUTS[Math.abs(seed) % VISUAL_LAYOUTS.length],
    mark: VISUAL_MARKS[Math.abs(seed) % VISUAL_MARKS.length],
    primary: mode.family,
    secondary: 'network',
    tertiary: 'spectrum',
    palette: VISUAL_PALETTES[Math.abs(seed) % VISUAL_PALETTES.length],
    density: 7,
    tilt: 0
  };
  const page = spell.page || 1;
  const tags = spell.tags || [];
  const hues = blueprint.palette || VISUAL_PALETTES[Math.abs(seed) % VISUAL_PALETTES.length];
  if (drawSemanticGlyph(ctx, W, H, t, seed, spell, blueprint, hues)) return;
  const baseHue = (hues[0] + signatureByte(spell, 0) + page * 11) % 360;
  const accentHue = (hues[1] + tags.length * 17) % 360;
  const hot = `hsla(${baseHue},88%,62%,0.86)`;
  const warm = `hsla(${accentHue},88%,61%,0.72)`;
  const ink = getThemeColor('rgba(244,240,255,0.68)', 'rgba(24,18,34,0.70)');
  const pulse = Math.sin(t * 0.035 + seed) * 0.5 + 0.5;
  const [mainArea, insetArea] = areaForLayout(blueprint.layout, W, H);
  const ox = mainArea.x, oy = mainArea.y, bw = mainArea.w, bh = mainArea.h;

  const primaryFamily = blueprint.primary || mode.family;
  if (!drawAdvancedFamily(ctx, primaryFamily, mainArea, t, seed, spell, blueprint, hues)) {
  switch (primaryFamily) {
    case 'matrix': {
      const cols = blueprint.density + 4 + (signatureByte(spell, 1) % 7);
      const rows = 3 + (blueprint.mark.length % 3) + (signatureByte(spell, 2) % 5);
      const cell = Math.min(bw / cols, bh / rows);
      const sx = ox + (bw - cols * cell) / 2;
      const sy = oy + (bh - rows * cell) / 2;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const v = hash32(`${spell.signature}:${x}:${y}:${Math.floor(t / 18)}`) % 100;
        ctx.fillStyle = v < 22 ? '#ffd700' : v < 58 ? hot : 'rgba(157,92,255,0.13)';
        ctx.fillRect(sx + x * cell + 1, sy + y * cell + 1, cell - 2, cell - 2);
      }
      break;
    }
    case 'network': {
      const n = blueprint.density + (signatureByte(spell, 1) % 8);
      const nodes = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + signatureByte(spell, i) * 0.002;
        const r = 32 + (signatureByte(spell, i + 2) % 52);
        nodes.push({ x: W / 2 + Math.cos(a) * r * 1.38, y: oy + bh / 2 + Math.sin(a) * r * 0.78 });
      }
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        if ((hash32(`${spell.signature}:${i}:${j}`) % 100) > 34) continue;
        ctx.strokeStyle = `hsla(${baseHue + i * 17},86%,62%,0.25)`;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
      nodes.forEach((node, i) => {
        ctx.fillStyle = i === Math.floor(t / 18) % n ? '#ffd700' : (i % 2 ? hot : warm);
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3.5 + (signatureByte(spell, i) % 5), 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }
    case 'timeline': {
      const lanes = 2 + (blueprint.density % 5) + (signatureByte(spell, 2) % 3);
      for (let lane = 0; lane < lanes; lane++) {
        const y = oy + 14 + lane * (bh - 20) / Math.max(1, lanes - 1);
        ctx.strokeStyle = lane % 2 ? warm : hot;
        ctx.beginPath();
        ctx.moveTo(ox, y);
        ctx.lineTo(ox + bw, y);
        ctx.stroke();
        for (let k = 0; k < 6; k++) {
          const x = ox + ((signatureByte(spell, lane + k) + t * (0.2 + lane * 0.04)) % 255) / 255 * bw;
          ctx.fillStyle = k === lane % 6 ? '#ffd700' : `hsla(${baseHue + k * 28},80%,60%,0.58)`;
          ctx.fillRect(x - 3, y - 8, 6 + (signatureByte(spell, k) % 12), 16);
        }
      }
      break;
    }
    case 'ledger': {
      const blocks = 4 + (blueprint.density % 5) + (signatureByte(spell, 1) % 4);
      const w = bw / blocks;
      for (let i = 0; i < blocks; i++) {
        const h = 44 + (signatureByte(spell, i) % 54);
        const x = ox + i * w + 4;
        const y = oy + bh - h;
        ctx.fillStyle = i === Math.floor(t / 25) % blocks ? 'rgba(255,215,0,0.70)' : (i % 2 ? hot : warm);
        ctx.fillRect(x, y, w - 8, h);
        ctx.strokeStyle = ink;
        ctx.strokeRect(x, y, w - 8, h);
        ctx.fillStyle = getThemeColor('#0a090c', '#fff9d8');
        ctx.font = '8px Space Mono, monospace';
        ctx.fillText((spell.signature || '').slice(i, i + 3), x + 5, y + 13);
      }
      break;
    }
    case 'spectrum': {
      const bars = 12 + blueprint.density + (signatureByte(spell, 2) % 12);
      for (let i = 0; i < bars; i++) {
        const v = (signatureByte(spell, i) / 255) * 0.55 + (Math.sin(t * 0.04 + i * 0.62) * 0.5 + 0.5) * 0.45;
        const x = ox + i * (bw / bars);
        const h = 8 + v * (bh - 12);
        ctx.fillStyle = `hsla(${baseHue + i * 8},86%,60%,${0.35 + v * 0.55})`;
        ctx.fillRect(x + 1, oy + bh - h, bw / bars - 2, h);
      }
      break;
    }
    case 'geometry': {
      const sides = 3 + (blueprint.mark.length % 5) + (signatureByte(spell, 0) % 7);
      for (let ring = 0; ring < 4; ring++) {
        const r = 24 + ring * 20 + signatureByte(spell, ring) % 12;
        ctx.strokeStyle = ring === 2 ? '#ffd700' : `hsla(${baseHue + ring * 42},86%,60%,0.56)`;
        ctx.lineWidth = 1.5 + ring * 0.35;
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
          const a = i / sides * Math.PI * 2 + t * 0.006 * (ring + 1);
          const x = W / 2 + Math.cos(a) * r * 1.45;
          const y = oy + bh / 2 + Math.sin(a) * r * 0.82;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
    }
    case 'proof': {
      const levels = 2 + (blueprint.density % 3) + (signatureByte(spell, 3) % 3);
      let previous = [{ x: W / 2, y: oy + 8 }];
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(W / 2 - 4, oy + 4, 8, 8);
      for (let level = 1; level <= levels; level++) {
        const count = previous.length + 1 + (signatureByte(spell, level) % 2);
        const current = [];
        for (let i = 0; i < count; i++) {
          current.push({ x: ox + (i + 1) * bw / (count + 1), y: oy + level * (bh - 16) / levels });
        }
        current.forEach((node, i) => {
          const parent = previous[i % previous.length];
          ctx.strokeStyle = `hsla(${baseHue + level * 35},86%,62%,0.44)`;
          ctx.beginPath();
          ctx.moveTo(parent.x, parent.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();
          ctx.fillStyle = i === Math.floor(t / 16) % count ? '#ffd700' : hot;
          ctx.fillRect(node.x - 4, node.y - 4, 8, 8);
        });
        previous = current;
      }
      break;
    }
    case 'memory': {
      const buckets = 4 + blueprint.density + (signatureByte(spell, 2) % 6);
      for (let i = 0; i < buckets; i++) {
        const load = 0.2 + (signatureByte(spell, i) / 255) * 0.78;
        const x = ox + i * bw / buckets + 3;
        const y = oy + 6;
        const w = bw / buckets - 6;
        ctx.strokeStyle = `hsla(${baseHue + i * 18},88%,62%,0.45)`;
        ctx.strokeRect(x, y, w, bh - 12);
        ctx.fillStyle = i === Math.floor(t / 20) % buckets ? 'rgba(255,215,0,0.62)' : `hsla(${baseHue + i * 19},86%,58%,0.46)`;
        ctx.fillRect(x + 3, y + (bh - 18) * (1 - load), w - 6, (bh - 18) * load);
      }
      break;
    }
    case 'automata': {
      const states = 4 + blueprint.density + (signatureByte(spell, 0) % 6);
      for (let i = 0; i < states; i++) {
        const x = ox + (i + 0.5) * bw / states;
        const y = oy + bh / 2 + Math.sin(i + t * 0.035) * 28;
        if (i > 0) {
          const px = ox + (i - 0.5) * bw / states;
          const py = oy + bh / 2 + Math.sin(i - 1 + t * 0.035) * 28;
          ctx.strokeStyle = `hsla(${baseHue + i * 22},86%,60%,0.46)`;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.quadraticCurveTo((px + x) / 2, oy + 10 + (signatureByte(spell, i) % 35), x, y);
          ctx.stroke();
        }
        ctx.fillStyle = i === Math.floor(t / 18) % states ? '#ffd700' : (i % 2 ? hot : warm);
        ctx.beginPath();
        ctx.arc(x, y, 6 + signatureByte(spell, i) % 5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    default: {
      const layers = 3 + (signatureByte(spell, 0) % 4);
      for (let layer = 0; layer < layers; layer++) {
        const y = oy + (layer + 1) * bh / (layers + 1);
        ctx.strokeStyle = `hsla(${baseHue + layer * 42},86%,60%,0.58)`;
        ctx.beginPath();
        for (let i = 0; i <= 90; i++) {
          const x = ox + (i / 90) * bw;
          const wave = Math.sin(i * 0.18 + t * 0.045 + layer + seed) * (8 + signatureByte(spell, layer) % 22);
          if (i === 0) ctx.moveTo(x, y + wave); else ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }
      ctx.fillStyle = `rgba(255,215,0,${0.22 + pulse * 0.42})`;
      ctx.beginPath();
      ctx.arc(ox + bw * pulse, oy + bh / 2, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  }

  drawMiniFamily(ctx, insetArea, blueprint.secondary, t, seed, spell, hues);
  drawMiniFamily(ctx, {
    x: Math.max(10, W - 82 - (signatureByte(spell, 0) % 36)),
    y: Math.max(14, H - 88 - (signatureByte(spell, 1) % 28)),
    w: 66,
    h: 38
  }, blueprint.tertiary, t + 11, seed + 97, spell, hues.slice().reverse());
}

const EXTRA_RENDERERS = {
  undecidable: drawUndecidable,
  quantum: drawQuantumWeb,
  logic: drawLogicMatrix,
  graph: drawGraphGlyph,
  flow: drawFlowGlyph,
  probability: drawProbabilityGlyph,
  sketch: drawSketchGlyph,
  automata: drawAutomataGlyph,
  evolution: drawEvolutionGlyph,
  optimization: drawOptimizationGlyph,
  distributed: drawDistributedGlyph,
  crypto: drawCryptoGlyph,
  topology: drawTopologyGlyph,
  parsing: drawParsingGlyph
};

function runExtraSpell(c, spell) {
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const seed = hash32(spell.id);
  let t = 0;
  const renderer = spell.visualMode ? drawAuthenticGlyph : (EXTRA_RENDERERS[spell.engine] || drawGraphGlyph);
  let rafId;
  function loop() {
    t++;
    renderer(ctx, W, H, t, seed, spell);
    rafId = requestAnimationFrame(loop);
  }
  loop();
  return rafId;
}

const DYNAMIC_SPELLS = [...EXTRA_SPELL_RECORDS, ...GENERATED_VOLUME_SPELLS];

for (const spell of DYNAMIC_SPELLS) {
  register(spell.id, (c) => runExtraSpell(c, spell));
}

mountExtraSpells();
mountStaticProofPanels();

// ===== INIT ALL =====
const BASE_ALGOS = [...HAND_BUILT_ALGO_IDS];
const ALL = [...BASE_ALGOS, ...DYNAMIC_SPELLS.map(spell => spell.id)];
const recordPageById = new Map([
  ...BASE_ALGOS.map(id => [id, 1]),
  ...DYNAMIC_SPELLS.map(spell => [spell.id, spell.page || 1])
]);
const dynamicSpellById = new Map(DYNAMIC_SPELLS.map(spell => [spell.id, spell]));
const VOLUME_PAGES = [
  {
    page: 1,
    short: 'Cursed Classics',
    title: 'The Original 100: Classical Rites, Forbidden Texts, and First Apocrypha',
    subtitle: 'The original grimoire: 30 hand-built rites plus 70 generated apocrypha, kept intact as Volume I.'
  },
  ...VOLUME_BLUEPRINTS.map(volume => ({
    page: volume.page,
    short: volume.short,
    title: volume.title,
    subtitle: volume.subtitle
  }))
];
const spellsByVolume = new Map(VOLUME_BLUEPRINTS.map(volume => [
  volume.page,
  GENERATED_VOLUME_SPELLS.filter(spell => spell.page === volume.page)
]));
let activeVolumePage = 1;
let dynamicObservedCanvases = [];
let manualCenterLockUntil = 0;
const recordFilters = {
  search: '',
  tag: 'all',
  engine: 'all',
  source: 'all',
  sonic: 'all',
  visual: 'all'
};

const sonicRuntime = (() => {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  const button = document.querySelector('[data-audio-toggle]');
  let ctx = null;
  let enabled = true;
  let unlocked = false;
  let lastHoverCode = '';
  let lastHoverAt = 0;
  const lastAlgorithmEventAt = new Map();
  const runVoices = new Map();
  let scheduledRunNotes = 0;
  let audioMode = 'solo';
  let lastMonsterCount = 0;
  let lastMonsterAt = 0;

  function updateButton() {
    if (!button) return;
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? 'Mute algorithm sound' : 'Enable algorithm sound');
    button.title = enabled
      ? (unlocked ? 'Algorithm sound on' : 'Algorithm sound armed; click an algorithm once to unlock browser audio')
      : 'Enable algorithm sound';
    button.classList.toggle('audio-on', enabled);
  }

  async function ensureContext() {
    if (!enabled || !AudioContextCtor) return null;
    if (!ctx) ctx = new AudioContextCtor({ latencyHint: 'interactive' });
    if (ctx.state === 'suspended') await ctx.resume();
    unlocked = ctx.state === 'running';
    updateButton();
    activatePendingRunVoices();
    return ctx;
  }

  function readRecipe(card) {
    if (!card) return null;
    const vector = (card.dataset.audioVector || '')
      .split('-')
      .map(value => Number(value))
      .filter(value => Number.isFinite(value));
    const ratios = (card.dataset.audioRatios || '1,1.25,1.5')
      .split(',')
      .map(value => Number(value))
      .filter(value => Number.isFinite(value) && value > 0);
    return {
      code: card.dataset.audioCode || '',
      fingerprint: card.dataset.audioFingerprint || '',
      kind: card.dataset.audioKind || 'unknown',
      kernel: card.dataset.audioKernel || 'metadata-state vector trace',
      rootHz: Number(card.dataset.audioRoot || 220),
      modHz: Number(card.dataset.audioMod || 3),
      shimmerHz: Number(card.dataset.audioShimmer || 880),
      tempoBpm: Number(card.dataset.audioTempo || 96),
      waveform: card.dataset.audioWave || 'triangle',
      ratios: ratios.length ? ratios : [1, 1.25, 1.5],
      vector: vector.length ? vector : [3, 1, 4, 1, 5, 9],
      isSorting: card.dataset.audioSort === 'true',
      intensity: Number(getComputedStyle(card).getPropertyValue('--sonic-intensity')) || 0.5
    };
  }

  function mark(card, recipe, gesture) {
    card.classList.add('sonic-active');
    card.classList.toggle('sonic-click', gesture !== 'hover');
    card.style.setProperty('--sonic-pulse-ms', `${gesture === 'hover' ? 360 : 860}ms`);
    window.clearTimeout(card.__sonicTimer);
    card.__sonicTimer = window.setTimeout(() => {
      card.classList.remove('sonic-active', 'sonic-click');
    }, gesture === 'hover' ? 420 : 920);
  }

  function scheduleVoice(context, destination, freq, at, duration, gainValue, type, panValue, filterFreq) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const panner = context.createStereoPanner ? context.createStereoPanner() : null;

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(30, Math.min(9000, freq)), at);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, Math.min(9000, freq * 1.012)), at + duration * 0.72);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainValue), at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(0.9, at);
    filter.frequency.setValueAtTime(Math.max(120, Math.min(7200, filterFreq)), at);

    osc.connect(gain);
    gain.connect(filter);
    if (panner) {
      panner.pan.setValueAtTime(Math.max(-0.8, Math.min(0.8, panValue)), at);
      filter.connect(panner);
      panner.connect(destination);
    } else {
      filter.connect(destination);
    }
    osc.start(at);
    osc.stop(at + duration + 0.025);
  }

  function scheduleSound(context, recipe, gesture) {
    const now = context.currentTime + 0.012;
    const click = gesture !== 'hover';
    const total = click ? 0.72 : 0.18;
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(click ? 0.26 : 0.12, now + 0.018);
    master.gain.exponentialRampToValueAtTime(0.0001, now + total + 0.08);
    master.connect(context.destination);

    const codeHash = hash32(recipe.code || recipe.fingerprint || recipe.kernel);
    const pan = ((codeHash % 161) - 80) / 100;
    const step = Math.max(0.042, 60 / recipe.tempoBpm / 4);
    const wave = recipe.waveform;
    const vector = click ? recipe.vector : recipe.vector.slice(0, 3);

    if (recipe.isSorting && click) {
      const sorted = [...vector].sort((a, b) => a - b);
      vector.forEach((value, index) => {
        const targetRank = sorted.indexOf(value) + 1;
        const displacement = Math.abs(targetRank - (index + 1));
        const freq = recipe.rootHz * (1 + value / 12 + displacement / 22);
        const at = now + index * step;
        scheduleVoice(context, master, freq, at, step * 0.78, 0.062 + displacement * 0.008, wave, pan * (index % 2 ? -1 : 1), freq * 2.4);
      });
    } else {
      vector.forEach((value, index) => {
        const ratio = recipe.ratios[index % recipe.ratios.length];
        const freq = recipe.rootHz * ratio * (1 + value / 64);
        const at = now + (click ? index * step * 0.9 : index * 0.038);
        scheduleVoice(context, master, freq, at, click ? step * 0.86 : 0.12, click ? 0.054 : 0.034, wave, pan * Math.sin(index + 1), freq * (1.8 + value / 7));
      });
    }

    const shimmerGain = click ? 0.043 : 0.019;
    scheduleVoice(context, master, recipe.shimmerHz, now + 0.03, click ? 0.26 : 0.1, shimmerGain, 'sine', -pan * 0.5, recipe.shimmerHz * 0.9);
    window.setTimeout(() => master.disconnect(), (total + 0.25) * 1000);
  }

  function eventNumber(event, keys, fallback = 0) {
    for (const key of keys) {
      const value = Number(event[key]);
      if (Number.isFinite(value)) return value;
    }
    return fallback;
  }

  function eventWaveform(recipe, type) {
    if (type === 'shuffle' || type === 'prune') return 'sawtooth';
    if (type === 'swap' || type === 'write') return 'square';
    if (type === 'merge' || type === 'insert') return 'triangle';
    if (type === 'sorted' || type === 'done' || type === 'observe') return 'sine';
    return recipe.waveform;
  }

  function scheduleAlgorithmEvent(context, recipe, event = {}) {
    const type = String(event.type || event.phase || 'state');
    const stepNo = eventNumber(event, ['step', 'phase'], 0);
    const eventHash = hash32(`${recipe.code}:${type}:${stepNo}:${event.index ?? ''}:${event.value ?? ''}:${event.direction ?? ''}`);
    const now = context.currentTime + 0.008;
    const master = context.createGain();
    const vectorFallback = recipe.vector[eventHash % recipe.vector.length] || 1;
    const value = eventNumber(event, ['value', 'disorder', 'sortedCount', 'phase'], vectorFallback);
    const from = eventNumber(event, ['from'], eventNumber(event, ['index'], 0));
    const to = eventNumber(event, ['to'], from);
    const index = eventNumber(event, ['index'], from);
    const ratio = recipe.ratios[Math.abs(Math.round(eventHash + value + index)) % recipe.ratios.length] || 1;
    const direction = to - from;
    const pan = Math.max(-0.82, Math.min(0.82, direction / 10 + ((eventHash % 91) - 45) / 140));
    const success = Boolean(event.success) || type === 'sorted' || type === 'done' || type === 'observe';
    const accent = success || type === 'swap' || type === 'write' || type === 'merge';
    const duration = success ? 0.19 : accent ? 0.12 : 0.072;
    const gainValue = success ? 0.088 : accent ? 0.072 : 0.048;
    const freq = recipe.rootHz * ratio * (1 + (Math.abs(value) % 29) / 96 + Math.abs(direction) / 84);
    const filterFreq = freq * (type === 'shuffle' ? 3.1 : type === 'prune' ? 1.6 : 2.25);

    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(success ? 0.2 : 0.14, now + 0.012);
    master.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.11);
    master.connect(context.destination);

    scheduleVoice(context, master, freq, now, duration, gainValue, eventWaveform(recipe, type), pan, filterFreq);

    if (type === 'shuffle' || type === 'prune') {
      const scatter = recipe.vector.slice(0, 3);
      scatter.forEach((sample, sampleIndex) => {
        const scatterFreq = recipe.rootHz * (1 + sample / 18 + sampleIndex / 9);
        scheduleVoice(context, master, scatterFreq, now + sampleIndex * 0.026, 0.052, 0.032, 'sawtooth', -pan * (sampleIndex % 2 ? 1 : -1), scatterFreq * 2.8);
      });
    } else if (type === 'merge' || type === 'insert') {
      scheduleVoice(context, master, freq * (type === 'merge' ? 1.5 : 1.25), now + 0.04, duration * 0.85, 0.04, 'triangle', -pan * 0.62, freq * 2.9);
    } else if (accent) {
      scheduleVoice(context, master, freq * (success ? 2 : 1.414), now + 0.032, duration * 0.7, success ? 0.046 : 0.034, 'sine', -pan * 0.5, recipe.shimmerHz);
    }

    const shimmerFreq = success ? recipe.shimmerHz * 1.08 : recipe.shimmerHz * (0.94 + (eventHash % 9) / 80);
    scheduleVoice(context, master, shimmerFreq, now + 0.018, success ? 0.18 : 0.075, success ? 0.032 : 0.018, 'sine', -pan * 0.3, shimmerFreq);
    window.setTimeout(() => master.disconnect(), (duration + 0.22) * 1000);
  }

  function findCardById(id) {
    return [...document.querySelectorAll('.spell-card')].find(candidate => candidate.dataset.algo === id) || null;
  }

  function phraseWaveform(recipe, beat) {
    if (recipe.isSorting && beat % 3 === 0) return 'triangle';
    if (recipe.kind === 'quantum' || recipe.kernel.includes('phase')) return beat % 4 === 0 ? 'sine' : 'triangle';
    if (recipe.kind === 'distributed' || recipe.kernel.includes('quorum')) return beat % 5 === 0 ? 'square' : 'triangle';
    if (recipe.kind === 'crypto' || recipe.kernel.includes('witness')) return beat % 6 === 0 ? 'square' : recipe.waveform;
    return recipe.waveform;
  }

  function scheduleRunPhrase(voice) {
    if (!ctx || !voice.active || !voice.master || ctx.state !== 'running') return;
    const recipe = voice.recipe;
    const horizon = ctx.currentTime + 0.58;
    const cadenceMs = Math.max(12, voice.cadenceMs || FRAME_INTERVAL_MS);
    const cadenceRatio = clamp(FRAME_INTERVAL_MS / cadenceMs, 0.58, 1.52);
    const baseStep = clamp((60 / recipe.tempoBpm) / (recipe.isSorting ? 2.3 : 3.15), 0.055, 0.31);
    const kernelHash = hash32(`${recipe.kernel}:${recipe.fingerprint}:run`);
    const stride = 1 + (kernelHash % Math.max(1, recipe.vector.length - 1));
    const liveEnergy = clamp(voice.energy || 1, 0.35, 2.45);
    let guard = 0;

    while (voice.nextAt < horizon && guard < 10) {
      const beat = voice.beat++;
      const vectorIndex = Math.abs((beat * stride + voice.frames + kernelHash) % recipe.vector.length);
      const value = recipe.vector[vectorIndex] || 1;
      const ratio = recipe.ratios[Math.abs((beat + value + kernelHash) % recipe.ratios.length)] || 1;
      const framePhase = (voice.frames % 97) / 97;
      const variance = Math.abs(value - (recipe.vector[(vectorIndex + 1) % recipe.vector.length] || value));
      const octave = beat % 16 === 0 ? 0.5 : beat % 11 === 0 ? 2 : 1;
      const freq = recipe.rootHz * ratio * octave * (1 + value / 78 + framePhase / 42 + variance / 190);
      const pan = Math.sin((beat + kernelHash % 31) * 0.73) * 0.74;
      const rhythmBend = 0.78 + ((hash32(`${recipe.code}:${beat}`) % 45) / 100);
      const step = clamp((baseStep * rhythmBend) / cadenceRatio, 0.052, 0.34);
      const duration = clamp(step * (recipe.isSorting ? 0.72 : 0.58 + (value % 4) * 0.06), 0.04, 0.26);
      const gainValue = clamp(0.032 + recipe.intensity * 0.03 + liveEnergy * 0.009 + variance * 0.0025, 0.028, 0.102);
      const filterFreq = freq * (1.55 + (value % 7) * 0.22 + liveEnergy * 0.16);

      scheduleVoice(ctx, voice.master, freq, voice.nextAt, duration, gainValue, phraseWaveform(recipe, beat), pan, filterFreq);
      scheduledRunNotes++;
      voice.scheduledNotes++;

      if (beat % 8 === 0) {
        const bassFreq = Math.max(32, recipe.rootHz * (0.5 + (value % 3) * 0.08));
        scheduleVoice(ctx, voice.master, bassFreq, voice.nextAt, Math.min(0.34, duration * 1.7), 0.022 + recipe.intensity * 0.015, 'sine', -pan * 0.35, bassFreq * 3);
        scheduledRunNotes++;
        voice.scheduledNotes++;
      }

      if (beat % 5 === 0 || recipe.isSorting) {
        const shimmerFreq = recipe.shimmerHz * (0.96 + (value % 9) / 90);
        scheduleVoice(ctx, voice.master, shimmerFreq, voice.nextAt + duration * 0.35, Math.min(0.13, duration), 0.013 + recipe.intensity * 0.008, 'sine', -pan * 0.55, shimmerFreq);
        scheduledRunNotes++;
        voice.scheduledNotes++;
      }

      voice.nextAt += step;
      guard++;
    }
  }

  function activateRunVoice(voice) {
    if (!ctx || !unlocked || !voice.active || voice.timer) return false;
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.48, now + 0.08);
    master.connect(ctx.destination);
    voice.master = master;
    voice.nextAt = Math.max(now + 0.035, voice.nextAt || 0);
    scheduleRunPhrase(voice);
    voice.timer = window.setInterval(() => scheduleRunPhrase(voice), 145);
    voice.card.classList.add('sonic-running');
    voice.card.style.setProperty('--sonic-pulse-ms', '1180ms');
    return true;
  }

  function activatePendingRunVoices() {
    if (!ctx || !unlocked) return;
    for (const voice of runVoices.values()) activateRunVoice(voice);
  }

  function setRunAudioMode(mode) {
    audioMode = mode === 'overlap' ? 'overlap' : 'solo';
    if (audioMode === 'solo' && runVoices.size > 1) {
      const newest = [...runVoices.keys()].pop();
      for (const existingId of [...runVoices.keys()]) {
        if (existingId !== newest) stopRunAudio(existingId);
      }
    }
    return audioMode;
  }

  function startRunAudio(id, meta = {}) {
    if (!enabled) return false;
    const requestedMode = meta.mode === 'overlap' || meta.mode === 'solo' ? meta.mode : audioMode;
    if (requestedMode === 'solo') {
      for (const existingId of [...runVoices.keys()]) {
        if (existingId !== id) stopRunAudio(existingId);
      }
    }
    stopRunAudio(id);
    const card = findCardById(id);
    const recipe = readRecipe(card);
    if (!card || !recipe?.code) return false;
    const voice = {
      id,
      card,
      recipe,
      source: meta.source || 'run',
      active: true,
      timer: null,
      master: null,
      nextAt: 0,
      beat: 0,
      frames: 0,
      cadenceMs: FRAME_INTERVAL_MS,
      energy: 1,
      scheduledNotes: 0,
      startedAt: performance.now(),
      maxMs: clamp(Number(meta.maxMs) || DEFAULT_RUN_AUDIO_MS, 700, 120000),
      lastTickAt: 0,
      endTimer: null
    };
    runVoices.set(id, voice);
    card.classList.add('sonic-running');
    card.style.setProperty('--sonic-live', '0.5');
    mark(card, recipe, 'run');
    voice.endTimer = window.setTimeout(() => {
      const stopped = stopRunAudio(id);
      if (stopped && typeof updateSonicConsoleStatus === 'function') {
        window.setTimeout(() => updateSonicConsoleStatus(`ended ${id}`), 0);
      }
    }, voice.maxMs);
    if (unlocked && ctx?.state === 'running') return activateRunVoice(voice);
    ensureContext().then(() => activateRunVoice(voice)).catch(() => {});
    return false;
  }

  function stopRunAudio(id) {
    const voice = runVoices.get(id);
    if (!voice) return false;
    voice.active = false;
    if (voice.timer) window.clearInterval(voice.timer);
    if (voice.endTimer) window.clearTimeout(voice.endTimer);
    voice.timer = null;
    voice.endTimer = null;
    const master = voice.master;
    if (master && ctx) {
      const now = ctx.currentTime;
      try {
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value || 0.0001), now);
        master.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        window.setTimeout(() => master.disconnect(), 140);
      } catch {
        try { master.disconnect(); } catch {}
      }
    }
    voice.card.classList.remove('sonic-running');
    voice.card.style.removeProperty('--sonic-live');
    runVoices.delete(id);
    return true;
  }

  function stopAllRunAudio() {
    for (const id of [...runVoices.keys()]) stopRunAudio(id);
  }

  function hasRunAudio(id) {
    return runVoices.has(id);
  }

  function tickRunAudio(id, tick = {}) {
    const voice = runVoices.get(id);
    if (!voice) return false;
    const elapsed = Number(tick.elapsed) || FRAME_INTERVAL_MS;
    voice.frames++;
    voice.cadenceMs = lerp(voice.cadenceMs || elapsed, elapsed, 0.22);
    const jitter = Math.abs(elapsed - FRAME_INTERVAL_MS) / FRAME_INTERVAL_MS;
    const vectorPulse = (voice.recipe.vector[voice.frames % voice.recipe.vector.length] || 1) / 9;
    voice.energy = clamp(0.5 + jitter * 0.65 + vectorPulse * 0.55, 0.35, 2.45);
    voice.lastTickAt = performance.now();
    voice.card.style.setProperty('--sonic-live', String(clamp(voice.energy / 2.1, 0.2, 1)));
    return true;
  }

  async function play(card, gesture = 'hover') {
    if (!enabled || !card) return false;
    const recipe = readRecipe(card);
    if (!recipe?.code) return false;
    const nowMs = performance.now();
    if (gesture === 'hover' && recipe.code === lastHoverCode && nowMs - lastHoverAt < 260) return false;
    if (gesture === 'hover' && !unlocked) return false;
    lastHoverCode = recipe.code;
    lastHoverAt = nowMs;
    mark(card, recipe, gesture);
    const context = await ensureContext();
    if (!context) return false;
    scheduleSound(context, recipe, gesture);
    activatePendingRunVoices();
    return true;
  }

  async function algorithmEvent(id, event = {}) {
    if (!enabled || !unlocked || !AudioContextCtor) return false;
    const card = [...document.querySelectorAll('.spell-card')].find(candidate => candidate.dataset.algo === id);
    if (!card) return false;
    const recipe = readRecipe(card);
    if (!recipe?.code) return false;
    const type = String(event.type || event.phase || 'state');
    const nowMs = performance.now();
    const throttleKey = `${id}:${type}`;
    const throttleMs = type === 'shuffle' ? 150 : type === 'insert' || type === 'merge' ? 90 : 70;
    if (nowMs - (lastAlgorithmEventAt.get(throttleKey) || 0) < throttleMs) return false;
    lastAlgorithmEventAt.set(throttleKey, nowMs);
    mark(card, recipe, 'algorithm');
    const context = await ensureContext();
    if (!context) return false;
    scheduleAlgorithmEvent(context, recipe, event);
    return true;
  }

  function normalizeRecipe(recipe) {
    const vector = Array.isArray(recipe?.vector) && recipe.vector.length ? recipe.vector : [3, 1, 4, 1, 5, 9];
    const ratios = Array.isArray(recipe?.ratios) && recipe.ratios.length ? recipe.ratios : [1, 1.25, 1.5];
    return {
      code: recipe?.code || recipe?.fingerprint || 'monster',
      fingerprint: recipe?.fingerprint || '',
      kind: recipe?.kind || 'unknown',
      kernel: recipe?.kernel || 'metadata-state vector trace',
      rootHz: Number(recipe?.rootHz) || 220,
      modHz: Number(recipe?.modHz) || 3,
      shimmerHz: Number(recipe?.shimmerHz) || 880,
      tempoBpm: Number(recipe?.tempoBpm) || 96,
      waveform: recipe?.waveform || 'triangle',
      ratios,
      vector,
      isSorting: Boolean(recipe?.isSorting),
      intensity: Number(recipe?.intensity) || 0.5
    };
  }

  async function monsterChord(recipes = []) {
    if (!enabled || !AudioContextCtor) return { count: 0, audible: false };
    const context = await ensureContext();
    if (!context) return { count: 0, audible: false };
    const list = recipes.map(normalizeRecipe).filter(recipe => Number.isFinite(recipe.rootHz));
    if (!list.length) return { count: 0, audible: false };
    const now = context.currentTime + 0.04;
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.16, now + 0.08);
    master.gain.setValueAtTime(0.16, now + MONSTER_CHORUS_MS / 1000 - 0.42);
    master.gain.exponentialRampToValueAtTime(0.0001, now + MONSTER_CHORUS_MS / 1000);
    master.connect(context.destination);

    list.forEach((recipe, index) => {
      const value = recipe.vector[index % recipe.vector.length] || 1;
      const ratio = recipe.ratios[index % recipe.ratios.length] || 1;
      const layer = index % 40;
      const cluster = Math.floor(index / 40);
      const at = now + layer * 0.011 + cluster * 0.004;
      const freq = recipe.rootHz * ratio * (1 + (value % 17) / 68);
      const pan = Math.sin(index * 1.618) * 0.78;
      const duration = clamp(0.09 + (value % 5) * 0.018, 0.08, 0.19);
      scheduleVoice(context, master, freq, at, duration, 0.0095, recipe.waveform, pan, freq * 2.1);
      if (index % 7 === 0) {
        scheduleVoice(context, master, recipe.shimmerHz * (0.82 + (value % 11) / 65), at + 0.035, 0.12, 0.004, 'sine', -pan * 0.45, recipe.shimmerHz);
      }
    });

    lastMonsterCount = list.length;
    lastMonsterAt = performance.now();
    window.setTimeout(() => {
      try { master.disconnect(); } catch {}
    }, MONSTER_CHORUS_MS + 420);
    return { count: list.length, audible: true, durationMs: MONSTER_CHORUS_MS };
  }

  button?.addEventListener('click', async (event) => {
    event.stopPropagation();
    enabled = !enabled;
    document.documentElement.classList.toggle('sound-enabled', enabled);
    if (!enabled) stopAllRunAudio();
    if (enabled) await ensureContext();
    updateButton();
  });

  document.documentElement.classList.toggle('sound-enabled', enabled);
  updateButton();

  return {
    play,
    algorithmEvent,
    setRunAudioMode,
    runAudioMode: () => audioMode,
    startRunAudio,
    stopRunAudio,
    stopAllRunAudio,
    hasRunAudio,
    tickRunAudio,
    monsterChord,
    status: () => ({
      supported: Boolean(AudioContextCtor),
      enabled,
      unlocked,
      state: ctx?.state || 'uncreated',
      mode: audioMode,
      liveEventSlots: lastAlgorithmEventAt.size,
      runVoiceCount: runVoices.size,
      audibleRunVoiceCount: [...runVoices.values()].filter(voice => Boolean(voice.timer)).length,
      scheduledRunNotes,
      runMasterGain: 0.48,
      boundedRunMs: DEFAULT_RUN_AUDIO_MS,
      lastMonsterCount,
      lastMonsterAgeMs: lastMonsterAt ? Math.round(performance.now() - lastMonsterAt) : null,
      runVoiceIds: [...runVoices.keys()],
      runVoiceDetails: [...runVoices.values()].map(voice => ({
        id: voice.id,
        source: voice.source,
        maxMs: voice.maxMs,
        ageMs: Math.round(performance.now() - voice.startedAt),
        frames: voice.frames,
        beat: voice.beat,
        scheduledNotes: voice.scheduledNotes,
        cadenceMs: Number((voice.cadenceMs || 0).toFixed(2)),
        energy: Number((voice.energy || 0).toFixed(3)),
        audible: Boolean(voice.timer)
      }))
    })
  };
})();

const autoSequence = {
  active: false,
  nextIndex: 0,
  currentIndex: -1,
  timer: null,
  currentId: null,
  completed: 0,
  startedAt: 0,
  endsAt: 0
};

function audioRecipeFromCard(card) {
  if (!card) return null;
  return {
    code: card.dataset.audioCode || '',
    fingerprint: card.dataset.audioFingerprint || '',
    kind: card.dataset.audioKind || 'unknown',
    kernel: card.dataset.audioKernel || 'metadata-state vector trace',
    rootHz: Number(card.dataset.audioRoot || 220),
    modHz: Number(card.dataset.audioMod || 3),
    shimmerHz: Number(card.dataset.audioShimmer || 880),
    tempoBpm: Number(card.dataset.audioTempo || 96),
    waveform: card.dataset.audioWave || 'triangle',
    ratios: cardAudioRatios(card),
    vector: cardAudioVector(card),
    isSorting: card.dataset.audioSort === 'true',
    intensity: Number(getComputedStyle(card).getPropertyValue('--sonic-intensity')) || 0.5
  };
}

function audioRecipeFromRecord(audio) {
  if (!audio) return null;
  return {
    code: audio.code,
    fingerprint: audio.fingerprint,
    kind: audio.kind,
    kernel: audio.kernel,
    rootHz: audio.rootHz,
    modHz: audio.modHz,
    shimmerHz: audio.shimmerHz,
    tempoBpm: audio.tempoBpm,
    waveform: audio.waveform,
    ratios: audio.ratios,
    vector: audio.vector,
    isSorting: audio.isSorting,
    intensity: audio.intensity
  };
}

function collectAllAudioRecipes() {
  const volumeOne = [...document.querySelectorAll('[data-volume-one] .spell-card')]
    .map(audioRecipeFromCard)
    .filter(Boolean);
  const generated = GENERATED_VOLUME_SPELLS
    .map(spell => audioRecipeFromRecord(spell.audio || recordAudioRecipe(spell)))
    .filter(Boolean);
  return [...volumeOne, ...generated].slice(0, 1000);
}

function updateSonicConsoleStatus(extra = '') {
  const status = document.querySelector('[data-sonic-status]');
  if (!status) return;
  const audio = sonicRuntime.status();
  const autoText = autoSequence.active
    ? `auto ${String(autoSequence.currentIndex + 1).padStart(3, '0')}/1000 ${autoSequence.currentId || 'arming'}`
    : 'auto idle';
  const pieces = [
    `Sound: ${audio.mode}`,
    `${audio.runVoiceCount} running`,
    autoText
  ];
  if (audio.lastMonsterCount) pieces.push(`monster ${audio.lastMonsterCount}`);
  if (extra) pieces.push(extra);
  status.textContent = pieces.join(' · ');
}

function setSonicMode(mode) {
  const nextMode = sonicRuntime.setRunAudioMode(mode);
  document.querySelectorAll('[data-sonic-mode]').forEach(button => {
    const active = button.dataset.sonicMode === nextMode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  updateSonicConsoleStatus();
  return nextMode;
}

function runRecord(id, options = {}) {
  const page = recordPageById.get(id);
  const runOptions = {
    audible: options.audible !== false,
    source: options.source || 'runtime-api',
    maxMs: options.maxMs,
    mode: options.mode
  };
  if (page && page !== activeVolumePage) {
    setActiveVolume(page);
    window.setTimeout(() => run(id, runOptions), options.mountDelayMs || 180);
    if (!options.silentStatus) updateSonicConsoleStatus(`last ${id}`);
    return true;
  }
  run(id, runOptions);
  if (!options.silentStatus) updateSonicConsoleStatus(`last ${id}`);
  return true;
}

function stopRecord(id) {
  stop(id);
  updateSonicConsoleStatus(`stopped ${id}`);
  return true;
}

function resetRecord(id) {
  stop(id);
  return runRecord(id, { audible: true, source: 'reset-api' });
}

function stopAutoSequence(options = {}) {
  autoSequence.active = false;
  if (autoSequence.timer) window.clearTimeout(autoSequence.timer);
  autoSequence.timer = null;
  if (autoSequence.currentId && !options.keepCurrent) stop(autoSequence.currentId);
  autoSequence.currentId = null;
  autoSequence.currentIndex = -1;
  autoSequence.startedAt = 0;
  autoSequence.endsAt = 0;
  if (!options.silent) updateSonicConsoleStatus('auto stopped');
}

function startAutoSequence() {
  stopAutoSequence({ silent: true });
  setSonicMode('solo');
  autoSequence.active = true;
  autoSequence.nextIndex = 0;
  autoSequence.currentIndex = -1;
  autoSequence.completed = 0;
  const step = () => {
    if (!autoSequence.active) return;
    if (autoSequence.currentId) {
      stop(autoSequence.currentId);
      autoSequence.completed = Math.max(autoSequence.completed, autoSequence.currentIndex + 1);
      autoSequence.currentId = null;
    }
    if (autoSequence.nextIndex >= ALL.length) {
      stopAutoSequence({ silent: true });
      updateSonicConsoleStatus('auto complete');
      return;
    }
    const index = autoSequence.nextIndex++;
    const id = ALL[index];
    autoSequence.currentIndex = index;
    autoSequence.currentId = id;
    autoSequence.startedAt = performance.now();
    autoSequence.endsAt = autoSequence.startedAt + AUTO_RUN_AUDIO_MS;
    runRecord(id, {
      audible: true,
      source: 'auto-sequence',
      maxMs: AUTO_RUN_AUDIO_MS,
      mode: 'solo',
      silentStatus: true,
      mountDelayMs: 220
    });
    updateSonicConsoleStatus(`auto playing ${id} for ${(AUTO_RUN_AUDIO_MS / 1000).toFixed(1)}s`);
    autoSequence.timer = window.setTimeout(() => {
      if (!autoSequence.active) return;
      if (autoSequence.currentId === id) {
        stop(id);
        autoSequence.completed = index + 1;
        autoSequence.currentId = null;
        updateSonicConsoleStatus(`auto finished ${id}`);
      }
      autoSequence.timer = window.setTimeout(step, AUTO_HANDOFF_MS);
    }, AUTO_RUN_AUDIO_MS + 80);
  };
  step();
  return true;
}

function stopEverything() {
  stopAutoSequence({ silent: true });
  ALL.forEach(stop);
  sonicRuntime.stopAllRunAudio();
  updateSonicConsoleStatus('all paused');
  return true;
}

function resetAllRecords() {
  stopEverything();
  visibleIds.clear();
  const root = activeVolumeRoot();
  if (root) {
    startVisibleCanvases(root);
    updateCenteredRecord();
  }
  updateSonicConsoleStatus('all reset');
  return true;
}

async function monsterButton() {
  const recipes = collectAllAudioRecipes();
  const result = await sonicRuntime.monsterChord(recipes);
  updateSonicConsoleStatus(`monster ${result.count}`);
  return result;
}

function setupSonicConsole() {
  setSonicMode(sonicRuntime.runAudioMode());
  document.querySelectorAll('[data-sonic-mode]').forEach(button => {
    button.addEventListener('click', () => setSonicMode(button.dataset.sonicMode));
  });
  document.querySelector('[data-sonic-stop]')?.addEventListener('click', stopEverything);
  document.querySelector('[data-sonic-reset]')?.addEventListener('click', resetAllRecords);
  document.querySelector('[data-sonic-auto]')?.addEventListener('click', () => {
    if (autoSequence.active) stopAutoSequence();
    else startAutoSequence();
  });
  document.querySelector('[data-sonic-monster]')?.addEventListener('click', () => {
    monsterButton().catch(() => updateSonicConsoleStatus('monster failed'));
  });
  updateSonicConsoleStatus();
}

function setupTechnicalTabs() {
  document.addEventListener('click', (event) => {
    const tab = event.target.closest?.('[data-tech-tab]');
    if (!tab) return;
    const box = tab.closest('.card-technical');
    if (!box) return;
    const key = tab.dataset.techTab;
    box.querySelectorAll('[data-tech-tab]').forEach(button => {
      const active = button.dataset.techTab === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    box.querySelectorAll('[data-tech-panel]').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.techPanel === key);
    });
  });
}

window.__grimoireRuntime = {
  activeIds: () => ALL.filter(id => Boolean(frames[id])),
  visibleIds: () => [...visibleIds],
  stopAll: stopEverything,
  activeVolume: () => activeVolumePage,
  setVolume: (page) => setActiveVolume(page),
  runRecord,
  stopRecord,
  resetRecord,
  resetAllRecords,
  startAutoSequence,
  stopAutoSequence,
  autoStatus: () => ({
    active: autoSequence.active,
    nextIndex: autoSequence.nextIndex,
    currentIndex: autoSequence.currentIndex,
    currentNumber: autoSequence.currentIndex + 1,
    currentId: autoSequence.currentId,
    completed: autoSequence.completed,
    startedAt: autoSequence.startedAt,
    endsAt: autoSequence.endsAt,
    remainingMs: autoSequence.active && autoSequence.endsAt ? Math.max(0, Math.round(autoSequence.endsAt - performance.now())) : 0,
    runMs: AUTO_RUN_AUDIO_MS,
    handoffMs: AUTO_HANDOFF_MS
  }),
  monsterButton,
  collectAllAudioRecipes,
  setSonicMode,
  filterStatus: () => {
    const cards = activeVolumeCards({ includeFiltered: true });
    return {
      activeVolume: activeVolumePage,
      visible: cards.filter(card => !card.hidden && !card.classList.contains('filtered-out')).length,
      total: cards.length,
      filters: { ...recordFilters },
      sourceMarkers: cards.filter(card => card.querySelector('.source-status-badge')).length,
      sourceStatuses: cards.reduce((acc, card) => {
        const key = card.dataset.sourceStatus || 'missing';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    };
  },
  resetRecordFilters,
  applyRecordFilters,
  audioStatus: () => sonicRuntime.status(),
  algorithmEvent: (id, event) => sonicRuntime.algorithmEvent(id, event),
  startRunAudio: (id, meta) => sonicRuntime.startRunAudio(id, meta),
  stopRunAudio: (id) => sonicRuntime.stopRunAudio(id),
  stopAllRunAudio: () => sonicRuntime.stopAllRunAudio(),
  hasRunAudio: (id) => sonicRuntime.hasRunAudio(id),
  tickRunAudio: (id, tick) => sonicRuntime.tickRunAudio(id, tick)
};

// Use IntersectionObserver to lazy-start and stop visualizations.
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const id = entry.target.id.replace('c-', '');
    if (entry.isIntersecting) {
      visibleIds.add(id);
      if (!frames[id] && document.visibilityState !== 'hidden') run(id);
    } else {
      visibleIds.delete(id);
      if (window.__grimoireRuntime?.hasRunAudio?.(id)) continue;
      stop(id);
    }
  }
}, { rootMargin: '160px 0px', threshold: 0.01 });

function observeCanvas(canvas, dynamic = false) {
  if (!canvas) return;
  observer.observe(canvas);
  if (dynamic) dynamicObservedCanvases.push(canvas);
}

function unobserveDynamicCanvases() {
  for (const canvas of dynamicObservedCanvases) observer.unobserve(canvas);
  dynamicObservedCanvases = [];
}

function canvasIsNearViewport(canvas) {
  const rect = canvas.getBoundingClientRect();
  return rect.bottom >= -160 && rect.top <= window.innerHeight + 160;
}

function startVisibleCanvases(root) {
  if (document.visibilityState === 'hidden') return;
  root.querySelectorAll('canvas[id^="c-"]').forEach(canvas => {
    if (canvas.closest('.spell-card')?.hidden) return;
    if (!canvasIsNearViewport(canvas)) return;
    const id = canvas.id.replace('c-', '');
    visibleIds.add(id);
    if (!frames[id]) run(id);
  });
}

for (const id of ALL) {
  const canvas = document.getElementById('c-' + id);
  if (canvas) observeCanvas(canvas);
}

function mountVolumeNavigation() {
  const tabs = document.querySelector('[data-volume-tabs]');
  const prev = document.querySelector('[data-volume-prev]');
  const next = document.querySelector('[data-volume-next]');
  if (!tabs || tabs.dataset.mounted === 'true') return;

  const frag = document.createDocumentFragment();
  for (const volume of VOLUME_PAGES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'volume-tab';
    btn.dataset.volumePage = String(volume.page);
    btn.innerHTML = `<strong>${String(volume.page).padStart(2, '0')}</strong><span>${volume.short}</span>`;
    btn.addEventListener('click', () => setActiveVolume(volume.page));
    frag.appendChild(btn);
  }
  tabs.appendChild(frag);
  tabs.dataset.mounted = 'true';

  prev?.addEventListener('click', () => setActiveVolume(activeVolumePage === 1 ? VOLUME_PAGES.length : activeVolumePage - 1));
  next?.addEventListener('click', () => setActiveVolume(activeVolumePage === VOLUME_PAGES.length ? 1 : activeVolumePage + 1));
}

function activeVolumeRoot() {
  return activeVolumePage === 1
    ? document.querySelector('[data-volume-one]')
    : document.querySelector('[data-volume-dynamic]');
}

function activeVolumeCards(options = {}) {
  const cards = [...(activeVolumeRoot()?.querySelectorAll('.spell-card') || [])];
  if (options.includeFiltered) return cards;
  return cards.filter(card => !card.hidden && !card.classList.contains('filtered-out'));
}

function mountRecordPicker() {
  const picker = document.querySelector('[data-record-picker]');
  if (!picker) return;
  const cards = activeVolumeCards({ includeFiltered: true });
  const frag = document.createDocumentFragment();
  cards.forEach((card) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'record-pick';
    btn.dataset.targetAlgo = card.dataset.algo;
    btn.dataset.localIndex = card.dataset.localIndex;
    btn.textContent = `${card.dataset.navLabel?.split('-').slice(1).join('') || card.dataset.localIndex}`;
    btn.title = `${card.dataset.navLabel} · ${card.querySelector('.card-title')?.textContent?.trim() || card.dataset.algo}`;
    btn.setAttribute('aria-label', btn.title);
    btn.addEventListener('click', () => {
      const targetCard = activeVolumeRoot()?.querySelector(`.spell-card[data-algo="${btn.dataset.targetAlgo}"]`);
      if (!targetCard) return;
      btn.blur();
      document.activeElement?.blur?.();
      const jumpToCard = () => {
        const targetTop = targetCard.getBoundingClientRect().top + window.scrollY - getRecordJumpOffset();
        window.scrollTo(0, Math.max(0, targetTop));
      };
      manualCenterLockUntil = performance.now() + 2200;
      jumpToCard();
      run(targetCard.dataset.algo, { audible: true, source: 'record-picker' });
      updateSonicConsoleStatus(`running ${targetCard.dataset.algo}`);
      setCenteredRecord(targetCard);
      requestAnimationFrame(() => {
        jumpToCard();
        setCenteredRecord(targetCard);
      });
      setTimeout(() => {
        jumpToCard();
        setCenteredRecord(targetCard);
      }, 0);
      setTimeout(() => {
        jumpToCard();
        setCenteredRecord(targetCard);
      }, 140);
      setTimeout(() => {
        jumpToCard();
        setCenteredRecord(targetCard);
      }, 520);
      setTimeout(() => {
        jumpToCard();
        setCenteredRecord(targetCard);
      }, 1100);
    });
    frag.appendChild(btn);
  });
  picker.replaceChildren(frag);
}

function filterControls() {
  return {
    search: document.querySelector('[data-filter-search]'),
    volume: document.querySelector('[data-filter-volume]'),
    tag: document.querySelector('[data-filter-tag]'),
    engine: document.querySelector('[data-filter-engine]'),
    source: document.querySelector('[data-filter-source]'),
    sonic: document.querySelector('[data-filter-sonic]'),
    visual: document.querySelector('[data-filter-visual]'),
    reset: document.querySelector('[data-filter-reset]'),
    status: document.querySelector('[data-filter-status]')
  };
}

function setSelectOptions(select, options, selectedValue, allLabel) {
  if (!select) return 'all';
  const current = options.some(option => option.value === selectedValue) ? selectedValue : 'all';
  select.replaceChildren();
  const all = document.createElement('option');
  all.value = 'all';
  all.textContent = allLabel;
  select.appendChild(all);
  for (const option of options) {
    const node = document.createElement('option');
    node.value = option.value;
    node.textContent = option.label;
    select.appendChild(node);
  }
  select.value = current;
  return current;
}

function uniqueOptions(cards, getter) {
  const map = new Map();
  for (const card of cards) {
    for (const raw of getter(card)) {
      const value = facetSlug(raw.value || raw.label || raw);
      const label = raw.label || facetLabel(raw.value || raw);
      if (value && value !== 'unknown' && !map.has(value)) map.set(value, label);
    }
  }
  return [...map.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function syncFilterVolumeControl() {
  const { volume } = filterControls();
  if (!volume) return;
  if (!volume.options.length) {
    for (const entry of VOLUME_PAGES) {
      const option = document.createElement('option');
      option.value = String(entry.page);
      option.textContent = `V${String(entry.page).padStart(2, '0')} · ${entry.short}`;
      volume.appendChild(option);
    }
  }
  volume.value = String(activeVolumePage);
}

function populateFilterFacetOptions() {
  const controls = filterControls();
  const cards = activeVolumeCards({ includeFiltered: true });
  syncFilterVolumeControl();
  recordFilters.tag = setSelectOptions(
    controls.tag,
    uniqueOptions(cards, card => cardTags(card).map(tag => ({ value: tag, label: tag }))),
    recordFilters.tag,
    'All tags'
  );
  recordFilters.engine = setSelectOptions(
    controls.engine,
    uniqueOptions(cards, card => [{ value: card.dataset.engine || 'unknown', label: facetLabel(card.dataset.engine || 'unknown') }]),
    recordFilters.engine,
    'All engines'
  );
  recordFilters.source = setSelectOptions(
    controls.source,
    uniqueOptions(cards, card => [{ value: card.dataset.sourceStatus || 'needs-review', label: facetLabel(card.dataset.sourceStatus || 'needs-review') }]),
    recordFilters.source,
    'All source states'
  );
  recordFilters.sonic = setSelectOptions(
    controls.sonic,
    uniqueOptions(cards, card => [{ value: card.dataset.sonicFamily || 'sonic', label: card.dataset.sonicFamilyLabel || facetLabel(card.dataset.sonicFamily || 'sonic') }]),
    recordFilters.sonic,
    'All sonic families'
  );
  recordFilters.visual = setSelectOptions(
    controls.visual,
    uniqueOptions(cards, card => [{ value: card.dataset.visualFamily || 'visual', label: card.dataset.visualFamilyLabel || facetLabel(card.dataset.visualFamily || 'visual') }]),
    recordFilters.visual,
    'All visual families'
  );
}

function cardSearchText(card) {
  return [
    card.dataset.navLabel,
    card.dataset.algo,
    card.dataset.title,
    card.dataset.engine,
    card.dataset.sourceStatus,
    card.dataset.sourceLedgerId,
    card.dataset.sonicFamilyLabel,
    card.dataset.visualFamilyLabel,
    card.querySelector('.card-title')?.textContent,
    card.querySelector('.card-desc')?.textContent,
    ...cardTags(card),
    ...Object.values(rowsToObject(card, '.proof-row')),
    ...Object.values(rowsToObject(card, '.context-row'))
  ].filter(Boolean).join(' ').toLowerCase();
}

function cardMatchesFilters(card) {
  const tokens = recordFilters.search.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = tokens.length ? cardSearchText(card) : '';
  if (tokens.length && !tokens.every(token => haystack.includes(token))) return false;
  if (recordFilters.tag !== 'all' && !cardTags(card).some(tag => facetSlug(tag) === recordFilters.tag)) return false;
  if (recordFilters.engine !== 'all' && facetSlug(card.dataset.engine || '') !== recordFilters.engine) return false;
  if (recordFilters.source !== 'all' && facetSlug(card.dataset.sourceStatus || '') !== recordFilters.source) return false;
  if (recordFilters.sonic !== 'all' && facetSlug(card.dataset.sonicFamily || '') !== recordFilters.sonic) return false;
  if (recordFilters.visual !== 'all' && facetSlug(card.dataset.visualFamily || '') !== recordFilters.visual) return false;
  return true;
}

function activeFilterDescription() {
  const parts = [];
  if (recordFilters.search) parts.push(`search "${recordFilters.search}"`);
  for (const key of ['tag', 'engine', 'source', 'sonic', 'visual']) {
    if (recordFilters[key] !== 'all') parts.push(`${key}:${facetLabel(recordFilters[key])}`);
  }
  return parts.length ? parts.join(' · ') : 'none';
}

function applyRecordFilters() {
  const cards = activeVolumeCards({ includeFiltered: true });
  const picker = document.querySelector('[data-record-picker]');
  let visible = 0;
  for (const card of cards) {
    const matched = cardMatchesFilters(card);
    card.hidden = !matched;
    card.classList.toggle('filtered-out', !matched);
    if (!matched) {
      const id = card.dataset.algo;
      if (id) {
        stop(id);
        visibleIds.delete(id);
      }
    } else {
      visible++;
    }
    const pick = picker?.querySelector(`.record-pick[data-target-algo="${card.dataset.algo}"]`);
    if (pick) {
      pick.classList.toggle('filtered-out', !matched);
      pick.disabled = !matched;
      pick.setAttribute('aria-hidden', String(!matched));
    }
  }

  const { status } = filterControls();
  const current = VOLUME_PAGES.find(volume => volume.page === activeVolumePage);
  if (status) {
    status.textContent = `Filters: ${visible}/${cards.length} visible · V${String(activeVolumePage).padStart(2, '0')} ${current?.short || ''} · ${activeFilterDescription()}`;
  }

  if (visible) {
    updateCenteredRecord();
  } else {
    document.querySelectorAll('.spell-card.centered').forEach(entry => entry.classList.remove('centered'));
    const counter = document.querySelector('[data-center-counter]');
    if (counter) counter.textContent = `Filtered: 0/${cards.length} visible in V${String(activeVolumePage).padStart(2, '0')}`;
  }
  return { visible, total: cards.length, filters: { ...recordFilters } };
}

function resetRecordFilters() {
  recordFilters.search = '';
  recordFilters.tag = 'all';
  recordFilters.engine = 'all';
  recordFilters.source = 'all';
  recordFilters.sonic = 'all';
  recordFilters.visual = 'all';
  const controls = filterControls();
  if (controls.search) controls.search.value = '';
  for (const key of ['tag', 'engine', 'source', 'sonic', 'visual']) {
    if (controls[key]) controls[key].value = 'all';
  }
  return applyRecordFilters();
}

function setupRecordFilters() {
  const controls = filterControls();
  if (!controls.search || controls.search.dataset.mounted === 'true') return;
  controls.search.dataset.mounted = 'true';
  syncFilterVolumeControl();
  controls.search.addEventListener('input', () => {
    recordFilters.search = controls.search.value.trim();
    applyRecordFilters();
  });
  controls.volume?.addEventListener('change', () => {
    const page = Number(controls.volume.value || activeVolumePage);
    setActiveVolume(page);
  });
  for (const key of ['tag', 'engine', 'source', 'sonic', 'visual']) {
    controls[key]?.addEventListener('change', () => {
      recordFilters[key] = controls[key].value || 'all';
      applyRecordFilters();
    });
  }
  controls.reset?.addEventListener('click', () => resetRecordFilters());
}

document.addEventListener('pointerover', (event) => {
  const card = event.target.closest?.('.spell-card');
  if (!card || card.contains(event.relatedTarget)) return;
  sonicRuntime.play(card, 'hover');
}, { passive: true });

document.addEventListener('click', (event) => {
  if (event.target.closest?.('[data-audio-toggle]')) return;
  const pick = event.target.closest?.('.record-pick');
  if (pick) {
    const targetCard = activeVolumeRoot()?.querySelector(`.spell-card[data-algo="${pick.dataset.targetAlgo}"]`);
    if (targetCard) sonicRuntime.play(targetCard, 'select');
    return;
  }
  if (event.target.closest?.('.card-controls, .card-tabs')) return;
  const card = event.target.closest?.('.spell-card');
  if (card) sonicRuntime.play(card, 'click');
});

function isLandscapeSideRail() {
  return window.matchMedia('(min-width: 900px) and (orientation: landscape)').matches;
}

function getRecordJumpOffset() {
  if (isLandscapeSideRail()) {
    const stickyOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sticky-nav-offset')) || 8;
    return stickyOffset + 16;
  }
  const sticky = document.querySelector('.volume-switcher');
  return (sticky?.offsetHeight || 180) + 24;
}

function revealPickerButton(active) {
  const picker = active?.closest('.record-picker');
  if (!picker || !active) return;
  const activeTop = active.offsetTop - picker.offsetTop;
  const activeLeft = active.offsetLeft - picker.offsetLeft;
  picker.scrollTop = Math.max(0, activeTop - picker.clientHeight / 2 + active.clientHeight / 2);
  picker.scrollLeft = Math.max(0, activeLeft - picker.clientWidth / 2 + active.clientWidth / 2);
}

function setCenteredRecord(card) {
  if (!card) return;
  document.querySelectorAll('.spell-card.centered').forEach(entry => entry.classList.remove('centered'));
  card.classList.add('centered');

  const counter = document.querySelector('[data-center-counter]');
  const title = card.querySelector('.card-title')?.textContent?.trim() || card.dataset.algo;
  if (counter) {
    counter.textContent = `Centered: ${card.dataset.navLabel} · ${String(card.dataset.localIndex).padStart(3, '0')}/100 in volume · ${String(card.dataset.globalIndex).padStart(3, '0')}/1000 · ${title}`;
  }

  document.querySelectorAll('.record-pick.active').forEach(btn => btn.classList.remove('active'));
  const active = document.querySelector(`.record-pick[data-target-algo="${card.dataset.algo}"]`);
  active?.classList.add('active');
  revealPickerButton(active);
}

function updateCenteredRecord() {
  if (performance.now() < manualCenterLockUntil) return;
  const cards = activeVolumeCards();
  if (!cards.length) return;
  const centerY = window.innerHeight / 2;
  let best = cards[0];
  let bestDistance = Infinity;
  for (const card of cards) {
    const rect = card.getBoundingClientRect();
    const cardCenter = rect.top + rect.height / 2;
    const distance = Math.abs(cardCenter - centerY);
    if (distance < bestDistance) {
      best = card;
      bestDistance = distance;
    }
  }
  setCenteredRecord(best);
  const picker = document.querySelector('[data-record-picker]');
  const active = document.querySelector(`.record-pick[data-target-algo="${best.dataset.algo}"]`);
  if (picker && active) revealPickerButton(active);
}

let centeredRecordQueued = false;
function scheduleCenteredRecordUpdate() {
  if (centeredRecordQueued) return;
  centeredRecordQueued = true;
  requestAnimationFrame(() => {
    centeredRecordQueued = false;
    updateCenteredRecord();
  });
}

function renderDynamicVolume(page) {
  const volume = VOLUME_BLUEPRINTS.find(entry => entry.page === page);
  const section = document.querySelector('[data-volume-dynamic]');
  const grid = document.querySelector('[data-volume-grid]');
  const title = document.querySelector('[data-volume-title]');
  const subtitle = document.querySelector('[data-volume-subtitle]');
  const kicker = document.querySelector('[data-volume-kicker]');
  const subcats = document.querySelector('[data-volume-subcats]');
  if (!volume || !section || !grid || !title || !subtitle || !kicker || !subcats) return;

  unobserveDynamicCanvases();
  grid.replaceChildren();
  const spells = spellsByVolume.get(page) || [];
  const frag = document.createDocumentFragment();
  spells.forEach((spell, index) => frag.appendChild(createSpellCard(spell, index)));
  grid.appendChild(frag);

  title.textContent = volume.title;
  subtitle.textContent = volume.subtitle;
  kicker.textContent = `VOLUME ${String(page).padStart(2, '0')} / 10 · ${spells.length} incantations`;
  subcats.replaceChildren(...volume.groups.map(group => {
    const span = document.createElement('span');
    span.textContent = group.name;
    return span;
  }));

  grid.querySelectorAll('canvas[id^="c-"]').forEach(canvas => observeCanvas(canvas, true));
  startVisibleCanvases(section);
}

function setActiveVolume(page) {
  if (!VOLUME_PAGES.some(volume => volume.page === page)) return;
  activeVolumePage = page;
  ALL.forEach(stop);
  visibleIds.clear();

  const volumeOne = document.querySelector('[data-volume-one]');
  const dynamic = document.querySelector('[data-volume-dynamic]');
  const status = document.querySelector('[data-volume-status]');
  const current = VOLUME_PAGES.find(volume => volume.page === page);

  document.querySelectorAll('.volume-tab').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.volumePage) === page);
  });

  if (status && current) {
    const count = page === 1 ? 100 : (spellsByVolume.get(page)?.length || 0);
    status.textContent = `Volume ${String(page).padStart(2, '0')} of 10 · ${count} unique incantations · ${current.title}`;
  }

  if (page === 1) {
    unobserveDynamicCanvases();
    document.querySelector('[data-volume-grid]')?.replaceChildren();
    if (volumeOne) volumeOne.hidden = false;
    if (dynamic) dynamic.hidden = true;
    requestAnimationFrame(() => volumeOne && startVisibleCanvases(volumeOne));
  } else {
    if (volumeOne) volumeOne.hidden = true;
    if (dynamic) dynamic.hidden = false;
    renderDynamicVolume(page);
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
  requestAnimationFrame(() => {
    mountRecordPicker();
    populateFilterFacetOptions();
    applyRecordFilters();
  });
}

function syncStickyNavOffset() {
  const header = document.querySelector('header');
  const headerPosition = header ? getComputedStyle(header).position : 'static';
  const offset = (headerPosition === 'sticky' || headerPosition === 'fixed')
    ? (header?.offsetHeight || 0) + 8
    : 8;
  document.documentElement.style.setProperty('--sticky-nav-offset', `${offset}px`);
}

mountVolumeNavigation();
syncStickyNavOffset();
setupRecordFilters();
setActiveVolume(1);
setupSonicConsole();
setupTechnicalTabs();
window.addEventListener('scroll', scheduleCenteredRecordUpdate, { passive: true });

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    for (const id of ALL) stop(id);
    return;
  }
  for (const id of visibleIds) run(id);
});

// Handle resize by restarting only visible visualizations.
window.addEventListener('resize', () => {
  syncStickyNavOffset();
  scheduleCenteredRecordUpdate();
  for (const id of ALL) {
    if (frames[id]) {
      const c = document.getElementById('c-' + id);
      if (c) {
        resizeCanvas(c);
        run(id);
      }
    }
  }
});
