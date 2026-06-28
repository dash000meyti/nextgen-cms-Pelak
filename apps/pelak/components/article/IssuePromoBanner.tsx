import type { IssueSummary } from "@nextgen-cms/contract/types/issue";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type IssuePromoBannerProps = {
  issue: IssueSummary;
};

export function IssuePromoBanner({ issue }: IssuePromoBannerProps) {
  return (
    <aside
      aria-label="آخرین شمارهٔ هفته‌نامه"
      className="w-full overflow-hidden rounded border border-rule bg-surface/50"
    >
      <Link href={`/issues/${issue.number}`} className="group block">
        <div className="relative aspect-3/4 w-full overflow-hidden bg-rule">
          <Image
            src={issue.cover.src}
            alt={issue.cover.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 1280px) 30vw, 320px"
          />
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
          آخرین شماره
        </p>
        <p className="font-heading text-sm leading-snug text-ink">
          {issue.label}
        </p>
        <p className="text-xs text-ink-muted">
          {issue.articleCount.toLocaleString("fa-IR")} محتوا
        </p>
        <Button
          href={`/issues/${issue.number}`}
          variant="outline"
          className="w-full text-xs"
        >
          مشاهده شماره
        </Button>
      </div>
    </aside>
  );
}
