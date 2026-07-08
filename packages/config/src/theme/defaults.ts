import type {
  ContactMethod,
  MessagesSettings,
} from "@nextgen-cms/contract/types/messages";
import type {
  ContentGroupModuleSettings,
  ContentSettings,
  LegacyModuleSettings,
  MediaSettings,
  MemberSettings,
  ModuleSettings,
  SectionListSettings,
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
  contentGroup: { enabled: true },
  video: { enabled: true },
  newsletter: { enabled: false },
};

export const DEFAULT_CONTENT_GROUP_MODULE_SETTINGS: ContentGroupModuleSettings =
  {
    period: "seasonal",
    pageTitle: "هفته‌نامه",
    itemsPerPage: 12,
    showInMenu: true,
    groupByYear: false,
  };

export const DEFAULT_VIDEO_MODULE_SETTINGS: VideoModuleSettings = {
  pageTitle: "ویدیو",
  itemsPerPage: 12,
  showInMenu: true,
};

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
    },
    video: {
      enabled: video.enabled ?? false,
    },
    newsletter: {
      enabled: newsletter.enabled ?? false,
    },
  };
}

function normalizeSectionListSettings(
  stored: Partial<SectionListSettings> | null | undefined,
  defaults: SectionListSettings,
): SectionListSettings {
  const pageTitle = stored?.pageTitle?.trim();
  const rawItemsPerPage = stored?.itemsPerPage;
  const itemsPerPage =
    typeof rawItemsPerPage === "string"
      ? Number.parseInt(rawItemsPerPage, 10)
      : rawItemsPerPage;
  return {
    pageTitle: pageTitle || defaults.pageTitle,
    itemsPerPage:
      typeof itemsPerPage === "number" && itemsPerPage > 0
        ? itemsPerPage
        : defaults.itemsPerPage,
    showInMenu: stored?.showInMenu ?? defaults.showInMenu,
  };
}

export function normalizeContentGroupModuleSettings(
  stored: Partial<ContentGroupModuleSettings> | null | undefined,
  legacyModuleSettings?: LegacyModuleSettings | null,
): ContentGroupModuleSettings {
  const period =
    stored?.period ??
    legacyModuleSettings?.contentGroup?.period ??
    DEFAULT_CONTENT_GROUP_MODULE_SETTINGS.period;
  const legacyLabel = legacyModuleSettings?.contentGroup?.label?.trim();
  const defaults: ContentGroupModuleSettings = {
    ...DEFAULT_CONTENT_GROUP_MODULE_SETTINGS,
    pageTitle: legacyLabel || DEFAULT_CONTENT_GROUP_MODULE_SETTINGS.pageTitle,
  };

  return {
    period,
    ...normalizeSectionListSettings(stored, defaults),
    groupByYear: stored?.groupByYear ?? defaults.groupByYear,
  };
}

export function normalizeVideoModuleSettings(
  stored: Partial<VideoModuleSettings> | null | undefined,
  legacyModuleSettings?: LegacyModuleSettings | null,
): VideoModuleSettings {
  const legacy = legacyModuleSettings?.video;
  const defaults: VideoModuleSettings = {
    pageTitle:
      legacy?.pageTitle?.trim() ||
      legacy?.label?.trim() ||
      DEFAULT_VIDEO_MODULE_SETTINGS.pageTitle,
    itemsPerPage:
      legacy?.itemsPerPage ?? DEFAULT_VIDEO_MODULE_SETTINGS.itemsPerPage,
    showInMenu: DEFAULT_VIDEO_MODULE_SETTINGS.showInMenu,
  };

  return normalizeSectionListSettings(stored, defaults);
}

export const DEFAULT_MEDIA_SETTINGS: MediaSettings = {
  maxImageBytes: 10 * 1024 * 1024,
  maxPdfBytes: 25 * 1024 * 1024,
  allowedMime: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
  ],
  pipeline: { stripMetadata: false, generateWebp: false },
};

type LegacyMediaSettings = Partial<MediaSettings> & { maxBytes?: number };
type LegacyContentGroupModuleSettings = Partial<ContentGroupModuleSettings> & {
  maxImageBytes?: number;
  maxPdfBytes?: number;
};

