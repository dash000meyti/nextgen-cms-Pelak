"use client";

import type { ButtonVariant } from "@nextgen-cms/contract/types/article";
import { TextField } from "@/components/admin/fields/TextField";
import type { BlockEditorProps, BlockSettingsProps } from "../blockTypes";

const VARIANTS: Array<{ variant: ButtonVariant; label: string }> = [
  { variant: "outline", label: "حاشیه‌دار" },
  { variant: "primary", label: "پررنگ" },
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
    <fieldset className="flex items-center gap-1" aria-label="نوع دکمه">
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
                variant: v === "outline" ? undefined : "primary",
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
    <div className="grid gap-2 sm:grid-cols-2">
      <TextField
        id={`block-button-label-${blockId}`}
        value={block.label}
        onChange={(label) => onChange({ ...block, label })}
        placeholder="متن دکمه"
        required
      />
      <TextField
        id={`block-button-href-${blockId}`}
        value={block.href}
        onChange={(href) => onChange({ ...block, href })}
        placeholder="https://… یا /مسیر"
        required
      />
    </div>
  );
}
