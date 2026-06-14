/**
 * Atmospheric ASCII intelligence field — strict linear grid, edge-dense rows.
 * Horizontal scan-line strings + radial safe zone + gradual character decode.
 */

export const ASCII_CHARS = ["@", "#", "$", "S", "0", "8", "X", "x", "+"] as const;

/** 0 = faint / far, 1 = mid, 2 = near */
export type ParticleLayer = 0 | 1 | 2;

export const CURSOR_RADIUS = 200;
const LERP = 0.11;
const HOVER_LERP = 0.14;
const DRIFT_PERIOD_MS = 38000;
const DECODE_RATE = 0.014;
const HOVER_DECODE_RATE = 0.055;
const LAYER_PARALLAX = { 0: 0.12, 1: 0.15, 2: 0.18 } as const;
const OPACITY_MIN = 0.14;
const OPACITY_MAX = 0.32;
const HOVER_OPACITY_BOOST = 0.18;
const HOVER_SIZE_BOOST = 0.08;

/** Pale cyan-white — reference palette */
const GLYPH_RGB = { r: 175, g: 215, b: 228 } as const;
const GLYPH_HOVER_RGB = { r: 210, g: 245, b: 255 } as const;

export type AsciiParticle = {
  layer: ParticleLayer;
  char: string;
  x: number;
  y: number;
  row: number;
  col: number;
  size: number;
  baseOpacity: number;
  offsetX: number;
  offsetY: number;
  opacityBoost: number;
  hoverGlow: number;
};

export type AsciiFieldState = {
  particles: AsciiParticle[];
  driftSeed: number;
};

const MONO_FONT = 'var(--font-jetbrains), ui-monospace, "JetBrains Mono", monospace';

/* ── Perlin noise (compact 2D) ─────────────────────────────────────────── */

const PERM = new Uint8Array(512);

function initPerm(): void {
  const src = new Uint8Array(256);
  for (let i = 0; i < 256; i++) src[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const tmp = src[i]!;
    src[i] = src[j]!;
    src[j] = tmp;
  }
  for (let i = 0; i < 512; i++) PERM[i] = src[i & 255]!;
}

