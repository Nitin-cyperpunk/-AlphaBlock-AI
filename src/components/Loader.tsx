"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { assets } from "@/lib/assets";

const PROGRESS_BLOCKS = 24;

const SYS_INFO = [
  "alpha@intelligence",
  "alphablock v1.0.0",
  "browser runtime",
  "webgl renderer",
  "signal engine",
] as const;

const LOGS = [
  { ms: 1042, text: "runtime // online" },
  { ms: 2034, text: "ethereum // connected" },
  { ms: 3152, text: "solana // connected" },
  { ms: 4173, text: "wallet graph // synced" },
  { ms: 5214, text: "social graph // synced" },
  { ms: 6451, text: "intelligence // primed" },
  { ms: 7812, text: "signal engine // armed" },
  { ms: 9143, text: "cluster analysis // active" },
  { ms: 10452, text: "market stream // online" },
] as const;

const SIG_CHARS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"] as const;

type LoaderProps = {
  onReady: () => void;
};

/** Faint animated green ASCII field — dims in, glows, settles to normal during boot. */
function AsciiField() {
  const [grid, setGrid] = useState("");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COLS = 90;
    const ROWS = 46;
    const glyphs = "01<>/\\|=+*-·:.";
    if (reduce) {
      let s = "";
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) s += glyphs[(r * c) % glyphs.length];
        s += "\n";
      }
      setGrid(s);
      return;
    }
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.028;
      let s = "";
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const v = Math.sin(c * 0.3 + t) + Math.cos(r * 0.4 - t * 0.7);
          const idx = Math.floor(((v + 2) / 4) * glyphs.length) % glyphs.length;
          s += v > 1.2 ? glyphs[idx]! : " ";
        }
        s += "\n";
      }
      setGrid(s);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <pre className="select-none whitespace-pre text-[0.5rem] leading-[1.1] text-[#1f7a3a] sm:text-[0.55rem]">
      {grid}
    </pre>
  );
}

function PixelTelemetry() {
  const [bars, setBars] = useState("▁▂▃▅▃▆▂▇");
  const [rx, setRx] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.06;
      const next = Array.from({ length: 8 }, (_, i) => {
        const v = Math.sin(t * 1.4 + i * 0.85) * 0.5 + 0.5;
        return SIG_CHARS[Math.floor(v * (SIG_CHARS.length - 1))]!;
      }).join("");
      setBars(next);
      setRx(Math.sin(t * 2.1) > -0.15);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="loader-telemetry mt-5 space-y-1 text-[0.58rem] leading-relaxed sm:text-[0.62rem]">
      <div className="flex items-center gap-2 text-white/30">
        <span className="w-6 text-white/25">sig</span>
        <span className="tracking-[0.12em] text-white/22">{bars}</span>
      </div>
      <div className="flex items-center gap-4 text-white/28">
        <span>
          rx{" "}
          <span style={{ color: rx ? "#0D2DCD" : "rgba(255,255,255,0.2)" }}>
            {rx ? "●" : "○"}
          </span>
        </span>
        <span>
          tx{" "}
          <span style={{ color: !rx ? "#0D2DCD" : "rgba(255,255,255,0.2)" }}>
            {!rx ? "●" : "○"}
          </span>
        </span>
      </div>
    </div>
  );
}

