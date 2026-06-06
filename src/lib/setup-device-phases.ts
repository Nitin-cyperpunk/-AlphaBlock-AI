/** Normalized master timeline (0–1) — one primary device action at a time. */
export const DEVICE_PHASE = {
  introEnd: 0.1,
  showcaseEnd: 0.3,
  lidCloseEnd: 0.48,
  laptopExitEnd: 0.6,
  mobileEntryEnd: 0.78,
  centerHoldEnd: 0.9,
  rotateEnd: 1,
} as const;

export const SETUP_SCROLL_END = "+=450%";
export const SETUP_SCRUB = 1.5;

export const STORY_ENTER_DUR = 0.032;
export const STORY_EXIT_DUR = 0.018;