let permReady = false;
function ensurePerm(): void {
  if (!permReady) {
    initPerm();
    permReady = true;
  }
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function perlin2(x: number, y: number): number {
  ensurePerm();
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);
  const aa = PERM[xi]! + yi;
  const ab = PERM[xi + 1]! + yi;
  return lerp(
    lerp(grad(PERM[aa]!, xf, yf), grad(PERM[ab]!, xf - 1, yf), u),
    lerp(grad(PERM[aa + 1]!, xf, yf - 1), grad(PERM[ab + 1]!, xf - 1, yf - 1), u),
    v,
  );
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickCharAt(row: number, col: number): string {
  const idx =
    (row * 17 + col * 31 + ((row ^ col) % ASCII_CHARS.length) + ASCII_CHARS.length) %
    ASCII_CHARS.length;
  return ASCII_CHARS[idx]!;
}

function swapChar(current: string, row: number, col: number): string {
  const idx = ASCII_CHARS.indexOf(current as (typeof ASCII_CHARS)[number]);
  if (idx >= 0 && Math.random() < 0.7) {
    const delta = Math.random() < 0.5 ? 1 : -1;
    return ASCII_CHARS[(idx + delta + ASCII_CHARS.length) % ASCII_CHARS.length]!;
  }
  return pickCharAt(row, col);
}

/* ── Density field ─────────────────────────────────────────────────────── */

const CONTENT_CX = 0.5;
const CONTENT_CY = 0.44;
const CLEAR_RX = 0.26;
const CLEAR_RY = 0.19;

/**
 * Curved top boundary — bowl arc like the reference (yellow line).
 * Dips lower at center (above eyebrow), rises toward top corners.
 */
function curvedTopBoundary(nx: number): number {
  const edgeT = Math.abs(nx - 0.5) / 0.5;
  const bowl = edgeT * edgeT * (3 - 2 * edgeT);
  const centerY = 0.21;
  const cornerY = 0.042;
  const y = centerY + (cornerY - centerY) * bowl;

  const wobble = perlin2(nx * 10 + 1.7, 2.3) * 0.032;
  const fine = perlin2(nx * 22 + 4.1, 0.6) * 0.014;
  return y + wobble + fine;
}

/** Organic top cut — rough edge, not a rectangle */
function isAboveCurvedTop(nx: number, ny: number): boolean {
  const boundary = curvedTopBoundary(nx);
  const gap = ny - boundary;

  if (gap < -0.03) return true;
  if (gap > 0.028) return false;

  const n = (perlin2(nx * 18, ny * 26 + 3.2) + 1) * 0.5;
  const n2 = (perlin2(nx * 31 + 8, ny * 19) + 1) * 0.5;
  const rough = (n * 0.65 + n2 * 0.35 - 0.5) * 0.065;
  return gap < rough;
}

/** Center content hole with soft, noisy perimeter */
function isInRoughCenterClear(nx: number, ny: number): boolean {
  const dx = (nx - CONTENT_CX) / CLEAR_RX;
  const dy = (ny - CONTENT_CY) / CLEAR_RY;
  const d = Math.sqrt(dx * dx + dy * dy);

  if (d < 0.72) return true;
  if (d > 1.14) return false;

  const fade = smoothstep(0.72, 1.14, d);
  const n = (perlin2(nx * 12 + 2, ny * 12 + 5) + 1) * 0.5;
  const n2 = (perlin2(nx * 24, ny * 20 + 1) + 1) * 0.5;
  const rough = n * 0.6 + n2 * 0.4;
  return fade < 0.42 + rough * 0.38;
}

function isAsciiExcludedZone(x: number, y: number, w: number, h: number): boolean {
  const nx = x / w;
  const ny = y / h;
  if (isAboveCurvedTop(nx, ny)) return true;
  if (isInRoughCenterClear(nx, ny)) return true;
  return false;
}

/** Interaction / readability safe zone */
export function inContentSafeZone(x: number, y: number, w: number, h: number): boolean {
  return isAsciiExcludedZone(x, y, w, h);
}

function cellShimmer(row: number, col: number): number {
  ensurePerm();
  return (perlin2(col * 0.11, row * 0.09 + 1.4) + 1) * 0.5;
}

function pickLayer(row: number): ParticleLayer {
  const mod = row % 5;
  if (mod === 0 || mod === 3) return 0;
  if (mod === 1 || mod === 4) return 1;
  return 2;
}

function layerSize(_layer: ParticleLayer, mobile: boolean): number {
  return mobile ? 10 : 11;
}

function layerOpacity(layer: ParticleLayer, row: number, col: number): number {
  const shimmer = cellShimmer(row, col);
  const base = rand(OPACITY_MIN, OPACITY_MAX);
  const scale = layer === 0 ? 0.88 : layer === 1 ? 0.96 : 1;
  return Math.min(0.38, base * scale * (0.82 + shimmer * 0.22));
}

/* ── Field build — full grid outside center ────────────────────────────── */

type GridCell = {
  x: number;
  y: number;
  row: number;
  col: number;
};

function collectOutsideCells(w: number, h: number, cellW: number, cellH: number): GridCell[] {
  const cols = Math.ceil(w / cellW);
  const rows = Math.ceil(h / cellH);
  const cells: GridCell[] = [];
  const seen = new Set<string>();

  const tryAdd = (x: number, y: number, row: number, col: number) => {
    const key = `${Math.round(x * 10)}:${Math.round(y * 10)}`;
    if (seen.has(key)) return;
    if (x < 1 || x > w - 1 || y < 1 || y > h - 1) return;
    if (isAsciiExcludedZone(x, y, w, h)) return;
    seen.add(key);
    cells.push({ x, y, row, col });
  };

  /* Edge-aligned grid — reaches viewport edges */
  for (let row = 0; row < rows; row++) {
    const y = Math.min(h - 1, row * cellH + cellH * 0.5);
    for (let col = 0; col < cols; col++) {
      const x = Math.min(w - 1, col * cellW + cellW * 0.5);
      tryAdd(x, y, row, col);
    }
  }

  /* Corner patches — fill gap between screen corner and main grid */
  const cornerRows = 5;
  const cornerCols = 6;
  for (let i = 0; i < cornerRows; i++) {
    for (let j = 0; j < cornerCols; j++) {
      const yTop = i * cellH + cellH * 0.5;
      const yBot = h - (i + 1) * cellH + cellH * 0.5;
      const xLeft = j * cellW + cellW * 0.5;
      const xRight = w - (j + 1) * cellW + cellW * 0.5;

      tryAdd(xLeft, yTop, 800 + i, j);
      tryAdd(xRight, yTop, 800 + i, 100 + j);
      tryAdd(xLeft, yBot, 850 + i, j);
      tryAdd(xRight, yBot, 850 + i, 100 + j);
    }
  }

  return cells;
}

function pushParticle(particles: AsciiParticle[], c: GridCell, mobile: boolean): void {
  const layer = pickLayer(c.row);
  particles.push({
    layer,
    char: pickCharAt(c.row, c.col),
    x: c.x,
    y: c.y,
    row: c.row,
    col: c.col,
    size: layerSize(layer, mobile),
    baseOpacity: layerOpacity(layer, c.row, c.col),
    offsetX: 0,
    offsetY: 0,
    opacityBoost: 0,
    hoverGlow: 0,
  });
}

export function buildAsciiField(w: number, h: number, maxCount: number): AsciiFieldState {
  ensurePerm();

  const mobile = w < 768;
  let cellW = mobile ? 14 : 12;
  let cellH = mobile ? 17 : 15;

  let cells = collectOutsideCells(w, h, cellW, cellH);

  /* Widen spacing only if we exceed the perf budget */
  while (cells.length > maxCount && cellW < 26) {
    cellW += 1;
    cellH += 1;
    cells = collectOutsideCells(w, h, cellW, cellH);
  }

  cells.sort((a, b) => (a.row !== b.row ? a.row - b.row : a.col - b.col));

  const particles: AsciiParticle[] = [];
  for (const cell of cells) {
    pushParticle(particles, cell, mobile);
  }

  return { particles, driftSeed: Math.random() * Math.PI * 2 };
}

/* ── Simulation step ───────────────────────────────────────────────────── */

export function stepAsciiField(
  state: AsciiFieldState,
  w: number,
  h: number,
  _dt: number,
  mouse: { x: number; y: number; active: boolean },
  interactive: boolean,
  reduced: boolean,
): void {
  if (reduced || state.particles.length === 0) return;

  const count = state.particles.length;
  const swaps = Math.max(1, Math.floor(count * DECODE_RATE * (0.85 + Math.random() * 0.3)));
  for (let s = 0; s < swaps; s++) {
    const i = (Math.random() * count) | 0;
    const p = state.particles[i]!;
    p.char = swapChar(p.char, p.row, p.col);
  }

  const mx = mouse.x;
  const my = mouse.y;
  const r2 = CURSOR_RADIUS * CURSOR_RADIUS;
  const mouseInSafe = interactive && mouse.active && inContentSafeZone(mx, my, w, h);

  for (let i = 0; i < count; i++) {
    const p = state.particles[i]!;
    let tOx = 0;
    let tOy = 0;
    let tOp = 0;
    let tGlow = 0;
    let nearCursor = false;

    if (interactive && mouse.active && !mouseInSafe && !inContentSafeZone(p.x, p.y, w, h)) {
      const dx = p.x - mx;
      const dy = p.y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < r2 && d2 > 1) {
        nearCursor = true;
        const dist = Math.sqrt(d2);
        const f = (1 - dist / CURSOR_RADIUS) ** 1.35;
        const inv = 1 / dist;
        tOx = dx * inv * f * rand(2, 3.5);
        tOy = dy * inv * f * rand(2, 3.5);
        tOp = f * HOVER_OPACITY_BOOST;
        tGlow = f;

        if (Math.random() < HOVER_DECODE_RATE * f) {
          p.char = swapChar(p.char, p.row, p.col);
        }
      }
    }

    p.offsetX += (tOx - p.offsetX) * (nearCursor ? HOVER_LERP : LERP);
    p.offsetY += (tOy - p.offsetY) * (nearCursor ? HOVER_LERP : LERP);
    p.opacityBoost += (tOp - p.opacityBoost) * (nearCursor ? HOVER_LERP : LERP);
    p.hoverGlow += (tGlow - p.hoverGlow) * (nearCursor ? HOVER_LERP : LERP);
  }
}

