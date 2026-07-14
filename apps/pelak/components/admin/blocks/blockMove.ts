import type { EditorBlock } from "./blockTypes";

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable='true'], [contenteditable='']",
    ),
  );
}

export function orderKeysByDocument(
  blocks: EditorBlock[],
  keys: Iterable<string>,
): string[] {
  const set = new Set(keys);
  return blocks.filter((b) => set.has(b._key)).map((b) => b._key);
}

/** Extract selected blocks (doc order), then insert as a contiguous run at insertAt. */
export function relocateKeys(
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
