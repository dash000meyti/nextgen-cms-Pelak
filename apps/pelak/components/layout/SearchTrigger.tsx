"use client";

import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type SearchTriggerProps = {
  articles: ArticlePreview[];
};

export function SearchTrigger({ articles }: SearchTriggerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="جستجو"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rule text-ink-muted transition-colors hover:border-accent hover:text-accent"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
      {open && mounted
        ? createPortal(
            <SearchOverlay
              articles={articles}
              onClose={() => setOpen(false)}
            />,
            document.body,
          )
        : null}
    </>
  );
}

type SearchOverlayProps = {
  articles: ArticlePreview[];
  onClose: () => void;
};

function SearchOverlay({ articles, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return articles.slice(0, 6);
    return articles
      .filter(
        (article) =>
          article.title.includes(q) ||
          article.subtitle.includes(q) ||
          article.excerpt.includes(q),
      )
      .slice(0, 8);
  }, [query, articles]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="جستجو در محتوا"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm sm:pt-20"
    >
      <button
        type="button"
        aria-label="بستن جستجو"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-lg border border-rule bg-paper shadow-xl">
        <div className="flex items-center gap-3 border-b border-rule px-4 py-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-ink-muted"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجو در محتوا..."
            className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-muted"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="hidden rounded-full border border-rule px-2 py-0.5 text-xs text-ink-muted hover:border-accent hover:text-accent sm:inline-flex"
          >
            esc
          </button>
        </div>

        <ul className="max-h-[60vh] overflow-y-auto sm:max-h-80">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-ink-muted">
              نتیجه‌ای یافت نشد.
            </li>
          ) : (
            results.map((article) => (
              <SearchResultRow
                key={article.slug}
                article={article}
                onClose={onClose}
              />
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

function SearchResultRow({
  article,
  onClose,
}: {
  article: ArticlePreview;
  onClose: () => void;
}) {
  return (
    <li className="border-b border-rule/60 last:border-0">
      <Link
        href={`/content/${article.slug}`}
        onClick={onClose}
        className="block px-4 py-3 transition-colors hover:bg-surface"
      >
        <p className="font-heading text-sm text-ink">{article.title}</p>
        <p className="mt-1 line-clamp-1 text-xs text-ink-muted">
          {article.subtitle}
        </p>
      </Link>
    </li>
  );
}
