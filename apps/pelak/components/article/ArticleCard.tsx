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
  secondaryArticles?: ArticlePreview[];
  imageFirst?: boolean;
  authorTone?: "muted" | "ink";
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
  secondaryArticles,
  imageFirst = true,
  authorTone = "muted",
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
      <article className="group flex flex-1 gap-3 border-b border-rule py-4 sm:gap-5 last:border-b-0">
        <Link
          href={`/content/${article.slug}`}
          className="relative block size-14 shrink-0 self-center overflow-hidden rounded bg-rule"
        >
          <Image
            src={article.heroImage.src}
            alt={article.heroImage.alt}
            fill
            className={imgClass}
            sizes="56px"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <Link href={`/content/${article.slug}`} className="space-y-1">
            <h3 className="font-heading text-sm leading-normal text-ink transition-colors group-hover:text-accent">
              {article.title}
            </h3>
            {article.subtitle ? (
              <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">
                {article.subtitle}
              </p>
            ) : null}
          </Link>
        </div>
      </article>
    );
  }

  if (variant === "featuredRow") {
    return (
      <article className="group grid grid-cols-[auto_1fr] gap-5 py-7">
        <Link
          href={`/content/${article.slug}`}
          className="relative block size-16 shrink-0 self-center overflow-hidden rounded bg-rule sm:size-20"
        >
          <Image
            src={article.heroImage.src}
            alt={article.heroImage.alt}
            fill
            className={imgClass}
            sizes="80px"
          />
        </Link>
        <div className="flex flex-col justify-center gap-2">
          <Link href={`/content/${article.slug}`} className="space-y-2">
            <h3 className="text-card-title-sm transition-colors group-hover:text-accent">
              {article.title}
            </h3>
            <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
              {article.subtitle}
            </p>
          </Link>
          <AuthorChipList authors={article.authors} tone={authorTone} />
        </div>
      </article>
    );
  }

  if (variant === "featuredLead") {
    const imageSide = imageFirst
      ? "md:col-start-1 md:col-span-5 md:row-start-1 md:row-span-2"
      : "md:col-start-8 md:col-span-5 md:row-start-1 md:row-span-2";
    const contentSide = imageFirst
      ? "md:col-start-6 md:col-span-7"
      : "md:col-start-1 md:col-span-7";

    const imageLink = (
      <div className={`order-2 ${imageSide} md:flex md:flex-col md:justify-center`}>
        <Link
          href={`/content/${article.slug}`}
          className="group relative block aspect-square w-full self-center overflow-hidden rounded bg-rule"
        >
          <Image
            src={article.heroImage.src}
            alt={article.heroImage.alt}
            fill
            className={imgClass}
            sizes="(max-width: 768px) 100vw, 42vw"
            priority={priority}
          />
        </Link>
      </div>
    );

    const authorBlock = (
      <AuthorChipList authors={article.authors} tone={authorTone} />
    );

    const leadHeader = (
      <div
        className={`order-1 flex flex-col justify-center gap-2 ${contentSide} md:row-start-1`}
      >
        {sectionTitle ? <SectionTitle title={sectionTitle} bordered /> : null}
        <Link
          href={`/content/${article.slug}`}
          className="group space-y-3 pt-6"
        >
          <h2 className="mb-0 pb-3 text-card-title transition-colors group-hover:text-accent">
            {article.title}
          </h2>
          <p className="text-base leading-relaxed text-ink-muted">
            {article.subtitle}
          </p>
        </Link>
        <div className="md:hidden">{authorBlock}</div>
      </div>
    );

    const leadFooter = (
      <div
        className={`order-3 flex flex-col justify-center gap-2 ${contentSide} md:row-start-2`}
      >
        <p className="hidden line-clamp-3 text-sm leading-7 text-ink-muted md:block">
          {article.excerpt}
        </p>
        <div className="hidden md:block">{authorBlock}</div>
        {secondaryArticles && secondaryArticles.length > 0 ? (
          <div className="mt-6 border-t border-rule [&>article:first-child]:border-b [&>article:first-child]:border-rule">
            {secondaryArticles.map((secondary) => (
              <ArticleCard
                key={secondary.slug}
                article={secondary}
                variant="featuredRow"
                authorTone={authorTone}
              />
            ))}
          </div>
        ) : null}
      </div>
    );

    return (
      <article className="grid gap-6 md:grid-cols-12 md:gap-20 md:gap-y-3">
        {leadHeader}
        {imageLink}
        {leadFooter}
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
          <AuthorChipList authors={article.authors} tone={authorTone} />
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
        <AuthorChipList authors={article.authors} tone={authorTone} />
      </div>
    </article>
  );
}
