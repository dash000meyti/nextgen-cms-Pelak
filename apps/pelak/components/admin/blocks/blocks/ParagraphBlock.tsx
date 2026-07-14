"use client";

import { EDITOR_PARAGRAPH_CLASS } from "@/components/article/blockStyles";
import { BlockPlainTextarea } from "../BlockPlainTextarea";
import type { BlockEditorProps } from "../blockTypes";

export function ParagraphBlock({
  block: rawBlock,
  blockId,
  onChange,
}: BlockEditorProps) {
  if (rawBlock.type !== "paragraph") return null;
  const block = rawBlock;
  return (
    <BlockPlainTextarea
      id={`block-paragraph-${blockId}`}
      value={block.content}
      onChange={(e) => onChange({ ...block, content: e.target.value })}
      rows={3}
      placeholder="متن پاراگراف…"
      className={EDITOR_PARAGRAPH_CLASS}
    />
  );
}
