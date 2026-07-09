import {
  buildContentPdfPath,
  buildContentShortPath,
} from "@nextgen-cms/contract/short-links";
import {
  getArticleBySlug,
  getArticleShareMetaBySlug,
  getContentGroupModuleSettings,
  getCurrentContentGroup,
  getRelatedArticles,
  getSiteConfig,
} from "@nextgen-cms/site-data/get-content";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ArticleDetailView } from "@/components/article/ArticleDetailView";
import {
  decodeSlugSegment,
  encodeSlugSegment,
  findBySlugCandidates,
} from "@/lib/slug";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { entity: article } = await findBySlugCandidates(
    slug,
    getArticleBySlug,
  );

  if (!article) return { title: "محتوا یافت نشد" };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hokmran.example";

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `${baseUrl}/content/${encodeSlugSegment(article.slug)}`,
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
  const decodedSlug = decodeSlugSegment(slug);
  const { entity: article } = await findBySlugCandidates(
    slug,
    getArticleBySlug,
  );

  if (!article) notFound();
  if (decodedSlug !== article.slug) {
    permanentRedirect(`/content/${encodeSlugSegment(article.slug)}`);
  }

  const related = await getRelatedArticles(article.slug, 4);
  const [
    currentContentGroup,
    siteConfig,
    shareMeta,
    contentGroupModuleSettings,
  ] = await Promise.all([
    getCurrentContentGroup(),
    getSiteConfig(),
    getArticleShareMetaBySlug(article.slug),
    getContentGroupModuleSettings(),
  ]);

  const shareUrl = shareMeta
    ? buildContentShortPath(shareMeta.id)
    : `/content/${encodeSlugSegment(article.slug)}`;
  const pdfDownloadUrl = shareMeta
    ? buildContentPdfPath(shareMeta.id)
    : undefined;
  const pdfFilename = shareMeta ? `${article.slug}.pdf` : undefined;

  return (
    <ArticleDetailView
      article={article}
      shareUrl={shareUrl}
      pdfDownloadUrl={pdfDownloadUrl}
      pdfFilename={pdfFilename}
      related={related}
      currentContentGroup={currentContentGroup}
      contentGroupPageTitle={contentGroupModuleSettings.pageTitle}
      siteConfig={siteConfig}
    />
  );
}
