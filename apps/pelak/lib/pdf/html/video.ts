import { formatPdfDate } from "@/lib/pdf/format";
import { escapeHtml } from "@/lib/pdf/html/escape";
import { getPdfFontCss } from "@/lib/pdf/html/fonts";
import { pdfBaseStyles } from "@/lib/pdf/html/styles";

export type VideoPdfInput = {
  title: string;
  description: string;
  duration: string;
  publishedAt: string;
  siteName: string;
  canonicalUrl: string;
  logoSrc?: string;
  thumbnailSrc?: string;
  externalLink?: string;
  playlists: string[];
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

export async function buildVideoPdfHtml(input: VideoPdfInput): Promise<string> {
  const fontCss = await getPdfFontCss();
  const thumbnail = input.thumbnailSrc
    ? `<img class="hero" src="${input.thumbnailSrc}" alt="" />`
    : "";
  const playlistsLine =
    input.playlists.length > 0
      ? `<p class="meta">لیست‌های پخش: ${escapeHtml(input.playlists.join("، "))}</p>`
      : "";
  const linkLine = input.externalLink
    ? `<p class="meta">لینک ویدیو: <a href="${escapeHtml(input.externalLink)}">${escapeHtml(input.externalLink)}</a></p>`
    : "";
  const metaLine = [formatPdfDate(input.publishedAt), input.duration]
    .filter(Boolean)
    .join(" — ");

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
    ${thumbnail}
    <h1 class="title">${escapeHtml(input.title)}</h1>
    <p class="meta">${escapeHtml(metaLine)}</p>
    <div class="divider"></div>
    <main class="body">
      <p>${escapeHtml(input.description)}</p>
      ${playlistsLine}
      ${linkLine}
    </main>
  </body>
</html>`;
}
