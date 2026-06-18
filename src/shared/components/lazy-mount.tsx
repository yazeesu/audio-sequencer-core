"use client";

import { useInView } from "motion/react";
import { PropsWithChildren, ReactNode, useRef } from "react";

type LazyMountProps = PropsWithChildren<{
  className?: string;
  /** Prefetch margin passed to Intersection Observer (e.g. load before entering viewport). */
  rootMargin?: string;
  fallback?: ReactNode;
  /** Reserves space before mount to reduce layout shift. */
  minHeight?: number | string;
}>;

export function LazyMount({
  children,
  className,
  rootMargin = "200px 0px",
  fallback = null,
  minHeight,
}: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldMount = useInView(ref, { once: true, margin: rootMargin });

  return (
    <div
      ref={ref}
      className={className}
      style={
        !shouldMount && minHeight !== undefined ? { minHeight } : undefined
      }
    >
      {shouldMount ? children : fallback}
    </div>
  );
}
