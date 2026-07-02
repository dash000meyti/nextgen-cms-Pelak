import type { Article } from "@nextgen-cms/contract/types/article";
import { AuthorChipList } from "@/components/ui/AuthorChip";
import { JalaliDate } from "@/components/ui/JalaliDate";

type ArticleHeaderProps = {
  title: string;
  subtitle: string;
  excerpt?: string;
  authors: Article["authors"];
  publishedAt: string;
};

export function ArticleHeader({
  title,
  subtitle,
  excerpt,
  authors,
  publishedAt,
}: ArticleHeaderProps) {
  return (
    <>
      <header className="space-y-4 md:space-y-5">
        <h1 className="font-heading text-[28px] leading-normal text-ink text-center md:text-start">
          {title}
        </h1>
        <p className="text-lead text-center md:text-start">{subtitle}</p>

        {excerpt ? (
          <p className="font-heading text-base leading-relaxed text-ink-muted italic text-center md:text-start md:leading-7">
            {excerpt}
          </p>
        ) : null}

        <div className="text-meta flex flex-wrap items-center justify-center text-center gap-x-3 gap-y-2 md:justify-start md:text-start">
          <AuthorChipList authors={authors} />
        </div>
      </header>
      <JalaliDate value={publishedAt} className="fa-num" style="long" />
    </>
  );
}
