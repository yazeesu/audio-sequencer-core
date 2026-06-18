"use client";

import AuthLanding from "@/src/features/auth/auth-landing";
import AuthFormPanel from "@/src/features/auth/auth-form-panel";
import { useScrollLock } from "@/src/shared/hooks/use-scroll-lock";

export default function AuthPage() {
  useScrollLock();

  return (
    <div className="h-screen overflow-hidden bg-background flex">
      <AuthLanding />
      <AuthFormPanel />
    </div>
  );
}
