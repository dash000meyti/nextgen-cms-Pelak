import {
  buildContentPdfPath,
  buildContentShortPath,
} from "@nextgen-cms/contract/short-links";
import {
  getArticleBySlug,
  getArticleShareMetaBySlug,
  getCurrentContentGroup,
  getRelatedArticles,
  getSiteConfig,
} from "@nextgen-cms/site-data/get-content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetailView } from "@/components/article/ArticleDetailView";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return { title: "محتوا یافت نشد" };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hokmran.example";

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `${baseUrl}/content/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.heroImage.src, alt: article.heroImage.alt }],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const related = await getRelatedArticles(slug, 4);
  const [currentContentGroup, siteConfig, shareMeta] = await Promise.all([
    getCurrentContentGroup(),
    getSiteConfig(),
    getArticleShareMetaBySlug(slug),
  ]);

  const shareUrl = shareMeta
    ? buildContentShortPath(shareMeta.id)
    : `/content/${slug}`;
  const pdfDownloadUrl = shareMeta
    ? buildContentPdfPath(shareMeta.id)
    : undefined;

  return (
    <ArticleDetailView
      article={article}
      shareUrl={shareUrl}
      pdfDownloadUrl={pdfDownloadUrl}
      related={related}
      currentContentGroup={currentContentGroup}
      siteConfig={siteConfig}
    />
  );
}
