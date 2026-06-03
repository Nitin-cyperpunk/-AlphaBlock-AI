/**
 * Cinematic ASCII intelligence field — dual canvas, two-pass glow, manual lerp.
 * Sharp canvas: layers 0–2. Blur canvas: layer 3 at 0.5× res + CSS blur.
 */

export const ASCII_CHARS = [
  "@",
  "#",
  "$",
  "%",
  "&",
  "+",
  "=",
  "/",
  "\\",
  "x",
  "X",
  "0",
  "8",
  "S",
  "*",
  ".",
  "|",
  "1",
  "2",
] as const;

/** 0–2 = sharp canvas, 3 = blur canvas */
export type ParticleLayer = 0 | 1 | 2 | 3;

export const CURSOR_RADIUS = 260;
export const TWINKLE_MS = 2000;
const LERP = 0.18;
const SIZE_SCALE = 1.4;
const SAFE_W = 0.7;
const SAFE_H = 0.6;
const LAYER_SCROLL: Record<ParticleLayer, number> = { 0: 5, 1: 15, 2: 25, 3: 40 };

export type AsciiParticle = {
  layer: ParticleLayer;
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseOpacity: number;
  offsetX: number;
  offsetY: number;
  glow: number;
  opacityBoost: number;
  twinkleActive: boolean;
  twinkleStart: number;
};

export type AsciiFieldState = {
  particles: AsciiParticle[];
  nextTwinkleAt: number;
};

const MONO_FONT = 'var(--font-jetbrains), ui-monospace, "JetBrains Mono", monospace';

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickChar(): string {
  return ASCII_CHARS[(Math.random() * ASCII_CHARS.length) | 0]!;
}

function inSafeZone(x: number, y: number, w: number, h: number): boolean {
  const sw = w * SAFE_W;
  const sh = h * SAFE_H;
  const sx = (w - sw) * 0.5;
  const sy = (h - sh) * 0.5;
  return x >= sx && x <= sx + sw && y >= sy && y <= sy + sh;
}

function samplePosition(w: number, h: number): { x: number; y: number } {
  for (let i = 0; i < 28; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    if (inSafeZone(x, y, w, h) && Math.random() < 0.9) continue;
    return { x, y };
  }
  return { x: Math.random() * w, y: Math.random() * h };
}

function pickLayer(): ParticleLayer {
  const r = Math.random();
  if (r < 0.32) return 0;
  if (r < 0.62) return 1;
  if (r < 0.88) return 2;
  return 3;
}

function layerSize(layer: ParticleLayer): number {
  let base: number;
  switch (layer) {
    case 0:
      base = rand(6, 10);
      break;
    case 1:
      base = rand(10, 14);
      break;
    case 2:
      base = rand(14, 20);
      break;
    case 3:
      base = rand(12, 20);
      break;
  }
  return base * SIZE_SCALE;
}

function layerOpacityScale(layer: ParticleLayer): number {
  switch (layer) {
    case 0:
      return 0.7;
    case 1:
      return 0.88;
    case 2:
      return 1;
    case 3:
      return 0.55;
  }
}

export function buildAsciiField(w: number, h: number, count: number): AsciiFieldState {
  const particles: AsciiParticle[] = [];
  const now = performance.now();

  for (let i = 0; i < count; i++) {
    const { x, y } = samplePosition(w, h);
    const layer = pickLayer();
    particles.push({
      layer,
      char: pickChar(),
      x,
      y,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      size: layerSize(layer),
      baseOpacity: rand(0.03, 0.18) * layerOpacityScale(layer),
      offsetX: 0,
      offsetY: 0,
      glow: 0,
      opacityBoost: 0,
      twinkleActive: false,
      twinkleStart: 0,
    });
  }

  return { particles, nextTwinkleAt: now + rand(4000, 8000) };
}

function scheduleTwinkle(state: AsciiFieldState, now: number): void {
  if (now < state.nextTwinkleAt) return;
  const n = Math.max(1, Math.floor(state.particles.length * 0.02));
  for (let i = 0; i < n; i++) {
    const p = state.particles[(Math.random() * state.particles.length) | 0]!;
    p.twinkleActive = true;
    p.twinkleStart = now;
  }
  state.nextTwinkleAt = now + rand(4000, 8000);
}

function twinkleAdd(p: AsciiParticle, now: number): number {
  if (!p.twinkleActive) return 0;
  const t = (now - p.twinkleStart) / TWINKLE_MS;
  if (t >= 1) {
    p.twinkleActive = false;
    return 0;
  }
  return Math.sin(t * Math.PI) * 0.12;
}

