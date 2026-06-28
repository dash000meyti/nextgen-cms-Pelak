import type { Article } from "@nextgen-cms/contract/types/article";
import { AuthorChipList } from "@/components/ui/AuthorChip";
import { JalaliDate } from "@/components/ui/JalaliDate";
import { ReadingTime } from "@/components/ui/ReadingTime";

type ArticleHeaderProps = {
  title: string;
  subtitle: string;
  authors: Article["authors"];
  publishedAt: string;
  readingMinutes: number;
};

export function ArticleHeader({
  title,
  subtitle,
  authors,
  publishedAt,
  readingMinutes,
}: ArticleHeaderProps) {
  return (
    <header className="space-y-4 md:space-y-5">
      <h1 className="font-heading text-2xl leading-tight text-ink sm:text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
        {title}
      </h1>
      <p className="text-base leading-relaxed text-ink-muted sm:text-lg md:text-xl">
        {subtitle}
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-ink-muted sm:text-sm">
        <AuthorChipList authors={authors} />
        <span aria-hidden="true">·</span>
        <JalaliDate value={publishedAt} />
        <span aria-hidden="true">·</span>
        <ReadingTime minutes={readingMinutes} />
      </div>
    </header>
  );
}
