"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type AuthMode = "sign-in" | "sign-up";

type AuthPanelContent = {
  title: string;
  subtitle: string;
  togglePrompt: string;
  toggleAction: string;
};

type AuthLandingContent = {
  title: [string, string];
  subtitle: string;
};

type AuthPageContent = {
  panel: AuthPanelContent;
  landing: AuthLandingContent;
};

const AUTH_MODES = new Set<AuthMode>(["sign-in", "sign-up"]);

const AUTH_PAGE_CONTENT: Record<AuthMode, AuthPageContent> = {
  "sign-in": {
    panel: {
      title: "Welcome Back",
      subtitle: "Sign in to continue to your studio",
      togglePrompt: "Don't have an account?",
      toggleAction: "Sign up",
    },
    landing: {
      title: ["Your Studio,", "Anywhere You Go"],
      subtitle:
        "Professional music production tools powered by cutting-edge web technology. Create, analyze, and master your tracks with precision.",
    },
  },
  "sign-up": {
    panel: {
      title: "Create Account",
      subtitle: "Sign up to start creating in your studio",
      togglePrompt: "Already have an account?",
      toggleAction: "Sign in",
    },
    landing: {
      title: ["Start Creating,", "Build Without Limits"],
      subtitle:
        "Join PolySonus and unlock professional music production tools. Analyze, produce, and master your tracks from anywhere.",
    },
  },
};

function parseAuthMode(value: string | null): AuthMode {
  if (value && AUTH_MODES.has(value as AuthMode)) {
    return value as AuthMode;
  }

  return "sign-in";
}

export function authHref(mode: AuthMode = "sign-in"): string {
  return mode === "sign-up" ? "/auth?mode=sign-up" : "/auth";
}

export function getDefaultAuthPageContent(): AuthPageContent {
  return AUTH_PAGE_CONTENT["sign-in"];
}

export function useAuthMode() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const mode = parseAuthMode(searchParams.get("mode"));
  const { panel, landing } = AUTH_PAGE_CONTENT[mode];

  const setMode = (nextMode: AuthMode) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextMode === "sign-in") {
      params.delete("mode");
    } else {
      params.set("mode", nextMode);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const toggleMode = () => {
    setMode(mode === "sign-in" ? "sign-up" : "sign-in");
  };

  return {
    mode,
    isSignIn: mode === "sign-in",
    isSignUp: mode === "sign-up",
    panel,
    landing,
    setMode,
    toggleMode,
  };
}
