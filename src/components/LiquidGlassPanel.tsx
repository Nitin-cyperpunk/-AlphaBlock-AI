"use client";

import { INTELLIGENCE_CHAPTERS } from "@/lib/intelligence-chapters";

type LiquidGlassPanelProps = {
  panelRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
};

export function LiquidGlassPanel({ panelRefs }: LiquidGlassPanelProps) {
  return (
    <div className="liquid-glass-panel" aria-live="polite">
      <div className="liquid-glass-panel__sheen" aria-hidden />
      <div className="liquid-glass-panel__inner">
        {INTELLIGENCE_CHAPTERS.map((chapter, index) => (
          <div
            key={chapter.id}
            ref={(el) => {
              panelRefs.current[index] = el;
            }}
            className="liquid-glass-panel__slide"
          >
            <h3 className="liquid-glass-panel__title">{chapter.panel.title}</h3>
            <p className="liquid-glass-panel__description">{chapter.panel.description}</p>
            <ul className="liquid-glass-panel__benefits">
              {chapter.panel.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
