import {
  DEFAULT_CONTENT_SETTINGS,
  DEFAULT_FEATURE_MODULES,
  DEFAULT_MEDIA_SETTINGS,
  DEFAULT_MEMBER_SETTINGS,
  DEFAULT_MODULE_SETTINGS,
  DEFAULT_THEME_PALETTE_DARK,
  DEFAULT_THEME_PALETTE_LIGHT,
} from "@nextgen-cms/config/theme/defaults";
import type { ThemeTokens } from "@nextgen-cms/contract/types/theme";

export const themeTokensFixture: ThemeTokens = {
  light: DEFAULT_THEME_PALETTE_LIGHT,
  dark: DEFAULT_THEME_PALETTE_DARK,
};

export const featureModulesFixture = DEFAULT_FEATURE_MODULES;
export {
  DEFAULT_MODULE_SETTINGS,
  DEFAULT_MEDIA_SETTINGS,
  DEFAULT_MEMBER_SETTINGS,
  DEFAULT_CONTENT_SETTINGS,
};
