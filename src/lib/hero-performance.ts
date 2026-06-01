/** Runtime hero performance tier — same animation pipeline; desktop vs mobile scale. */

export type HeroPerfTier = "reduced" | "mobile" | "desktop";

/** Canonical desktop canvas arrow field (do not change). */
export const DESKTOP_ARROW = 12;
export const DESKTOP_CELL = 18;
export const DESKTOP_CURSOR_RADIUS = 200;
export const DESKTOP_REST = -Math.PI / 4;

export type HeroPerfConfig = {
  tier: HeroPerfTier;
  dpr: number;
  /** Minimum ms between rendered frames */
  frameIntervalMs: number;
  rippleSlots: number;
  particleCap: number;
  drawCanvasArrows: boolean;
  drawHoverCanvas: boolean;
  drawRippleStroke: boolean;
  enablePointerHover: boolean;
  enableTwinkle: boolean;
  arrowSize: number;
  cellSize: number;
  cursorRadius: number;
  restAngle: number;
  patternMainSize: number;
  patternDepthSize: number;
  patternMainOpacity: number;
  patternDepthOpacity: number;
};

const DESKTOP_CONFIG: Omit<HeroPerfConfig, "tier"> = {
  dpr: 1.25,
  frameIntervalMs: 16,
  rippleSlots: 4,
  particleCap: 180,
  drawCanvasArrows: true,
  drawHoverCanvas: true,
  drawRippleStroke: false,
  enablePointerHover: true,
  enableTwinkle: true,
  arrowSize: DESKTOP_ARROW,
  cellSize: DESKTOP_CELL,
  cursorRadius: DESKTOP_CURSOR_RADIUS,
  restAngle: DESKTOP_REST,
  patternMainSize: 28,
  patternDepthSize: 30,
  patternMainOpacity: 0.18,
  patternDepthOpacity: 0.04,
};

const MOBILE_CONFIG: Omit<HeroPerfConfig, "tier"> = {
  dpr: 1,
  frameIntervalMs: 33,
  rippleSlots: 4,
  particleCap: 72,
  drawCanvasArrows: true,
  drawHoverCanvas: true,
  drawRippleStroke: false,
  enablePointerHover: true,
  enableTwinkle: true,
  arrowSize: 9,
  cellSize: 22,
  cursorRadius: 160,
  restAngle: DESKTOP_REST,
  patternMainSize: 22,
  patternDepthSize: 24,
  patternMainOpacity: 0.22,
  patternDepthOpacity: 0.05,
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isMobileViewport(): boolean {
  return window.matchMedia("(max-width: 768px)").matches;
}

function isTabletViewport(): boolean {
  return window.matchMedia("(max-width: 1024px) and (pointer: coarse)").matches;
}

function isLowEndDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowRam = typeof nav.deviceMemory === "number" && nav.deviceMemory < 4;
  const lowCpu =
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency <= 2;
  return lowRam || lowCpu;
}

export function getHeroPerfConfig(): HeroPerfConfig {
  if (typeof window === "undefined") {
    return { tier: "desktop", ...DESKTOP_CONFIG };
  }

  if (prefersReducedMotion()) {
    return {
      tier: "reduced",
      dpr: 1,
      frameIntervalMs: 9999,
      rippleSlots: 0,
      particleCap: 0,
      drawCanvasArrows: false,
      drawHoverCanvas: false,
      drawRippleStroke: false,
      enablePointerHover: false,
      enableTwinkle: false,
      arrowSize: DESKTOP_ARROW,
      cellSize: DESKTOP_CELL,
      cursorRadius: DESKTOP_CURSOR_RADIUS,
      restAngle: DESKTOP_REST,
      patternMainSize: 28,
      patternDepthSize: 30,
      patternMainOpacity: 0.18,
      patternDepthOpacity: 0.04,
    };
  }

  if (isMobileViewport() || isTabletViewport()) {
    return { tier: "mobile", ...MOBILE_CONFIG };
  }

  const lowEnd = isLowEndDevice();

  return {
    tier: "desktop",
    ...DESKTOP_CONFIG,
    dpr: lowEnd ? 1 : DESKTOP_CONFIG.dpr,
    frameIntervalMs: lowEnd ? 20 : DESKTOP_CONFIG.frameIntervalMs,
    particleCap: lowEnd ? 120 : DESKTOP_CONFIG.particleCap,
  };
}

export function shouldUseLenis(): boolean {
  if (typeof window === "undefined") return true;
  if (prefersReducedMotion()) return false;
  return !isMobileViewport() && !isTabletViewport();
}
