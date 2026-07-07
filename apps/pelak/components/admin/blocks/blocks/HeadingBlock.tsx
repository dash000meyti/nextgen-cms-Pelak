"use client";

import type { HeadingLevel } from "@nextgen-cms/contract/types/article";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import type { BlockEditorProps } from "../blockTypes";

const LEVELS: Array<{ level: HeadingLevel; label: string }> = [
  { level: 2, label: "H2" },
  { level: 3, label: "H3" },
  { level: 4, label: "H4" },
];

export function HeadingBlock({
  block: rawBlock,
  blockId,
  onChange,
}: BlockEditorProps) {
  if (rawBlock.type !== "heading") return null;
  const block = rawBlock;
  return (
    <div className="space-y-2">
      <fieldset className="flex items-center gap-1" aria-label="سطح عنوان">
        <legend className="sr-only">سطح عنوان</legend>
        {LEVELS.map(({ level, label }) => {
          const active = block.level === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange({ ...block, level })}
              aria-pressed={active}
              className={[
                "rounded border px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-rule text-ink-muted hover:bg-surface-2",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </fieldset>
      <TextareaField
        id={`block-heading-${blockId}`}
        label="متن عنوان"
        value={block.content}
        onChange={(content) => onChange({ ...block, content })}
        rows={2}
        placeholder="متن عنوان…"
      />
    </div>
  );
}
