export type ContentGroupPeriod = "yearly" | "seasonal" | "monthly" | "weekly";

export type ModuleSettings = {
  contentGroup: { enabled: boolean; label: string };
  video: { enabled: boolean; label: string };
  newsletter: { enabled: boolean; label: string };
};

export type ContentGroupModuleSettings = {
  period: ContentGroupPeriod;
};

export type VideoModuleSettings = {
  pageTitle: string;
  itemsPerPage: number;
};

/** Legacy shape stored in module_settings before settings restructure */
export type LegacyModuleSettings = {
  contentGroup: { enabled: boolean; period?: ContentGroupPeriod; label?: string };
  video: {
    enabled: boolean;
    pageTitle?: string;
    itemsPerPage?: number;
    label?: string;
  };
  newsletter: { enabled: boolean; label?: string };
};

export type MediaSettings = {
  maxBytes: number;
  allowedMime: string[];
  pipeline: {
    stripMetadata: boolean;
    generateWebp: boolean;
  };
};

export type MemberSettings = {
  defaultRoleId: number;
  memberLabel: string;
  membersLabel: string;
};

export type ContentSettings = {
  defaultArticleStatus: "draft" | "published";
  slugAutoGenerate: boolean;
  homepageArticleCount: number;
  showAuthorOnCards: boolean;
};

/** @deprecated Use ModuleSettings.contentGroup.enabled etc. */
export type FeatureModules = {
  contentGroup: boolean;
  video: boolean;
  newsletter: boolean;
};
