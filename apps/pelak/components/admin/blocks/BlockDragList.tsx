"use client";

import type {
  ArticleBlock,
  BlockType,
} from "@nextgen-cms/contract/types/article";
import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";
import { useCallback, useEffect, useState } from "react";
import { BlockWrapper } from "./BlockWrapper";
import { relocateKeys } from "./blockMove";
import { convertBlock } from "./blockRegistry";
import type { EditorBlock } from "./blockTypes";
import { InsertionZone } from "./InsertionZone";
import { useBlockDnD } from "./useBlockDnD";
import { useBlockSelection } from "./useBlockSelection";

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
  const [scrollTarget, setScrollTarget] = useState<{
    key: string;
    nonce: number;
  } | null>(null);

  const {
    selectedSet,
    orderedSelected,
    handleSelectClick,
    removeFromSelection,
    syncSelectionToKeys,
  } = useBlockSelection(blocks);

  const commit = useCallback(
    (next: EditorBlock[]) => onChange(next),
    [onChange],
  );

  const {
    draggingKeys,
    draggingSet,
    startSingleDrag,
    startGroupDrag,
    handleDragEnd,
    handleDropAt,
  } = useBlockDnD({
    blocks,
    commit,
    selectedSet,
    orderedSelected,
    onDropComplete: ({ keys, next, movingSelection }) => {
      if (movingSelection) {
        syncSelectionToKeys(next, keys);
      }
      if (keys[0]) setScrollTarget({ key: keys[0], nonce: Date.now() });
    },
  });

  useEffect(() => {
    if (!scrollTarget) return;
    const el = document.querySelector(
      `[data-block-key="${CSS.escape(scrollTarget.key)}"]`,
    );
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [scrollTarget]);

  function patch(key: string, nextBlock: EditorBlock) {
    commit(blocks.map((block) => (block._key === key ? nextBlock : block)));
  }

  function remove(key: string) {
    commit(blocks.filter((block) => block._key !== key));
    removeFromSelection(key);
  }

  /** Group-aware keys for Select column ▲/▼ — toolbar never uses this. */
  function keysForGroupNudge(primaryKey: string): string[] {
    if (selectedSet.has(primaryKey) && orderedSelected.length > 1) {
      return orderedSelected;
    }
    return [primaryKey];
  }

  function moveKeys(keys: string[], direction: -1 | 1) {
    const indices = keys
      .map((k) => blocks.findIndex((b) => b._key === k))
      .filter((i) => i >= 0)
      .sort((a, b) => a - b);
    if (indices.length === 0) return;

    const first = indices[0];
    if (first == null) return;
    let next = relocateKeys(blocks, keys, first);
    const runStart = next.findIndex((b) => b._key === keys[0]);
    if (runStart < 0) return;

    if (direction === -1) {
      if (runStart === 0) return;
      next = relocateKeys(next, keys, runStart - 1);
    } else {
      if (runStart + keys.length >= next.length) return;
      next = relocateKeys(next, keys, runStart + keys.length + 1);
    }

    const same =
      next.length === blocks.length &&
      next.every((b, i) => b._key === blocks[i]?._key);
    if (same) return;

    commit(next);
    return { next, keys };
  }

  function moveSingle(primaryKey: string, direction: -1 | 1) {
    const result = moveKeys([primaryKey], direction);
    if (!result) return;
    if (selectedSet.has(primaryKey)) {
      syncSelectionToKeys(result.next, [primaryKey]);
    }
    setScrollTarget({ key: primaryKey, nonce: Date.now() });
  }

  function moveGroup(primaryKey: string, direction: -1 | 1) {
    const keys = keysForGroupNudge(primaryKey);
    const result = moveKeys(keys, direction);
    if (!result) return;
    if (keys.length > 1 || selectedSet.has(primaryKey)) {
      syncSelectionToKeys(result.next, keys);
    }
    const scrollKey = keys[0];
    if (scrollKey) setScrollTarget({ key: scrollKey, nonce: Date.now() });
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

  function canMoveKeys(keys: string[], direction: -1 | 1): boolean {
    const indices = keys
      .map((k) => blocks.findIndex((b) => b._key === k))
      .filter((i) => i >= 0)
      .sort((a, b) => a - b);
    if (indices.length === 0) return false;
    const firstIdx = indices[0];
    const lastIdx = indices[indices.length - 1];
    if (firstIdx == null || lastIdx == null) return false;
    if (direction === -1) return firstIdx > 0;
    return lastIdx < blocks.length - 1;
  }

  const multiSelect = orderedSelected.length > 1;

  return (
    <div>
      <InsertionZone
        index={0}
        onInsert={insert}
        dragActive={draggingKeys.length > 0}
        onDropAt={handleDropAt}
      />
      {blocks.map((block, index) => (
        <div key={block._key}>
          <BlockWrapper
            block={block}
            fieldKey={`body.${index}`}
            isDragging={draggingSet.has(block._key)}
            isSelected={selectedSet.has(block._key)}
            multiSelectActive={multiSelect && selectedSet.has(block._key)}
            groupDragEnabled={multiSelect && selectedSet.has(block._key)}
            canMoveSingleUp={canMoveKeys([block._key], -1)}
            canMoveSingleDown={canMoveKeys([block._key], 1)}
            canMoveGroupUp={canMoveKeys(keysForGroupNudge(block._key), -1)}
            canMoveGroupDown={canMoveKeys(keysForGroupNudge(block._key), 1)}
            onChange={(next) => patch(block._key, next)}
            onConvert={(type) => convert(block._key, type)}
            onMoveSingleUp={() => moveSingle(block._key, -1)}
            onMoveSingleDown={() => moveSingle(block._key, 1)}
            onMoveGroupUp={() => moveGroup(block._key, -1)}
            onMoveGroupDown={() => moveGroup(block._key, 1)}
            onDelete={() => remove(block._key)}
            onSingleDragStart={(e) => startSingleDrag(block._key, e)}
            onGroupDragStart={(e) => startGroupDrag(block._key, e)}
            onDragEnd={handleDragEnd}
            onSelect={(e) => handleSelectClick(block._key, e)}
            uploadContext={uploadContext}
          />
          <InsertionZone
            index={index + 1}
            onInsert={insert}
            dragActive={draggingKeys.length > 0}
            onDropAt={handleDropAt}
            hideWhenIdle={index === blocks.length - 1}
          />
        </div>
      ))}
    </div>
  );
}
