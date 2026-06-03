/** AlphaBlock AI brand assets served from /public/Assets */

const encode = (path: string) =>
  path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

export const assets = {
  /** Hero section full-bleed background */
  heroBg: encode("/Assets/bg2.png"),
  /** Logo for dark backgrounds (hero, navbar) */
  logoLight: encode("/Assets/Dark mode without BG.webp"),
  /** Logo for light backgrounds */
  logoDark: encode("/Assets/Light Mode.jpg"),
  /** App icon — mobile menu, branding */
  icon: encode("/Assets/App Icon.png"),
  faviconLight: encode("/Assets/Light_Favicon.png"),
  faviconDark: encode("/Assets/Dark_Favicon.png"),
} as const;