/* ── Render ────────────────────────────────────────────────────────────── */

type DrawBatch = { lastFont: string; lastFill: string };

function ensureFont(ctx: CanvasRenderingContext2D, batch: DrawBatch, size: number): void {
  const font = `500 ${size}px ${MONO_FONT}`;
  if (batch.lastFont !== font) {
    ctx.font = font;
    batch.lastFont = font;
  }
}

function ensureFill(ctx: CanvasRenderingContext2D, batch: DrawBatch, fill: string): void {
  if (batch.lastFill !== fill) {
    ctx.fillStyle = fill;
    batch.lastFill = fill;
  }
}

function globalDrift(now: number, seed: number): { x: number; y: number } {
  const t = (now % DRIFT_PERIOD_MS) / DRIFT_PERIOD_MS;
  const angle = t * Math.PI * 2 + seed;
  return {
    x: Math.sin(angle) * 2,
    y: Math.cos(angle * 0.93) * 3.5,
  };
}

export type DrawAsciiOptions = {
  scrollProgress: number;
  now: number;
};

function glyphFill(hoverGlow: number): { r: number; g: number; b: number } {
  const t = Math.min(1, hoverGlow);
  return {
    r: Math.round(GLYPH_RGB.r + (GLYPH_HOVER_RGB.r - GLYPH_RGB.r) * t),
    g: Math.round(GLYPH_RGB.g + (GLYPH_HOVER_RGB.g - GLYPH_RGB.g) * t),
    b: Math.round(GLYPH_RGB.b + (GLYPH_HOVER_RGB.b - GLYPH_RGB.b) * t),
  };
}

