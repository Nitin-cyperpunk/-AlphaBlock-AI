/** Side-cluster ambient particles — curved bands, spring drift, side-only pointer */

import { isSideClusterX, SIDE_CLUSTER_RADIUS } from "@/lib/hero-side-zones";

export type FieldParticle = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  phase: number;
  driftPhase: number;
  blue: boolean;
  size: number;
  opacityBase: number;
};

export function buildFieldParticles(w: number, h: number, count: number): FieldParticle[] {
  const particles: FieldParticle[] = [];
  const cx = w * 0.5;
  const excludeR = w * 0.2;
  const anchors = [w * 0.14, w * 0.86];

  for (const anchorX of anchors) {
    const half = Math.floor(count / 2);
    for (let i = 0; i < half; i++) {
      let x = 0;
      let y = 0;
      for (let attempt = 0; attempt < 12; attempt++) {
        const band = (i / half) * Math.PI * 1.6 - Math.PI * 0.8;
        const spread = (Math.random() - 0.5) * 0.55;
        const angle = band + spread;
        const dist = (0.25 + Math.random() * 0.75) * Math.min(w, h) * 0.38;
        x = anchorX + Math.cos(angle) * dist * 0.42;
        y = h * (0.22 + (i / half) * 0.56) + Math.sin(angle * 2) * h * 0.06;
        if (Math.abs(x - cx) > excludeR) break;
      }
      particles.push({
        baseX: x,
        baseY: y,
        x,
        y,
        vx: 0,
        vy: 0,
        tx: x,
        ty: y,
        phase: Math.random() * Math.PI * 2,
        driftPhase: Math.random() * Math.PI * 2,
        blue: Math.random() < 0.24,
        size: 0.65 + Math.random() * 1.15,
        opacityBase: 0.88 + Math.random() * 0.12,
      });
    }
  }
  return particles;
}

export function stepFieldParticles(
  particles: FieldParticle[],
  t: number,
  reduce: boolean,
  mouseX: number,
  mouseY: number,
  mouseOn: boolean,
  width: number,
): void {
  for (const p of particles) {
    if (!reduce) {
      const drift = 0.85 + Math.sin(t * 0.22 + p.driftPhase) * 0.15;
      const ampX = 2 + (p.phase % 1) * 4;
      const ampY = 2 + (p.driftPhase % 1) * 3;
      p.tx =
        p.baseX +
        Math.sin(t * 0.31 + p.phase) * ampX * drift +
        Math.sin(t * 0.17 + p.driftPhase) * 1.2;
      p.ty =
        p.baseY +
        Math.cos(t * 0.26 + p.phase * 1.15) * ampY * drift +
        Math.cos(t * 0.19 + p.driftPhase) * 0.9;

      if (mouseOn && isSideClusterX(mouseX, width)) {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < SIDE_CLUSTER_RADIUS && dist > 0.1) {
          const force = (1 - dist / SIDE_CLUSTER_RADIUS) ** 2 * 4.2;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }
    }

    p.vx += (p.tx - p.x) * 0.055;
    p.vy += (p.ty - p.y) * 0.055;
    p.vx *= 0.8;
    p.vy *= 0.8;
    p.x += p.vx;
    p.y += p.vy;
  }
}
