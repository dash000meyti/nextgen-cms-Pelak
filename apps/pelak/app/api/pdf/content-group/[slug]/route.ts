import {
  getArticleBySlug,
  getContentGroupBySlug,
  getSiteConfig,
} from "@nextgen-cms/site-data/get-content";
import { requireFeatureModule } from "@nextgen-cms/site-data/require-feature-module";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { contentDisposition } from "@/lib/pdf/content-disposition";
import { buildContentGroupPdfHtml } from "@/lib/pdf/html/content-group";
import { renderHtmlToPdf } from "@/lib/pdf/render-html-pdf";
import { resolveArticleBlocks } from "@/lib/pdf/resolve-blocks";
import { getSiteBaseUrl, resolvePdfImageSrc } from "@/lib/pdf/resolve-image";

export const dynamic = "force-dynamic";

type ContentGroupPdfRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(
  _request: Request,
  { params }: ContentGroupPdfRouteProps,
) {
  await requireFeatureModule("contentGroup");

  const { slug } = await params;
  if (!slug.trim()) notFound();

  const [group, siteConfig] = await Promise.all([
    getContentGroupBySlug(slug),
    getSiteConfig(),
  ]);
  if (!group) notFound();

  const siteUrl = getSiteBaseUrl();
  const base = siteUrl.replace(/\/$/, "");
  const canonicalUrl = `${base}/content-group/${group.slug}`;

  const [coverSrc, logoSrc, articles] = await Promise.all([
    resolvePdfImageSrc(group.cover.src, siteUrl),
    resolvePdfImageSrc(siteConfig.logo, siteUrl),
    Promise.all(
      group.articles.map(async (preview) => {
        const article = await getArticleBySlug(preview.slug);
        if (!article) return null;

        const [blocks, authors] = await Promise.all([
          resolveArticleBlocks(article.body, siteUrl),
          Promise.all(
            article.authors.map(async (author) => ({
              name: author.name,
              role: author.role,
              bio: author.bio,
              avatarSrc: await resolvePdfImageSrc(author.avatar.src, siteUrl),
            })),
          ),
        ]);

        return {
          title: article.title,
          subtitle: article.subtitle,
          authors,
          publishedAt: article.publishedAt,
          blocks,
        };
      }),
    ),
  ]);

  const resolvedArticles = articles.filter(
    (entry): entry is NonNullable<typeof entry> => entry !== null,
  );

  try {
    const html = await buildContentGroupPdfHtml({
      slug: group.slug,
      title: group.title,
      publishedAt: group.publishedAt,
      siteName: siteConfig.name,
      canonicalUrl,
      logoSrc,
      coverSrc,
      articles: resolvedArticles,
    });

    const pdf = await renderHtmlToPdf(html);
    const filename = `${group.slug}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition("attachment", filename),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "PDF generation failed",
      { status: 500 },
    );
  }
}
