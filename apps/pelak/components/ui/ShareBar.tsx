"use client";

import { useEffect, useState } from "react";

type ShareBarProps = {
  title: string;
  shareUrl: string;
  pdfDownloadUrl?: string;
  pdfFilename?: string;
  variant?: "inline" | "sidebar";
};

function toAbsoluteUrl(shareUrl: string) {
  if (shareUrl.startsWith("http")) return shareUrl;
  return `${window.location.origin}${shareUrl}`;
}

function pdfUrlPath(url: string): string {
  if (url.startsWith("http")) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
  return url;
}

function isGeneratedPdfUrl(url: string): boolean {
  return pdfUrlPath(url).startsWith("/api/pdf/");
}

function LinkIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function DownloadIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4v10m0 0 3.5-3.5M12 14l-3.5-3.5M5 18h14" />
    </svg>
  );
}

async function readPdfErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const data = (await response.json()) as { message?: string };
      if (data.message) return data.message;
    } catch {
      // fall through
    }
  }
  try {
    const text = await response.text();
    if (text.trim()) return text.trim();
  } catch {
    // fall through
  }
  return "تولید PDF با خطا مواجه شد.";
}

export function ShareBar({
  title,
  shareUrl,
  pdfDownloadUrl,
  pdfFilename,
  variant = "inline",
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [absoluteShareUrl, setAbsoluteShareUrl] = useState(shareUrl);
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const staticPdfUrl =
    pdfDownloadUrl && !isGeneratedPdfUrl(pdfDownloadUrl)
      ? pdfDownloadUrl
      : undefined;
  const generatedPdfUrl =
    pdfDownloadUrl && isGeneratedPdfUrl(pdfDownloadUrl)
      ? pdfDownloadUrl
      : undefined;
  const downloadFilename = pdfFilename ?? "download.pdf";

  useEffect(() => {
    setAbsoluteShareUrl(toAbsoluteUrl(shareUrl));
  }, [shareUrl]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(absoluteShareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleGeneratedPdfDownload() {
    if (!generatedPdfUrl || downloading) return;

    setPdfError(null);
    setDownloading(true);

    try {
      const response = await fetch(generatedPdfUrl);
      if (!response.ok) {
        const message = await readPdfErrorMessage(response);
        setPdfError(message);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = downloadFilename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setPdfError("دانلود PDF انجام نشد.");
    } finally {
      setDownloading(false);
    }
  }

  const buttonClass =
    "rounded-full border border-rule text-xs text-ink-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50 disabled:pointer-events-none";

  const pdfButton = staticPdfUrl ? (
    <a
      href={staticPdfUrl}
      download={downloadFilename}
      aria-label={`دانلود PDF: ${title}`}
      className={`${buttonClass} flex flex-col items-center gap-1 px-3 py-2 text-center`}
    >
      <DownloadIcon />
      PDF
    </a>
  ) : generatedPdfUrl ? (
    <button
      type="button"
      onClick={handleGeneratedPdfDownload}
      disabled={downloading}
      aria-label={`دانلود PDF: ${title}`}
      className={`${buttonClass} flex flex-col items-center gap-1 px-3 py-2 text-center`}
    >
      <DownloadIcon />
      {downloading ? "…" : "PDF"}
    </button>
  ) : null;

  const pdfButtonInline = staticPdfUrl ? (
    <a
      href={staticPdfUrl}
      download={downloadFilename}
      aria-label={`دانلود PDF: ${title}`}
      className={`${buttonClass} inline-flex items-center gap-1.5 px-4 py-1.5`}
    >
      <DownloadIcon />
      دانلود PDF
    </a>
  ) : generatedPdfUrl ? (
    <button
      type="button"
      onClick={handleGeneratedPdfDownload}
      disabled={downloading}
      aria-label={`دانلود PDF: ${title}`}
      className={`${buttonClass} inline-flex items-center gap-1.5 px-4 py-1.5`}
    >
      <DownloadIcon />
      {downloading ? "در حال دانلود…" : "دانلود PDF"}
    </button>
  ) : null;

  if (variant === "sidebar") {
    return (
      <nav
        aria-label="اشتراک‌گذاری"
        className="flex flex-col items-center gap-4"
      >
        <span className="text-xs font-medium tracking-wide text-ink-muted uppercase [writing-mode:vertical-rl]">
          اشتراک‌گذاری
        </span>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`${buttonClass} flex flex-col items-center gap-1 px-3 py-2`}
          >
            <LinkIcon />
            {copied ? "کپی" : "لینک"}
          </button>
          {pdfButton}
        </div>
        {pdfError ? (
          <p className="max-w-32 text-center text-xs text-accent">{pdfError}</p>
        ) : null}
      </nav>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium tracking-wide text-ink-muted uppercase">
          اشتراک‌گذاری
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`${buttonClass} inline-flex items-center gap-1.5 px-4 py-1.5`}
          >
            <LinkIcon />
            {copied ? "کپی شد" : "کپی لینک"}
          </button>
          {pdfButtonInline}
        </div>
      </div>
      {pdfError ? <p className="text-xs text-accent">{pdfError}</p> : null}
    </div>
  );
}
