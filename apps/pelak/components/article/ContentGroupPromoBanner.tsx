import type { ContentGroupSummary } from "@nextgen-cms/contract/types/content-group";
import Image from "next/image";
import Link from "next/link";
import { contentGroupCoverAspectClass } from "@/components/content-group/content-group-cover-aspect";
import { Button } from "@/components/ui/Button";

type ContentGroupPromoBannerProps = {
  group: ContentGroupSummary;
  contentGroupPageTitle: string;
};

export function ContentGroupPromoBanner({
  group,
  contentGroupPageTitle,
}: ContentGroupPromoBannerProps) {
  return (
    <aside
      aria-label={`آخرین ${contentGroupPageTitle}`}
      className="w-full overflow-hidden rounded border border-rule bg-surface/50"
    >
      <Link
        href={`/content-group/${group.number}`}
        className="group m-14 mb-8 block"
      >
        <div
          className={`relative ${contentGroupCoverAspectClass} w-full overflow-hidden bg-rule rounded-md`}
        >
          <Image
            src={group.cover.src}
            alt={group.cover.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 1280px) 30vw, 320px"
          />
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
          آخرین {contentGroupPageTitle}
        </p>
        <p className="font-heading text-sm leading-normal text-ink">
          {group.label}
        </p>
        <p className="text-xs text-ink-muted">
          {group.articleCount.toLocaleString("fa-IR")} محتوا
        </p>
        <Button
          href={`/content-group/${group.number}`}
          variant="outline"
          className="w-full text-xs"
        >
          مشاهده {contentGroupPageTitle}
        </Button>
      </div>
    </aside>
  );
}
