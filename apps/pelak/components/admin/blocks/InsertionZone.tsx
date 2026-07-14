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
  /** Hide hover + button (keep drag drop target). Used for trailing zone replaced by permanent CTA. */
  hideWhenIdle?: boolean;
};

export function InsertionZone({
  index,
  onInsert,
  dragActive = false,
  onDropAt,
  hideWhenIdle = false,
}: InsertionZoneProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (hideWhenIdle && !dragActive) {
    return null;
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: HTML5 DnD drop target; the + button handles click insertion.
    <div
      className={[
        "group relative flex items-center transition-all",
        dragActive ? "h-8" : "min-h-5",
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
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={`افزودن بلوک در موقعیت ${index + 1}`}
          className="flex w-full items-center justify-center gap-1 rounded border border-dashed border-rule bg-paper py-1 text-ink-muted opacity-0 transition-opacity hover:border-accent hover:text-accent group-hover:opacity-100"
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </button>
      )}

      {menuOpen ? (
        <div className="absolute start-0 end-0 top-full z-30 mt-1 flex justify-center">
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
