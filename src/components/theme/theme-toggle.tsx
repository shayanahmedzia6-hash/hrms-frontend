"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useHydrated } from "@/hooks/use-hydrated";

type Props = {
  /** icon = header moon button; labeled = full-width control (settings / rare) */
  variant?: "icon" | "labeled";
  className?: string;
};

export function ThemeToggle({ variant = "icon", className = "" }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHydrated();

  const isDark = mounted && resolvedTheme === "dark";

  if (variant === "labeled") {
    return (
      <button
        className={`theme-button ${className}`.trim()}
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label="Toggle light and dark mode"
        disabled={!mounted}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
        {mounted ? (isDark ? "Light appearance" : "Dark appearance") : "Appearance"}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`theme-icon-button ${className}`.trim()}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
      disabled={!mounted}
      suppressHydrationWarning
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
