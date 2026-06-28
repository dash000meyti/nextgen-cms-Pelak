import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import Link from "next/link";
import { ArticleListItem } from "@/components/article/ArticleListItem";
import { SectionTitle } from "@/components/article/SectionHeader";

type MostReadListProps = {
  articles: ArticlePreview[];
};

export function MostReadList({ articles }: MostReadListProps) {
  return (
    <section aria-labelledby="most-read-heading" className="space-y-2">
      <SectionTitle title="پرخواننده‌ترین‌ها" />
      <ul>
        {articles.map((article, index) => (
          <ArticleListItem
            key={article.slug}
            article={article}
            rank={index + 1}
          />
        ))}
      </ul>
    </section>
  );
}

export { Link };
