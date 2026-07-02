import type { Article } from "@nextgen-cms/contract/types/article";
import { AuthorChipList } from "@/components/ui/AuthorChip";
import { JalaliDate } from "@/components/ui/JalaliDate";
import { ReadingTime } from "@/components/ui/ReadingTime";

type ArticleHeaderProps = {
  title: string;
  subtitle: string;
  excerpt?: string;
  authors: Article["authors"];
  publishedAt: string;
  readingMinutes: number;
};

export function ArticleHeader({
  title,
  subtitle,
  excerpt,
  authors,
  publishedAt,
  readingMinutes,
}: ArticleHeaderProps) {
  return (
    <header className="space-y-4 md:space-y-5">
      <h1 className="font-heading text-2xl leading-normal text-ink sm:text-2xl md:text-3xl">
        {title}
      </h1>
      <p className="text-lead">{subtitle}</p>

      <div className="text-meta flex flex-wrap items-center gap-x-3 gap-y-2">
        <AuthorChipList authors={authors} />
        <span aria-hidden="true">·</span>
        <JalaliDate value={publishedAt} />
        <span aria-hidden="true">·</span>
        <ReadingTime minutes={readingMinutes} />
      </div>

      {excerpt ? (
        <p className="text-base leading-relaxed text-ink-muted md:leading-7">
          {excerpt}
        </p>
      ) : null}
    </header>
  );
}
