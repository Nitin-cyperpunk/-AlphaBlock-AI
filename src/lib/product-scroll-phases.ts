/** Combined Setup (Section 2) + Intelligence (Section 3) master timeline. */

export const PRODUCT_SCROLL_END = "+=900%";
export const PRODUCT_SCRUB = 1.5;

/** Setup occupies the first 38% of master scroll progress. */
export const SETUP_WEIGHT = 0.38;

export const setupT = (phase: number) => phase * SETUP_WEIGHT;

export const intelT = (local: number) => SETUP_WEIGHT + local * (1 - SETUP_WEIGHT);

/** Intelligence sub-timeline (0–1 within the intelligence portion). */
export const INTEL_PHASE = {
  handoffEnd: 0.12,
  kolEnd: 0.28,
  whaleEnd: 0.44,
  clusterEnd: 0.58,
  surgeEnd: 0.76,
  askEnd: 1,
} as const;

export const INTEL_NAV_TARGETS: Record<string, number> = {
  kol: INTEL_PHASE.handoffEnd,
  whale: INTEL_PHASE.kolEnd,
  cluster: INTEL_PHASE.whaleEnd,
  surge: INTEL_PHASE.clusterEnd,
  ask: INTEL_PHASE.surgeEnd,
};
