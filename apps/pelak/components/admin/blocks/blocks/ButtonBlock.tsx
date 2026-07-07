"use client";

import type { ButtonVariant } from "@nextgen-cms/contract/types/article";
import { TextField } from "@/components/admin/fields/TextField";
import type { BlockEditorProps } from "../blockTypes";

const VARIANTS: Array<{ variant: ButtonVariant; label: string }> = [
  { variant: "primary", label: "پررنگ" },
  { variant: "outline", label: "حاشیه‌دار" },
];

export function ButtonBlock({
  block: rawBlock,
  blockId,
  onChange,
}: BlockEditorProps) {
  if (rawBlock.type !== "button") return null;
  const block = rawBlock;
  const variant = block.variant ?? "primary";

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <TextField
          id={`block-button-label-${blockId}`}
          label="برچسب دکمه"
          value={block.label}
          onChange={(label) => onChange({ ...block, label })}
          placeholder="متن دکمه"
          required
        />
        <TextField
          id={`block-button-href-${blockId}`}
          label="لینک"
          value={block.href}
          onChange={(href) => onChange({ ...block, href })}
          placeholder="https://… یا /مسیر"
          required
        />
      </div>
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
                  variant: v === "primary" ? undefined : "outline",
                })
              }
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
    </div>
  );
}
