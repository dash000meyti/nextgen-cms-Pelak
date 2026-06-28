import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import Link from "next/link";
import { SectionBadge } from "@/components/ui/SectionBadge";

type ArticleListItemProps = {
  article: ArticlePreview;
  rank: number;
};

export function ArticleListItem({ article, rank }: ArticleListItemProps) {
  const primaryTopic = article.topics[0];
  return (
    <li className="group flex items-start gap-3 border-b border-rule py-4 last:border-0 sm:gap-5">
      <span
        className="w-7 shrink-0 pt-0.5 font-heading text-2xl leading-none text-accent/85 tabular-nums sm:w-9 sm:text-3xl"
        aria-hidden="true"
      >
        {rank.toLocaleString("fa-IR")}
      </span>
      <div className="min-w-0 flex-1 space-y-1.5">
        {primaryTopic ? <SectionBadge topic={primaryTopic} /> : null}
        <Link href={`/content/${article.slug}`}>
          <h3 className="font-heading text-base leading-snug text-ink transition-colors group-hover:text-accent">
            {article.title}
          </h3>
        </Link>
        <p className="text-xs text-ink-faint">
          {article.authors.map((author) => author.name).join(" و ")}
        </p>
      </div>
    </li>
  );
}
