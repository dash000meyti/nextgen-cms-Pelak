import { buildContentGroupPdfFilename } from "@nextgen-cms/core/media/content-group-pdf";
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
import {
  decodeSlugSegment,
  encodeSlugSegment,
  findBySlugCandidates,
} from "@/lib/slug";

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
  const decodedSlug = decodeSlugSegment(slug);
  if (!decodedSlug.trim()) notFound();

  const [resolved, siteConfig] = await Promise.all([
    findBySlugCandidates(slug, getContentGroupBySlug),
    getSiteConfig(),
  ]);
  const group = resolved.entity;
  if (!group) notFound();
  if (decodedSlug !== group.slug) {
    return NextResponse.redirect(
      `/api/pdf/content-group/${encodeSlugSegment(group.slug)}`,
      { status: 301 },
    );
  }

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
    const filename = buildContentGroupPdfFilename(group.title, group.slug);

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition("attachment", filename),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    const fallbackFilename = buildContentGroupPdfFilename(
      group.title,
      group.slug,
    );
    return NextResponse.json(
      {
        error: "PDF generation failed",
        message:
          error instanceof Error ? error.message : "PDF generation failed",
        filename: fallbackFilename,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  }
}
