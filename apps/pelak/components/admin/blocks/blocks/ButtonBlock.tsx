"use client";

import type { ButtonVariant } from "@nextgen-cms/contract/types/article";
import {
  BUTTON_WRAP_CLASS,
  buttonVariantClass,
} from "@/components/article/blockStyles";
import type { BlockEditorProps, BlockSettingsProps } from "../blockTypes";

const VARIANTS: Array<{ variant: ButtonVariant; label: string }> = [
  { variant: "primary", label: "پررنگ" },
  { variant: "outline", label: "حاشیه‌دار" },
  { variant: "secondary", label: "ثانویه" },
];

function pillClass(active: boolean): string {
  return [
    "rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors",
    active
      ? "border-accent bg-accent-soft text-accent"
      : "border-rule text-ink-muted hover:bg-surface-2",
  ].join(" ");
}

export function ButtonSettings({ block, onChange }: BlockSettingsProps) {
  if (block.type !== "button") return null;
  const variant = block.variant ?? "outline";
  return (
    <fieldset className="flex flex-col gap-1" aria-label="نوع دکمه">
      <legend className="sr-only">نوع دکمه</legend>
      {VARIANTS.map(({ variant: v, label }) => {
        const active = variant === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() =>
              onChange({
                ...block,
                ...(v === "outline" ? { variant: undefined } : { variant: v }),
              })
            }
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

export function ButtonBlock({
  block: rawBlock,
  blockId,
  onChange,
}: BlockEditorProps) {
  if (rawBlock.type !== "button") return null;
  const block = rawBlock;

  return (
    <div
      className={`${BUTTON_WRAP_CLASS} my-0! flex flex-wrap items-center gap-3`}
    >
      <label
        className={`${buttonVariantClass(block.variant)} min-w-28 cursor-text`}
      >
        <span className="sr-only">متن دکمه</span>
        <input
          id={`block-button-label-${blockId}`}
          type="text"
          value={block.label}
          onChange={(e) => onChange({ ...block, label: e.target.value })}
          placeholder="متن دکمه"
          required
          className="w-full min-w-24 bg-transparent text-center text-sm font-medium text-inherit outline-none placeholder:opacity-55"
          size={Math.max(block.label.length, 8)}
        />
      </label>
      <input
        id={`block-button-href-${blockId}`}
        type="url"
        value={block.href}
        onChange={(e) => onChange({ ...block, href: e.target.value })}
        placeholder="لینک — https://… یا /مسیر"
        required
        className="min-w-48 flex-1 rounded border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
      />
    </div>
  );
}
