"use client";

import { Suspense } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import AuthSignInForm from "@/src/features/auth/auth-sign-in-form";
import AuthSignUpForm from "@/src/features/auth/auth-sign-up-form";
import AuthPanelHeader from "@/src/features/auth/auth-panel-header";
import AuthDivider from "@/src/features/auth/auth-divider";
import AuthSocialButtons from "@/src/features/auth/auth-social-buttons";
import { useAuthMode } from "@/src/features/auth/hooks/use-auth-mode";
import { Button } from "@/components/ui/button";
import {
  defaultTransition,
  EASE_OUT,
  fadeUp,
  staggerContainer,
} from "@/src/shared/lib/motion";

const layoutTransition = { duration: 0.25, ease: EASE_OUT };
const modeTransition = { duration: 0.2, ease: EASE_OUT };

function AuthFormPanelContent() {
  const { panel, isSignIn, toggleMode, mode } = useAuthMode();

  return (
    <motion.div
      className="w-full max-w-md space-y-8"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeUp} transition={defaultTransition}>
        <AuthPanelHeader title={panel.title} subtitle={panel.subtitle} />
      </motion.div>

      <motion.div
        layout
        transition={{ layout: layoutTransition }}
        className="relative"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={mode}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={modeTransition}
          >
            {isSignIn ? <AuthSignInForm /> : <AuthSignUpForm />}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.div variants={fadeUp} transition={defaultTransition}>
        <AuthDivider />
      </motion.div>

      <motion.div variants={fadeUp} transition={defaultTransition}>
        <AuthSocialButtons />
      </motion.div>

      <motion.p
        variants={fadeUp}
        transition={defaultTransition}
        className="text-center text-sm text-muted-foreground"
      >
        {panel.togglePrompt}{" "}
        <Button
          type="button"
          variant="link"
          className="p-0 h-auto text-primary"
          onClick={toggleMode}
        >
          {panel.toggleAction}
        </Button>
      </motion.p>
    </motion.div>
  );
}

function AuthFormPanelFallback() {
  return (
    <div className="w-full max-w-md space-y-8 animate-pulse">
      <div className="h-24 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg bg-muted" />
    </div>
  );
}

export default function AuthFormPanel() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      className="w-full lg:w-1/2 flex items-center justify-center p-8"
      initial={prefersReducedMotion ? false : { opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 }}
    >
      <Suspense fallback={<AuthFormPanelFallback />}>
        <AuthFormPanelContent />
      </Suspense>
    </motion.section>
  );
}
