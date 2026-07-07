"use client";

import { TextareaField } from "@/components/admin/fields/TextareaField";
import { TextField } from "@/components/admin/fields/TextField";
import type { BlockEditorProps } from "../blockTypes";

export function QuoteBlock({
  block: rawBlock,
  blockId,
  onChange,
}: BlockEditorProps) {
  if (rawBlock.type !== "quote") return null;
  const block = rawBlock;
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_18rem]">
      <TextareaField
        id={`block-quote-content-${blockId}`}
        value={block.content}
        onChange={(content) => onChange({ ...block, content })}
        rows={2}
        placeholder="متن نقل‌قول…"
      />
      <TextField
        id={`block-quote-attribution-${blockId}`}
        value={block.attribution ?? ""}
        onChange={(attribution) => onChange({ ...block, attribution })}
        placeholder="نسبت (اختیاری)"
      />
    </div>
  );
}
