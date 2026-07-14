"use client";

import type {
  ArticleBlock,
  BlockType,
} from "@nextgen-cms/contract/types/article";
import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BlockWrapper } from "./BlockWrapper";
import { convertBlock } from "./blockRegistry";
import type { EditorBlock } from "./blockTypes";
import { InsertionZone } from "./InsertionZone";

type BlockDragListProps = {
  blocks: EditorBlock[];
  onChange: (blocks: EditorBlock[]) => void;
  uploadContext?: MediaUploadContext;
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable='true'], [contenteditable='']",
    ),
  );
}

function orderKeysByDocument(
  blocks: EditorBlock[],
  keys: Iterable<string>,
): string[] {
  const set = new Set(keys);
  return blocks.filter((b) => set.has(b._key)).map((b) => b._key);
}

/** Extract selected blocks (doc order), then insert as a contiguous run at insertAt. */
function relocateKeys(
  blocks: EditorBlock[],
  keys: string[],
  insertAt: number,
): EditorBlock[] {
  const keySet = new Set(keys);
  const moving = blocks.filter((b) => keySet.has(b._key));
  if (moving.length === 0) return blocks;

  const remaining = blocks.filter((b) => !keySet.has(b._key));
  const removedBefore = blocks
    .slice(0, insertAt)
    .filter((b) => keySet.has(b._key)).length;
  const adjusted = Math.max(
    0,
    Math.min(insertAt - removedBefore, remaining.length),
  );
  return [
    ...remaining.slice(0, adjusted),
    ...moving,
    ...remaining.slice(adjusted),
  ];
}

export function BlockDragList({
  blocks,
  onChange,
  uploadContext,
}: BlockDragListProps) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectionAnchorKey, setSelectionAnchorKey] = useState<string | null>(
    null,
  );
  const [draggingKeys, setDraggingKeys] = useState<string[]>([]);
  const [scrollTarget, setScrollTarget] = useState<{
    key: string;
    nonce: number;
  } | null>(null);

  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const draggingSet = useMemo(() => new Set(draggingKeys), [draggingKeys]);

  const orderedSelected = useMemo(
    () => orderKeysByDocument(blocks, selectedKeys),
    [blocks, selectedKeys],
  );

  useEffect(() => {
    if (!scrollTarget) return;
    const el = document.querySelector(
      `[data-block-key="${CSS.escape(scrollTarget.key)}"]`,
    );
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [scrollTarget]);

  // Drop keys that no longer exist (after delete/convert)
  useEffect(() => {
    const alive = new Set(blocks.map((b) => b._key));
    setSelectedKeys((prev) => {
      const next = prev.filter((k) => alive.has(k));
      return next.length === prev.length ? prev : next;
    });
    setSelectionAnchorKey((prev) => (prev && alive.has(prev) ? prev : null));
  }, [blocks]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (isEditableTarget(e.target)) return;
      setSelectedKeys([]);
      setSelectionAnchorKey(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const commit = useCallback(
    (next: EditorBlock[]) => onChange(next),
    [onChange],
  );

  function patch(key: string, nextBlock: EditorBlock) {
    commit(blocks.map((block) => (block._key === key ? nextBlock : block)));
  }

  function remove(key: string) {
    commit(blocks.filter((block) => block._key !== key));
    setSelectedKeys((prev) => prev.filter((k) => k !== key));
  }

  function selectOnly(key: string) {
    setSelectedKeys([key]);
    setSelectionAnchorKey(key);
  }

  function toggle(key: string) {
    setSelectedKeys((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      return orderKeysByDocument(blocks, [...prev, key]);
    });
    setSelectionAnchorKey(key);
  }

  function selectRange(toKey: string) {
    const anchor = selectionAnchorKey ?? toKey;
    const a = blocks.findIndex((b) => b._key === anchor);
    const b = blocks.findIndex((block) => block._key === toKey);
    if (a < 0 || b < 0) {
      selectOnly(toKey);
      return;
    }
    const from = Math.min(a, b);
    const to = Math.max(a, b);
    setSelectedKeys(blocks.slice(from, to + 1).map((block) => block._key));
  }

  function handleCheckboxSelect(key: string, e: React.MouseEvent) {
    if (e.shiftKey) {
      selectRange(key);
      return;
    }
    if (e.metaKey || e.ctrlKey) {
      toggle(key);
      return;
    }
    // Plain click: select only this — or deselect if it is already the sole selection
    if (selectedKeys.length === 1 && selectedKeys[0] === key) {
      setSelectedKeys([]);
      setSelectionAnchorKey(null);
      return;
    }
    selectOnly(key);
  }

  function keysForMove(primaryKey: string): string[] {
    if (selectedSet.has(primaryKey) && orderedSelected.length > 1) {
      return orderedSelected;
    }
    return [primaryKey];
  }

  function moveSelected(primaryKey: string, direction: -1 | 1) {
    const keys = keysForMove(primaryKey);
    const indices = keys
      .map((k) => blocks.findIndex((b) => b._key === k))
      .filter((i) => i >= 0)
      .sort((a, b) => a - b);
    if (indices.length === 0) return;

    const first = indices[0];
    if (first == null) return;
    // Collapse selection into a contiguous run at its minimum index, then shift
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
    if (keys.length > 1 || selectedSet.has(primaryKey)) {
      setSelectedKeys(orderKeysByDocument(next, keys));
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

  function handleDragStart(key: string, e: React.DragEvent<HTMLButtonElement>) {
    const keys = keysForMove(key);
    setDraggingKeys(keys);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("application/block-index", keys[0] ?? key);
    } catch {
      // some browsers throw on custom MIME types; state is the source of truth
    }
  }

  function handleDragEnd() {
    setDraggingKeys([]);
  }

  function handleDropAt(targetIndex: number) {
    if (draggingKeys.length === 0) return;
    const keys = orderKeysByDocument(blocks, draggingKeys);
    const movingSelection =
      keys.length > 1 || (keys[0] != null && selectedSet.has(keys[0]));
    const next = relocateKeys(blocks, keys, targetIndex);
    commit(next);
    if (movingSelection) {
      setSelectedKeys(orderKeysByDocument(next, keys));
    }
    handleDragEnd();
    if (keys[0]) setScrollTarget({ key: keys[0], nonce: Date.now() });
  }

  function canMoveSelection(primaryKey: string, direction: -1 | 1): boolean {
    const keys = keysForMove(primaryKey);
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
            canMoveUp={canMoveSelection(block._key, -1)}
            canMoveDown={canMoveSelection(block._key, 1)}
            onChange={(next) => patch(block._key, next)}
            onConvert={(type) => convert(block._key, type)}
            onMoveUp={() => moveSelected(block._key, -1)}
            onMoveDown={() => moveSelected(block._key, 1)}
            onDelete={() => remove(block._key)}
            onDragStart={(e) => handleDragStart(block._key, e)}
            onDragEnd={handleDragEnd}
            onSelect={(e) => handleCheckboxSelect(block._key, e)}
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
