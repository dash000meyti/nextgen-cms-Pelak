import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import Image from "next/image";
import Link from "next/link";

type ArticleListItemProps = {
  article: ArticlePreview;
  rank?: number;
  priority?: boolean;
};

const imgClass =
  "object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]";

export function ArticleListItem({
  article,
  rank,
  priority = false,
}: ArticleListItemProps) {
  return (
    <li className="group flex items-center gap-3 border-b border-rule py-4 sm:gap-5">
      {rank != null ? (
        <span
          className="w-7 shrink-0 font-heading text-xl leading-none text-accent/85 tabular-nums sm:w-9 sm:text-2xl"
          aria-hidden="true"
        >
          {rank.toLocaleString("fa-IR")}
        </span>
      ) : null}
      <div className="min-w-0 flex-1 space-y-1.5">
        <Link href={`/content/${article.slug}`}>
          <h3 className="text-card-title-sm transition-colors group-hover:text-accent">
            {article.title}
          </h3>
        </Link>
        {article.subtitle ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
            {article.subtitle}
          </p>
        ) : null}
        <p className="text-xs text-ink-faint">
          {article.authors.map((author) => author.name).join(" و ")}
        </p>
      </div>
      <Link
        href={`/content/${article.slug}`}
        className="relative block aspect-square w-20 shrink-0 overflow-hidden rounded bg-rule sm:w-24"
      >
        <Image
          src={article.heroImage.src}
          alt={article.heroImage.alt}
          fill
          className={imgClass}
          sizes="96px"
          priority={priority}
        />
      </Link>
    </li>
  );
}
