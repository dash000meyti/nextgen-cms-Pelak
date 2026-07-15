"use client";

import { useMemo, useState } from "react";
import { orderKeysByDocument, relocateKeys } from "./blockMove";
import type { EditorBlock } from "./blockTypes";

type UseBlockDnDOptions = {
  blocks: EditorBlock[];
  commit: (next: EditorBlock[]) => void;
  selectedSet: Set<string>;
  orderedSelected: string[];
  onDropComplete?: (args: {
    keys: string[];
    next: EditorBlock[];
    movingSelection: boolean;
  }) => void;
};

function setDragMime(
  e: React.DragEvent<HTMLButtonElement>,
  primaryKey: string,
) {
  e.dataTransfer.effectAllowed = "move";
  try {
    e.dataTransfer.setData("application/block-index", primaryKey);
  } catch {
    // some browsers throw on custom MIME types; state is the source of truth
  }
}

export function useBlockDnD({
  blocks,
  commit,
  selectedSet,
  orderedSelected,
  onDropComplete,
}: UseBlockDnDOptions) {
  const [draggingKeys, setDraggingKeys] = useState<string[]>([]);
  const draggingSet = useMemo(() => new Set(draggingKeys), [draggingKeys]);

  function handleDragEnd() {
    setDraggingKeys([]);
  }

  function startSingleDrag(key: string, e: React.DragEvent<HTMLButtonElement>) {
    setDraggingKeys([key]);
    setDragMime(e, key);
  }

  function startGroupDrag(key: string, e: React.DragEvent<HTMLButtonElement>) {
    if (!(selectedSet.has(key) && orderedSelected.length > 1)) {
      e.preventDefault();
      return;
    }
    setDraggingKeys(orderedSelected);
    setDragMime(e, orderedSelected[0] ?? key);
  }

  function handleDropAt(targetIndex: number) {
    if (draggingKeys.length === 0) return;
    const keys = orderKeysByDocument(blocks, draggingKeys);
    const movingSelection =
      keys.length > 1 || (keys[0] != null && selectedSet.has(keys[0]));
    const next = relocateKeys(blocks, keys, targetIndex);
    commit(next);
    handleDragEnd();
    onDropComplete?.({ keys, next, movingSelection });
  }

  return {
    draggingKeys,
    draggingSet,
    startSingleDrag,
    startGroupDrag,
    handleDragEnd,
    handleDropAt,
  };
}