export function renderAsciiCanvas(
  ctx: CanvasRenderingContext2D,
  state: AsciiFieldState,
  w: number,
  h: number,
  options: DrawAsciiOptions,
  layers: ParticleLayer[] = [0, 1, 2],
): void {
  const { scrollProgress, now } = options;
  const drift = globalDrift(now, state.driftSeed);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const batch: DrawBatch = { lastFont: "", lastFill: "" };

  for (const layer of layers) {
    const parallaxY = scrollProgress * h * LAYER_PARALLAX[layer];
    const layerDriftX = drift.x * (layer + 1) * 0.22;
    const layerDriftY = drift.y * (layer + 1) * 0.22;

    for (let i = 0; i < state.particles.length; i++) {
      const p = state.particles[i]!;
      if (p.layer !== layer) continue;

      const opacity = Math.min(0.52, p.baseOpacity + p.opacityBoost);
      if (opacity < 0.006) continue;

      const x = p.x + p.offsetX + layerDriftX;
      const y = p.y + p.offsetY + parallaxY + layerDriftY;
      const { r, g, b } = glyphFill(p.hoverGlow);
      const size = p.size * (1 + p.hoverGlow * HOVER_SIZE_BOOST);

      ensureFont(ctx, batch, size);
      ensureFill(ctx, batch, `rgba(${r}, ${g}, ${b}, ${opacity.toFixed(3)})`);
      ctx.fillText(p.char, x, y);
    }
  }
}

export function renderAsciiCanvases(
  sharpCtx: CanvasRenderingContext2D,
  blurCtx: CanvasRenderingContext2D | null,
  state: AsciiFieldState,
  w: number,
  h: number,
  options: DrawAsciiOptions,
  drawBlurLayer: boolean,
): void {
  renderAsciiCanvas(sharpCtx, state, w, h, options, [0, 1, 2]);
  if (blurCtx && drawBlurLayer) {
    renderAsciiCanvas(blurCtx, state, w, h, options, [0]);
  }
}

export function getHeroCanvasDpr(): number {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, 1.25);
}