export function stepAsciiField(
  state: AsciiFieldState,
  w: number,
  h: number,
  dt: number,
  mouse: { x: number; y: number; active: boolean },
  interactive: boolean,
  reduced: boolean,
  enableTwinkle: boolean,
): void {
  const now = performance.now();
  if (!reduced && enableTwinkle) scheduleTwinkle(state, now);

  const mx = mouse.x;
  const my = mouse.y;
  const r2 = CURSOR_RADIUS * CURSOR_RADIUS;

  for (let i = 0; i < state.particles.length; i++) {
    const p = state.particles[i]!;

    if (!reduced) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < -32) p.x = w + 32;
      else if (p.x > w + 32) p.x = -32;
      if (p.y < -32) p.y = h + 32;
      else if (p.y > h + 32) p.y = -32;
    }

    let tOx = 0;
    let tOy = 0;
    let tGlow = 0;
    let tOp = 0;

    if (interactive && mouse.active) {
      const dx = p.x - mx;
      const dy = p.y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < r2 && d2 > 0.25) {
        const dist = Math.sqrt(d2);
        const f = 1 - dist / CURSOR_RADIUS;
        const inv = 1 / dist;
        tOx = dx * inv * f * 18;
        tOy = dy * inv * f * 18;
        tOp = f * 0.7;
        tGlow = f;
      }
    }

    p.offsetX += (tOx - p.offsetX) * LERP;
    p.offsetY += (tOy - p.offsetY) * LERP;
    p.glow += (tGlow - p.glow) * LERP;
    p.opacityBoost += (tOp - p.opacityBoost) * LERP;
  }
}

type DrawBatch = {
  lastFont: string;
  lastFill: string;
};

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

function particleOpacity(p: AsciiParticle, now: number): number {
  const tw = twinkleAdd(p, now);
  return Math.min(0.88, p.baseOpacity + p.opacityBoost + tw);
}

function drawParticleBase(
  ctx: CanvasRenderingContext2D,
  batch: DrawBatch,
  p: AsciiParticle,
  x: number,
  y: number,
  opacity: number,
): void {
  if (opacity < 0.008) return;
  ensureFont(ctx, batch, p.size);
  ensureFill(ctx, batch, `rgba(200, 210, 235, ${opacity})`);
  ctx.fillText(p.char, x, y);
}

function drawParticleGlow(
  ctx: CanvasRenderingContext2D,
  batch: DrawBatch,
  p: AsciiParticle,
  x: number,
  y: number,
  opacity: number,
  glow: number,
): void {
  if (glow <= 0.04 || opacity < 0.008) return;

  const r = Math.round(120 + (255 - 120) * (1 - glow));
  const g = Math.round(170 + (255 - 170) * (1 - glow));
  const b = 255;

  ensureFont(ctx, batch, p.size);
  ctx.shadowColor = "#0D2DCD";
  ctx.shadowBlur = 8 + glow * 22;
  ensureFill(ctx, batch, `rgba(${r}, ${g}, ${b}, ${opacity})`);
  ctx.fillText(p.char, x, y);
  ctx.shadowBlur = 0;
}

export type DrawAsciiOptions = {
  scrollProgress: number;
  layers: ParticleLayer[];
  now: number;
};

/** Pass 1 + 2 on sharp or blur context */
export function renderAsciiCanvases(
  sharpCtx: CanvasRenderingContext2D,
  blurCtx: CanvasRenderingContext2D | null,
  state: AsciiFieldState,
  w: number,
  h: number,
  options: DrawAsciiOptions,
  drawBlurLayer: boolean,
): void {
  const { scrollProgress, layers, now } = options;
  sharpCtx.textAlign = "center";
  sharpCtx.textBaseline = "middle";

  const pass1: DrawBatch = { lastFont: "", lastFill: "" };
  const pass2: DrawBatch = { lastFont: "", lastFill: "" };

  const sharpLayers = layers.filter((l) => l !== 3);
  for (const layer of sharpLayers) {
    const scrollY = scrollProgress * LAYER_SCROLL[layer];
    for (let i = 0; i < state.particles.length; i++) {
      const p = state.particles[i]!;
      if (p.layer !== layer) continue;
      const opacity = particleOpacity(p, now);
      const x = p.x + p.offsetX;
      const y = p.y + p.offsetY + scrollY;
      drawParticleBase(sharpCtx, pass1, p, x, y, opacity);
    }
  }

  for (let i = 0; i < state.particles.length; i++) {
    const p = state.particles[i]!;
    if (p.layer === 3) continue;
    const glow = p.glow;
    if (glow <= 0.04) continue;
    const scrollY = scrollProgress * LAYER_SCROLL[p.layer];
    const opacity = particleOpacity(p, now);
    const x = p.x + p.offsetX;
    const y = p.y + p.offsetY + scrollY;
    drawParticleGlow(sharpCtx, pass2, p, x, y, opacity, glow);
  }

  if (!blurCtx || !drawBlurLayer) return;

  blurCtx.textAlign = "center";
  blurCtx.textBaseline = "middle";
  const blurPass1: DrawBatch = { lastFont: "", lastFill: "" };
  const blurPass2: DrawBatch = { lastFont: "", lastFill: "" };
  const scrollY = scrollProgress * LAYER_SCROLL[3];

  for (let i = 0; i < state.particles.length; i++) {
    const p = state.particles[i]!;
    if (p.layer !== 3) continue;
    const opacity = particleOpacity(p, now);
    const x = p.x + p.offsetX;
    const y = p.y + p.offsetY + scrollY;
    drawParticleBase(blurCtx, blurPass1, p, x, y, opacity);
  }

  for (let i = 0; i < state.particles.length; i++) {
    const p = state.particles[i]!;
    if (p.layer !== 3 || p.glow <= 0.04) continue;
    const opacity = particleOpacity(p, now);
    const x = p.x + p.offsetX;
    const y = p.y + p.offsetY + scrollY;
    drawParticleGlow(blurCtx, blurPass2, p, x, y, opacity, p.glow);
  }
}

export function getHeroCanvasDpr(): number {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, 1.25);
}
