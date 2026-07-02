export const pdfBaseStyles = `
  :root {
    --paper: #ffffff;
    --surface: #faf8f6;
    --ink: #14110f;
    --ink-muted: #5c5752;
    --ink-faint: #8a847d;
    --accent: #8b0016;
    --accent-soft: #f4e8ea;
    --rule: #e6e2dd;
  }

  * { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    background: var(--paper);
    color: var(--ink);
    font-family: "IRANSansX", sans-serif;
    font-size: 11pt;
    line-height: 1.75;
    direction: rtl;
    text-align: right;
  }

  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }

  .header {
    border-bottom: 1px solid var(--rule);
    padding-bottom: 12px;
    margin-bottom: 20px;
  }

  .header-row {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 10px;
  }

  .logo { height: 28px; width: auto; max-width: 140px; object-fit: contain; }
  .site-name { font-weight: 700; font-size: 12pt; color: var(--accent); }
  .view-on-site { font-size: 10pt; color: var(--accent); text-decoration: underline; }

  .hero {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 6px;
    margin-bottom: 20px;
  }

  .title {
    font-weight: 700;
    font-size: 22pt;
    line-height: 1.45;
    margin: 0 0 8px;
  }

  .subtitle {
    font-size: 13pt;
    color: var(--ink-muted);
    margin: 0 0 12px;
  }

  .meta {
    font-size: 10pt;
    color: var(--ink-faint);
    margin: 0 0 20px;
  }

  .divider {
    border-bottom: 1px solid var(--rule);
    margin: 0 0 20px;
  }

  .body p {
    margin: 0 0 12px;
  }

  .body h2 {
    font-weight: 700;
    font-size: 16pt;
    line-height: 1.45;
    margin: 20px 0 10px;
    padding-right: 12px;
    border-right: 3px solid var(--accent);
  }

  .body blockquote {
    margin: 14px 0;
    padding: 8px 16px 8px 0;
    background: var(--accent-soft);
    border-right: 3px solid var(--accent);
  }

  .body blockquote footer {
    margin-top: 6px;
    font-size: 9pt;
    color: var(--ink-muted);
  }

  .body figure {
    margin: 16px 0;
  }

  .body figure img {
    width: 100%;
    max-height: 280px;
    object-fit: cover;
    border-radius: 6px;
  }

  .body figcaption {
    margin-top: 6px;
    font-size: 9pt;
    color: var(--ink-muted);
  }

  .authors {
    margin-top: 28px;
    padding-top: 16px;
    border-top: 1px solid var(--rule);
  }

  .authors h2 {
    font-size: 14pt;
    font-weight: 700;
    margin: 0 0 14px;
  }

  .author-card {
    display: flex;
    flex-direction: row-reverse;
    gap: 12px;
    margin-bottom: 14px;
    padding: 12px;
    background: var(--surface);
    border: 1px solid var(--rule);
    border-radius: 6px;
  }

  .author-card img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .author-name { font-weight: 700; font-size: 12pt; margin: 0; }
  .author-role { font-size: 9pt; color: var(--accent); margin: 4px 0 0; }
  .author-bio { font-size: 10pt; color: var(--ink-muted); margin: 8px 0 0; line-height: 1.6; }

  .cover-page { page-break-after: always; }
  .article-page { page-break-before: always; }
  .cover-image {
    width: 180px;
    height: 250px;
    object-fit: cover;
    border-radius: 6px;
    margin-bottom: 20px;
  }
`.trim();
