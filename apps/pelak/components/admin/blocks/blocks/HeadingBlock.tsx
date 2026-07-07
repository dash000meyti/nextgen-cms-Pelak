"use client";

import type { HeadingLevel } from "@nextgen-cms/contract/types/article";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import type { BlockEditorProps, BlockSettingsProps } from "../blockTypes";

const LEVELS: Array<{ level: HeadingLevel; label: string }> = [
  { level: 2, label: "H2" },
  { level: 3, label: "H3" },
  { level: 4, label: "H4" },
];

function pillClass(active: boolean): string {
  return [
    "rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors",
    active
      ? "border-accent bg-accent-soft text-accent"
      : "border-rule text-ink-muted hover:bg-surface-2",
  ].join(" ");
}

export function HeadingSettings({ block, onChange }: BlockSettingsProps) {
  if (block.type !== "heading") return null;
  return (
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
            className={pillClass(active)}
          >
            {label}
          </button>
        );
      })}
    </fieldset>
  );
}

export function HeadingBlock({
  block: rawBlock,
  blockId,
  onChange,
}: BlockEditorProps) {
  if (rawBlock.type !== "heading") return null;
  const block = rawBlock;
  return (
    <TextareaField
      id={`block-heading-${blockId}`}
      value={block.content}
      onChange={(content) => onChange({ ...block, content })}
      rows={2}
      placeholder="متن عنوان…"
    />
  );
}
