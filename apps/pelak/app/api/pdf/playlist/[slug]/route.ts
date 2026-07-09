import {
  getPlaylistBySlug,
  getSiteConfig,
  getVideosByPlaylist,
} from "@nextgen-cms/site-data/get-content";
import { requireFeatureModule } from "@nextgen-cms/site-data/require-feature-module";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { contentDisposition } from "@/lib/pdf/content-disposition";
import { buildPlaylistPdfHtml } from "@/lib/pdf/html/playlist";
import { renderHtmlToPdf } from "@/lib/pdf/render-html-pdf";
import { getSiteBaseUrl, resolvePdfImageSrc } from "@/lib/pdf/resolve-image";
import {
  decodeSlugSegment,
  encodeSlugSegment,
  findBySlugCandidates,
} from "@/lib/slug";

export const dynamic = "force-dynamic";

type PlaylistPdfRouteProps = {
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

export async function GET(
  _request: Request,
  { params }: PlaylistPdfRouteProps,
) {
  await requireFeatureModule("video");

  const { slug } = await params;
  const decodedSlug = decodeSlugSegment(slug);
  if (!decodedSlug.trim()) notFound();

  const [resolved, siteConfig] = await Promise.all([
    findBySlugCandidates(slug, getPlaylistBySlug),
    getSiteConfig(),
  ]);
  const playlist = resolved.entity;
  if (!playlist) notFound();
  if (decodedSlug !== playlist.slug) {
    return NextResponse.redirect(
      `/api/pdf/playlist/${encodeSlugSegment(playlist.slug)}`,
      { status: 301 },
    );
  }

  try {
    const siteUrl = getSiteBaseUrl();
    const base = siteUrl.replace(/\/$/, "");
    const canonicalUrl = `${base}/playlists/${playlist.slug}`;

    const [coverSrc, logoSrc, videos] = await Promise.all([
      resolvePdfImageSrc(playlist.cover.src, siteUrl),
      resolvePdfImageSrc(siteConfig.logo, siteUrl),
      getVideosByPlaylist(playlist.slug),
    ]);

    const html = await buildPlaylistPdfHtml({
      title: playlist.name,
      description: playlist.description,
      siteName: siteConfig.name,
      canonicalUrl,
      logoSrc,
      coverSrc,
      videos: videos.map((video) => ({
        title: video.title,
        description: video.description,
        duration: video.duration,
        publishedAt: video.publishedAt,
      })),
    });
    const pdf = await renderHtmlToPdf(html);
    const filename = `${playlist.slug}.pdf`;

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
    console.error(`PDF generation failed (playlist=${slug}):`, error);
    return pdfErrorResponse(message);
  }
}
