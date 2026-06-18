"use client";

import { motion, useReducedMotion } from "motion/react";

const BAR_COUNT = 48;

const BAR_COLORS = [
  { from: "#ef4444", to: "#fca5a5" },
  { from: "#f97316", to: "#fdba74" },
  { from: "#eab308", to: "#fde047" },
  { from: "#84cc16", to: "#bef264" },
  { from: "#22c55e", to: "#86efac" },
  { from: "#14b8a6", to: "#5eead4" },
  { from: "#06b6d4", to: "#67e8f9" },
  { from: "#3b82f6", to: "#93c5fd" },
  { from: "#6366f1", to: "#a5b4fc" },
  { from: "#8b5cf6", to: "#c4b5fd" },
  { from: "#a855f7", to: "#d8b4fe" },
  { from: "#ec4899", to: "#f9a8d4" },
] as const;

function getBarHeight(index: number) {
  return `${((index * 17) % 60) + 20}%`;
}

function getBarDuration(index: number) {
  return 1.2 + ((index * 7) % 20) / 10;
}

function getBarColor(index: number) {
  return BAR_COLORS[index % BAR_COLORS.length];
}

export function HeroWaveform() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 shadow-2xl"
      initial={{ opacity: 0, y: 48, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        delay: 0.45,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      <div className="grid grid-cols-12 gap-2 h-64 items-end">
        {Array.from({ length: BAR_COUNT }).map((_, index) => {
          const color = getBarColor(index);

          return (
            <motion.div
              key={index}
              className="rounded origin-bottom"
              style={{
                height: getBarHeight(index),
                background: `linear-gradient(to top, ${color.from}, ${color.to})`,
              }}
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      scaleY: [0.55, 1, 0.65],
                      opacity: [0.65, 1, 0.75],
                    }
              }
              transition={
                prefersReducedMotion
                  ? undefined
                  : {
                      duration: getBarDuration(index),
                      repeat: Infinity,
                      repeatType: "mirror",
                      delay: index * 0.05,
                      ease: "easeInOut",
                    }
              }
            />
          );
        })}
      </div>
    </motion.div>
  );
}
