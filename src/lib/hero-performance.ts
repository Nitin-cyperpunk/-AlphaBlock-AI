/** Runtime hero performance — capped DPR, particle budgets */

import { getHeroCanvasDpr } from "@/lib/ascii-intelligence-field";

export type HeroPerfTier = "reduced" | "mobile" | "desktop";

export type HeroPerfConfig = {
  tier: HeroPerfTier;
  dpr: number;
  frameIntervalMs: number;
  particleCount: number;
  enablePointerHover: boolean;
  enableTwinkle: boolean;
};

const DESKTOP_PARTICLES = 4800;
const MOBILE_PARTICLES = Math.floor(DESKTOP_PARTICLES * 0.42);

const DESKTOP_CONFIG: Omit<HeroPerfConfig, "tier" | "dpr"> = {
  frameIntervalMs: 0,
  particleCount: DESKTOP_PARTICLES,
  enablePointerHover: true,
  enableTwinkle: false,
};

const MOBILE_CONFIG: Omit<HeroPerfConfig, "tier" | "dpr"> = {
  frameIntervalMs: 0,
  particleCount: MOBILE_PARTICLES,
  enablePointerHover: true,
  enableTwinkle: false,
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isMobileViewport(): boolean {
  return window.innerWidth < 768;
}

function isTabletViewport(): boolean {
  return window.innerWidth < 1024 && window.matchMedia("(pointer: coarse)").matches;
}

function isLowEndDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowRam = typeof nav.deviceMemory === "number" && nav.deviceMemory < 4;
  const lowCpu =
    typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 2;
  return lowRam || lowCpu;
}

export function getHeroPerfConfig(): HeroPerfConfig {
  const dpr = getHeroCanvasDpr();

  if (typeof window === "undefined") {
    return { tier: "desktop", dpr: 1, ...DESKTOP_CONFIG };
  }

  if (prefersReducedMotion()) {
    return {
      tier: "reduced",
      dpr: 1,
      frameIntervalMs: 9999,
      particleCount: 0,
      enablePointerHover: false,
      enableTwinkle: false,
    };
  }

  if (isMobileViewport() || isTabletViewport()) {
    return { tier: "mobile", dpr, ...MOBILE_CONFIG };
  }

  const lowEnd = isLowEndDevice();
  return {
    tier: "desktop",
    dpr,
    ...DESKTOP_CONFIG,
    particleCount: lowEnd ? 3200 : DESKTOP_PARTICLES,
    frameIntervalMs: lowEnd ? 16 : 0,
  };
}

export function shouldUseLenis(): boolean {
  if (typeof window === "undefined") return true;
  if (prefersReducedMotion()) return false;
  return !isMobileViewport() && !isTabletViewport();
}