const Loader = forwardRef<HTMLDivElement, LoaderProps>(function Loader({ onReady }, forwardedRef) {
  const rootRef = useRef<HTMLDivElement>(null);
  const asciiRef = useRef<HTMLDivElement>(null);
  const asciiGlowRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const telemetryWrapRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const logRefs = useRef<(HTMLDivElement | null)[]>([]);
  const onReadyRef = useRef(onReady);
  const [blockCount, setBlockCount] = useState(0);

  logRefs.current = [];
  onReadyRef.current = onReady;

  const setRootRef = useCallback(
    (el: HTMLDivElement | null) => {
      rootRef.current = el;
      if (typeof forwardedRef === "function") forwardedRef(el);
      else if (forwardedRef) forwardedRef.current = el;
    },
    [forwardedRef],
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ease = "power2.out";

    if (reduce) {
      gsap.set(asciiRef.current, { opacity: 0.22 });
      gsap.set(asciiGlowRef.current, { opacity: 0.2 });
      gsap.set([terminalRef.current, headerRef.current, progressRef.current, finalRef.current], {
        opacity: 1,
      });
      gsap.set(logRefs.current, { opacity: 1 });
      gsap.set(telemetryWrapRef.current, { opacity: 1 });
      setBlockCount(PROGRESS_BLOCKS);
      const t = window.setTimeout(() => onReadyRef.current(), 600);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }

    const ctx = gsap.context(() => {
      gsap.set(terminalRef.current, { opacity: 1, scale: 1, filter: "blur(0px)" });
      gsap.set([headerRef.current, progressRef.current, telemetryWrapRef.current, finalRef.current], {
        opacity: 0,
      });
      gsap.set(logRefs.current, { opacity: 0 });

      // ASCII field: dim → soft glow pulses → normal
      gsap.set(asciiRef.current, { opacity: 0.04, filter: "brightness(0.55)" });
      gsap.set(asciiGlowRef.current, { opacity: 0 });

      const tl = gsap.timeline({ onComplete: () => onReadyRef.current() });

      // 0–2s — black + barely visible ASCII
      tl.to({}, { duration: 2 });

      // 2–4s — dim glow pulses as system wakes
      tl.to(
        asciiRef.current,
        { opacity: 0.1, filter: "brightness(0.72)", duration: 1.1, ease: "power1.out" },
        2,
      );
      tl.to(asciiGlowRef.current, { opacity: 0.22, duration: 1.2, ease: "power1.out" }, 2.1);
      tl.to(
        asciiGlowRef.current,
        { opacity: 0.38, duration: 0.55, ease: "sine.inOut", yoyo: true, repeat: 1 },
        2.8,
      );
      tl.to(
        asciiRef.current,
        { opacity: 0.14, filter: "brightness(0.82)", duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 1 },
        2.85,
      );

      // 2–4s — logo + system module (centered)
      tl.to(headerRef.current, { opacity: 1, duration: 1.1, ease }, 2);
      tl.to(progressRef.current, { opacity: 1, duration: 0.7, ease }, 2.35);
      tl.to(telemetryWrapRef.current, { opacity: 1, duration: 0.6, ease }, 2.55);

      // 4–10s — logs + ASCII ramps to normal
      tl.to(
        asciiRef.current,
        { opacity: 0.26, filter: "brightness(1)", duration: 5.8, ease: "power1.inOut" },
        4,
      );
      tl.to(
        asciiGlowRef.current,
        { opacity: 0.16, duration: 5.5, ease: "power1.inOut" },
        4.2,
      );

      const logStart = 4.1;
      const logStagger = 0.62;
      LOGS.forEach((_, i) => {
        tl.to(
          logRefs.current[i],
          { opacity: 1, duration: 0.32, ease: "power1.out" },
          logStart + i * logStagger,
        );
      });

      const blockStart = 4;
      const blockStep = 7 / PROGRESS_BLOCKS;
      for (let i = 0; i < PROGRESS_BLOCKS; i++) {
        tl.call(() => setBlockCount(i + 1), [], blockStart + i * blockStep);
      }

      tl.to({}, { duration: 0.4 }, 10.2);

      // 11–12s — final status, ASCII holds steady
      tl.to(
        finalRef.current,
        { opacity: 1, duration: 0.65, ease: "power1.inOut" },
        11,
      );
      tl.to({}, { duration: 0.55 }, 11.65);
    }, rootRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={setRootRef}
      className="loader-root absolute inset-0 z-50 overflow-hidden bg-[#010101] font-mono"
      style={{ fontFamily: "var(--font-jetbrains), ui-monospace, JetBrains Mono, monospace" }}
      aria-label="Intelligence layer initializing"
      aria-busy={blockCount < PROGRESS_BLOCKS}
    >
      <div
        ref={asciiRef}
        aria-hidden
        className="loader-ascii pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <AsciiField />
      </div>

      <div
        ref={asciiGlowRef}
        aria-hidden
        className="loader-ascii-glow pointer-events-none absolute inset-0"
      />

      <div className="relative flex min-h-full w-full items-center justify-center px-6 py-10 sm:px-8">
        <div
          ref={terminalRef}
          className="loader-terminal w-full max-w-md"
        >
          <div ref={headerRef} className="loader-header flex items-start gap-4 opacity-0 sm:gap-5">
            <div className="loader-logo shrink-0 pt-0.5">
              <Image
                src={assets.logoLight}
                alt="AlphaBlock"
                width={128}
                height={40}
                priority
                className="h-auto w-[clamp(72px,16vw,108px)] object-contain object-left"
              />
            </div>

            <div
              className="loader-sysinfo min-w-0 space-y-0.5 text-left text-[0.58rem] leading-[1.55] sm:text-[0.62rem]"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              {SYS_INFO.map((line, i) => (
                <div key={line}>
                  {i === 0 && <span className="text-white/30">$ </span>}
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div
            ref={progressRef}
            className="loader-pixel-progress mt-5 opacity-0 text-left text-[0.52rem] tracking-[0.08em] sm:text-[0.56rem]"
            aria-hidden={blockCount === 0}
          >
            {Array.from({ length: PROGRESS_BLOCKS }, (_, i) => (
              <span
                key={i}
                style={{ color: i < blockCount ? "#0D2DCD" : "rgba(255,255,255,0.12)" }}
              >
                {i < blockCount ? "▓" : "░"}
              </span>
            ))}
          </div>

          <div className="loader-logs mt-6 space-y-[0.35rem] text-left text-[0.58rem] leading-[1.6] sm:text-[0.62rem]">
            {LOGS.map((log, i) => (
              <div
                key={log.ms}
                ref={(el) => {
                  logRefs.current[i] = el;
                }}
                className="opacity-0"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                <span style={{ color: "rgba(255,170,120,0.75)" }}>[{log.ms}ms]</span>{" "}
                {log.text}
              </div>
            ))}
          </div>

          <div ref={telemetryWrapRef} className="opacity-0">
            <PixelTelemetry />
          </div>

          <div
            ref={finalRef}
            className="loader-final mt-8 text-left text-[0.58rem] uppercase tracking-[0.38em] opacity-0 sm:text-[0.62rem]"
            style={{ color: "#0D2DCD" }}
          >
            Intelligence layer online
          </div>
        </div>
      </div>
    </div>
  );
});

export default Loader;
