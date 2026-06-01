/** Four continuous intelligence propagation waves — felt, not drawn as rings */

export const INTELLIGENCE_WAVE_COUNT = 4;

export type IntelligenceWave = {
  startR: number;
  endR: number;
  durationMs: number;
};

export const INTELLIGENCE_WAVES: readonly IntelligenceWave[] = [
  { startR: 200, endR: 1200, durationMs: 12_000 },
  { startR: 400, endR: 1400, durationMs: 14_000 },
  { startR: 600, endR: 1600, durationMs: 16_000 },
  { startR: 800, endR: 1800, durationMs: 18_000 },
] as const;

export function maxRippleRadius(w: number, h: number): number {
  return Math.hypot(w, h) * 0.72;
}

/** Viewport scale so largest wave reaches field edge */
export function waveViewportScale(w: number, h: number): number {
  const maxBase = INTELLIGENCE_WAVES[INTELLIGENCE_WAVES.length - 1].endR;
  return maxRippleRadius(w, h) / maxBase;
}

export function wavePhase(elapsedMs: number, index: number): number {
  const wave = INTELLIGENCE_WAVES[index];
  return ((elapsedMs % wave.durationMs) + wave.durationMs) % wave.durationMs / wave.durationMs;
}

/** Soft envelope — no hard pop on loop (overlapping waves hide seams) */
export function waveAlpha(phase: number): number {
  const edge = Math.sin(phase * Math.PI);
  const mid = Math.sin(phase * Math.PI * 0.5) ** 0.85;
  return edge * 0.55 + mid * 0.45;
}

export function waveRadius(phase: number, index: number, scale: number): number {
  const wave = INTELLIGENCE_WAVES[index];
  const t = phase ** 1.05;
  return (wave.startR + (wave.endR - wave.startR) * t) * scale;
}

/** Subtle arrow / field boost as wave front passes (0–1) */
export function rippleBoostAt(
  dist: number,
  elapsedMs: number,
  w: number,
  h: number,
): number {
  const scale = waveViewportScale(w, h);
  let boost = 0;

  for (let i = 0; i < INTELLIGENCE_WAVE_COUNT; i++) {
    const phase = wavePhase(elapsedMs, i);
    const alpha = waveAlpha(phase);
    if (alpha < 0.04) continue;

    const r = waveRadius(phase, i, scale);
    const band = 110;
    const d = dist - r;
    if (d > band || d < -band * 0.55) continue;

    const u = (d + band * 0.55) / (band * 1.55);
    const bandStrength = Math.sin(Math.max(0, Math.min(1, u)) * Math.PI * 0.5) ** 1.15;
    boost += bandStrength * alpha * 0.36;
  }

  return Math.min(1, boost);
}

/** Average wave energy for ambient SVG pattern pulse */
export function ambientWaveStrength(elapsedMs: number): number {
  let sum = 0;
  for (let i = 0; i < INTELLIGENCE_WAVE_COUNT; i++) {
    sum += waveAlpha(wavePhase(elapsedMs, i));
  }
  return sum / INTELLIGENCE_WAVE_COUNT;
}

/** Legacy aliases used by draw loop */
export const RIPPLE_SLOTS = INTELLIGENCE_WAVE_COUNT;

export function rippleAge(elapsedMs: number, slot: number): number {
  const wave = INTELLIGENCE_WAVES[slot];
  return ((elapsedMs % wave.durationMs) + wave.durationMs) % wave.durationMs;
}

export function ripplePhase(age: number, slot: number): number {
  return age / INTELLIGENCE_WAVES[slot].durationMs;
}

export function rippleAlpha(phase: number): number {
  return waveAlpha(phase);
}

export function rippleRadius(phase: number, maxR: number, slot: number): number {
  const wave = INTELLIGENCE_WAVES[slot];
  const scale = maxR / wave.endR;
  return waveRadius(phase, slot, scale);
}
