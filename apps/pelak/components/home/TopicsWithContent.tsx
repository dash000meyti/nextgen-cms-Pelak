import type {
  ArticlePreview,
  Topic,
} from "@nextgen-cms/contract/types/article";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleListItem } from "@/components/article/ArticleListItem";
import { SectionTitle } from "@/components/article/SectionHeader";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export type TopicSection = {
  topic: Topic;
  articles: ArticlePreview[];
};

type TopicsWithContentProps = {
  sections: TopicSection[];
};

export function TopicsWithContent({ sections }: TopicsWithContentProps) {
  if (sections.length === 0) return null;

  return (
    <>
      {sections.map(({ topic, articles }) => {
        const [lead, ...rest] = articles;
        const listArticles = rest.slice(0, 6);

        return (
          <div key={topic.slug}>
            <Container className="border-b border-rule py-10 md:py-20">
              <ArticleCard
                article={lead}
                variant="featuredLead"
                priority
                sectionTitle={topic.name}
                imageFirst={false}
                authorTone="ink"
              />
            </Container>

            {listArticles.length > 0 ? (
              <section className="bg-surface">
                <Container className="border-b border-rule py-10 md:py-20">
                  <SectionTitle
                    title="بیشتر بخوانید"
                    titleWeight="normal"
                    action={
                      <Button href={`/topics/${topic.slug}`} variant="outline">
                        {`تمام محتوای ${topic.name}`}
                      </Button>
                    }
                    bordered
                  />
                  <ul className="grid gap-x-8 md:grid-cols-2 md:gap-x-14">
                    {listArticles.map((article, index) => (
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
            ) : null}
          </div>
        );
      })}
    </>
  );
}
