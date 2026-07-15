"use client";

import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import { normalizeArticleBlock } from "@nextgen-cms/contract/types/article";
import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";
import { useCallback, useEffect, useState } from "react";
import { BlockDragList } from "./BlockDragList";
import { BlockImportPanel } from "./BlockImportPanel";
import { InsertionMenu } from "./BlockInsertMenu";
import { BlockInsertPalette } from "./BlockInsertPalette";
import type { EditorBlock } from "./blockTypes";
import { PlusIcon } from "./icons";

type BlockEditorProps = {
  value: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
  uploadContext?: MediaUploadContext;
  /** When false, palette is omitted — parent renders it (e.g. unified ArticleForm sidebar). */
  showPalette?: boolean;
  onAppendReady?: (append: (block: ArticleBlock) => void) => void;
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
  showPalette = true,
  onAppendReady,
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

  function appendMany(imported: ArticleBlock[]) {
    if (imported.length === 0) return;
    commit([
      ...blocks,
      ...imported.map((block) => ({
        ...normalizeArticleBlock(block),
        _key: crypto.randomUUID(),
      })),
    ]);
  }

  const appendStable = useCallback(
    (block: ArticleBlock) => {
      setBlocks((prev) => {
        const next = [...prev, { ...block, _key: crypto.randomUUID() }];
        onChange(toArticleBlocks(next));
        return next;
      });
    },
    [onChange],
  );

  useEffect(() => {
    if (!onAppendReady) return;
    onAppendReady(appendStable);
  }, [appendStable, onAppendReady]);

  const content = (
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

      <BlockImportPanel onImport={appendMany} />
    </div>
  );

  if (!showPalette) {
    return <div data-field="body">{content}</div>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto]" data-field="body">
      {content}

      <div className="lg:sticky lg:top-[40dvh] lg:self-start">
        <div className="flex flex-row flex-wrap gap-1.5 lg:flex-col">
          <BlockInsertPalette onSelect={append} layout="column" />
        </div>
      </div>
    </div>
  );
}
