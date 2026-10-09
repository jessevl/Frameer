/**
 * @file ThemeInitializer.tsx
 * @description Applies the light or dark theme to <html> (the `dark` class) and keeps the browser's theme-color meta tags in step with the canvas color.
 * Used by the app's providers; renders nothing.
 */
import { useEffect } from "react";

export type ThemeMode = "system" | "light" | "dark";

export interface ThemeInitializerProps {
  theme: ThemeMode;
}

/** Writes the canvas color of the active theme into every theme-color meta tag. */
const syncThemeColor = () => {
  const canvas = window.getComputedStyle(document.documentElement).getPropertyValue("--canvas").trim();
  if (!canvas) return;
  const existing = document.head.querySelectorAll('meta[name="theme-color"]');
  if (existing.length === 0) {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
    meta.setAttribute("content", canvas);
    return;
  }
  existing.forEach((meta) => meta.setAttribute("content", canvas));
};

export default function ThemeInitializer({ theme }: ThemeInitializerProps) {
  useEffect(() => {
    const root = document.documentElement;
    const apply = (isDark: boolean) => {
      root.classList.toggle("dark", isDark);
      syncThemeColor();
    };

    if (theme === "dark") {
      apply(true);
      return;
    }
    if (theme === "light") {
      apply(false);
      return;
    }

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    apply(mql.matches);
    const handler = (event: MediaQueryListEvent) => apply(event.matches);
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, [theme]);

  return null;
}
