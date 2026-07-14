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

const chromeVisible =
  "pointer-events-none opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100";

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
        "group relative rounded-md",
        isDragging ? "opacity-40" : "",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-start gap-2 p-1">
        <div
          className={[
            "flex shrink-0 flex-row items-start gap-1.5",
            chromeVisible,
          ].join(" ")}
        >
          <div className="group/settings relative max-w-[7.5rem]">
            {/* footprint — label row only; settings overlay below without layout growth */}
            <div
              className="invisible rounded-md p-1"
              aria-hidden
            >
              <div className="flex items-center gap-1 px-0.5 text-[10px] font-medium">
                <meta.Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{meta.label}</span>
                <span className="ms-auto shrink-0 rounded p-0.5">
                  <TrashIcon className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>

            <div className="absolute start-0 top-0 z-20 flex w-full max-w-[7.5rem] flex-col items-stretch gap-1 rounded-md bg-paper/95 p-1 shadow-sm ring-1 ring-rule">
              <div className="flex items-center gap-1 px-0.5 text-[10px] font-medium text-ink-muted">
                <meta.Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{meta.label}</span>
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
                  />
                </div>
              ) : null}
            </div>
          </div>

          <BlockToolbar
            convertibleTo={meta.convertibleTo}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onConvert={onConvert}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            dragHandleProps={{ draggable: true, onDragStart, onDragEnd }}
          />
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
