"use client";

import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import {
  listInsertablePaletteRows,
  type InsertableEntry,
} from "./blockRegistry";

type BlockInsertPaletteProps = {
  onSelect: (block: ArticleBlock) => void;
  /** Sticky column: 5 vertical rows (primary + 2 variants). Menu: 5 horizontal columns. */
  layout?: "column" | "menu";
  className?: string;
};

const MAIN_BUTTON =
  "flex size-10 shrink-0 items-center justify-center rounded border border-rule text-ink hover:bg-surface";
/** 19px — two squares in 40px with gap-0.5 (2px) between them */
const SECONDARY_BUTTON =
  "flex size-[19px] shrink-0 items-center justify-center rounded border border-rule text-ink hover:bg-surface";
const MAIN_ICON = "size-5 text-ink-muted";
const SECONDARY_ICON = "size-3 text-ink-muted";

function insertKey(entry: InsertableEntry): string {
  return `${entry.type}-${entry.label}`;
}

function PaletteInsertButton({
  entry,
  size,
  onSelect,
  role,
}: {
  entry: InsertableEntry;
  size: "main" | "secondary";
  onSelect: (block: ArticleBlock) => void;
  role?: "menuitem";
}) {
  const isMain = size === "main";

  return (
    <button
      type="button"
      role={role}
      onClick={() => onSelect(entry.payload)}
      title={entry.label}
      aria-label={entry.label}
      className={isMain ? MAIN_BUTTON : SECONDARY_BUTTON}
    >
      <entry.Icon className={isMain ? MAIN_ICON : SECONDARY_ICON} />
    </button>
  );
}

/** Sticky sidebar: primary on the right, two square variants stacked on the left. */
function PaletteRow({
  main,
  secondary,
  onSelect,
}: {
  main: InsertableEntry;
  secondary: [InsertableEntry, InsertableEntry];
  onSelect: (block: ArticleBlock) => void;
}) {
  return (
    <div className="flex flex-row gap-0.5">
      <PaletteInsertButton entry={main} size="main" onSelect={onSelect} />
      <div className="flex h-10 flex-col justify-center gap-0.5">
        {secondary.map((entry) => (
          <PaletteInsertButton
            key={insertKey(entry)}
            entry={entry}
            size="secondary"
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

/** Popover menu: primary on top, two square variants side by side below. */
function PaletteColumn({
  main,
  secondary,
  onSelect,
}: {
  main: InsertableEntry;
  secondary: [InsertableEntry, InsertableEntry];
  onSelect: (block: ArticleBlock) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <PaletteInsertButton
        entry={main}
        size="main"
        onSelect={onSelect}
        role="menuitem"
      />
      <div className="flex flex-row gap-0.5">
        {secondary.map((entry) => (
          <PaletteInsertButton
            key={insertKey(entry)}
            entry={entry}
            size="secondary"
            onSelect={onSelect}
            role="menuitem"
          />
        ))}
      </div>
    </div>
  );
}

export function BlockInsertPalette({
  onSelect,
  layout = "column",
  className = "",
}: BlockInsertPaletteProps) {
  const rows = listInsertablePaletteRows();

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
        <div className="flex flex-row gap-2">
          {rows.map((row) => (
            <PaletteColumn
              key={insertKey(row.main)}
              main={row.main}
              secondary={row.secondary}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      role="toolbar"
      className={className}
      aria-label="افزودن بلوک"
    >
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <PaletteRow
            key={insertKey(row.main)}
            main={row.main}
            secondary={row.secondary}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
