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
    <div className="space-y-2">
      <TextareaField
        id={`block-quote-content-${blockId}`}
        label="نقل‌قول"
        value={block.content}
        onChange={(content) => onChange({ ...block, content })}
        rows={3}
        placeholder="متن نقل‌قول…"
      />
      <TextField
        id={`block-quote-attribution-${blockId}`}
        label="نسبت (اختیاری)"
        value={block.attribution ?? ""}
        onChange={(attribution) => onChange({ ...block, attribution })}
        placeholder="نام گوینده یا منبع"
      />
    </div>
  );
}
