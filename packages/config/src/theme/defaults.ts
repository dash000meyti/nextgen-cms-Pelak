import { modulePermissionGroups } from "@nextgen-cms/contract/permissions";
import type {
  ContentGroupModuleSettings,
  ContentSettings,
  LegacyModuleSettings,
  MediaSettings,
  MemberSettings,
  ModuleSettings,
  VideoModuleSettings,
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
  contentGroup: { enabled: true, label: "" },
  video: { enabled: true, label: "" },
  newsletter: { enabled: false, label: "" },
};

export const DEFAULT_CONTENT_GROUP_MODULE_SETTINGS: ContentGroupModuleSettings =
  {
    period: "seasonal",
  };

export const DEFAULT_VIDEO_MODULE_SETTINGS: VideoModuleSettings = {
  pageTitle: "ویدیو",
  itemsPerPage: 12,
};

function defaultModuleLabel(moduleId: keyof ModuleSettings): string {
  const group = modulePermissionGroups.find((g) => g.id === moduleId);
  return group?.label ?? moduleId;
}

export function normalizeModuleSettings(
  stored: ModuleSettings | LegacyModuleSettings | null | undefined,
): ModuleSettings {
  if (!stored) return DEFAULT_MODULE_SETTINGS;

  const contentGroup = stored.contentGroup ?? { enabled: false };
  const video = stored.video ?? { enabled: false };
  const newsletter = stored.newsletter ?? { enabled: false };

  return {
    contentGroup: {
      enabled: contentGroup.enabled ?? false,
      label:
        contentGroup.label?.trim() || defaultModuleLabel("contentGroup"),
    },
    video: {
      enabled: video.enabled ?? false,
      label: video.label?.trim() || defaultModuleLabel("video"),
    },
    newsletter: {
      enabled: newsletter.enabled ?? false,
      label:
        newsletter.label?.trim() || defaultModuleLabel("newsletter"),
    },
  };
}

export function normalizeContentGroupModuleSettings(
  stored: ContentGroupModuleSettings | null | undefined,
  legacyModuleSettings?: LegacyModuleSettings | null,
): ContentGroupModuleSettings {
  if (stored?.period) return stored;
  if (legacyModuleSettings?.contentGroup?.period) {
    return { period: legacyModuleSettings.contentGroup.period };
  }
  return DEFAULT_CONTENT_GROUP_MODULE_SETTINGS;
}

export function normalizeVideoModuleSettings(
  stored: VideoModuleSettings | null | undefined,
  legacyModuleSettings?: LegacyModuleSettings | null,
): VideoModuleSettings {
  if (stored) return stored;
  const legacy = legacyModuleSettings?.video;
  return {
    pageTitle: legacy?.pageTitle ?? DEFAULT_VIDEO_MODULE_SETTINGS.pageTitle,
    itemsPerPage:
      legacy?.itemsPerPage ?? DEFAULT_VIDEO_MODULE_SETTINGS.itemsPerPage,
  };
}

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
  legacy: LegacyFeatureModules | ModuleSettings | LegacyModuleSettings,
): ModuleSettings {
  if (
    "contentGroup" in legacy &&
    typeof legacy.contentGroup === "object" &&
    legacy.contentGroup !== null
  ) {
    return normalizeModuleSettings(legacy as LegacyModuleSettings);
  }
  const flags = legacy as LegacyFeatureModules & { issues?: boolean };
  return normalizeModuleSettings({
    contentGroup: {
      enabled: flags.contentGroup ?? flags.issues ?? false,
    },
    video: { enabled: flags.video },
    newsletter: { enabled: flags.newsletter },
  });
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
