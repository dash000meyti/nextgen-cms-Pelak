"use client";

import {
  QUOTE_ATTRIBUTION_CLASS,
  QUOTE_CLASS,
  QUOTE_CONTENT_CLASS,
} from "@/components/article/blockStyles";
import { BlockPlainInput } from "../BlockPlainInput";
import { BlockPlainTextarea } from "../BlockPlainTextarea";
import type { BlockEditorProps } from "../blockTypes";

export function QuoteBlock({
  block: rawBlock,
  blockId,
  onChange,
}: BlockEditorProps) {
  if (rawBlock.type !== "quote") return null;
  const block = rawBlock;
  return (
    <blockquote className={`${QUOTE_CLASS} !my-0`}>
      <BlockPlainTextarea
        id={`block-quote-content-${blockId}`}
        value={block.content}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
        rows={2}
        placeholder="متن نقل‌قول…"
        className={QUOTE_CONTENT_CLASS}
      />
      <BlockPlainInput
        id={`block-quote-attribution-${blockId}`}
        value={block.attribution ?? ""}
        onChange={(e) =>
          onChange({ ...block, attribution: e.target.value || undefined })
        }
        placeholder="نسبت (اختیاری)"
        className={QUOTE_ATTRIBUTION_CLASS}
      />
    </blockquote>
  );
}
