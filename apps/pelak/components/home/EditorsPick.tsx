import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleCardGrid } from "@/components/article/ArticleCardGrid";
import { SectionTitle } from "@/components/article/SectionHeader";
import { EditorsPickLead } from "@/components/home/EditorsPickLead";
import { Container } from "@/components/layout/Container";

type EditorsPickProps = {
  articles: ArticlePreview[];
};

export function EditorsPick({ articles }: EditorsPickProps) {
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;
  const sideArticles = rest.slice(0, 4);

  return (
    <Container className="border-t border-rule py-10 md:py-20">
      <SectionTitle title="انتخاب سردبیر" />
      <div className="grid gap-10 md:grid-cols-3 md:gap-14">
        <div className="flex min-w-0 items-center md:col-span-2">
          <EditorsPickLead article={lead} priority />
        </div>
        <aside className="min-w-0 md:col-span-1">
          {sideArticles.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              variant="compact"
            />
          ))}
        </aside>
      </div>
    </Container>
  );
}

export { ArticleCardGrid };
