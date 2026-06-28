import type { ThemeTokens } from "@nextgen-cms/contract/types/theme";
import { buildThemeStyleBlocks } from "@nextgen-cms/site-data/get-theme-css";

type ThemeTokensProviderProps = {
  tokens: ThemeTokens;
};

export function ThemeTokensProvider({ tokens }: ThemeTokensProviderProps) {
  const { light, dark } = buildThemeStyleBlocks(tokens);

  return (
    <style
      // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted theme tokens from platform DB
      dangerouslySetInnerHTML={{ __html: `${light}\n${dark}` }}
    />
  );
}
