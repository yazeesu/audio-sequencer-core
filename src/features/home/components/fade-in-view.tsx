"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { PropsWithChildren, useRef } from "react";
import {
  defaultTransition,
  fadeIn,
  fadeLeft,
  fadeRight,
  fadeUp,
  scaleIn,
} from "@/src/shared/lib/motion";

type Direction = "up" | "left" | "right" | "none" | "scale";

const variants = {
  up: fadeUp,
  left: fadeLeft,
  right: fadeRight,
  none: fadeIn,
  scale: scaleIn,
};

type FadeInViewProps = PropsWithChildren<{
  direction?: Direction;
  delay?: number;
  className?: string;
  once?: boolean;
}>;

export function FadeInView({
  children,
  direction = "up",
  delay = 0,
  className,
  once = true,
}: FadeInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-60px 0px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={prefersReducedMotion ? "visible" : "hidden"}
      animate={isInView || prefersReducedMotion ? "visible" : "hidden"}
      variants={variants[direction]}
      transition={{ ...defaultTransition, delay }}
    >
      {children}
    </motion.div>
  );
}
