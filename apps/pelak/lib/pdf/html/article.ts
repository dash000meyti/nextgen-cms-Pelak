import { formatPdfAuthors, formatPdfDate } from "@/lib/pdf/format";
import { renderBlocksHtml } from "@/lib/pdf/html/blocks";
import { escapeHtml } from "@/lib/pdf/html/escape";
import { getPdfFontCss } from "@/lib/pdf/html/fonts";
import { pdfBaseStyles } from "@/lib/pdf/html/styles";
import type { ResolvedBlock } from "@/lib/pdf/resolve-blocks";

export type PdfAuthor = {
  name: string;
  role: string;
  bio?: string;
  avatarSrc?: string;
};

export type ArticlePdfInput = {
  title: string;
  subtitle?: string;
  authors: PdfAuthor[];
  publishedAt: string;
  siteName: string;
  siteUrl: string;
  canonicalUrl: string;
  logoSrc?: string;
  heroSrc?: string;
  blocks: ResolvedBlock[];
  metaLine?: string;
  authorsHeading?: string;
};

function renderAuthorsHtml(
  authors: PdfAuthor[],
  heading = "نویسندگان",
): string {
  if (authors.length === 0) return "";

  const cards = authors
    .map((author) => {
      const avatar = author.avatarSrc
        ? `<img src="${author.avatarSrc}" alt="${escapeHtml(author.name)}" />`
        : "";
      const bio = author.bio
        ? `<p class="author-bio">${escapeHtml(author.bio)}</p>`
        : "";

      return `
        <article class="author-card">
          ${avatar}
          <div>
            <p class="author-name">${escapeHtml(author.name)}</p>
            <p class="author-role">${escapeHtml(author.role)}</p>
            ${bio}
          </div>
        </article>
      `.trim();
    })
    .join("\n");

  return `
    <section class="authors">
      <h2>${escapeHtml(heading)}</h2>
      ${cards}
    </section>
  `.trim();
}

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
        <a class="view-on-site" href="${escapeHtml(input.canonicalUrl)}">مشاهده این مطلب در سایت</a>
      </div>
    </header>
  `.trim();
}

export async function buildArticlePdfHtml(input: ArticlePdfInput): Promise<string> {
  const fontCss = await getPdfFontCss();
  const meta =
    input.metaLine ??
    [formatPdfAuthors(input.authors), formatPdfDate(input.publishedAt)]
      .filter(Boolean)
      .join(" — ");
  const hero = input.heroSrc
    ? `<img class="hero" src="${input.heroSrc}" alt="" />`
    : "";
  const subtitle = input.subtitle
    ? `<p class="subtitle">${escapeHtml(input.subtitle)}</p>`
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
    ${hero}
    <h1 class="title">${escapeHtml(input.title)}</h1>
    ${subtitle}
    <p class="meta">${escapeHtml(meta)}</p>
    <div class="divider"></div>
    <main class="body">
      ${renderBlocksHtml(input.blocks)}
    </main>
    ${renderAuthorsHtml(input.authors, input.authorsHeading)}
  </body>
</html>`;
}
