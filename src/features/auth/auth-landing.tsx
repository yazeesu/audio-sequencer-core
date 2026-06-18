"use client";

import { Music2Icon } from "lucide-react";
import { PropsWithChildren, Suspense } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  getDefaultAuthPageContent,
  useAuthMode,
} from "@/src/features/auth/hooks/use-auth-mode";
import {
  defaultTransition,
  EASE_OUT,
  fadeLeft,
  fadeUp,
  staggerContainer,
} from "@/src/shared/lib/motion";

function AuthLandingTitle({ children }: PropsWithChildren) {
  return <h2 className="text-4xl font-bold leading-tight">{children}</h2>;
}

function AuthLandingSubtitle({ children }: PropsWithChildren) {
  return <p className="text-white/80 text-lg">{children}</p>;
}

function AuthLandingDecoration() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-2 gap-4 pt-8">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={i}
          className="h-2 rounded-full bg-white/20 backdrop-blur-sm"
          style={{ width: `${40 + ((i * 17) % 60)}%` }}
          animate={
            prefersReducedMotion
              ? undefined
              : { opacity: [0.4, 1, 0.5], scaleX: [0.85, 1, 0.9] }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: 1 + ((i * 7) % 20) / 10,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: i * 0.1,
                  ease: "easeInOut",
                }
          }
        />
      ))}
    </div>
  );
}

function AuthLandingLogo() {
  return (
    <motion.div
      variants={fadeUp}
      transition={defaultTransition}
      className="flex items-center gap-3"
    >
      <motion.div
        className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
        whileHover={{ scale: 1.05, rotate: 3 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
      >
        <Music2Icon className="w-8 h-8" />
      </motion.div>
      <span className="text-3xl font-bold">PolySonus</span>
    </motion.div>
  );
}

function AuthLandingText({
  title,
  subtitle,
}: {
  title: [string, string];
  subtitle: string;
}) {
  return (
    <>
      <AuthLandingTitle>
        {title[0]}
        <br />
        {title[1]}
      </AuthLandingTitle>
      <AuthLandingSubtitle>{subtitle}</AuthLandingSubtitle>
      <AuthLandingDecoration />
    </>
  );
}

function AuthLandingContentInner() {
  const { landing, mode } = useAuthMode();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
      >
        <AuthLandingText title={landing.title} subtitle={landing.subtitle} />
      </motion.div>
    </AnimatePresence>
  );
}

function AuthLandingContentFallback() {
  const { landing } = getDefaultAuthPageContent();

  return <AuthLandingText title={landing.title} subtitle={landing.subtitle} />;
}

function AuthLandingContent() {
  return (
    <Suspense fallback={<AuthLandingContentFallback />}>
      <AuthLandingContentInner />
    </Suspense>
  );
}

export default function AuthLanding() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      initial={prefersReducedMotion ? false : { opacity: 0, x: -48 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary/50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent)]" />

      {!prefersReducedMotion && (
        <motion.div
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="relative w-full flex flex-col justify-center items-center p-12 text-white">
        <motion.div
          className="max-w-md space-y-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <AuthLandingLogo />
          <motion.div variants={fadeLeft} transition={defaultTransition}>
            <AuthLandingContent />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
