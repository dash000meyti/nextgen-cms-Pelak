"use client";

import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import { listInsertableBlocks } from "./blockRegistry";

type BlockInsertPaletteProps = {
  onSelect: (block: ArticleBlock) => void;
  /** Compact sticky column (3 cols × 5 rows of icon buttons). */
  layout?: "column" | "menu";
  className?: string;
};

export function BlockInsertPalette({
  onSelect,
  layout = "column",
  className = "",
}: BlockInsertPaletteProps) {
  const items = listInsertableBlocks();

  if (layout === "menu") {
    return (
      <div
        role="menu"
        className={[
          "w-max rounded-lg border border-rule bg-paper p-2 shadow-lg",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="grid grid-cols-3 gap-1.5">
          {items.map((entry) => (
            <button
              key={`${entry.type}-${entry.label}`}
              type="button"
              role="menuitem"
              onClick={() => onSelect(entry.payload)}
              title={entry.label}
              aria-label={entry.label}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-rule text-ink hover:bg-surface-2"
            >
              <entry.Icon className="h-5 w-5 text-ink-muted" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      role="toolbar"
      className={["grid grid-cols-3 gap-1.5", className]
        .filter(Boolean)
        .join(" ")}
      aria-label="افزودن بلوک"
    >
      {items.map((entry) => (
        <button
          key={`${entry.type}-${entry.label}`}
          type="button"
          onClick={() => onSelect(entry.payload)}
          title={entry.label}
          aria-label={entry.label}
          className="flex h-9 w-9 items-center justify-center rounded border border-rule text-ink hover:bg-surface-2"
        >
          <entry.Icon className="h-5 w-5 text-ink-muted" />
        </button>
      ))}
    </div>
  );
}
