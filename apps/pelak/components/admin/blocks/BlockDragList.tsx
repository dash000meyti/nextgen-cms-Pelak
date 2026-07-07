"use client";

import type {
  ArticleBlock,
  BlockType,
} from "@nextgen-cms/contract/types/article";
import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";
import { useCallback, useEffect, useState } from "react";
import { BlockWrapper } from "./BlockWrapper";
import { convertBlock } from "./blockRegistry";
import type { EditorBlock } from "./blockTypes";
import { InsertionZone } from "./InsertionZone";

type BlockDragListProps = {
  blocks: EditorBlock[];
  onChange: (blocks: EditorBlock[]) => void;
  uploadContext?: MediaUploadContext;
};

export function BlockDragList({
  blocks,
  onChange,
  uploadContext,
}: BlockDragListProps) {
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [scrollTarget, setScrollTarget] = useState<{
    key: string;
    nonce: number;
  } | null>(null);

  const draggingIndex = draggingKey
    ? blocks.findIndex((block) => block._key === draggingKey)
    : -1;

  useEffect(() => {
    if (!scrollTarget) return;
    const el = document.querySelector(
      `[data-block-key="${CSS.escape(scrollTarget.key)}"]`,
    );
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [scrollTarget]);

  const commit = useCallback(
    (next: EditorBlock[]) => onChange(next),
    [onChange],
  );

  function patch(key: string, nextBlock: EditorBlock) {
    commit(blocks.map((block) => (block._key === key ? nextBlock : block)));
  }

  function remove(key: string) {
    commit(blocks.filter((block) => block._key !== key));
  }

  function move(key: string, direction: -1 | 1) {
    const index = blocks.findIndex((block) => block._key === key);
    if (index < 0) return;
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(target, 0, item);
    commit(next);
    setScrollTarget({ key, nonce: Date.now() });
  }

  function convert(key: string, target: BlockType) {
    const index = blocks.findIndex((block) => block._key === key);
    if (index < 0) return;
    const current = blocks[index];
    if (!current) return;
    const converted = convertBlock(current, target) as EditorBlock;
    commit(
      blocks.map((block, i) =>
        i === index ? { ...converted, _key: block._key } : block,
      ),
    );
  }

  function insert(atIndex: number, block: ArticleBlock) {
    const editorBlock: EditorBlock = {
      ...block,
      _key: crypto.randomUUID(),
    };
    const next = [...blocks];
    next.splice(atIndex, 0, editorBlock);
    commit(next);
  }

  function handleDragStart(key: string, e: React.DragEvent<HTMLButtonElement>) {
    setDraggingKey(key);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("application/block-index", key);
    } catch {
      // some browsers throw on custom MIME types; state is the source of truth
    }
  }

  function handleDragEnd() {
    setDraggingKey(null);
  }

  function handleDropAt(targetIndex: number) {
    if (draggingIndex < 0) return;
    const draggedKey = blocks[draggingIndex]?._key;
    const next = [...blocks];
    const [item] = next.splice(draggingIndex, 1);
    if (!item) return;
    let adjusted = targetIndex;
    if (draggingIndex < targetIndex) adjusted -= 1;
    next.splice(adjusted, 0, item);
    commit(next);
    handleDragEnd();
    if (draggedKey) setScrollTarget({ key: draggedKey, nonce: Date.now() });
  }

  return (
    <div>
      <InsertionZone
        index={0}
        onInsert={insert}
        dragActive={draggingKey !== null}
        onDropAt={handleDropAt}
      />
      {blocks.map((block, index) => (
        <div key={block._key}>
          <BlockWrapper
            block={block}
            isDragging={block._key === draggingKey}
            canMoveUp={index > 0}
            canMoveDown={index < blocks.length - 1}
            onChange={(next) => patch(block._key, next)}
            onConvert={(type) => convert(block._key, type)}
            onMoveUp={() => move(block._key, -1)}
            onMoveDown={() => move(block._key, 1)}
            onDelete={() => remove(block._key)}
            onDragStart={(e) => handleDragStart(block._key, e)}
            onDragEnd={handleDragEnd}
            uploadContext={uploadContext}
          />
          <InsertionZone
            index={index + 1}
            onInsert={insert}
            dragActive={draggingKey !== null}
            onDropAt={handleDropAt}
          />
        </div>
      ))}
    </div>
  );
}
