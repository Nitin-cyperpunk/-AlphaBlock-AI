/** Intelligence wave propagation — radial density fields, not strokes. */

export const WAVE_CYCLE_MS = 16_000;
export const WAVE_PEAK_RADII = [400, 700, 1000, 1300] as const;
export const WAVE_COUNT = WAVE_PEAK_RADII.length;

export function waveBand(peak: number): number {
  return peak * 0.3;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Ease-out expansion — cinematic deceleration as ring moves outward */
export function easeWaveProgress(progress: number): number {
  return 1 - (1 - progress) ** 2.15;
}

export function waveProgress(elapsedMs: number, index: number): number {
  const stagger = (WAVE_CYCLE_MS / WAVE_COUNT) * index;
  return (((elapsedMs - stagger) % WAVE_CYCLE_MS) + WAVE_CYCLE_MS) % WAVE_CYCLE_MS / WAVE_CYCLE_MS;
}

/** Expanding ring radius with eased motion */
export function waveRadius(peak: number, progress: number): number {
  const eased = easeWaveProgress(progress);
  const start = 48;
  const end = peak * 1.38;
  return start + (end - start) * eased;
}

/** Long crossfades — waves overlap without hard resets */
export function waveEnvelope(progress: number): number {
  const fadeIn = smoothstep(0, 0.18, progress);
  const fadeOut = 1 - smoothstep(0.72, 1, progress);
  return fadeIn * fadeOut;
}

/**
 * Asymmetric wave band: trailing (inner) is darker, leading (outer) is lighter.
 */
export function directionalWaveDensity(dist: number, ringRadius: number, band: number): number {
  const d = dist - ringRadius;

  if (d > band * 0.95) return 0;

  if (d >= -band * 0.3) {
    const u = (d + band * 0.3) / (band * 1.25);
    return Math.pow(Math.sin((u * Math.PI) / 2), 1.25);
  }

  const u = (-d - band * 0.3) / (band * 0.85);
  return 0.14 * Math.exp(-u * u * 2.2);
}

/** Darken regions ahead of wave fronts — soft transitions */
export function waveShadeAt(
  dist: number,
  elapsedMs: number,
  smoothedRadii?: readonly number[],
): number {
  let shade = 1;

  for (let i = 0; i < WAVE_COUNT; i++) {
    const p = waveProgress(elapsedMs, i);
    const peak = WAVE_PEAK_RADII[i];
    const radius = smoothedRadii?.[i] ?? waveRadius(peak, p);
    const env = waveEnvelope(p);
    if (env < 0.04) continue;

    const band = waveBand(peak);
    const d = dist - radius;

    if (d > band * 0.4) {
      const ahead = (d - band * 0.4) / (band * 2.2);
      shade = Math.min(shade, 0.52 + 0.2 * Math.exp(-ahead * 0.75));
    } else if (d < -band * 0.5) {
      const trail = (-d - band * 0.5) / (band * 1.2);
      shade = Math.min(shade, 0.7 + 0.08 * Math.exp(-trail * 0.6));
    }
  }

  return shade;
}

/** Brightness at leading edge of all active waves */
export function waveFieldAt(
  x: number,
  y: number,
  cx: number,
  cy: number,
  elapsedMs: number,
  ripples: ReadonlyArray<{ x: number; y: number; born: number }>,
  now: number,
  smoothedRadii?: readonly number[],
): number {
  const dist = Math.hypot(x - cx, y - cy);
  let total = 0;

  for (let i = 0; i < WAVE_COUNT; i++) {
    const p = waveProgress(elapsedMs, i);
    const peak = WAVE_PEAK_RADII[i];
    const radius = smoothedRadii?.[i] ?? waveRadius(peak, p);
    const env = waveEnvelope(p);
    const band = waveBand(peak);
    total += directionalWaveDensity(dist, radius, band) * env;
  }

  for (const rip of ripples) {
    const age = now - rip.born;
    if (age > 2800) continue;
    const linear = age / 2800;
    const p = 1 - (1 - linear) ** 2;
    const r = 40 + 320 * p;
    const rd = Math.hypot(x - rip.x, y - rip.y);
    const fade = (1 - linear) ** 1.4;
    total += directionalWaveDensity(rd, r, 85) * fade * 0.48;
  }

  return Math.min(1, total);
}

/** Lerp displayed ring radii toward targets for frame-to-frame smoothness */
export function smoothWaveRadii(
  display: number[],
  elapsedMs: number,
  lerp = 0.055,
): number[] {
  for (let i = 0; i < WAVE_COUNT; i++) {
    const p = waveProgress(elapsedMs, i);
    const peak = WAVE_PEAK_RADII[i];
    const target = waveRadius(peak, p);
    display[i] += (target - display[i]) * lerp;
  }
  return display;
}
