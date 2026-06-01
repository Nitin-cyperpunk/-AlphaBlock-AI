/** Side-cluster ambient particles — spring drift, central exclusion */

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
  blue: boolean;
  size: number;
};

export function buildFieldParticles(w: number, h: number, count: number): FieldParticle[] {
  const particles: FieldParticle[] = [];
  const cx = w * 0.5;
  const excludeR = w * 0.22;
  const clusters = [w * 0.18, w * 0.82];

  for (const anchorX of clusters) {
    const half = Math.floor(count / 2);
    for (let i = 0; i < half; i++) {
      let x = 0;
      let y = 0;
      for (let attempt = 0; attempt < 8; attempt++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 0.55) * Math.min(w, h) * 0.42;
        x = anchorX + Math.cos(angle) * dist * 0.35;
        y = h * 0.2 + Math.random() * h * 0.6;
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
        blue: Math.random() < 0.22,
        size: 0.7 + Math.random() * 1.1,
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
): void {
  for (const p of particles) {
    if (!reduce) {
      const breath = 0.85 + Math.sin(t * 0.6 + p.phase) * 0.15;
      p.tx = p.baseX + Math.sin(t * 0.35 + p.phase) * 5 * breath;
      p.ty = p.baseY + Math.cos(t * 0.28 + p.phase * 1.2) * 4 * breath;

      if (mouseOn) {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < 200 && dist > 0.1) {
          const force = (1 - dist / 200) ** 2 * 3.8;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }
    }

    p.vx += (p.tx - p.x) * 0.06;
    p.vy += (p.ty - p.y) * 0.06;
    p.vx *= 0.82;
    p.vy *= 0.82;
    p.x += p.vx;
    p.y += p.vy;
  }
}
