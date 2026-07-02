"use client";

import type {
  ArticlePreview,
  Topic,
} from "@nextgen-cms/contract/types/article";
import Link from "next/link";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleCardGrid } from "@/components/article/ArticleCardGrid";
import { ListPagination } from "@/components/ui/ListPagination";

type ArticleFiltersProps = {
  topics: Topic[];
  articles: ArticlePreview[];
  activeTopic?: string;
  page: number;
  totalPages: number;
};

const ALL = "all";

function topicHref(topic?: string) {
  if (!topic || topic === ALL) return "/content";
  return `/content?topic=${encodeURIComponent(topic)}`;
}

export function ArticleFilters({
  topics,
  articles,
  activeTopic,
  page,
  totalPages,
}: ArticleFiltersProps) {
  const active = activeTopic ?? ALL;

  const chips: Array<{ id: string; label: string; href: string }> = [
    { id: ALL, label: "همه", href: topicHref() },
    ...topics.map((topic) => ({
      id: topic.slug,
      label: topic.name,
      href: topicHref(topic.slug),
    })),
  ];

  return (
    <div className="space-y-8">
      <div className="nav-scroll -mx-1 overflow-x-auto px-1">
        <ul className="flex w-max gap-2">
          {chips.map((chip) => {
            const isActive = active === chip.id;
            return (
              <li key={chip.id} className="shrink-0">
                <Link
                  href={chip.href}
                  className={`inline-block rounded-full border px-3.5 py-1.5 text-xs transition-colors sm:text-sm ${
                    isActive
                      ? "border-accent bg-accent text-paper"
                      : "border-rule text-ink-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  {chip.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <ArticleCardGrid columns={3}>
        {articles.map((article, index) => (
          <ArticleCard
            key={article.slug}
            article={article}
            priority={index < 3}
          />
        ))}
      </ArticleCardGrid>

      {articles.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-muted">
          محتوایی در این موضوع یافت نشد.
        </p>
      ) : null}

      <ListPagination
        page={page}
        totalPages={totalPages}
        basePath="/content"
        query={activeTopic ? { topic: activeTopic } : undefined}
      />
    </div>
  );
}
