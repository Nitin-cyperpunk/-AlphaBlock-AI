"use client";

import { HeroBackground } from "@/components/HeroBackground";

const NAV = ["Product", "Features", "How it works", "Pricing"];

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden bg-background border-b border-border"
    >
      <HeroBackground />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium tracking-[0.22em] text-foreground">
            ALPHABLOCK <span className="text-brand">AI</span>
          </span>
        </div>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <a
              key={item}
              href="#"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              {item}
            </a>
          ))}
        </nav>

        <a
          href="#launch"
          className="group flex items-center gap-2 rounded-md border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-darkgray"
        >
          Launch Dashboard
          <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            ↗
          </span>
        </a>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-4xl flex-col items-center justify-center px-6 text-center">
        <p className="hero-up font-mono text-[0.7rem] uppercase tracking-[0.35em] text-muted-foreground [animation-delay:120ms]">
          Built for the next generation of traders
        </p>

        <h1 className="hero-up mt-7 text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl [animation-delay:240ms]">
          The{" "}
          <span className="font-serif italic font-normal">personalised</span>{" "}
          intelligence and{" "}
          <span className="font-serif italic font-normal">execution</span> layer
          for{" "}
          <span className="font-serif italic font-normal">onchain</span> trading.
        </h1>

        <p className="hero-up mt-7 max-w-md text-base text-muted-foreground [animation-delay:420ms]">
          Understand the market before the market moves.
        </p>

        <div className="hero-up mt-10 flex flex-col items-center gap-4 sm:flex-row [animation-delay:560ms]">
          <a
            href="#launch"
            className="group flex items-center gap-2 rounded-md bg-primary px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Launch Dashboard
            <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </a>
          <a
            href="#telegram"
            className="group flex items-center gap-2 rounded-md border border-border bg-transparent px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-darkgray"
          >
            Launch Telegram
            <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
