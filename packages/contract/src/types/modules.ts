export type ContentGroupPeriod = "yearly" | "seasonal" | "monthly" | "weekly";

export type SectionListSettings = {
  pageTitle: string;
  itemsPerPage: number;
  showInMenu: boolean;
};

export type ModuleSettings = {
  contentGroup: { enabled: boolean };
  video: { enabled: boolean };
  newsletter: { enabled: boolean };
};

export type ContentGroupModuleSettings = SectionListSettings & {
  period: ContentGroupPeriod;
  groupByYear: boolean;
  maxImageBytes: number;
  maxPdfBytes: number;
};

export type VideoModuleSettings = SectionListSettings;

/** Legacy shape stored in module_settings before settings restructure */
export type LegacyModuleSettings = {
  contentGroup: {
    enabled: boolean;
    period?: ContentGroupPeriod;
    label?: string;
  };
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

export type MemberSettings = SectionListSettings & {
  defaultRoleId: number;
  memberLabel: string;
  membersLabel: string;
};

export type ContentSettings = SectionListSettings & {
  defaultArticleStatus: "draft" | "published";
};

/** @deprecated Use ModuleSettings.contentGroup.enabled etc. */
export type FeatureModules = {
  contentGroup: boolean;
  video: boolean;
  newsletter: boolean;
};
