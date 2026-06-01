/** Side bands — pointer / ripples affect clusters only, center stays clean */

export const SIDE_CLUSTER_RADIUS = 250;

export function isSideClusterX(x: number, width: number, inset = 0.32): boolean {
  const edge = width * inset;
  return x < edge || x > width - edge;
}

export function sideClusterWeight(x: number, width: number): number {
  const cx = width * 0.5;
  const norm = Math.abs(x - cx) / (width * 0.5);
  return Math.max(0, Math.min(1, (norm - 0.28) / 0.42));
}
