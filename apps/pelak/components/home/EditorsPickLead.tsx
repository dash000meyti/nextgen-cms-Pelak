import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import Image from "next/image";
import Link from "next/link";
import { AuthorChipList } from "@/components/ui/AuthorChip";

type EditorsPickLeadProps = {
  article: ArticlePreview;
  priority?: boolean;
};

const imgClass =
  "object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]";

export function EditorsPickLead({
  article,
  priority = false,
}: EditorsPickLeadProps) {
  return (
    <article className="grid w-full min-w-0 gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-14">
      <Link
        href={`/content/${article.slug}`}
        className="group relative block aspect-square w-full overflow-hidden rounded bg-rule"
      >
        <Image
          src={article.heroImage.src}
          alt={article.heroImage.alt}
          fill
          className={imgClass}
          sizes="(max-width: 768px) 100vw, 28vw"
          priority={priority}
        />
      </Link>

      <div className="flex min-w-0 flex-col justify-center gap-3">
        <Link href={`/content/${article.slug}`} className="group space-y-2">
          <h2 className="text-card-title transition-colors group-hover:text-accent">
            {article.title}
          </h2>
          {article.subtitle ? (
            <p className="text-base leading-relaxed text-ink-muted">
              {article.subtitle}
            </p>
          ) : null}
        </Link>
        {article.excerpt ? (
          <p className="line-clamp-3 text-sm leading-7 text-ink-muted">
            {article.excerpt}
          </p>
        ) : null}
        <AuthorChipList authors={article.authors} tone="ink" />
      </div>
    </article>
  );
}
