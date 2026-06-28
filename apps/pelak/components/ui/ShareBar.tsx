"use client";

import { useState } from "react";

type ShareBarProps = {
  title: string;
  shareUrl: string;
  variant?: "inline" | "sidebar";
};

function toAbsoluteUrl(shareUrl: string) {
  if (shareUrl.startsWith("http")) return shareUrl;
  return `${window.location.origin}${shareUrl}`;
}

export function ShareBar({
  title,
  shareUrl,
  variant = "inline",
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(toAbsoluteUrl(shareUrl));
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
            className={`${buttonClass} px-3 py-2`}
          >
            {copied ? "کپی" : "لینک"}
          </button>
          <a
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`}
            className={`${buttonClass} px-3 py-2 text-center`}
          >
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
          className={`${buttonClass} px-4 py-1.5`}
        >
          {copied ? "کپی شد" : "کپی لینک"}
        </button>
        <a
          href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`}
          className={`${buttonClass} px-4 py-1.5`}
        >
          ایمیل
        </a>
      </div>
    </div>
  );
}
