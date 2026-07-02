import type {
  Article,
  ArticlePreview,
} from "@nextgen-cms/contract/types/article";
import type { ContentGroup } from "@nextgen-cms/contract/types/content-group";
import type { SiteConfig } from "@nextgen-cms/contract/types/site";
import { ArticleBody } from "@/components/article/ArticleBody";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { ArticleHero } from "@/components/article/ArticleHero";
import { AuthorList } from "@/components/article/AuthorList";
import { ContentGroupPromoBanner } from "@/components/article/ContentGroupPromoBanner";
import { RelatedArticles } from "@/components/article/RelatedArticles";
import { TopicTags } from "@/components/article/TopicTags";
import { TopContentGroup } from "@/components/home/TopContentGroup";
import { Container } from "@/components/layout/Container";
import { ShareBar } from "@/components/ui/ShareBar";

type ArticleDetailViewProps = {
  article: Article;
  shareUrl: string;
  pdfDownloadUrl?: string;
  related: ArticlePreview[];
  currentContentGroup: ContentGroup;
  siteConfig: SiteConfig;
};

export function ArticleDetailView({
  article,
  shareUrl,
  pdfDownloadUrl,
  related,
  currentContentGroup,
  siteConfig,
}: ArticleDetailViewProps) {
  return (
    <>
      <TopContentGroup group={currentContentGroup} />

      <Container variant="wide" className="py-6 md:py-12">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="mx-auto py-12 w-full max-w-content space-y-5 md:space-y-6 lg:my-0 lg:flex lg:w-1/2 lg:max-w-none lg:flex-col lg:self-center">
            <TopicTags topics={article.topics} />
            <ArticleHeader
              title={article.title}
              subtitle={article.subtitle}
              excerpt={article.excerpt}
              authors={article.authors}
              publishedAt={article.publishedAt}
              readingMinutes={article.readingMinutes}
            />
          </div>
          <ArticleHero
            image={article.heroImage}
            priority
            className="w-full lg:w-1/2"
          />
        </div>
      </Container>

      <Container variant="wide" className="pb-16">
        <div className="mx-auto max-w-content space-y-12 lg:hidden">
          <ShareBar
            title={article.title}
            shareUrl={shareUrl}
            pdfDownloadUrl={pdfDownloadUrl}
          />
          <ArticleBody blocks={article.body} />
          <AuthorList
            authors={article.authors}
            socialLinks={siteConfig.socialLinks}
            memberLabel={siteConfig.memberLabel}
            membersLabel={siteConfig.membersLabel}
          />
        </div>

        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-10">
          <aside className="col-span-1">
            <div className="sticky top-[40dvh] z-10 ">
              <ShareBar
                title={article.title}
                shareUrl={shareUrl}
                pdfDownloadUrl={pdfDownloadUrl}
                variant="sidebar"
              />
            </div>
          </aside>
          <div className="col-span-7">
            <ArticleBody blocks={article.body} />
          </div>
          <aside className="col-span-4 flex flex-col gap-8">
            <AuthorList
              authors={article.authors}
              socialLinks={siteConfig.socialLinks}
              memberLabel={siteConfig.memberLabel}
              membersLabel={siteConfig.membersLabel}
              variant="sidebar"
            />
            <div className="w-full sticky top-[18dvh] z-10">
              <ContentGroupPromoBanner group={currentContentGroup} />
            </div>
          </aside>
        </div>
      </Container>

      <RelatedArticles articles={related} />
    </>
  );
}
