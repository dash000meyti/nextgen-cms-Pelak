import {
  getCurrentContentGroup,
  getRelatedArticles,
  getSiteConfig,
} from "@nextgen-cms/site-data/get-content";
import { getArticleForAdmin } from "@nextgen-cms/studio/cms/queries";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetailView } from "@/components/article/ArticleDetailView";
import { ContentPreviewBanner } from "@/components/admin/studio/ContentPreviewBanner";

type PreviewPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PreviewPageProps): Promise<Metadata> {
  const { id } = await params;
  const articleId = Number.parseInt(id, 10);
  if (Number.isNaN(articleId)) return { title: "پیش‌نمایش" };

  const article = await getArticleForAdmin(articleId);
  if (!article) return { title: "پیش‌نمایش" };

  return {
    title: `پیش‌نمایش: ${article.title}`,
    robots: { index: false, follow: false },
  };
}

export default async function ContentPreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;
  const articleId = Number.parseInt(id, 10);
  if (Number.isNaN(articleId)) notFound();

  const result = await getArticleForAdmin(articleId);
  if (!result) notFound();

  const { article, slug, status } = result;
  const [related, currentContentGroup, siteConfig] = await Promise.all([
    getRelatedArticles(slug, 4),
    getCurrentContentGroup(),
    getSiteConfig(),
  ]);

  return (
    <>
      <ContentPreviewBanner articleId={articleId} status={status} />
      <ArticleDetailView
        article={article}
        slug={slug}
        related={related}
        currentContentGroup={currentContentGroup}
        siteConfig={siteConfig}
      />
    </>
  );
}
