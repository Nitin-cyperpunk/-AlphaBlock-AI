/** Continuous concentric ripple pool — cinematic, seamless loop */

export const RIPPLE_SLOTS = 6;
export const RIPPLE_LIFESPAN_MS = 7_000;
export const RIPPLE_EMIT_MS = 1_150;

export function rippleAge(elapsedMs: number, slot: number): number {
  const offset = slot * RIPPLE_EMIT_MS;
  return (((elapsedMs - offset) % RIPPLE_LIFESPAN_MS) + RIPPLE_LIFESPAN_MS) % RIPPLE_LIFESPAN_MS;
}

export function ripplePhase(age: number): number {
  return age / RIPPLE_LIFESPAN_MS;
}

/** sin(π·phase) — soft birth and death */
export function rippleAlpha(phase: number): number {
  return Math.sin(phase * Math.PI);
}

export function rippleRadius(phase: number, maxR: number): number {
  const eased = 1 - (1 - phase) ** 2.1;
  return maxR * eased;
}

export function maxRippleRadius(w: number, h: number): number {
  return Math.hypot(w, h) * 0.65;
}

/** Subtle arrow-boost sample at distance from center (0–1) */
export function rippleBoostAt(
  dist: number,
  elapsedMs: number,
  maxR: number,
): number {
  let boost = 0;
  for (let i = 0; i < RIPPLE_SLOTS; i++) {
    const age = rippleAge(elapsedMs, i);
    const phase = ripplePhase(age);
    const alpha = rippleAlpha(phase);
    if (alpha < 0.02) continue;
    const r = rippleRadius(phase, maxR);
    const band = 100;
    const d = dist - r;
    if (d > band || d < -band * 0.6) continue;
    const u = (d + band * 0.6) / (band * 1.6);
    const bandStrength = Math.sin(Math.max(0, Math.min(1, u)) * Math.PI * 0.5) ** 1.2;
    boost += bandStrength * alpha * 0.22;
  }
  return Math.min(1, boost);
}
