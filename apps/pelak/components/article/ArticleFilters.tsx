"use client";

import type {
  ArticlePreview,
  Topic,
} from "@nextgen-cms/contract/types/article";
import { useMemo, useState } from "react";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleCardGrid } from "@/components/article/ArticleCardGrid";

type ArticleFiltersProps = {
  topics: Topic[];
  articles: ArticlePreview[];
};

const ALL = "all";

export function ArticleFilters({ topics, articles }: ArticleFiltersProps) {
  const [active, setActive] = useState<string>(ALL);

  const filtered = useMemo(() => {
    if (active === ALL) return articles;
    return articles.filter((article) =>
      article.topics.some((topic) => topic.slug === active),
    );
  }, [active, articles]);

  const chips: Array<{ id: string; label: string }> = [
    { id: ALL, label: "همه" },
    ...topics.map((topic) => ({ id: topic.slug, label: topic.name })),
  ];

  return (
    <div className="space-y-8">
      <div className="nav-scroll -mx-1 overflow-x-auto px-1">
        <ul className="flex w-max gap-2">
          {chips.map((chip) => {
            const isActive = active === chip.id;
            return (
              <li key={chip.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setActive(chip.id)}
                  className={`inline-block rounded-full border px-3.5 py-1.5 text-xs transition-colors sm:text-sm ${
                    isActive
                      ? "border-accent bg-accent text-paper"
                      : "border-rule text-ink-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  {chip.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <ArticleCardGrid columns={3}>
        {filtered.map((article, index) => (
          <ArticleCard
            key={article.slug}
            article={article}
            priority={index < 3}
          />
        ))}
      </ArticleCardGrid>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-muted">
          محتوایی در این موضوع یافت نشد.
        </p>
      ) : null}
    </div>
  );
}
