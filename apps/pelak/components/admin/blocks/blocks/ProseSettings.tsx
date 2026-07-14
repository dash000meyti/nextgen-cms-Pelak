"use client";

import type { BlockType } from "@nextgen-cms/contract/types/article";
import type { BlockSettingsProps } from "../blockTypes";
import { ParagraphIcon, QuestionIcon, QuoteIcon } from "../icons";

const PROSE_OPTIONS: Array<{
  type: Extract<BlockType, "paragraph" | "quote" | "question">;
  label: string;
  Icon: typeof ParagraphIcon;
}> = [
  { type: "paragraph", label: "پاراگراف", Icon: ParagraphIcon },
  { type: "quote", label: "نقل‌قول", Icon: QuoteIcon },
  { type: "question", label: "پرسش", Icon: QuestionIcon },
];

function iconBtnClass(active: boolean, disabled?: boolean): string {
  return [
    "inline-flex items-center justify-center rounded border p-1 transition-colors",
    active
      ? "border-accent bg-accent-soft text-accent"
      : "border-rule text-ink-muted hover:bg-surface-2",
    disabled ? "opacity-40" : "",
  ].join(" ");
}

/** Convert among paragraph / quote / question from Settings chrome. */
export function ProseSettings({
  block,
  onConvert,
  convertDisabled = false,
}: BlockSettingsProps) {
  if (
    block.type !== "paragraph" &&
    block.type !== "quote" &&
    block.type !== "question"
  ) {
    return null;
  }

  return (
    <fieldset className="flex flex-col gap-1" aria-label="نوع متن">
      <legend className="sr-only">نوع متن</legend>
      {PROSE_OPTIONS.map(({ type, label, Icon }) => {
        const active = block.type === type;
        return (
          <button
            key={type}
            type="button"
            disabled={convertDisabled || active}
            onClick={() => {
              if (convertDisabled || active) return;
              onConvert?.(type);
            }}
            aria-label={label}
            aria-pressed={active}
            title={label}
            className={iconBtnClass(active, convertDisabled)}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </fieldset>
  );
}
