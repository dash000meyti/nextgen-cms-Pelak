"use client";

import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import { normalizeArticleBlock } from "@nextgen-cms/contract/types/article";
import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";
import { useState } from "react";
import { BlockDragList } from "./BlockDragList";
import { InsertionMenu } from "./BlockInsertMenu";
import { BlockInsertPalette } from "./BlockInsertPalette";
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
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  function commit(next: EditorBlock[]) {
    setBlocks(next);
    onChange(toArticleBlocks(next));
  }

  function append(block: ArticleBlock) {
    commit([...blocks, { ...block, _key: crypto.randomUUID() }]);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto]" data-field="body">
      <div className="min-w-0 space-y-3">
        {blocks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-rule px-4 py-10 text-center">
            <p className="text-sm text-ink-muted">بلوکی اضافه نشده است.</p>
            <p className="mt-1 text-xs text-ink-faint">
              با دکمه‌های کناری یا «افزودن» اضافه کنید.
            </p>
          </div>
        ) : (
          <BlockDragList
            blocks={blocks}
            onChange={commit}
            uploadContext={uploadContext}
          />
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setAddMenuOpen((open) => !open)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-rule bg-surface-2 px-4 py-3 text-sm text-ink-muted hover:border-accent hover:text-accent"
          >
            <PlusIcon className="h-4 w-4" />
            افزودن
          </button>
          {addMenuOpen ? (
            <div className="absolute start-0 end-0 top-full z-30 mt-1 flex justify-center">
              <InsertionMenu
                onSelect={(block) => {
                  setAddMenuOpen(false);
                  append(block);
                }}
                onClose={() => setAddMenuOpen(false)}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="lg:sticky lg:top-[40dvh] lg:self-start">
        <div className="flex flex-row flex-wrap gap-1.5 lg:flex-col">
          <BlockInsertPalette onSelect={append} layout="column" />
        </div>
      </div>
    </div>
  );
}
