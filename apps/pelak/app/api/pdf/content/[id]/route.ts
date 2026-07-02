import {
  getMemberSettings,
  getPublishedArticleById,
  getSiteConfig,
} from "@nextgen-cms/site-data/get-content";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { buildArticlePdfHtml } from "@/lib/pdf/html/article";
import { resolveArticleBlocks } from "@/lib/pdf/resolve-blocks";
import { renderHtmlToPdf } from "@/lib/pdf/render-html-pdf";
import {
  getSiteBaseUrl,
  resolvePdfImageSrc,
} from "@/lib/pdf/resolve-image";
import { formatPdfAuthors, formatPdfDate } from "@/lib/pdf/format";

export const dynamic = "force-dynamic";

type ContentPdfRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: ContentPdfRouteProps) {
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);
  if (Number.isNaN(id) || id <= 0) notFound();

  const result = await getPublishedArticleById(id);
  if (!result) notFound();

  const [siteConfig, memberSettings] = await Promise.all([
    getSiteConfig(),
    getMemberSettings(),
  ]);

  const siteUrl = getSiteBaseUrl();
  const base = siteUrl.replace(/\/$/, "");
  const articleUrl = `${base}/content/${result.slug}`;

  const [blocks, heroSrc, logoSrc, authors] = await Promise.all([
    resolveArticleBlocks(result.article.body, siteUrl),
    resolvePdfImageSrc(result.article.heroImage.src, siteUrl),
    resolvePdfImageSrc(siteConfig.logo, siteUrl),
    Promise.all(
      result.article.authors.map(async (author) => ({
        name: author.name,
        role: author.role,
        bio: author.bio,
        avatarSrc: await resolvePdfImageSrc(author.avatar.src, siteUrl),
      })),
    ),
  ]);

  const authorsLine = formatPdfAuthors(result.article.authors);
  const dateLine = formatPdfDate(result.article.publishedAt);
  const readingLine =
    result.article.readingMinutes > 0
      ? `${result.article.readingMinutes.toLocaleString("fa-IR")} دقیقه مطالعه`
      : "";
  const metaParts = [authorsLine, dateLine, readingLine].filter(Boolean);

  try {
    const html = await buildArticlePdfHtml({
      title: result.article.title,
      subtitle: result.article.subtitle,
      authors,
      publishedAt: result.article.publishedAt,
      siteName: siteConfig.name,
      siteUrl: base,
      canonicalUrl: articleUrl,
      logoSrc,
      heroSrc,
      blocks,
      metaLine: metaParts.join(" — "),
      authorsHeading:
        authors.length === 1
          ? memberSettings.memberLabel
          : memberSettings.membersLabel,
    });

    const pdf = await renderHtmlToPdf(html);
    const filename = `${result.slug}.pdf`;

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
