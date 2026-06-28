import type {
  ThemePalette,
  ThemeTokens,
} from "@nextgen-cms/contract/types/theme";

export type CSSVariablesRecord = Record<string, string>;

const PALETTE_TO_CSS: Record<keyof ThemePalette, string> = {
  paper: "--paper",
  surface: "--surface",
  surface2: "--surface-2",
  ink: "--ink",
  inkMuted: "--ink-muted",
  inkFaint: "--ink-faint",
  accent: "--accent",
  accentHover: "--accent-hover",
  accentSoft: "--accent-soft",
  rule: "--rule",
  ruleStrong: "--rule-strong",
  contentMax: "--content-max",
  wideMax: "--wide-max",
  radius: "--radius",
};

export function paletteToCssVars(palette: ThemePalette): CSSVariablesRecord {
  const vars: CSSVariablesRecord = {};
  for (const key of Object.keys(PALETTE_TO_CSS) as (keyof ThemePalette)[]) {
    vars[PALETTE_TO_CSS[key]] = palette[key];
  }
  return vars;
}

function cssVarsToBlock(selector: string, vars: CSSVariablesRecord): string {
  const declarations = Object.entries(vars)
    .map(([name, value]) => `${name}: ${value};`)
    .join(" ");
  return `${selector} { ${declarations} }`;
}

export function buildThemeStyleBlocks(tokens: ThemeTokens): {
  light: string;
  dark: string;
} {
  return {
    light: cssVarsToBlock(":root", paletteToCssVars(tokens.light)),
    dark: cssVarsToBlock(":root.dark", paletteToCssVars(tokens.dark)),
  };
}
