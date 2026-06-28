import type { SiteConfig } from "@nextgen-cms/contract/types/site";
import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  siteConfig: SiteConfig;
  className?: string;
  withWordmark?: boolean;
};

export function Logo({
  siteConfig,
  className = "",
  withWordmark = false,
}: LogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-3 ${className}`.trim()}
      aria-label={siteConfig.name}
    >
      <Image
        src={siteConfig.logo}
        alt={siteConfig.name}
        width={225}
        height={98}
        priority
        className="h-10 w-auto"
      />
      {withWordmark ? (
        <span className="hidden font-heading text-sm text-ink-muted sm:inline">
          {siteConfig.tagline}
        </span>
      ) : null}
    </Link>
  );
}
