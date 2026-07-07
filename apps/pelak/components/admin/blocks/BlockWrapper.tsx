"use client";

import type { BlockType } from "@nextgen-cms/contract/types/article";
import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";
import { useEffect, useRef, useState } from "react";
import { BlockToolbar } from "./BlockToolbar";
import { getBlockMeta } from "./blockRegistry";
import type { EditorBlock } from "./blockTypes";
import { TrashIcon } from "./icons";

type BlockWrapperProps = {
  block: EditorBlock;
  isDragging?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (block: EditorBlock) => void;
  onConvert: (type: BlockType) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
  uploadContext?: MediaUploadContext;
};

export function BlockWrapper({
  block,
  isDragging = false,
  canMoveUp,
  canMoveDown,
  onChange,
  onConvert,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDragStart,
  onDragEnd,
  uploadContext,
}: BlockWrapperProps) {
  const meta = getBlockMeta(block.type);
  const Editor = meta.Editor;
  const Settings = meta.Settings;

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

  return (
    <div
      data-block-key={block._key}
      className={[
        "group relative rounded-lg border border-rule bg-surface-2 p-4 transition-all",
        isDragging ? "opacity-40" : "hover:border-rule-strong",
      ].join(" ")}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <BlockToolbar
          convertibleTo={meta.convertibleTo}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onConvert={onConvert}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          dragHandleProps={{ draggable: true, onDragStart, onDragEnd }}
        />
        <div className="flex items-center gap-2">
          {Settings ? (
            <Settings
              block={block}
              onChange={(next) => onChange({ ...next, _key: block._key })}
            />
          ) : null}
          <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
            <meta.Icon className="h-3.5 w-3.5" />
            <span>{meta.label}</span>
            <button
              type="button"
              aria-label={deleteArmed ? "تأیید حذف" : "حذف بلوک"}
              title={deleteArmed ? "بار دیگر برای حذف" : "حذف"}
              onClick={handleDeleteClick}
              onBlur={disarmDelete}
              aria-pressed={deleteArmed}
              className={[
                "rounded p-1 transition-colors",
                deleteArmed
                  ? "bg-accent text-paper"
                  : "text-ink-muted hover:bg-accent-soft hover:text-accent",
              ].join(" ")}
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      <Editor
        block={block}
        blockId={block._key}
        onChange={(next) => onChange({ ...next, _key: block._key })}
        uploadContext={uploadContext}
      />
    </div>
  );
}
