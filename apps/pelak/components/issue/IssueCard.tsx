import type { IssueSummary } from "@nextgen-cms/contract/types/issue";
import Image from "next/image";
import Link from "next/link";

type IssueCardProps = {
  issue: IssueSummary;
};

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <Link href={`/issues/${issue.number}`} className="group block space-y-4">
      <div className="relative aspect-3/4 w-full overflow-hidden rounded bg-rule">
        <Image
          src={issue.cover.src}
          alt={issue.cover.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <div className="space-y-1">
        <p className="font-heading text-base text-ink transition-colors group-hover:text-accent">
          {issue.label}
        </p>
        <p className="text-xs text-ink-muted">{issue.articleCount} محتوا</p>
      </div>
    </Link>
  );
}
