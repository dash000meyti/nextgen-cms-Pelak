import { formatPdfDate } from "@/lib/pdf/format";
import { escapeHtml } from "@/lib/pdf/html/escape";
import { getPdfFontCss } from "@/lib/pdf/html/fonts";
import { pdfBaseStyles } from "@/lib/pdf/html/styles";

export type PlaylistVideoPdfItem = {
  title: string;
  description: string;
  duration: string;
  publishedAt: string;
};

export type PlaylistPdfInput = {
  title: string;
  description: string;
  siteName: string;
  canonicalUrl: string;
  logoSrc?: string;
  coverSrc?: string;
  videos: PlaylistVideoPdfItem[];
};

function renderHeaderHtml(input: {
  siteName: string;
  canonicalUrl: string;
  logoSrc?: string;
}): string {
  const logo = input.logoSrc
    ? `<a href="${escapeHtml(input.canonicalUrl)}"><img class="logo" src="${input.logoSrc}" alt="${escapeHtml(input.siteName)}" /></a>`
    : `<span class="site-name">${escapeHtml(input.siteName)}</span>`;

  return `
    <header class="header">
      <div class="header-row">
        ${logo}
        <a class="view-on-site" href="${escapeHtml(input.canonicalUrl)}">مشاهده در سایت</a>
      </div>
    </header>
  `.trim();
}

function renderVideoItems(videos: PlaylistVideoPdfItem[]): string {
  if (videos.length === 0) {
    return `<p>ویدیوی منتشرشده‌ای برای این لیست پخش وجود ندارد.</p>`;
  }

  return videos
    .map((video) => {
      const meta = [formatPdfDate(video.publishedAt), video.duration]
        .filter(Boolean)
        .join(" — ");
      return `
        <article class="section">
          <h2>${escapeHtml(video.title)}</h2>
          <p class="meta">${escapeHtml(meta)}</p>
          <p>${escapeHtml(video.description)}</p>
        </article>
      `.trim();
    })
    .join("\n");
}

export async function buildPlaylistPdfHtml(
  input: PlaylistPdfInput,
): Promise<string> {
  const fontCss = await getPdfFontCss();
  const cover = input.coverSrc
    ? `<img class="hero" src="${input.coverSrc}" alt="" />`
    : "";

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(input.title)}</title>
    <style>
      ${fontCss}
      ${pdfBaseStyles}
    </style>
  </head>
  <body>
    ${renderHeaderHtml({
      siteName: input.siteName,
      canonicalUrl: input.canonicalUrl,
      logoSrc: input.logoSrc,
    })}
    ${cover}
    <h1 class="title">${escapeHtml(input.title)}</h1>
    <p>${escapeHtml(input.description)}</p>
    <div class="divider"></div>
    <main class="body">
      ${renderVideoItems(input.videos)}
    </main>
  </body>
</html>`;
}
