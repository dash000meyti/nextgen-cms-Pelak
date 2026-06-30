import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleCardGrid } from "@/components/article/ArticleCardGrid";
import { SectionTitle } from "@/components/article/SectionHeader";
import { Container } from "@/components/layout/Container";

type EditorsPickProps = {
  articles: ArticlePreview[];
};

export function EditorsPick({ articles }: EditorsPickProps) {
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;
  const sideArticles = rest.slice(0, 4);

  return (
    <Container className="border-t border-rule py-10 md:py-8">
      <SectionTitle title="انتخاب سردبیر" />
      <div className="grid gap-10 md:grid-cols-[2fr_1fr] md:gap-12">
        <ArticleCard article={lead} variant="featuredLead" priority />
        <div className="space-y-4">
          {sideArticles.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              variant="compact"
            />
          ))}
        </div>
      </div>
    </Container>
  );
}

export { ArticleCardGrid };
