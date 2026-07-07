"use client";

import type { BlockType } from "@nextgen-cms/contract/types/article";
import { useEffect, useRef, useState } from "react";
import { getBlockMeta } from "./blockRegistry";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DragHandleIcon,
  TransformIcon,
} from "./icons";

type BlockToolbarProps = {
  convertibleTo: BlockType[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  onConvert: (type: BlockType) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  dragHandleProps: {
    draggable: true;
    onDragStart: (e: React.DragEvent<HTMLButtonElement>) => void;
    onDragEnd: () => void;
  };
};

export function BlockToolbar({
  convertibleTo,
  canMoveUp,
  canMoveDown,
  onConvert,
  onMoveUp,
  onMoveDown,
  dragHandleProps,
}: BlockToolbarProps) {
  const [transformOpen, setTransformOpen] = useState(false);
  const transformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!transformOpen) return;
    function handlePointer(e: PointerEvent) {
      if (
        transformRef.current &&
        !transformRef.current.contains(e.target as Node)
      ) {
        setTransformOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setTransformOpen(false);
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [transformOpen]);

  return (
    <div className="flex items-center gap-0.5 rounded-md p-0.5">
      <button
        type="button"
        aria-label="جابه‌جایی"
        title="برای جابه‌جایی بکشید"
        className="cursor-grab rounded p-1 text-ink-muted hover:bg-surface-2 active:cursor-grabbing"
        {...dragHandleProps}
      >
        <DragHandleIcon className="h-4 w-4" />
      </button>

      {convertibleTo.length > 0 ? (
        <div ref={transformRef} className="relative">
          <button
            type="button"
            aria-label="تبدیل نوع"
            title="تبدیل به نوع دیگر"
            onClick={() => setTransformOpen((v) => !v)}
            className="rounded p-1 text-ink-muted hover:bg-surface-2"
          >
            <TransformIcon className="h-4 w-4" />
          </button>
          {transformOpen ? (
            <div
              role="menu"
              className="absolute start-0 top-full z-30 mt-1 w-44 rounded-lg border border-rule bg-paper p-1 shadow-lg"
            >
              {convertibleTo.map((type) => {
                const meta = getBlockMeta(type);
                return (
                  <button
                    key={type}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setTransformOpen(false);
                      onConvert(type);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-surface-2"
                  >
                    <meta.Icon className="h-4 w-4 text-ink-muted" />
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        aria-label="بالا"
        onClick={onMoveUp}
        disabled={canMoveUp === false}
        className="rounded p-1 text-ink-muted hover:bg-surface-2 disabled:opacity-30"
      >
        <ArrowUpIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="پایین"
        onClick={onMoveDown}
        disabled={canMoveDown === false}
        className="rounded p-1 text-ink-muted hover:bg-surface-2 disabled:opacity-30"
      >
        <ArrowDownIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
