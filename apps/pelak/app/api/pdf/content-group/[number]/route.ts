import {
  getArticleBySlug,
  getContentGroupByNumber,
  getSiteConfig,
} from "@nextgen-cms/site-data/get-content";
import { requireFeatureModule } from "@nextgen-cms/site-data/require-feature-module";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { buildContentGroupPdfHtml } from "@/lib/pdf/html/content-group";
import { resolveArticleBlocks } from "@/lib/pdf/resolve-blocks";
import { renderHtmlToPdf } from "@/lib/pdf/render-html-pdf";
import { getSiteBaseUrl, resolvePdfImageSrc } from "@/lib/pdf/resolve-image";

export const dynamic = "force-dynamic";

type ContentGroupPdfRouteProps = {
  params: Promise<{ number: string }>;
};

export async function GET(
  _request: Request,
  { params }: ContentGroupPdfRouteProps,
) {
  await requireFeatureModule("contentGroup");

  const { number: numberParam } = await params;
  const number = Number.parseInt(numberParam, 10);
  if (Number.isNaN(number) || number <= 0) notFound();

  const [group, siteConfig] = await Promise.all([
    getContentGroupByNumber(number),
    getSiteConfig(),
  ]);
  if (!group) notFound();

  const siteUrl = getSiteBaseUrl();
  const base = siteUrl.replace(/\/$/, "");
  const canonicalUrl = `${base}/content-group/${number}`;

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
      number,
      label: group.label,
      season: group.season,
      year: group.year,
      publishedAt: group.publishedAt,
      siteName: siteConfig.name,
      canonicalUrl,
      logoSrc,
      coverSrc,
      articles: resolvedArticles,
    });

    const pdf = await renderHtmlToPdf(html);
    const filename = `content-group-${number}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
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
