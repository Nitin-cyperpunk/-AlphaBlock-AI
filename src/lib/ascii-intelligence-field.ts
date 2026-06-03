/**
 * ASCII intelligence field — canvas-only, edge-dense clusters, 3 depth layers.
 */

export const ASCII_CHARS = ["0", "1", "#", "$", "%", "@", "+", "x", "/", "\\"] as const;

/** 0 = faint tiny, 1 = medium, 2 = larger brighter */
export type ParticleLayer = 0 | 1 | 2;

export const CURSOR_RADIUS = 225;
const LERP = 0.14;
const SIZE_SCALE = 1.22;
const HOVER_SIZE_BOOST = 0.14;
const LAYER_SCROLL: Record<ParticleLayer, number> = { 0: 4, 1: 12, 2: 22 };

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
  rotation: number;
  targetRotation: number;
  nextCharSwapAt: number;
  phase: number;
};

export type AsciiFieldState = {
  particles: AsciiParticle[];
};

const MONO_FONT = 'var(--font-jetbrains), ui-monospace, "JetBrains Mono", monospace';

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickChar(): string {
  return ASCII_CHARS[(Math.random() * ASCII_CHARS.length) | 0]!;
}

function swapChar(current: string): string {
  const idx = ASCII_CHARS.indexOf(current as (typeof ASCII_CHARS)[number]);
  if (idx >= 0 && Math.random() < 0.55) {
    const next = (idx + 1 + ((Math.random() * 2) | 0)) % ASCII_CHARS.length;
    return ASCII_CHARS[next]!;
  }
  return pickChar();
}

type SpawnZone =
  | "corner"
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "belowCta"
  | "belowCtaCore"
  | "fill"
  | "center";

/** Tight core kept clear for headline — edges/corners/bottom stay dense */
function inHeadlineSafeZone(x: number, y: number, w: number, h: number): boolean {
  const dx = (x - w * 0.5) / (w * 0.2);
  const dy = (y - h * 0.44) / (h * 0.11);
  return dx * dx + dy * dy < 1;
}

function sampleInZone(w: number, h: number, zone: SpawnZone): { x: number; y: number } {
  const padX = w * 0.02;
  const padY = h * 0.02;

  switch (zone) {
    case "corner": {
      const left = Math.random() < 0.5;
      const top = Math.random() < 0.5;
      return {
        x: left ? rand(padX, w * 0.22) : rand(w * 0.78, w - padX),
        y: top ? rand(padY, h * 0.22) : rand(h * 0.58, h - padY),
      };
    }
    case "left":
      return {
        x: rand(padX, w * 0.14),
        y: rand(padY, h - padY),
      };
    case "right":
      return {
        x: rand(w * 0.86, w - padX),
        y: rand(padY, h - padY),
      };
    case "top":
      return {
        x: rand(padX, w - padX),
        y: rand(padY, h * 0.16),
      };
    case "bottom":
      return {
        x: rand(padX, w - padX),
        y: rand(h * 0.55, h - padY),
      };
    case "belowCta":
      return {
        x: rand(padX, w - padX),
        y: rand(h * 0.54, h - padY),
      };
    case "belowCtaCore":
      return {
        x: rand(w * 0.18, w * 0.82),
        y: rand(h * 0.52, h * 0.86),
      };
    case "fill": {
      const edge = Math.random();
      if (edge < 0.25) return { x: rand(padX, w * 0.2), y: rand(padY, h - padY) };
      if (edge < 0.5) return { x: rand(w * 0.8, w - padX), y: rand(padY, h - padY) };
      if (edge < 0.7) return { x: rand(padX, w - padX), y: rand(padY, h * 0.2) };
      return { x: rand(padX, w - padX), y: rand(h * 0.48, h - padY) };
    }
    case "center": {
      for (let i = 0; i < 16; i++) {
        const x = w * (0.28 + Math.random() * 0.44);
        const y = h * (0.28 + Math.random() * 0.38);
        if (!inHeadlineSafeZone(x, y, w, h)) return { x, y };
      }
      return { x: w * (0.2 + Math.random() * 0.6), y: h * (0.5 + Math.random() * 0.42) };
    }
  }
}

