import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import type { SiteConfig } from "@nextgen-cms/contract/types/site";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchTrigger } from "@/components/layout/SearchTrigger";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type SiteHeaderProps = {
  siteConfig: SiteConfig;
  searchArticles: ArticlePreview[];
  currentContentGroupLabel: string;
};

export function SiteHeader({
  siteConfig,
  searchArticles,
  currentContentGroupLabel,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/80 backdrop-blur-sm supports-backdrop-filter:bg-paper/75">
      <Container className="relative flex h-14 items-center gap-3">
        <div className="z-0 flex flex-1 items-center justify-start">
          <div className="lg:hidden">
            <MobileNav
              navSections={siteConfig.navSections}
              currentContentGroupLabel={currentContentGroupLabel}
            />
          </div>
          <nav aria-label="ناوبری اصلی" className="hidden lg:block">
            <ul className="flex items-center gap-7 text-sm">
              {siteConfig.navSections.map((section) => (
                <li key={section.id}>
                  <Link
                    href={section.href}
                    className="relative py-1.5 font-medium text-ink-muted transition-colors hover:text-accent"
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Logo
          siteConfig={siteConfig}
          className="pointer-events-auto absolute inset-x-0 z-10 mx-auto w-fit"
        />

        <div className="z-0 flex flex-1 items-center justify-end gap-1.5 sm:gap-2 md:gap-3">
          <ThemeToggle />
          <SearchTrigger articles={searchArticles} />
        </div>
      </Container>

      <div className="h-0.25 bg-accent max-w-6xl mx-auto -mb-0.25" />
    </header>
  );
}
