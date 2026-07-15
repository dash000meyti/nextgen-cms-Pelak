"use client";

import type { HeadingLevel } from "@nextgen-cms/contract/types/article";
import { HEADING_CLASS } from "@/components/article/blockStyles";
import { BlockPlainTextarea } from "../BlockPlainTextarea";
import type { BlockEditorProps, BlockSettingsProps } from "../blockTypes";
import { Heading2Icon, Heading3Icon, Heading4Icon } from "../icons";

const LEVELS: Array<{
  level: HeadingLevel;
  label: string;
  title: string;
  Icon: typeof Heading2Icon;
}> = [
  { level: 2, label: "H2", title: "عنوان (سطح ۲)", Icon: Heading2Icon },
  { level: 3, label: "H3", title: "زیرعنوان (سطح ۳)", Icon: Heading3Icon },
  { level: 4, label: "H4", title: "ریزعنوان (سطح ۴)", Icon: Heading4Icon },
];

function iconBtnClass(active: boolean): string {
  return [
    "inline-flex items-center justify-center rounded border p-1 transition-colors",
    active
      ? "border-accent bg-accent-soft text-accent"
      : "border-rule text-ink-muted hover:bg-surface-2",
  ].join(" ");
}

export function HeadingSettings({ block, onChange }: BlockSettingsProps) {
  if (block.type !== "heading") return null;
  return (
    <fieldset className="flex flex-col gap-1" aria-label="سطح عنوان">
      <legend className="sr-only">سطح عنوان</legend>
      {LEVELS.map(({ level, label, title, Icon }) => {
        const active = block.level === level;
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange({ ...block, level })}
            aria-label={label}
            aria-pressed={active}
            title={title}
            className={iconBtnClass(active)}
          >
            <Icon className="h-3.5 w-3.5" />
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
  const className = [
    HEADING_CLASS[block.level] ?? HEADING_CLASS[2],
    "!mt-0 !mb-0",
  ].join(" ");
  return (
    <BlockPlainTextarea
      id={`block-heading-${blockId}`}
      value={block.content}
      onChange={(e) => onChange({ ...block, content: e.target.value })}
      rows={1}
      placeholder="متن عنوان…"
      className={className}
    />
  );
}