function zoneQuotas(total: number): Record<SpawnZone, number> {
  const corner = Math.floor(total * 0.12);
  const left = Math.floor(total * 0.12);
  const right = Math.floor(total * 0.12);
  const top = Math.floor(total * 0.08);
  const bottom = Math.floor(total * 0.1);
  const belowCtaCore = Math.floor(total * 0.22);
  const belowCta = Math.floor(total * 0.14);
  const fill = Math.floor(total * 0.08);
  const used = corner + left + right + top + bottom + belowCtaCore + belowCta + fill;
  const center = Math.max(0, total - used);
  return { corner, left, right, top, bottom, belowCta, belowCtaCore, fill, center };
}

function pickLayer(): ParticleLayer {
  const r = Math.random();
  if (r < 0.42) return 0;
  if (r < 0.78) return 1;
  return 2;
}

function layerSize(layer: ParticleLayer): number {
  switch (layer) {
    case 0:
      return rand(5, 8) * SIZE_SCALE;
    case 1:
      return rand(9, 13) * SIZE_SCALE;
    case 2:
      return rand(14, 19) * SIZE_SCALE;
  }
}

function layerOpacityScale(layer: ParticleLayer): number {
  switch (layer) {
    case 0:
      return 0.55;
    case 1:
      return 0.82;
    case 2:
      return 1;
  }
}

function layerDrift(layer: ParticleLayer): number {
  switch (layer) {
    case 0:
      return 0.035;
    case 1:
      return 0.055;
    case 2:
      return 0.075;
  }
}

function pushParticle(
  particles: AsciiParticle[],
  w: number,
  h: number,
  zone: SpawnZone,
  now: number,
): void {
  const { x, y } = sampleInZone(w, h, zone);
  const layer = pickLayer();
  const drift = layerDrift(layer);
  const isEdge =
    zone === "corner" ||
    zone === "left" ||
    zone === "right" ||
    zone === "top" ||
    zone === "bottom" ||
    zone === "belowCta" ||
    zone === "belowCtaCore";
  const edgeBoost = isEdge ? 1.45 : 1;

  particles.push({
    layer,
    char: pickChar(),
    x,
    y,
    vx: (Math.random() - 0.5) * drift * (isEdge ? 0.55 : 1),
    vy: (Math.random() - 0.5) * drift * (isEdge ? 0.55 : 1),
    size: layerSize(layer) * (isEdge ? 1.05 : 1),
    baseOpacity:
      rand(isEdge ? 0.06 : 0.03, isEdge ? 0.2 : 0.14) * layerOpacityScale(layer) * edgeBoost,
    offsetX: 0,
    offsetY: 0,
    glow: 0,
    opacityBoost: 0,
    rotation: 0,
    targetRotation: 0,
    nextCharSwapAt: now + rand(3000, 8000),
    phase: Math.random() * Math.PI * 2,
  });
}

