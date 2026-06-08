"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { assets } from "@/lib/assets";

const PROGRESS_BLOCKS = 24;
const SIG_CHARS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"] as const;

const SYS_INFO = [
  "alpha@intelligence",
  "alphablock v1.0.0",
  "browser runtime",
  "webgl renderer",
  "signal engine",
] as const;

/** Boot script — phases, logs, block grants, optional stall (seconds). */
const BOOT_SCRIPT = [
  { phase: "initializing runtime" },
  { log: "runtime // online", blocks: 3, wait: 0.52, clock: 420 },
  { phase: "connecting chains" },
  { log: "ethereum // connected", blocks: 2, wait: 0.48, clock: 380 },
  { log: "solana // connected", blocks: 2, wait: 0.58, clock: 520, stall: 0.42 },
  { phase: "syncing intelligence graph" },
  { log: "wallet graph // synced", blocks: 4, wait: 0.55, clock: 610, stall: 0.48 },
  { log: "social graph // synced", blocks: 2, wait: 0.5, clock: 480 },
  { log: "intelligence // primed", blocks: 3, wait: 0.52, clock: 540 },
  { phase: "arming signal engines" },
  { log: "signal engine // armed", blocks: 3, wait: 0.5, clock: 460 },
  { log: "cluster analysis // active", blocks: 3, wait: 0.54, clock: 580 },
  { log: "market stream // online", blocks: 2, wait: 0.48, clock: 440 },
] as const;

type LogStatus = "active" | "ok";

type BootRow =
  | { id: string; kind: "phase"; text: string; visible: boolean }
  | { id: string; kind: "log"; text: string; ms: number; status: LogStatus; visible: boolean };

type LoaderProps = {
  onReady: () => void;
};

