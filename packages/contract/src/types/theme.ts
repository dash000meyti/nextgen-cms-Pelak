export type ThemePalette = {
  paper: string;
  surface: string;
  surface2: string;
  ink: string;
  inkMuted: string;
  inkFaint: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  rule: string;
  ruleStrong: string;
  contentMax: string;
  wideMax: string;
  radius: string;
};

export type ThemeTokens = {
  light: ThemePalette;
  dark: ThemePalette;
};

export type { FeatureModules } from "./modules";