export function normalizeMediaSettings(
  stored: LegacyMediaSettings | null | undefined,
  legacyContentGroup?: LegacyContentGroupModuleSettings | null,
): MediaSettings {
  const defaults = DEFAULT_MEDIA_SETTINGS;
  const maxImageBytes =
    stored?.maxImageBytes ??
    stored?.maxBytes ??
    legacyContentGroup?.maxImageBytes ??
    defaults.maxImageBytes;
  const maxPdfBytes =
    stored?.maxPdfBytes ??
    legacyContentGroup?.maxPdfBytes ??
    defaults.maxPdfBytes;
  return {
    maxImageBytes,
    maxPdfBytes,
    allowedMime: stored?.allowedMime ?? defaults.allowedMime,
    pipeline: {
      stripMetadata:
        stored?.pipeline?.stripMetadata ?? defaults.pipeline.stripMetadata,
      generateWebp:
        stored?.pipeline?.generateWebp ?? defaults.pipeline.generateWebp,
    },
  };
}

export const DEFAULT_MEMBER_SETTINGS: MemberSettings = {
  defaultRoleId: 3,
  memberLabel: "نویسنده",
  membersLabel: "نویسنده‌ها",
  pageTitle: "نویسنده‌ها",
  itemsPerPage: 12,
  showInMenu: false,
};

export function normalizeMemberSettings(
  stored: Partial<MemberSettings> | null | undefined,
): MemberSettings {
  const memberLabel = stored?.memberLabel?.trim();
  const membersLabel = stored?.membersLabel?.trim();
  const listDefaults: SectionListSettings = {
    pageTitle: membersLabel || DEFAULT_MEMBER_SETTINGS.pageTitle,
    itemsPerPage: DEFAULT_MEMBER_SETTINGS.itemsPerPage,
    showInMenu: DEFAULT_MEMBER_SETTINGS.showInMenu,
  };

  return {
    defaultRoleId:
      stored?.defaultRoleId ?? DEFAULT_MEMBER_SETTINGS.defaultRoleId,
    memberLabel: memberLabel || DEFAULT_MEMBER_SETTINGS.memberLabel,
    membersLabel: membersLabel || DEFAULT_MEMBER_SETTINGS.membersLabel,
    ...normalizeSectionListSettings(stored, {
      ...listDefaults,
      pageTitle:
        stored?.pageTitle?.trim() ||
        membersLabel ||
        DEFAULT_MEMBER_SETTINGS.pageTitle,
    }),
  };
}

export const DEFAULT_CONTENT_SETTINGS: ContentSettings = {
  defaultArticleStatus: "draft",
  pageTitle: "محتوا",
  itemsPerPage: 12,
  showInMenu: true,
};

export const DEFAULT_MESSAGES_SETTINGS: MessagesSettings = {
  contactMethods: [],
};

/**
 * Central registry for defaults used in runtime normalizers and migrations.
 * Keep this map aligned with SQL backfills when adding new schema fields.
 */
export const DEFAULTS_REGISTRY = {
  moduleSettings: DEFAULT_MODULE_SETTINGS,
  contentGroupModuleSettings: DEFAULT_CONTENT_GROUP_MODULE_SETTINGS,
  videoModuleSettings: DEFAULT_VIDEO_MODULE_SETTINGS,
  mediaSettings: DEFAULT_MEDIA_SETTINGS,
  memberSettings: DEFAULT_MEMBER_SETTINGS,
  contentSettings: DEFAULT_CONTENT_SETTINGS,
  messagesSettings: DEFAULT_MESSAGES_SETTINGS,
} as const;

export function normalizeContentSettings(
  stored: Partial<ContentSettings> | null | undefined,
): ContentSettings {
  const list = normalizeSectionListSettings(stored, DEFAULT_CONTENT_SETTINGS);
  return {
    defaultArticleStatus:
      stored?.defaultArticleStatus ??
      DEFAULT_CONTENT_SETTINGS.defaultArticleStatus,
    ...list,
  };
}

function sanitizeContactMethod(
  raw: Partial<ContactMethod> | undefined,
  fallbackId: string,
): ContactMethod | null {
  const label = raw?.label?.trim() ?? "";
  const value = raw?.value?.trim() ?? "";
  if (!label && !value) return null;
  const id = raw?.id?.trim() || fallbackId;
  return { id, label, value };
}

export function normalizeMessagesSettings(
  stored: Partial<MessagesSettings> | null | undefined,
): MessagesSettings {
  const storedList = stored?.contactMethods;
  const rawList = Array.isArray(storedList) ? storedList : [];
  const contactMethods: ContactMethod[] = [];
  for (const [index, raw] of rawList.entries()) {
    const method = sanitizeContactMethod(raw, `method-${index + 1}`);
    if (method) contactMethods.push(method);
  }
  return { contactMethods };
}

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
