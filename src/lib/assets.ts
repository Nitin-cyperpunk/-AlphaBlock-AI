/** AlphaBlock AI brand assets served from /public/Assets */

const encode = (path: string) =>
  path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

export const assets = {
  /** Setup section device mockups */
  macbook: encode("/macbook.png"),
  closeMacbook: encode("/closemacbook.png"),
  iphone: encode("/iphone.png"),
  laptopScreen1: encode("/laptop1.png"),
  laptopScreen2: encode("/laptop2.png"),
  mobileScreen1: encode("/mobile1.png"),
  mobileScreen2: encode("/mobile2.png"),
  mobileLandscape1: encode("/landscape1.png"),
  mobileLandscape2: encode("/landscape 2.png"),
  /** Hero + setup atmosphere — subtle grid overlay, institutional cinematic tone */
  heroBg: encode("/Assets/ascii-art.png"),
  /** Alternate hero backgrounds */
  heroBgMountain: encode("/Assets/moutain.png"),
  heroBgGarden: encode("/Assets/flowergarden.png"),
  /** Logo for dark backgrounds (hero, navbar) */
  logoLight: encode("/Assets/Dark mode without BG.webp"),
  /** Logo for light backgrounds */
  logoDark: encode("/Assets/Light Mode.jpg"),
  /** App icon — mobile menu, branding */
  icon: encode("/Assets/App Icon.png"),
  faviconLight: encode("/Assets/Light_Favicon.png"),
  faviconDark: encode("/Assets/Dark_Favicon.png"),
} as const;
