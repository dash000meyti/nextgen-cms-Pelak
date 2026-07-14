"use client";

import type { BlockType } from "@nextgen-cms/contract/types/article";
import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";
import { useEffect, useRef, useState } from "react";
import { BlockSelectHandle } from "./BlockSelectHandle";
import { BlockToolbar } from "./BlockToolbar";
import { getBlockMeta, resolveBlockChromeIcon, resolveBlockChromeLabel } from "./blockRegistry";
import type { EditorBlock } from "./blockTypes";
import { TrashIcon } from "./icons";

type BlockWrapperProps = {
  block: EditorBlock;
  /** Form feedback anchor — e.g. `body.2`. */
  fieldKey?: string;
  isDragging?: boolean;
  isSelected?: boolean;
  /** True when this block is part of a multi-block selection (disables Settings convert). */
  multiSelectActive?: boolean;
  /** Select-handle may start group drag when multi-selected. */
  groupDragEnabled?: boolean;
  canMoveSingleUp: boolean;
  canMoveSingleDown: boolean;
  canMoveGroupUp: boolean;
  canMoveGroupDown: boolean;
  onChange: (block: EditorBlock) => void;
  onConvert: (type: BlockType) => void;
  onMoveSingleUp: () => void;
  onMoveSingleDown: () => void;
  onMoveGroupUp: () => void;
  onMoveGroupDown: () => void;
  onDelete: () => void;
  onSingleDragStart: (e: React.DragEvent<HTMLButtonElement>) => void;
  onGroupDragStart: (e: React.DragEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
  onSelect: (e: React.MouseEvent) => void;
  uploadContext?: MediaUploadContext;
};

/** Settings/Toolbar: reveal on block hover or focus inside that column — not when Select alone is focused. */
const hoverChromeVisible =
  "pointer-events-none opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100";

/** Select: same hover reveal, plus always visible while selected. */
const selectChromeVisible =
  "pointer-events-none opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100";

export function BlockWrapper({
  block,
  fieldKey,
  isDragging = false,
  isSelected = false,
  multiSelectActive = false,
  groupDragEnabled = false,
  canMoveSingleUp,
  canMoveSingleDown,
  canMoveGroupUp,
  canMoveGroupDown,
  onChange,
  onConvert,
  onMoveSingleUp,
  onMoveSingleDown,
  onMoveGroupUp,
  onMoveGroupDown,
  onDelete,
  onSingleDragStart,
  onGroupDragStart,
  onDragEnd,
  onSelect,
  uploadContext,
}: BlockWrapperProps) {
  const meta = getBlockMeta(block.type);
  const Editor = meta.Editor;
  const Settings = meta.Settings;
  const ChromeIcon = resolveBlockChromeIcon(block);
  const chromeLabel = resolveBlockChromeLabel(block);

  const [deleteArmed, setDeleteArmed] = useState(false);
  const disarmTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (disarmTimerRef.current != null) {
        window.clearTimeout(disarmTimerRef.current);
      }
    };
  }, []);

  function handleDeleteClick() {
    if (deleteArmed) {
      if (disarmTimerRef.current != null) {
        window.clearTimeout(disarmTimerRef.current);
        disarmTimerRef.current = null;
      }
      setDeleteArmed(false);
      onDelete();
      return;
    }
    setDeleteArmed(true);
    disarmTimerRef.current = window.setTimeout(() => {
      setDeleteArmed(false);
      disarmTimerRef.current = null;
    }, 3000);
  }

  function disarmDelete() {
    if (disarmTimerRef.current != null) {
      window.clearTimeout(disarmTimerRef.current);
      disarmTimerRef.current = null;
    }
    setDeleteArmed(false);
  }

  const selectChromeClass = [
    "shrink-0",
    isSelected
      ? "pointer-events-auto opacity-100"
      : selectChromeVisible,
  ].join(" ");

  return (
    <div
      data-block-key={block._key}
      data-field={fieldKey}
      className={[
        "group relative rounded-md",
        isDragging ? "opacity-40" : "",
        isSelected ? "ring-1 ring-accent" : "",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-start gap-2 p-1">
        <div className="flex shrink-0 flex-row items-start gap-1.5">
          {/* Select stays visible when selected; Settings/Toolbar only on hover or their own focus-within */}
          <div className={selectChromeClass}>
            <BlockSelectHandle
              label={meta.label}
              isSelected={isSelected}
              groupDragEnabled={groupDragEnabled}
              canMoveUp={canMoveGroupUp}
              canMoveDown={canMoveGroupDown}
              onSelect={onSelect}
              onMoveUp={onMoveGroupUp}
              onMoveDown={onMoveGroupDown}
              onGroupDragStart={onGroupDragStart}
              onGroupDragEnd={onDragEnd}
            />
          </div>

          <div className={`shrink-0 ${hoverChromeVisible}`}>
            <div className="group/settings relative max-w-30">
              {/* footprint — label row only; settings overlay below without layout growth */}
              <div className="invisible rounded-md p-1" aria-hidden>
                <div className="flex items-center gap-1 px-0.5 text-[10px] font-medium">
                  <span className="h-3.5 w-3.5 shrink-0" />
                  <span className="ms-auto shrink-0 rounded p-0.5">
                    <TrashIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              <div className="absolute inset-s-0 top-0 z-20 flex w-full max-w-30 flex-col items-stretch gap-1 rounded-md bg-paper/95 p-1 shadow-sm ring-1 ring-rule">
                <div className="flex items-center gap-1 px-0.5 text-[10px] font-medium text-ink-muted">
                  <span title={chromeLabel} className="inline-flex shrink-0">
                    <ChromeIcon className="h-3.5 w-3.5 text-ink-muted" />
                  </span>
                  <button
                    type="button"
                    aria-label={deleteArmed ? "تأیید حذف" : "حذف بلوک"}
                    title={deleteArmed ? "بار دیگر برای حذف" : "حذف"}
                    onClick={handleDeleteClick}
                    onBlur={disarmDelete}
                    aria-pressed={deleteArmed}
                    className={[
                      "ms-auto shrink-0 rounded p-0.5 transition-colors",
                      deleteArmed
                        ? "bg-accent text-paper"
                        : "text-ink-muted hover:bg-accent-soft hover:text-accent",
                    ].join(" ")}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
                {Settings ? (
                  <div
                    className={[
                      "overflow-hidden transition-[max-height,opacity] duration-150",
                      "max-h-0 opacity-0 pointer-events-none",
                      "group-hover/settings:max-h-48 group-hover/settings:opacity-100 group-hover/settings:pointer-events-auto",
                      "group-focus-within/settings:max-h-48 group-focus-within/settings:opacity-100 group-focus-within/settings:pointer-events-auto",
                    ].join(" ")}
                  >
                    <Settings
                      block={block}
                      onChange={(next) =>
                        onChange({ ...next, _key: block._key })
                      }
                      onConvert={onConvert}
                      convertDisabled={multiSelectActive}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className={`shrink-0 ${hoverChromeVisible}`}>
            <BlockToolbar
              canMoveUp={canMoveSingleUp}
              canMoveDown={canMoveSingleDown}
              onMoveUp={onMoveSingleUp}
              onMoveDown={onMoveSingleDown}
              dragHandleProps={{
                draggable: true,
                onDragStart: onSingleDragStart,
                onDragEnd,
              }}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <Editor
            block={block}
            blockId={block._key}
            onChange={(next) => onChange({ ...next, _key: block._key })}
            uploadContext={uploadContext}
          />
        </div>
      </div>
    </div>
  );
}
