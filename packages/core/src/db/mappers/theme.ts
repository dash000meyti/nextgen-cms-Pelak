import type { ThemeTokens } from "@nextgen-cms/contract/types/theme";
import type { ThemeTokensRow } from "@nextgen-cms/core/db/schema/theme-tokens";

function parseJson<T>(value: T | string): T {
  if (typeof value === "string") {
    return JSON.parse(value) as T;
  }
  return value;
}

export function mapThemeTokensRow(row: ThemeTokensRow): ThemeTokens {
  return {
    light: parseJson(row.light),
    dark: parseJson(row.dark),
  };
}
