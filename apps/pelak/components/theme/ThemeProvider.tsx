"use client";

import { THEME_STORAGE_KEY } from "@nextgen-cms/config/theme/constants";
import { resolveTheme } from "@nextgen-cms/config/theme/resolve-theme";
import type { ThemeMode } from "@nextgen-cms/contract/types/site";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSiteConfig } from "@/components/theme/SiteConfigProvider";

type Theme = ThemeMode;

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const siteConfig = useSiteConfig();
  const [theme, setThemeState] = useState<Theme>(siteConfig.defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const initial = resolveTheme(stored, siteConfig.defaultTheme);
    setThemeState(initial);
    setMounted(true);
  }, [siteConfig.defaultTheme]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, mounted]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    [],
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
