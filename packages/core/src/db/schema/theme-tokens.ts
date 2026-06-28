import type { ThemePalette } from "@nextgen-cms/contract/types/theme";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const themeTokens = sqliteTable("theme_tokens", {
  id: integer("id").primaryKey(),
  light: text("light").notNull().$type<ThemePalette>(),
  dark: text("dark").notNull().$type<ThemePalette>(),
});

export type ThemeTokensRow = typeof themeTokens.$inferSelect;
