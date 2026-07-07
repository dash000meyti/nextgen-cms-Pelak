"use client";

import { TextareaField } from "@/components/admin/fields/TextareaField";
import type { BlockEditorProps } from "../blockTypes";

export function ParagraphBlock({
  block: rawBlock,
  blockId,
  onChange,
}: BlockEditorProps) {
  if (rawBlock.type !== "paragraph") return null;
  const block = rawBlock;
  return (
    <TextareaField
      id={`block-paragraph-${blockId}`}
      value={block.content}
      onChange={(content) => onChange({ ...block, content })}
      rows={5}
      placeholder="متن پاراگراف…"
    />
  );
}
