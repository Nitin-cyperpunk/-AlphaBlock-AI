/** Footer link columns + metadata */

import { APP_URL } from "@/lib/urls";

export const FOOTER_CONTRACT =
  "0xA1B2C3D4E5F67890ABCDEF1234567890FEDCBA98" as const;

export const FOOTER_SYSTEM_STATUS = "SYSTEM STATUS · NETWORK STABLE · 2026" as const;

export function truncateContract(address: string): string {
  if (address.length <= 13) return address;
  return `${address.slice(0, 6)}…${address.slice(-5)}`;
}

/** Shorter truncation for narrow screens — e.g. 0xA1B2…BA98 */
export function truncateContractMobile(address: string): string {
  if (address.length <= 11) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export const FOOTER_SOCIAL = [
  { label: "X (Twitter)", href: "https://x.com/AlphaBlockAI", icon: "x" as const },
  { label: "Telegram", href: "https://t.me/AlphaBlockAI", icon: "telegram" as const },
  { label: "Discord", href: "https://discord.gg/alphablock", icon: "discord" as const },
  { label: "LinkedIn", href: "https://linkedin.com/company/alphablock", icon: "linkedin" as const },
] as const;

export const FOOTER_PRODUCT_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Dashboard", href: APP_URL },
  { label: "Pricing", href: "#pricing" },
  { label: "Documentation", href: APP_URL },
] as const;

export const FOOTER_CHANNEL_LINKS = [
  { label: "AlphaBlockAI", href: "https://t.me/AlphaBlockAI" },
  { label: "AlphaWhalesX", href: "https://x.com/AlphaWhalesX" },
  { label: "AlphxInsights", href: "https://x.com/AlphxInsights" },
  { label: "AlphaStriker Bot", href: "https://t.me/AlphaStrikerBot" },
] as const;

export const FOOTER_TOKEN_LINKS = [
  { label: "$ALPHA", href: "#footer" },
  { label: "Tokenomics", href: "#intelligence" },
  { label: "Contract", href: "#footer" },
  { label: "Liquidity", href: APP_URL },
] as const;

/** Deterministic constellation nodes (viewBox 0 0 100 100). */
export const FOOTER_NETWORK_NODES: { x: number; y: number }[] = [
  { x: 8, y: 22 },
  { x: 18, y: 38 },
  { x: 28, y: 18 },
  { x: 38, y: 52 },
  { x: 48, y: 28 },
  { x: 58, y: 62 },
  { x: 68, y: 34 },
  { x: 78, y: 48 },
  { x: 88, y: 26 },
  { x: 14, y: 68 },
  { x: 24, y: 78 },
  { x: 34, y: 58 },
  { x: 44, y: 82 },
  { x: 54, y: 72 },
  { x: 64, y: 88 },
  { x: 74, y: 66 },
  { x: 84, y: 76 },
  { x: 92, y: 58 },
  { x: 6, y: 44 },
  { x: 22, y: 52 },
  { x: 42, y: 42 },
  { x: 62, y: 46 },
  { x: 82, y: 38 },
  { x: 52, y: 14 },
  { x: 72, y: 12 },
  { x: 32, y: 32 },
  { x: 56, y: 36 },
  { x: 76, y: 54 },
];

/** Reduced node set for mobile constellation (~40% of desktop). */
export const FOOTER_NETWORK_MOBILE_INDICES = [0, 3, 5, 8, 11, 14, 17, 20, 23, 26] as const;

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Edges between nearby nodes — computed once. */
export const FOOTER_NETWORK_EDGES: [number, number][] = (() => {
  const edges: [number, number][] = [];
  const maxDist = 22;
  for (let i = 0; i < FOOTER_NETWORK_NODES.length; i++) {
    for (let j = i + 1; j < FOOTER_NETWORK_NODES.length; j++) {
      if (dist(FOOTER_NETWORK_NODES[i]!, FOOTER_NETWORK_NODES[j]!) < maxDist) {
        edges.push([i, j]);
      }
    }
  }
  return edges;
})();

export const FOOTER_ASCII_RESIDUE =
  "0 x @ + / # $ 0 x @ + / # $ 0 x @ + / # $ 0 x @ + / # $ 0 x @ + / # $";
