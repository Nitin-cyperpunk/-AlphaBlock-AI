/**
 * Lightweight ASCII + depth particles for SetupSection atmosphere.
 */

export const SETUP_ASCII_CHARS = ["0", "1", "x", "+", "#", "/"] as const;

type AsciiDot = {
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  phase: number;
};

type DepthDot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
};

export type SetupAtmosphereState = {
  ascii: AsciiDot[];
  depth: DepthDot[];
};

const MONO = 'var(--font-jetbrains), ui-monospace, "JetBrains Mono", monospace';

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function buildSetupAtmosphere(w: number, h: number): SetupAtmosphereState {
  const asciiCount = Math.min(140, Math.floor((w * h) / 12000));
  const depthCount = Math.min(48, Math.floor((w * h) / 28000));

  const ascii: AsciiDot[] = Array.from({ length: asciiCount }, () => ({
    char: SETUP_ASCII_CHARS[(Math.random() * SETUP_ASCII_CHARS.length) | 0]!,
    x: rand(0, w),
    y: rand(0, h),
    vx: rand(-0.12, 0.12),
    vy: rand(-0.18, 0.18),
    size: rand(9, 13),
    opacity: rand(0.05, 0.1),
    phase: rand(0, Math.PI * 2),
  }));

  const depth: DepthDot[] = Array.from({ length: depthCount }, () => ({
    x: rand(0, w),
    y: rand(0, h),
    vx: rand(-0.06, 0.06),
    vy: rand(-0.1, 0.1),
    size: rand(1, 2),
    opacity: rand(0.14, 0.34),
  }));

  return { ascii, depth };
}

export function stepSetupAtmosphere(
  state: SetupAtmosphereState,
  w: number,
  h: number,
  dt: number,
  scrollParallax: number,
) {
  for (const p of state.ascii) {
    p.x += p.vx * dt;
    p.y += p.vy * dt + scrollParallax * 0.02;
    p.phase += 0.008 * dt;

    if (p.x < -20) p.x = w + 20;
    if (p.x > w + 20) p.x = -20;
    if (p.y < -20) p.y = h + 20;
    if (p.y > h + 20) p.y = -20;
  }

  for (const p of state.depth) {
    p.x += p.vx * dt;
    p.y += p.vy * dt + scrollParallax * 0.035;
    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;
  }
}

export function renderSetupAtmosphere(
  asciiCtx: CanvasRenderingContext2D,
  depthCtx: CanvasRenderingContext2D,
  state: SetupAtmosphereState,
  w: number,
  h: number,
) {
  asciiCtx.clearRect(0, 0, w, h);
  depthCtx.clearRect(0, 0, w, h);

  asciiCtx.font = `500 11px ${MONO}`;
  asciiCtx.textAlign = "center";
  asciiCtx.textBaseline = "middle";

  for (const p of state.ascii) {
    const flicker = 0.85 + Math.sin(p.phase) * 0.15;
    asciiCtx.fillStyle = `rgba(255,255,255,${(p.opacity * flicker).toFixed(3)})`;
    asciiCtx.font = `500 ${p.size}px ${MONO}`;
    asciiCtx.fillText(p.char, p.x, p.y);
  }

  for (const p of state.depth) {
    depthCtx.fillStyle = `rgba(255,255,255,${p.opacity.toFixed(3)})`;
    depthCtx.beginPath();
    depthCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    depthCtx.fill();
  }
}
