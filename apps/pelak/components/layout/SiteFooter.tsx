import type { SiteConfig } from "@nextgen-cms/contract/types/site";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { SocialLinks } from "@/components/ui/SocialLinks";

type SiteFooterProps = {
  siteConfig: SiteConfig;
};

export function SiteFooter({ siteConfig }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-rule bg-surface">
      <Container className="py-10 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-12">
          <div className="space-y-5">
            <Logo siteConfig={siteConfig} />
            <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
              {siteConfig.description}
            </p>
            <SocialLinks links={siteConfig.socialLinks} />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {siteConfig.footerColumns.map((column) => (
              <div key={column.title} className="space-y-3">
                <h2 className="font-heading text-sm text-ink">
                  {column.title}
                </h2>
                <ul className="space-y-2.5 text-sm text-ink-muted">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-rule pt-6 text-xs text-ink-faint md:flex-row md:items-center md:justify-between">
          <p>
            © {year.toLocaleString("fa-IR")} {siteConfig.name}. تمامی حقوق محفوظ
            است.
          </p>
          <p>استفاده از مطالب با ذکر منبع بلامانع است.</p>
        </div>
      </Container>
    </footer>
  );
}
