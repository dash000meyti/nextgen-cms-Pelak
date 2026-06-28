import type {
  ArticlePreview,
  Topic,
} from "@nextgen-cms/contract/types/article";
import Link from "next/link";
import { ArticleCard } from "@/components/article/ArticleCard";
import { SectionTitle } from "@/components/article/SectionHeader";

type TopicColumnsProps = {
  topics: Array<{ topic: Topic; articles: ArticlePreview[] }>;
};

export function TopicColumns({ topics }: TopicColumnsProps) {
  return (
    <section aria-labelledby="topics-heading" className="space-y-8">
      <SectionTitle title="به‌ترتیب موضوع" />
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map(({ topic, articles }) => (
          <div key={topic.slug} className="space-y-5">
            <Link
              href={`/topics/${topic.slug}`}
              className="font-heading text-lg text-ink transition-colors hover:text-accent"
            >
              {topic.name}
            </Link>
            <div className="space-y-5 border-t border-rule pt-5">
              {articles.slice(0, 4).map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  variant="minimal"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
