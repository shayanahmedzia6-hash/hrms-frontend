"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const readClient = () => true;
const readServer = () => false;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, readClient, readServer);

  return (
    <button className="theme-button" type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle light and dark mode" disabled={!mounted}>
      {mounted && resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      {mounted && resolvedTheme === "dark" ? "Light appearance" : "Dark appearance"}
    </button>
  );
}
