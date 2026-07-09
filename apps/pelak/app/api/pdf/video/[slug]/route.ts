import {
  getSiteConfig,
  getVideoBySlug,
} from "@nextgen-cms/site-data/get-content";
import { requireFeatureModule } from "@nextgen-cms/site-data/require-feature-module";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { contentDisposition } from "@/lib/pdf/content-disposition";
import { buildVideoPdfHtml } from "@/lib/pdf/html/video";
import { renderHtmlToPdf } from "@/lib/pdf/render-html-pdf";
import { getSiteBaseUrl, resolvePdfImageSrc } from "@/lib/pdf/resolve-image";
import {
  decodeSlugSegment,
  encodeSlugSegment,
  findBySlugCandidates,
} from "@/lib/slug";

export const dynamic = "force-dynamic";

type VideoPdfRouteProps = {
  params: Promise<{ slug: string }>;
};

function pdfErrorResponse(message: string, status = 500) {
  return NextResponse.json(
    { error: "PDF generation failed", message },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}

export async function GET(_request: Request, { params }: VideoPdfRouteProps) {
  await requireFeatureModule("video");

  const { slug } = await params;
  const decodedSlug = decodeSlugSegment(slug);
  if (!decodedSlug.trim()) notFound();

  const [resolved, siteConfig] = await Promise.all([
    findBySlugCandidates(slug, getVideoBySlug),
    getSiteConfig(),
  ]);
  const video = resolved.entity;
  if (!video) notFound();
  if (decodedSlug !== video.slug) {
    return NextResponse.redirect(
      `/api/pdf/video/${encodeSlugSegment(video.slug)}`,
      {
        status: 301,
      },
    );
  }

  try {
    const siteUrl = getSiteBaseUrl();
    const base = siteUrl.replace(/\/$/, "");
    const canonicalUrl = `${base}/video`;
    const thumbnailSrc = await resolvePdfImageSrc(video.thumbnail.src, siteUrl);
    const logoSrc = await resolvePdfImageSrc(siteConfig.logo, siteUrl);
    const html = await buildVideoPdfHtml({
      title: video.title,
      description: video.description,
      duration: video.duration,
      publishedAt: video.publishedAt,
      siteName: siteConfig.name,
      canonicalUrl,
      logoSrc,
      thumbnailSrc,
      externalLink: video.externalLink || undefined,
      playlists: video.playlists.map((playlist) => playlist.name),
    });
    const pdf = await renderHtmlToPdf(html);
    const filename = `${video.slug}.pdf`;

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
    console.error(`PDF generation failed (video=${slug}):`, error);
    return pdfErrorResponse(message);
  }
}
