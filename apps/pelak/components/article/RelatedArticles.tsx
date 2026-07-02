import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import { ArticleListItem } from "@/components/article/ArticleListItem";
import { SectionTitle } from "@/components/article/SectionHeader";
import { Container } from "@/components/layout/Container";

type RelatedArticlesProps = {
  articles: ArticlePreview[];
};

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section aria-label="پیشنهادهای مرتبط" className="bg-surface">
      <Container className="border-b border-rule py-25">
        <SectionTitle
          title="پیشنهادهای مرتبط"
          titleWeight="normal"
          bordered
        />
        <ul className="grid gap-x-8 md:grid-cols-2 md:gap-x-14">
          {articles.map((article, index) => (
            <ArticleListItem
              key={article.slug}
              article={article}
              priority={index === 0}
              authorTone="ink"
            />
          ))}
        </ul>
      </Container>
    </section>
  );
}
