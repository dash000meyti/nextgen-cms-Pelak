"use client";

import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import { useState } from "react";
import { InsertionMenu } from "./BlockInsertMenu";
import { PlusIcon } from "./icons";

type InsertionZoneProps = {
  index: number;
  onInsert: (index: number, block: ArticleBlock) => void;
  /** Whether a drag is active; zones expand to make dropping easier. */
  dragActive?: boolean;
  onDropAt?: (index: number) => void;
};

export function InsertionZone({
  index,
  onInsert,
  dragActive = false,
  onDropAt,
}: InsertionZoneProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: HTML5 DnD drop target; the + button handles click insertion.
    <div
      className={[
        "group relative flex items-center transition-all",
        dragActive ? "h-8" : "h-5",
      ].join(" ")}
      onDragOver={(e) => {
        if (!onDropAt) return;
        if (e.dataTransfer.types.includes("application/block-index")) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }
      }}
      onDrop={(e) => {
        if (!onDropAt) return;
        if (e.dataTransfer.types.includes("application/block-index")) {
          e.preventDefault();
          onDropAt(index);
        }
      }}
    >
      {dragActive ? (
        <div className="h-0.5 w-full rounded-full bg-accent animate-block-drop-blink" />
      ) : (
        <div className="flex w-full items-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="h-px flex-1 bg-rule" />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={`افزودن بلوک در موقعیت ${index + 1}`}
            className="mx-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-rule bg-paper text-ink-muted hover:border-accent hover:text-accent"
          >
            <PlusIcon className="h-3 w-3" />
          </button>
          <div className="h-px flex-1 bg-rule" />
        </div>
      )}

      {menuOpen ? (
        <div className="absolute start-0 top-full z-30">
          <InsertionMenu
            onSelect={(block) => {
              setMenuOpen(false);
              onInsert(index, block);
            }}
            onClose={() => setMenuOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
