import type { SiteConfig } from "@nextgen-cms/contract/types/site";
import type { FeatureModules } from "@nextgen-cms/contract/types/theme";

function disabledHrefs(modules: FeatureModules): Set<string> {
  const hrefs = new Set<string>();
  if (!modules.contentGroup) hrefs.add("/content-group");
  if (!modules.video) hrefs.add("/video");
  if (!modules.newsletter) {
    hrefs.add("/newsletter");
    hrefs.add("#newsletter");
  }
  return hrefs;
}

function filterLinks<T extends { href: string }>(
  links: T[],
  disabled: Set<string>,
): T[] {
  return links.filter((link) => !disabled.has(link.href));
}

export function applyFeatureModules(
  config: SiteConfig,
  modules: FeatureModules,
): SiteConfig {
  const disabled = disabledHrefs(modules);

  return {
    ...config,
    navSections: filterLinks(config.navSections, disabled),
    utilityLinks: filterLinks(config.utilityLinks, disabled),
    footerColumns: config.footerColumns.map((column) => ({
      ...column,
      links: filterLinks(column.links, disabled),
    })),
  };
}
