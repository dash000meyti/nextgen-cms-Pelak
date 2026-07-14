"use client";

import type { ListVariant } from "@nextgen-cms/contract/types/article";
import { useRef } from "react";
import { listVariantClass } from "@/components/article/blockStyles";
import { BlockPlainInput } from "../BlockPlainInput";
import type { BlockEditorProps, BlockSettingsProps } from "../blockTypes";

const VARIANT_LABEL: Record<ListVariant, string> = {
  bullet: "نقطه‌ای",
  ordered: "شماره‌دار",
  dash: "خط تیره",
};

const VARIANTS: ListVariant[] = ["bullet", "ordered", "dash"];

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
    <fieldset className="flex flex-col gap-1" aria-label="نوع لیست">
      <legend className="sr-only">نوع لیست</legend>
      {VARIANTS.map((variant) => {
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
  const ListTag = block.variant === "ordered" ? "ol" : "ul";

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
    <div>
      <ListTag className={`${listVariantClass(block.variant)} !my-0`}>
        {items.map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: list item order is authoritative; content may duplicate
          <li key={index} className="group/item">
            <div className="flex items-center gap-2">
              <BlockPlainInput
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
                className="text-base leading-relaxed text-ink"
              />
              {items.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  aria-label="حذف مورد"
                  className="rounded px-1 text-xs text-ink-muted opacity-0 transition-opacity hover:bg-surface-2 group-hover/item:opacity-100 group-focus-within/item:opacity-100"
                >
                  ×
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ListTag>
    </div>
  );
}
