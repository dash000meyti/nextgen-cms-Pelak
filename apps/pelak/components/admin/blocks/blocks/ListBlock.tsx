"use client";

import type { ListVariant } from "@nextgen-cms/contract/types/article";
import { useRef } from "react";
import type { BlockEditorProps, BlockSettingsProps } from "../blockTypes";

const VARIANT_LABEL: Record<ListVariant, string> = {
  bullet: "نقطه‌ای",
  ordered: "شماره‌دار",
};

function pillClass(active: boolean): string {
  return [
    "rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors",
    active
      ? "border-accent bg-accent-soft text-accent"
      : "border-rule text-ink-muted hover:bg-surface-2",
  ].join(" ");
}

export function ListSettings({ block, onChange }: BlockSettingsProps) {
  if (block.type !== "list") return null;
  return (
    <fieldset className="flex items-center gap-1" aria-label="نوع لیست">
      <legend className="sr-only">نوع لیست</legend>
      {(["bullet", "ordered"] as const).map((variant) => {
        const active = block.variant === variant;
        return (
          <button
            key={variant}
            type="button"
            onClick={() => onChange({ ...block, variant })}
            aria-pressed={active}
            className={pillClass(active)}
          >
            {VARIANT_LABEL[variant]}
          </button>
        );
      })}
    </fieldset>
  );
}

export function ListBlock({ block: rawBlock, onChange }: BlockEditorProps) {
  const focusIndexRef = useRef(-1);
  if (rawBlock.type !== "list") return null;
  const block = rawBlock;

  const items = block.items.length > 0 ? block.items : [""];

  function updateItem(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange({ ...block, items: next });
  }

  function addItemAfter(index: number) {
    const next = [...items];
    next.splice(index + 1, 0, "");
    focusIndexRef.current = index + 1;
    onChange({ ...block, items: next });
  }

  function removeItem(index: number) {
    const next = [...items];
    next.splice(index, 1);
    onChange({ ...block, items: next.length === 0 ? [""] : next });
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
      addItemAfter(index);
    } else if (
      e.key === "Backspace" &&
      items[index] === "" &&
      items.length > 1
    ) {
      e.preventDefault();
      removeItem(index);
    }
  }

  return (
    <div className="space-y-1.5">
      <ol
        className={[
          "space-y-1.5 ps-6",
          block.variant === "bullet" ? "list-disc" : "list-decimal",
        ].join(" ")}
      >
        {items.map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: list item order is authoritative; content may duplicate
          <li key={index} className="flex items-center gap-2">
            <input
              ref={(el) => {
                if (focusIndexRef.current === index && el) {
                  el.focus();
                  focusIndexRef.current = -1;
                }
              }}
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              placeholder="مورد لیست…"
              aria-label={`مورد ${index + 1}`}
              className="w-full rounded border border-rule bg-paper px-3 py-1.5 text-sm text-ink outline-none focus:border-accent"
            />
            {items.length > 1 ? (
              <button
                type="button"
                onClick={() => removeItem(index)}
                aria-label="حذف مورد"
                className="rounded border border-rule px-1.5 py-1 text-xs text-ink-muted hover:bg-surface-2"
              >
                ×
              </button>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="text-xs text-ink-faint">
        Enter برای افزودن مورد، Backspace در مورد خالی برای حذف.
      </p>
    </div>
  );
}
