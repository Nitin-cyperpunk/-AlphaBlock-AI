# Laptop Animation

Cinematic scroll-driven **Setup Experience** section built with Next.js, Tailwind CSS, GSAP ScrollTrigger, and Lenis.

## Stack

- Next.js App Router
- Tailwind CSS v4
- GSAP + ScrollTrigger
- Lenis smooth scrolling

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and scroll to the pinned section.

## Assets

Replace placeholder media in `public/`:

| File | Purpose |
|------|---------|
| `public/alphablock-demo.mp4` | Looping AlphaBlock product demo inside the laptop screen |
| `public/mobile-dashboard.svg` | Mobile dashboard screenshot (swap for PNG/WebP) |
| `public/laptop-poster.svg` | Video poster frame |

## Component

The main section lives in `src/components/SetupSection.tsx` and includes:

- `Laptop` — MacBook-style mockup with looping video
- `Phone` — perspective-ready mobile mockup
- GSAP timeline with ScrollTrigger pin (`end: +=200%`)
- Responsive breakpoints via `gsap.matchMedia`
- Cleanup via `gsap.context().revert()` on unmount

## Scroll behavior (250vh pinned)

1. **Phase 1 — Reveal** — Laptop lid opens (10° → 100°), AlphaBlock demo fades in
2. **Phase 2 — Showcase** — Both devices visible with subtle floating motion
3. **Phase 3 — Handoff** — Laptop recedes; phone scales up and moves to center
4. **Phase 4 — Final** — Phone centered, front-facing; laptop nearly invisible

All transitions use `ease: power2.inOut` with Lenis-synced scrubbed scroll.
# -AlphaBlock-AI
