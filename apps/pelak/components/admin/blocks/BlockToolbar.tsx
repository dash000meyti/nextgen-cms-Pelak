"use client";

import { ArrowDownIcon, ArrowUpIcon, DragHandleIcon } from "./icons";

type BlockToolbarProps = {
  canMoveUp: boolean;
  canMoveDown: boolean;
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
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  dragHandleProps,
}: BlockToolbarProps) {
  return (
    <div className="group/toolbar relative">
      {/* footprint — keeps layout size fixed to the drag handle */}
      <div className="invisible rounded-md p-0.5" aria-hidden>
        <div className={btnClass}>
          <DragHandleIcon className="h-4 w-4" />
        </div>
      </div>

      <div className="absolute inset-s-0 top-0 z-20 flex flex-col items-center gap-0 overflow-visible rounded-md bg-paper/95 p-0.5 shadow-sm ring-1 ring-rule">
        <button
          type="button"
          aria-label="جابه‌جایی این بلوک"
          title="برای جابه‌جایی این بلوک بکشید — فقط همین بلوک جابه‌جا می‌شود"
          className={`cursor-grab active:cursor-grabbing ${btnClass}`}
          {...dragHandleProps}
        >
          <DragHandleIcon className="h-4 w-4" />
        </button>

        <div
          className={[
            "flex flex-col items-center",
            "max-h-0 opacity-0 pointer-events-none overflow-hidden",
            "group-hover/toolbar:max-h-40 group-hover/toolbar:opacity-100 group-hover/toolbar:pointer-events-auto group-hover/toolbar:overflow-visible",
            "group-focus-within/toolbar:max-h-40 group-focus-within/toolbar:opacity-100 group-focus-within/toolbar:pointer-events-auto group-focus-within/toolbar:overflow-visible",
          ].join(" ")}
        >
          <button
            type="button"
            aria-label="بالا"
            title="جابه‌جایی این بلوک به بالا"
            onClick={onMoveUp}
            disabled={canMoveUp === false}
            className={btnClass}
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="پایین"
            title="جابه‌جایی این بلوک به پایین"
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
