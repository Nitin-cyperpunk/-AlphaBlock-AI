/** Shared geometric ↗ arrow tile for hero background layers. */
export const ARROW_PATTERN_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M8 22V19.9L16.75 11.15H13.9V9H20.5V15.6H18.35V12.75L9.6 21.5H11.7V23.65H5.35V17.3H7.5V20.15L8 22Z" fill="rgba(255,255,255,0.12)"/>
  </svg>`,
);

export const ARROW_PATTERN_URL = `url("data:image/svg+xml,${ARROW_PATTERN_SVG}")`;

/** Absolute timeline anchors (seconds from page load). */
export const TIMELINE = {
  preloaderEnd: 5.4,
  environmentEnd: 5,
  glowEnd: 5.8,
  contentEnd: 7,
} as const;
