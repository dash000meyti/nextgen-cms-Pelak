export type IssuePeriod = "yearly" | "seasonal" | "monthly" | "weekly";

export type ModuleSettings = {
  issues: { enabled: boolean; period: IssuePeriod };
  video: { enabled: boolean; pageTitle: string; itemsPerPage: number };
  newsletter: { enabled: boolean };
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
  allowRegistration: boolean;
  requireApproval: boolean;
};

export type ContentSettings = {
  defaultArticleStatus: "draft" | "published";
  slugAutoGenerate: boolean;
  homepageArticleCount: number;
  showAuthorOnCards: boolean;
};

/** @deprecated Use ModuleSettings.issues.enabled etc. */
export type FeatureModules = {
  issues: boolean;
  video: boolean;
  newsletter: boolean;
};
