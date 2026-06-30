import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import Image from "next/image";
import Link from "next/link";
import { SectionTitle } from "@/components/article/SectionHeader";
import { AuthorChipList } from "@/components/ui/AuthorChip";
import { JalaliDate } from "@/components/ui/JalaliDate";
import { ReadingTime } from "@/components/ui/ReadingTime";
import { SectionBadge } from "@/components/ui/SectionBadge";

type ArticleCardProps = {
  article: ArticlePreview;
  variant?:
    | "default"
    | "featured"
    | "featuredLead"
    | "featuredRow"
    | "compact"
    | "minimal";
  priority?: boolean;
  sectionTitle?: string;
};

function CardMeta({ article }: { article: ArticlePreview }) {
  const primaryTopic = article.topics[0];
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-faint">
      {primaryTopic ? <SectionBadge topic={primaryTopic} /> : null}
      <span aria-hidden="true">·</span>
      <JalaliDate value={article.publishedAt} />
      <span aria-hidden="true">·</span>
      <ReadingTime minutes={article.readingMinutes} />
    </div>
  );
}

const imgClass =
  "object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]";

export function ArticleCard({
  article,
  variant = "default",
  priority = false,
  sectionTitle,
}: ArticleCardProps) {
  if (variant === "minimal") {
    return (
      <article className="group space-y-1.5">
        <CardMeta article={article} />
        <Link href={`/content/${article.slug}`}>
          <h3 className="text-card-title-sm transition-colors group-hover:text-accent">
            {article.title}
          </h3>
        </Link>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group flex gap-3">
        <Link
          href={`/content/${article.slug}`}
          className="relative block size-14 shrink-0 overflow-hidden rounded bg-rule"
        >
          <Image
            src={article.heroImage.src}
            alt={article.heroImage.alt}
            fill
            className={imgClass}
            sizes="56px"
          />
        </Link>
        <div className="flex flex-1 flex-col gap-1.5">
          <CardMeta article={article} />
          <Link href={`/content/${article.slug}`}>
            <h3 className="font-heading text-sm leading-normal text-ink transition-colors group-hover:text-accent">
              {article.title}
            </h3>
          </Link>
        </div>
      </article>
    );
  }

  if (variant === "featuredRow") {
    return (
      <article className="group grid grid-cols-[1fr_2fr] gap-3 sm:gap-5">
        <Link
          href={`/content/${article.slug}`}
          className="relative block aspect-square overflow-hidden rounded bg-rule"
        >
          <Image
            src={article.heroImage.src}
            alt={article.heroImage.alt}
            fill
            className={imgClass}
            sizes="(max-width: 768px) 33vw, 16vw"
          />
        </Link>
        <div className="flex flex-col justify-center gap-2">
          <CardMeta article={article} />
          <Link href={`/content/${article.slug}`} className="space-y-2">
            <h3 className="text-card-title-sm transition-colors group-hover:text-accent">
              {article.title}
            </h3>
            <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
              {article.subtitle}
            </p>
          </Link>
          <AuthorChipList authors={article.authors} className="text-sm" />
        </div>
      </article>
    );
  }

  if (variant === "featuredLead") {
    return (
      <article className="group grid gap-6 md:grid-cols-2 md:gap-10">
        <Link
          href={`/content/${article.slug}`}
          className="relative block aspect-square w-full overflow-hidden rounded bg-rule"
        >
          <Image
            src={article.heroImage.src}
            alt={article.heroImage.alt}
            fill
            className={imgClass}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={priority}
          />
        </Link>

        <div className="flex flex-col justify-center gap-4">
          {sectionTitle ? (
            <SectionTitle title={sectionTitle} bordered />
          ) : null}
          <CardMeta article={article} />
          <Link href={`/content/${article.slug}`} className="space-y-3">
            <h2 className="text-card-title transition-colors group-hover:text-accent">
              {article.title}
            </h2>
            <p className="text-base leading-relaxed text-ink-muted">
              {article.subtitle}
            </p>
          </Link>
          <p className="line-clamp-3 text-sm leading-7 text-ink-muted">
            {article.excerpt}
          </p>
          <AuthorChipList authors={article.authors} className="text-sm" />
        </div>
      </article>
    );
  }

  if (variant === "featured") {
    return (
      <article className="group grid gap-6 border-b border-rule pb-10 md:grid-cols-2 md:gap-10">
        <Link
          href={`/content/${article.slug}`}
          className="relative block aspect-16/9 w-full overflow-hidden rounded bg-rule"
        >
          <Image
            src={article.heroImage.src}
            alt={article.heroImage.alt}
            fill
            className={imgClass}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={priority}
          />
        </Link>

        <div className="flex flex-col justify-center gap-4">
          <CardMeta article={article} />
          <Link href={`/content/${article.slug}`} className="space-y-3">
            <h2 className="text-card-title transition-colors group-hover:text-accent">
              {article.title}
            </h2>
            <p className="text-base leading-relaxed text-ink-muted">
              {article.subtitle}
            </p>
          </Link>
          <p className="line-clamp-3 text-sm leading-7 text-ink-muted">
            {article.excerpt}
          </p>
          <AuthorChipList authors={article.authors} className="text-sm" />
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/content/${article.slug}`}
        className="relative mb-4 block aspect-3/2 overflow-hidden rounded bg-rule"
      >
        <Image
          src={article.heroImage.src}
          alt={article.heroImage.alt}
          fill
          className={imgClass}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3">
        <CardMeta article={article} />
        <Link href={`/content/${article.slug}`} className="space-y-2">
          <h2 className="text-card-title-sm transition-colors group-hover:text-accent">
            {article.title}
          </h2>
          <p className="line-clamp-2 text-base leading-relaxed text-ink-muted">
            {article.subtitle}
          </p>
        </Link>
        <AuthorChipList authors={article.authors} className="text-sm" />
      </div>
    </article>
  );
}
