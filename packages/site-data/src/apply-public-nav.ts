import type {
  ContentGroupModuleSettings,
  ContentSettings,
  MemberSettings,
  ModuleSettings,
  VideoModuleSettings,
} from "@nextgen-cms/contract/types/modules";
import type { NavSection, SiteConfig } from "@nextgen-cms/contract/types/site";
import { applyFeatureModules } from "@nextgen-cms/site-data/apply-feature-modules";
import { moduleSettingsToFeatureModules } from "@nextgen-cms/config/theme/defaults";

export type PublicNavSettings = {
  content: ContentSettings;
  members: MemberSettings;
  contentGroup: ContentGroupModuleSettings;
  video: VideoModuleSettings;
  modules: ModuleSettings;
};

const SECTION_NAV_IDS = {
  content: "content",
  contentGroup: "contentGroup",
  video: "video",
  members: "members",
} as const;

function patchNavLabel(
  sections: NavSection[],
  id: string,
  label: string,
): NavSection[] {
  return sections.map((section) =>
    section.id === id ? { ...section, label } : section,
  );
}

function removeNavSection(sections: NavSection[], id: string): NavSection[] {
  return sections.filter((section) => section.id !== id);
}

function upsertMembersNav(sections: NavSection[], label: string): NavSection[] {
  const existing = sections.find(
    (section) => section.id === SECTION_NAV_IDS.members,
  );
  if (existing) {
    return patchNavLabel(sections, SECTION_NAV_IDS.members, label);
  }

  const videoIndex = sections.findIndex(
    (section) => section.id === SECTION_NAV_IDS.video,
  );
  const membersSection: NavSection = {
    id: SECTION_NAV_IDS.members,
    label,
    href: "/members",
  };

  if (videoIndex === -1) {
    return [...sections, membersSection];
  }

  return [
    ...sections.slice(0, videoIndex),
    membersSection,
    ...sections.slice(videoIndex),
  ];
}

export function applyPublicNav(
  siteConfig: SiteConfig,
  settings: PublicNavSettings,
): SiteConfig {
  const featureModules = moduleSettingsToFeatureModules(settings.modules);
  let navSections = [...siteConfig.navSections];

  navSections = patchNavLabel(
    navSections,
    SECTION_NAV_IDS.content,
    settings.content.pageTitle,
  );
  navSections = patchNavLabel(
    navSections,
    SECTION_NAV_IDS.contentGroup,
    settings.contentGroup.pageTitle,
  );
  navSections = patchNavLabel(
    navSections,
    SECTION_NAV_IDS.video,
    settings.video.pageTitle,
  );

  if (!settings.content.showInMenu) {
    navSections = removeNavSection(navSections, SECTION_NAV_IDS.content);
  }
  if (!settings.contentGroup.showInMenu) {
    navSections = removeNavSection(navSections, SECTION_NAV_IDS.contentGroup);
  }
  if (!settings.video.showInMenu) {
    navSections = removeNavSection(navSections, SECTION_NAV_IDS.video);
  }

  if (settings.members.showInMenu) {
    navSections = upsertMembersNav(navSections, settings.members.pageTitle);
  } else {
    navSections = removeNavSection(navSections, SECTION_NAV_IDS.members);
  }

  const withModules = applyFeatureModules(
    { ...siteConfig, navSections },
    featureModules,
  );

  return withModules;
}