/** Locked anchors — corners + bottom strip under CTAs */
function pushAnchorParticles(particles: AsciiParticle[], w: number, h: number, now: number): void {
  const corners: [number, number][] = [
    [0.05, 0.07],
    [0.95, 0.07],
    [0.05, 0.93],
    [0.95, 0.93],
    [0.12, 0.12],
    [0.88, 0.12],
    [0.12, 0.88],
    [0.88, 0.88],
  ];

  const perCorner = 18;
  for (const [nx, ny] of corners) {
    for (let i = 0; i < perCorner; i++) {
      const layer = pickLayer();
      const drift = layerDrift(layer);
      particles.push({
        layer,
        char: pickChar(),
        x: nx * w + rand(-w * 0.04, w * 0.04),
        y: ny * h + rand(-h * 0.04, h * 0.04),
        vx: (Math.random() - 0.5) * drift * 0.35,
        vy: (Math.random() - 0.5) * drift * 0.35,
        size: layerSize(layer) * 1.08,
        baseOpacity: rand(0.08, 0.22) * layerOpacityScale(layer),
        offsetX: 0,
        offsetY: 0,
        glow: 0,
        opacityBoost: 0,
        rotation: 0,
        targetRotation: 0,
        nextCharSwapAt: now + rand(3000, 8000),
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  const bottomCols = 16;
  const bottomRows = 6;
  for (let row = 0; row < bottomRows; row++) {
    for (let col = 0; col < bottomCols; col++) {
      const layer = pickLayer();
      const drift = layerDrift(layer);
      const x = (col / Math.max(1, bottomCols - 1)) * w * 0.96 + w * 0.02;
      const y = h * (0.5 + (row / Math.max(1, bottomRows - 1)) * 0.46) + rand(-10, 10);
      particles.push({
        layer,
        char: pickChar(),
        x: x + rand(-w * 0.012, w * 0.012),
        y,
        vx: (Math.random() - 0.5) * drift * 0.35,
        vy: (Math.random() - 0.5) * drift * 0.2,
        size: layerSize(layer),
        baseOpacity: rand(0.08, 0.22) * layerOpacityScale(layer),
        offsetX: 0,
        offsetY: 0,
        glow: 0,
        opacityBoost: 0,
        rotation: 0,
        targetRotation: 0,
        nextCharSwapAt: now + rand(3000, 8000),
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  /* Dense fill directly under CTA buttons (center gap) */
  const coreCols = 10;
  const coreRows = 7;
  for (let row = 0; row < coreRows; row++) {
    for (let col = 0; col < coreCols; col++) {
      const layer = pickLayer();
      const drift = layerDrift(layer);
      const x = w * 0.16 + (col / Math.max(1, coreCols - 1)) * w * 0.68 + rand(-w * 0.01, w * 0.01);
      const y = h * 0.5 + (row / Math.max(1, coreRows - 1)) * h * 0.4 + rand(-12, 12);
      particles.push({
        layer,
        char: pickChar(),
        x,
        y,
        vx: (Math.random() - 0.5) * drift * 0.3,
        vy: (Math.random() - 0.5) * drift * 0.18,
        size: layerSize(layer) * 1.06,
        baseOpacity: rand(0.09, 0.24) * layerOpacityScale(layer),
        offsetX: 0,
        offsetY: 0,
        glow: 0,
        opacityBoost: 0,
        rotation: 0,
        targetRotation: 0,
        nextCharSwapAt: now + rand(3000, 8000),
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  const topCols = 8;
  for (let col = 0; col < topCols; col++) {
    const layer = pickLayer();
    const drift = layerDrift(layer);
    particles.push({
      layer,
      char: pickChar(),
      x: (col / (topCols - 1)) * w * 0.9 + w * 0.05,
      y: rand(h * 0.03, h * 0.14),
      vx: (Math.random() - 0.5) * drift * 0.4,
      vy: (Math.random() - 0.5) * drift * 0.35,
      size: layerSize(layer),
      baseOpacity: rand(0.06, 0.18) * layerOpacityScale(layer),
      offsetX: 0,
      offsetY: 0,
      glow: 0,
      opacityBoost: 0,
      rotation: 0,
      targetRotation: 0,
      nextCharSwapAt: now + rand(3000, 8000),
      phase: Math.random() * Math.PI * 2,
    });
  }
}

export function buildAsciiField(w: number, h: number, count: number): AsciiFieldState {
  const particles: AsciiParticle[] = [];
  const now = performance.now();

  pushAnchorParticles(particles, w, h, now);

  const quotas = zoneQuotas(count);
  const zones = Object.keys(quotas) as SpawnZone[];
  for (const zone of zones) {
    const n = quotas[zone];
    for (let i = 0; i < n; i++) {
      pushParticle(particles, w, h, zone, now);
    }
  }

  return { particles };
}

export function stepAsciiField(
  state: AsciiFieldState,
  w: number,
  h: number,
  dt: number,
  mouse: { x: number; y: number; active: boolean },
  interactive: boolean,
  reduced: boolean,
): void {
  const now = performance.now();
  const mx = mouse.x;
  const my = mouse.y;
  const r2 = CURSOR_RADIUS * CURSOR_RADIUS;

  for (let i = 0; i < state.particles.length; i++) {
    const p = state.particles[i]!;

    if (!reduced) {
      const drift = layerDrift(p.layer);
      p.phase += 0.002 * dt * (p.layer + 1);
      p.x += p.vx * dt + Math.sin(p.phase) * drift * 0.15;
      p.y += p.vy * dt + Math.cos(p.phase * 0.87) * drift * 0.12;

      if (now >= p.nextCharSwapAt) {
        p.char = swapChar(p.char);
        p.nextCharSwapAt = now + rand(3000, 8000);
      }

      const margin = 6;
      if (p.x < margin) {
        p.x = margin;
        p.vx = Math.abs(p.vx) * 0.6;
      } else if (p.x > w - margin) {
        p.x = w - margin;
        p.vx = -Math.abs(p.vx) * 0.6;
      }
      if (p.y < margin) {
        p.y = margin;
        p.vy = Math.abs(p.vy) * 0.6;
      } else if (p.y > h - margin) {
        p.y = h - margin;
        p.vy = -Math.abs(p.vy) * 0.6;
      }
    }

    let tOx = 0;
    let tOy = 0;
    let tGlow = 0;
    let tOp = 0;
    let tRot = 0;

    if (interactive && mouse.active) {
      const dx = p.x - mx;
      const dy = p.y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < r2 && d2 > 0.25) {
        const dist = Math.sqrt(d2);
        const f = (1 - dist / CURSOR_RADIUS) ** 1.4;
        const inv = 1 / dist;
        tOx = dx * inv * f * 9;
        tOy = dy * inv * f * 9;
        tOp = f * 0.7;
        tGlow = f * 0.98;
        tRot = f * 0.12 * (dx > 0 ? 1 : -1);
      }
    }

    p.offsetX += (tOx - p.offsetX) * LERP;
    p.offsetY += (tOy - p.offsetY) * LERP;
    p.glow += (tGlow - p.glow) * LERP;
    p.opacityBoost += (tOp - p.opacityBoost) * LERP;
    p.targetRotation = tRot;
    p.rotation += (p.targetRotation - p.rotation) * 0.1;
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
  const flicker = 0.9 + 0.1 * Math.sin(p.phase * 1.35 + now * 0.00035);
  return Math.min(0.94, (p.baseOpacity + p.opacityBoost + p.glow * 0.16) * flicker);
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  batch: DrawBatch,
  p: AsciiParticle,
  x: number,
  y: number,
  opacity: number,
): void {
  if (opacity < 0.006) return;

  const bright = Math.min(255, 178 + p.glow * 77);
  const hoverScale = 1 + p.glow * HOVER_SIZE_BOOST;
  ensureFont(ctx, batch, p.size * hoverScale);
  ensureFill(ctx, batch, `rgba(${bright}, ${Math.min(255, bright + 14)}, 255, ${opacity})`);

  if (Math.abs(p.rotation) > 0.001) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(p.rotation);
    ctx.fillText(p.char, 0, 0);
    ctx.restore();
  } else {
    ctx.fillText(p.char, x, y);
  }
}

export type DrawAsciiOptions = {
  scrollProgress: number;
  now: number;
};

export function renderAsciiCanvas(
  ctx: CanvasRenderingContext2D,
  state: AsciiFieldState,
  w: number,
  h: number,
  options: DrawAsciiOptions,
  layers: ParticleLayer[] = [0, 1, 2],
): void {
  const { scrollProgress, now } = options;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const batch: DrawBatch = { lastFont: "", lastFill: "" };

  for (const layer of layers) {
    const scrollY = scrollProgress * LAYER_SCROLL[layer];
    for (let i = 0; i < state.particles.length; i++) {
      const p = state.particles[i]!;
      if (p.layer !== layer) continue;
      const opacity = particleOpacity(p, now);
      drawParticle(ctx, batch, p, p.x + p.offsetX, p.y + p.offsetY + scrollY, opacity);
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
