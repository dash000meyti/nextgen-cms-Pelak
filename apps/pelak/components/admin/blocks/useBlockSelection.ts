"use client";

import { useEffect, useMemo, useState } from "react";
import { isEditableTarget, orderKeysByDocument } from "./blockMove";
import type { EditorBlock } from "./blockTypes";

export function useBlockSelection(blocks: EditorBlock[]) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectionAnchorKey, setSelectionAnchorKey] = useState<string | null>(
    null,
  );

  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys]);

  const orderedSelected = useMemo(
    () => orderKeysByDocument(blocks, selectedKeys),
    [blocks, selectedKeys],
  );

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
      if (e.defaultPrevented) return;
      if (isEditableTarget(e.target)) return;
      setSelectedKeys([]);
      setSelectionAnchorKey(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

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

  function handleSelectClick(key: string, e: React.MouseEvent) {
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

  function removeFromSelection(key: string) {
    setSelectedKeys((prev) => prev.filter((k) => k !== key));
  }

  function syncSelectionToKeys(nextBlocks: EditorBlock[], keys: string[]) {
    setSelectedKeys(orderKeysByDocument(nextBlocks, keys));
  }

  return {
    selectedKeys,
    selectedSet,
    orderedSelected,
    handleSelectClick,
    removeFromSelection,
    syncSelectionToKeys,
  };
}