function AsciiField({ activity }: { activity: number }) {
  const [grid, setGrid] = useState("");
  const activityRef = useRef(activity);
  activityRef.current = activity;

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
      t += 0.026 + activityRef.current * 0.018;
      const threshold = 1.35 - activityRef.current * 0.45;
      let s = "";
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const v = Math.sin(c * 0.3 + t) + Math.cos(r * 0.4 - t * 0.7);
          const idx = Math.floor(((v + 2) / 4) * glyphs.length) % glyphs.length;
          s += v > threshold ? glyphs[idx]! : " ";
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

function PixelTelemetry({ booting }: { booting: boolean }) {
  const [bars, setBars] = useState("▁▂▃▅▃▆▂▇");
  const [rx, setRx] = useState(true);
  const [cpu, setCpu] = useState(8);
  const [mem, setMem] = useState(256);
  const [lat, setLat] = useState(18);

  useEffect(() => {
    if (!booting) return;
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
      setCpu(Math.round(10 + Math.sin(t * 0.9) * 6 + Math.sin(t * 2.3) * 3));
      setMem(Math.round(320 + Math.sin(t * 0.7) * 90));
      setLat(Math.round(20 + Math.sin(t * 1.6) * 5));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [booting]);

  return (
    <div className="loader-telemetry mt-5 space-y-1.5 text-[0.58rem] leading-relaxed text-white/28 sm:text-[0.62rem]">
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 tabular-nums">
        <span>cpu {cpu.toString().padStart(2, " ")}%</span>
        <span>mem {mem}mb</span>
        <span>lat {lat}ms</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-6 text-white/25">sig</span>
        <span className="tracking-[0.12em] text-white/22">{bars}</span>
      </div>
      <div className="flex items-center gap-4">
        <span>
          rx{" "}
          <span style={{ color: rx ? "#0D2DCD" : "rgba(255,255,255,0.2)" }}>{rx ? "●" : "○"}</span>
        </span>
        <span>
          tx{" "}
          <span style={{ color: !rx ? "#0D2DCD" : "rgba(255,255,255,0.2)" }}>
            {!rx ? "●" : "○"}
          </span>
        </span>
        <span>nodes 2/2</span>
      </div>
    </div>
  );
}

function statusLabel(status: LogStatus) {
  if (status === "ok") {
    return <span className="text-[#1f7a3a]/80">[  OK  ]</span>;
  }
  return <span className="text-white/30">[ .... ]</span>;
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
  const sysLineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const onReadyRef = useRef(onReady);

  const [blockCount, setBlockCount] = useState(0);
  const [asciiActivity, setAsciiActivity] = useState(0);
  const [bootRows, setBootRows] = useState<BootRow[]>([]);
  const [cursorVisible, setCursorVisible] = useState(false);

  sysLineRefs.current = [];
  rowRefs.current = [];
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
      gsap.set(telemetryWrapRef.current, { opacity: 1 });
      setAsciiActivity(0.6);
      setBlockCount(PROGRESS_BLOCKS);
      setBootRows(
        BOOT_SCRIPT.filter((s) => "log" in s).map((s, i) => ({
          id: `log-${i}`,
          kind: "log" as const,
          text: "log" in s ? s.log : "",
          ms: 1000 + i * 900,
          status: "ok" as const,
          visible: true,
        })),
      );
      const t = window.setTimeout(() => onReadyRef.current(), 600);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }

    let bootClock = 0;
    let rowIndex = 0;
    let blocks = 0;

    const ctx = gsap.context(() => {
      gsap.set(terminalRef.current, { opacity: 1, scale: 1, filter: "blur(0px)" });
      gsap.set([headerRef.current, progressRef.current, telemetryWrapRef.current, finalRef.current], {
        opacity: 0,
      });
      gsap.set(sysLineRefs.current, { opacity: 0 });
      gsap.set(asciiRef.current, { opacity: 0.04, filter: "brightness(0.55)" });
      gsap.set(asciiGlowRef.current, { opacity: 0 });

      const tl = gsap.timeline({ onComplete: () => onReadyRef.current() });

      const addBlocks = (n: number) => {
        blocks = Math.min(PROGRESS_BLOCKS, blocks + n);
        setBlockCount(blocks);
      };

      const rowsRef: BootRow[] = [];
      const syncRows = () => setBootRows([...rowsRef]);

      const revealPhaseRow = (text: string) => {
        const id = `row-${rowIndex++}`;
        rowsRef.push({ id, kind: "phase", text, visible: true });
        syncRows();
        const idx = rowsRef.length - 1;
        requestAnimationFrame(() => {
          const el = rowRefs.current[idx];
          if (el) gsap.fromTo(el, { opacity: 0, y: 3 }, { opacity: 1, y: 0, duration: 0.3, ease: "power1.out" });
        });
      };

      const startLog = (text: string) => {
        const id = `row-${rowIndex++}`;
        rowsRef.push({
          id,
          kind: "log",
          text,
          ms: bootClock,
          status: "active",
          visible: true,
        });
        syncRows();
        setCursorVisible(true);
        const idx = rowsRef.length - 1;
        requestAnimationFrame(() => {
          const el = rowRefs.current[idx];
          if (el) gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power1.out" });
        });
      };

      const completeLog = (clockAdd: number, blockGrant: number) => {
        bootClock += clockAdd;
        const last = rowsRef[rowsRef.length - 1];
        if (last?.kind === "log") {
          last.ms = bootClock;
          last.status = "ok";
          syncRows();
        }
        addBlocks(blockGrant);
        setCursorVisible(false);
      };

      // 0–2s — black standby
      tl.to({}, { duration: 2 });

      // 2–4s — ASCII wake + header
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
      tl.call(() => setAsciiActivity(0.25), [], 2.2);
      tl.to(headerRef.current, { opacity: 1, duration: 0.9, ease }, 2);
      SYS_INFO.forEach((_, i) => {
        tl.to(sysLineRefs.current[i], { opacity: 1, duration: 0.28, ease: "power1.out" }, 2.15 + i * 0.22);
      });
      tl.to(progressRef.current, { opacity: 1, duration: 0.6, ease }, 2.5);
      tl.to(telemetryWrapRef.current, { opacity: 1, duration: 0.55, ease }, 2.65);

      // 4s+ — ASCII ramps, boot script runs sequentially
      tl.to(
        asciiRef.current,
        { opacity: 0.26, filter: "brightness(1)", duration: 5.8, ease: "power1.inOut" },
        4,
      );
      tl.to(asciiGlowRef.current, { opacity: 0.16, duration: 5.5, ease: "power1.inOut" }, 4.2);
      tl.call(() => setAsciiActivity(0.55), [], 4);
      tl.call(() => setAsciiActivity(0.85), [], 8.5);

      const bootTl = gsap.timeline();
      BOOT_SCRIPT.forEach((step) => {
        if ("phase" in step) {
          bootTl.call(() => revealPhaseRow(step.phase));
          bootTl.to({}, { duration: 0.32 });
          return;
        }
        bootTl.call(() => startLog(step.log));
        bootTl.to({}, { duration: step.wait });
        if ("stall" in step && step.stall) {
          bootTl.call(() => setAsciiActivity(0.38));
          bootTl.to({}, { duration: step.stall });
          bootTl.call(() => setAsciiActivity(0.68));
        }
        bootTl.call(() => completeLog(step.clock, step.blocks));
        bootTl.to({}, { duration: 0.1 });
      });
      tl.add(bootTl, 4);

      tl.call(() => setCursorVisible(false), [], 10.8);
      tl.call(() => setAsciiActivity(1), [], 10.9);
      tl.to(finalRef.current, { opacity: 1, duration: 0.65, ease: "power1.inOut" }, 11);
      tl.to({}, { duration: 0.55 }, 11.65);
    }, rootRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = "";
    };
  }, []);

  // Cursor blink
  useEffect(() => {
    if (!cursorVisible) return;
    const el = document.querySelector(".loader-cursor-blink");
    if (!el) return;
    const tween = gsap.to(el, {
      opacity: 0,
      duration: 0.52,
      repeat: -1,
      yoyo: true,
      ease: "steps(1)",
    });
    return () => {
      tween.kill();
    };
  }, [cursorVisible, bootRows]);

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
        <AsciiField activity={asciiActivity} />
      </div>

      <div ref={asciiGlowRef} aria-hidden className="loader-ascii-glow pointer-events-none absolute inset-0" />

      <div className="relative flex min-h-full w-full items-center justify-center px-6 py-10 sm:px-8">
        <div ref={terminalRef} className="loader-terminal w-full max-w-md">
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
                <div
                  key={line}
                  ref={(el) => {
                    sysLineRefs.current[i] = el;
                  }}
                  className="opacity-0"
                >
                  {i === 0 && <span className="text-white/30">$ </span>}
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div
            ref={progressRef}
            className="loader-pixel-progress mt-5 opacity-0 text-left text-[0.52rem] tracking-[0.08em] sm:text-[0.56rem]"
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

          <div className="loader-logs mt-6 space-y-[0.4rem] text-left text-[0.58rem] leading-[1.55] sm:text-[0.62rem]">
            {bootRows.map((row, i) => {
              if (row.kind === "phase") {
                return (
                  <div
                    key={row.id}
                    ref={(el) => {
                      rowRefs.current[i] = el;
                    }}
                    className="pt-2 text-[0.52rem] tracking-wide text-white/22 sm:text-[0.56rem]"
                  >
                    <span className="text-white/18">-- </span>
                    {row.text}
                    <span className="text-white/12">
                      {" "}
                      { "-".repeat(Math.max(0, 24 - row.text.length)) }
                    </span>
                  </div>
                );
              }
              const isActive = row.status === "active";
              return (
                <div
                  key={row.id}
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  <span style={{ color: "rgba(255,170,120,0.75)" }}>
                    [{row.ms.toString().padStart(5, " ")}ms]
                  </span>{" "}
                  {statusLabel(row.status)}{" "}
                  {row.text}
                  {isActive && cursorVisible && (
                    <span className="loader-cursor-blink ml-0.5 text-white/45">▊</span>
                  )}
                </div>
              );
            })}
          </div>

          <div ref={telemetryWrapRef} className="opacity-0">
            <PixelTelemetry booting={blockCount < PROGRESS_BLOCKS} />
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
