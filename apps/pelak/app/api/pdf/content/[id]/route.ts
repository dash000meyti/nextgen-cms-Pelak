import {
  getMemberSettings,
  getPublishedArticleById,
  getSiteConfig,
} from "@nextgen-cms/site-data/get-content";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { contentDisposition } from "@/lib/pdf/content-disposition";
import { formatPdfAuthors, formatPdfDate } from "@/lib/pdf/format";
import { buildArticlePdfHtml } from "@/lib/pdf/html/article";
import { renderHtmlToPdf } from "@/lib/pdf/render-html-pdf";
import { resolveArticleBlocks } from "@/lib/pdf/resolve-blocks";
import { getSiteBaseUrl, resolvePdfImageSrc } from "@/lib/pdf/resolve-image";

export const dynamic = "force-dynamic";

type ContentPdfRouteProps = {
  params: Promise<{ id: string }>;
};

function pdfErrorResponse(message: string, status = 500) {
  return new NextResponse(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(_request: Request, { params }: ContentPdfRouteProps) {
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);
  if (Number.isNaN(id) || id <= 0) notFound();

  const result = await getPublishedArticleById(id);
  if (!result) notFound();

  const { article, slug } = result;

  try {
    const [siteConfig, memberSettings] = await Promise.all([
      getSiteConfig(),
      getMemberSettings(),
    ]);

    const siteUrl = getSiteBaseUrl();
    const base = siteUrl.replace(/\/$/, "");
    const articleUrl = `${base}/content/${slug}`;

    const [blocks, heroSrc, logoSrc, authors] = await Promise.all([
      resolveArticleBlocks(article.body, siteUrl),
      resolvePdfImageSrc(article.heroImage.src, siteUrl),
      resolvePdfImageSrc(siteConfig.logo, siteUrl),
      Promise.all(
        article.authors.map(async (author) => ({
          name: author.name,
          role: author.role,
          bio: author.bio,
          avatarSrc: await resolvePdfImageSrc(author.avatar.src, siteUrl),
        })),
      ),
    ]);

    const authorsLine = formatPdfAuthors(article.authors);
    const dateLine = formatPdfDate(article.publishedAt);
    const readingLine =
      article.readingMinutes > 0
        ? `${article.readingMinutes.toLocaleString("fa-IR")} دقیقه مطالعه`
        : "";
    const metaParts = [authorsLine, dateLine, readingLine].filter(Boolean);

    const html = await buildArticlePdfHtml({
      title: article.title,
      subtitle: article.subtitle,
      authors,
      publishedAt: article.publishedAt,
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
    const filename = `${slug}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition("attachment", filename),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "تولید PDF با خطا مواجه شد.";
    console.error(`PDF generation failed (id=${id}, slug=${slug}):`, error);
    return pdfErrorResponse(message);
  }
}
