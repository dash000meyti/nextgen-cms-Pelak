import type {
  ContentSettings,
  MediaSettings,
  MemberSettings,
  ModuleSettings,
} from "@nextgen-cms/contract/types/modules";
import type {
  FeatureModules as LegacyFeatureModules,
  ThemePalette,
} from "@nextgen-cms/contract/types/theme";

/** Matches app/globals.css :root defaults */
export const DEFAULT_THEME_PALETTE_LIGHT: ThemePalette = {
  paper: "#ffffff",
  surface: "#faf8f6",
  surface2: "#f3f0eb",
  ink: "#14110f",
  inkMuted: "#5c5752",
  inkFaint: "#8a847d",
  accent: "#8b0016",
  accentHover: "#6e0011",
  accentSoft: "#f4e8ea",
  rule: "#e6e2dd",
  ruleStrong: "#d4cec6",
  contentMax: "42rem",
  wideMax: "76rem",
  radius: "6px",
};

/** Matches app/globals.css :root.dark defaults */
export const DEFAULT_THEME_PALETTE_DARK: ThemePalette = {
  paper: "#0e0d0c",
  surface: "#161412",
  surface2: "#1f1c19",
  ink: "#f4f1ec",
  inkMuted: "#a39d94",
  inkFaint: "#6f6a63",
  accent: "#e0455d",
  accentHover: "#f0566e",
  accentSoft: "#2a1518",
  rule: "#2a2723",
  ruleStrong: "#3a362f",
  contentMax: "42rem",
  wideMax: "76rem",
  radius: "6px",
};

export const DEFAULT_FEATURE_MODULES: LegacyFeatureModules = {
  contentGroup: true,
  video: true,
  newsletter: false,
};

export const DEFAULT_MODULE_SETTINGS: ModuleSettings = {
  contentGroup: { enabled: true, period: "seasonal" },
  video: { enabled: true, pageTitle: "ویدیو", itemsPerPage: 12 },
  newsletter: { enabled: false },
};

export const DEFAULT_MEDIA_SETTINGS: MediaSettings = {
  maxBytes: 5 * 1024 * 1024,
  allowedMime: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  pipeline: { stripMetadata: false, generateWebp: false },
};

export const DEFAULT_MEMBER_SETTINGS: MemberSettings = {
  defaultRoleId: 3,
  allowRegistration: false,
  requireApproval: true,
};

export const DEFAULT_CONTENT_SETTINGS: ContentSettings = {
  defaultArticleStatus: "draft",
  slugAutoGenerate: true,
  homepageArticleCount: 6,
  showAuthorOnCards: true,
};

export function featureModulesToModuleSettings(
  legacy: LegacyFeatureModules | ModuleSettings,
): ModuleSettings {
  if (
    "contentGroup" in legacy &&
    typeof legacy.contentGroup === "object" &&
    legacy.contentGroup !== null
  ) {
    return legacy;
  }
  const flags = legacy as LegacyFeatureModules & { issues?: boolean };
  return {
    contentGroup: {
      enabled: flags.contentGroup ?? flags.issues ?? false,
      period: "seasonal",
    },
    video: {
      enabled: flags.video,
      pageTitle: DEFAULT_MODULE_SETTINGS.video.pageTitle,
      itemsPerPage: DEFAULT_MODULE_SETTINGS.video.itemsPerPage,
    },
    newsletter: { enabled: flags.newsletter },
  };
}

export function moduleSettingsToFeatureModules(
  settings: ModuleSettings,
): LegacyFeatureModules {
  return {
    contentGroup: settings.contentGroup.enabled,
    video: settings.video.enabled,
    newsletter: settings.newsletter.enabled,
  };
}
