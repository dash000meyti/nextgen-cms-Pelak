import type { ThemeTokens } from "@nextgen-cms/contract/types/theme";
import { db } from "@nextgen-cms/core/db";
import { mapThemeTokensRow } from "@nextgen-cms/core/db/mappers/theme";
import { themeTokens } from "@nextgen-cms/core/db/schema";
import { eq } from "drizzle-orm";

export async function findThemeTokens() {
  const rows = await db
    .select()
    .from(themeTokens)
    .where(eq(themeTokens.id, 1))
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new Error("Theme tokens not found. Run db:migrate on startup.");
  }

  return mapThemeTokensRow(row);
}

export async function updateThemeTokens(tokens: ThemeTokens) {
  await db
    .update(themeTokens)
    .set({
      light: tokens.light,
      dark: tokens.dark,
    })
    .where(eq(themeTokens.id, 1));
}
