"use client";

import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import { normalizeArticleBlock } from "@nextgen-cms/contract/types/article";
import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";
import { useMemo, useState } from "react";
import { BlockDragList } from "./BlockDragList";
import { listInsertableBlocks } from "./blockRegistry";
import type { EditorBlock } from "./blockTypes";
import { PlusIcon } from "./icons";

type BlockEditorProps = {
  value: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
  uploadContext?: MediaUploadContext;
};

function stableBlockKey(block: ArticleBlock, index: number): string {
  return `block-${index}-${block.type}`;
}

function toEditorBlocks(blocks: ArticleBlock[]): EditorBlock[] {
  return blocks.map((block, index) => ({
    ...normalizeArticleBlock(block),
    _key: stableBlockKey(block, index),
  }));
}

function toArticleBlocks(blocks: EditorBlock[]): ArticleBlock[] {
  return blocks.map(({ _key: _ignored, ...rest }) =>
    normalizeArticleBlock(rest),
  );
}

export function BlockEditor({
  value,
  onChange,
  uploadContext,
}: BlockEditorProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() =>
    toEditorBlocks(value),
  );

  function commit(next: EditorBlock[]) {
    setBlocks(next);
    onChange(toArticleBlocks(next));
  }

  const insertable = useMemo(() => listInsertableBlocks(), []);

  function append(block: ArticleBlock) {
    commit([...blocks, { ...block, _key: crypto.randomUUID() }]);
  }

  return (
    <div className="space-y-3">
      <div className="sticky top-14 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-rule bg-paper py-2">
        <h3 className="text-sm font-medium text-ink">بدنهٔ محتوا</h3>
        <div className="flex flex-wrap gap-1.5">
          {insertable.map((entry) => (
            <button
              key={`${entry.type}-${entry.label}`}
              type="button"
              onClick={() => append(entry.payload)}
              className="flex items-center gap-1.5 rounded border border-rule px-2.5 py-1 text-xs text-ink hover:bg-surface-2"
              title={entry.label}
            >
              <entry.Icon className="h-3.5 w-3.5 text-ink-muted" />
              <span>{entry.label}</span>
              <PlusIcon className="h-3 w-3" />
            </button>
          ))}
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-rule px-4 py-10 text-center">
          <p className="text-sm text-ink-muted">بلوکی اضافه نشده است.</p>
          <p className="mt-1 text-xs text-ink-faint">
            با دکمه‌های بالا یا علامت + بین بلوک‌ها اضافه کنید.
          </p>
        </div>
      ) : (
        <BlockDragList
          blocks={blocks}
          onChange={commit}
          uploadContext={uploadContext}
        />
      )}
    </div>
  );
}
