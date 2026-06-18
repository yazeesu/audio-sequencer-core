"use client";

import { Music2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LayoutNavbar() {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isStudioPage = pathname === "/studio";
  const isPlaygroundPage = pathname === "/playground";

  return (
    <nav className="absolute top-0 z-50 dark min-h-screen bg-background text-foreground">
      {!isAuthPage && !isStudioPage && !isPlaygroundPage && (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Music2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold">PolySonus</span>
            </Link>

            <div className="flex items-center gap-6">
              <Link
                href="/auth?mode=sign-in"
                className="px-4 py-2 text-foreground hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth?mode=sign-up"
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      )}
    </nav>
  );
}
