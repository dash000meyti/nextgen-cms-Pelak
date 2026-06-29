"use client";

import { useEffect, useState } from "react";

type ShareBarProps = {
  title: string;
  shareUrl: string;
  variant?: "inline" | "sidebar";
};

function toAbsoluteUrl(shareUrl: string) {
  if (shareUrl.startsWith("http")) return shareUrl;
  return `${window.location.origin}${shareUrl}`;
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

function EmailIcon({ size = 14 }: { size?: number }) {
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
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function buildMailtoHref(title: string, absoluteShareUrl: string) {
  return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(absoluteShareUrl)}`;
}

export function ShareBar({
  title,
  shareUrl,
  variant = "inline",
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [absoluteShareUrl, setAbsoluteShareUrl] = useState(shareUrl);

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

  const buttonClass =
    "rounded-full border border-rule text-xs text-ink-muted transition-colors hover:border-accent hover:text-accent";

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
          <a
            href={buildMailtoHref(title, absoluteShareUrl)}
            className={`${buttonClass} flex flex-col items-center gap-1 px-3 py-2 text-center`}
          >
            <EmailIcon />
            ایمیل
          </a>
        </div>
      </nav>
    );
  }

  return (
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
        <a
          href={buildMailtoHref(title, absoluteShareUrl)}
          className={`${buttonClass} inline-flex items-center gap-1.5 px-4 py-1.5`}
        >
          <EmailIcon />
          ایمیل
        </a>
      </div>
    </div>
  );
}
