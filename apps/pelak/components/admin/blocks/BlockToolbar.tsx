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
  transformDisabled?: boolean;
  onConvert: (type: BlockType) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  dragHandleProps: {
    draggable: true;
    onDragStart: (e: React.DragEvent<HTMLButtonElement>) => void;
    onDragEnd: () => void;
  };
};

const btnClass =
  "rounded p-1 text-ink-muted hover:bg-surface-2 disabled:opacity-30";

export function BlockToolbar({
  convertibleTo,
  canMoveUp,
  canMoveDown,
  transformDisabled = false,
  onConvert,
  onMoveUp,
  onMoveDown,
  dragHandleProps,
}: BlockToolbarProps) {
  const [transformOpen, setTransformOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transformDisabled) setTransformOpen(false);
  }, [transformDisabled]);

  useEffect(() => {
    if (!transformOpen) return;
    function handlePointer(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
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

  const actionsExpanded = transformOpen;
  const showTransform = convertibleTo.length > 0 && !transformDisabled;

  return (
    <div ref={rootRef} className="group/toolbar relative">
      {/* footprint — keeps layout size fixed to the drag handle */}
      <div className="invisible rounded-md p-0.5" aria-hidden>
        <div className={btnClass}>
          <DragHandleIcon className="h-4 w-4" />
        </div>
      </div>

      <div className="absolute inset-s-0 top-0 z-20 flex flex-col items-center gap-0 overflow-visible rounded-md bg-paper/95 p-0.5 shadow-sm ring-1 ring-rule">
        <button
          type="button"
          aria-label="جابه‌جایی"
          title="برای جابه‌جایی بکشید"
          className={`cursor-grab active:cursor-grabbing ${btnClass}`}
          {...dragHandleProps}
        >
          <DragHandleIcon className="h-4 w-4" />
        </button>

        <div
          className={[
            "flex flex-col items-center",
            actionsExpanded
              ? "max-h-40 opacity-100 pointer-events-auto"
              : [
                  "max-h-0 opacity-0 pointer-events-none overflow-hidden",
                  "group-hover/toolbar:max-h-40 group-hover/toolbar:opacity-100 group-hover/toolbar:pointer-events-auto group-hover/toolbar:overflow-visible",
                  "group-focus-within/toolbar:max-h-40 group-focus-within/toolbar:opacity-100 group-focus-within/toolbar:pointer-events-auto group-focus-within/toolbar:overflow-visible",
                ].join(" "),
          ].join(" ")}
        >
          <button
            type="button"
            aria-label="بالا"
            onClick={onMoveUp}
            disabled={canMoveUp === false}
            className={btnClass}
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>

          {showTransform ? (
            <div className="relative">
              <button
                type="button"
                aria-label="تبدیل نوع"
                title="تبدیل به نوع دیگر"
                aria-expanded={transformOpen}
                aria-haspopup="menu"
                onClick={(e) => {
                  e.stopPropagation();
                  setTransformOpen((v) => !v);
                }}
                className={btnClass}
              >
                <TransformIcon className="h-4 w-4" />
              </button>
              {transformOpen ? (
                <div
                  role="menu"
                  className="absolute start-full top-0 z-40 ms-1 w-44 rounded-lg border border-rule bg-paper p-1 shadow-lg"
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
            aria-label="پایین"
            onClick={onMoveDown}
            disabled={canMoveDown === false}
            className={btnClass}
          >
            <ArrowDownIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
