import { formatPdfDate } from "@/lib/pdf/format";
import type { PdfAuthor } from "@/lib/pdf/html/article";
import { renderBlocksHtml } from "@/lib/pdf/html/blocks";
import { escapeHtml } from "@/lib/pdf/html/escape";
import { getPdfFontCss } from "@/lib/pdf/html/fonts";
import { pdfBaseStyles } from "@/lib/pdf/html/styles";
import type { ResolvedBlock } from "@/lib/pdf/resolve-blocks";

export type ContentGroupArticlePdf = {
  title: string;
  subtitle?: string;
  authors: PdfAuthor[];
  publishedAt: string;
  blocks: ResolvedBlock[];
};

export type ContentGroupPdfInput = {
  slug: string;
  title: string;
  publishedAt: string;
  siteName: string;
  canonicalUrl: string;
  logoSrc?: string;
  coverSrc?: string;
  articles: ContentGroupArticlePdf[];
};

function renderAuthorsHtml(authors: PdfAuthor[]): string {
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
      <h2>نویسندگان</h2>
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
        <a class="view-on-site" href="${escapeHtml(input.canonicalUrl)}">مشاهده در سایت</a>
      </div>
    </header>
  `.trim();
}

export async function buildContentGroupPdfHtml(
  input: ContentGroupPdfInput,
): Promise<string> {
  const fontCss = await getPdfFontCss();
  const coverImage = input.coverSrc
    ? `<img class="cover-image" src="${input.coverSrc}" alt="" />`
    : "";

  const articlePages = input.articles
    .map((article) => {
      const articleSubtitle = article.subtitle
        ? `<p class="subtitle">${escapeHtml(article.subtitle)}</p>`
        : "";
      const authors = article.authors
        .map((author) => `${author.name} (${author.role})`)
        .join("، ");
      const meta = [authors, formatPdfDate(article.publishedAt)]
        .filter(Boolean)
        .join(" — ");

      return `
        <section class="article-page">
          <h1 class="title">${escapeHtml(article.title)}</h1>
          ${articleSubtitle}
          <p class="meta">${escapeHtml(meta)}</p>
          <div class="divider"></div>
          <main class="body">
            ${renderBlocksHtml(article.blocks)}
          </main>
          ${renderAuthorsHtml(article.authors)}
        </section>
      `.trim();
    })
    .join("\n");

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
    <section class="cover-page">
      ${coverImage}
      <h1 class="title">${escapeHtml(input.title)}</h1>
      <p class="meta">${escapeHtml(formatPdfDate(input.publishedAt))}</p>
    </section>
    ${articlePages}
  </body>
</html>`;
}
