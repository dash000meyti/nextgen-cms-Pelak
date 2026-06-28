import type { ThemeMode } from "@nextgen-cms/contract/types/site";

export function resolveTheme(
  stored: string | null,
  defaultTheme: ThemeMode,
): ThemeMode {
  if (stored === "light" || stored === "dark") return stored;
  return defaultTheme;
}
