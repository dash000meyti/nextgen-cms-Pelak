"use client";

import { useRef } from "react";
import { ArrowDownIcon, ArrowUpIcon, GroupSelectIcon } from "./icons";

type BlockSelectHandleProps = {
  label: string;
  isSelected: boolean;
  /** When true, this handle may start a group drag. */
  groupDragEnabled: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onGroupDragStart: (e: React.DragEvent<HTMLButtonElement>) => void;
  onGroupDragEnd: () => void;
};

const idleClass =
  "rounded p-1 text-ink-muted hover:bg-surface-2 disabled:opacity-30";
const selectedClass =
  "rounded p-1 bg-accent-soft text-accent hover:bg-accent-soft";

const SELECT_TOOLTIP = [
  "انتخاب بلوک",
  "کلیک: فقط این بلوک — کلیک دوباره روی همان: لغو انتخاب",
  "⌘/Ctrl+کلیک: افزودن یا حذف از انتخاب",
  "Shift+کلیک: انتخاب بازه از لنگر تا این بلوک",
  "Escape: پاک کردن همهٔ انتخاب‌ها",
].join("\n");

const GROUP_DRAG_TOOLTIP = [
  "انتخاب / جابه‌جایی گروهی",
  "بکشید: جابه‌جایی همهٔ بلوک‌های انتخاب‌شده",
  "⌘/Ctrl+کلیک: چندتایی",
  "Shift+کلیک: بازه",
  "Escape: لغو انتخاب",
  "▲/▼: جابه‌جایی گروه به بالا/پایین",
].join("\n");

/**
 * Chrome column for selection + group drag / group nudge —
 * same overlay pattern as BlockToolbar; arrows live inside this column.
 */
export function BlockSelectHandle({
  label,
  isSelected,
  groupDragEnabled,
  canMoveUp,
  canMoveDown,
  onSelect,
  onMoveUp,
  onMoveDown,
  onGroupDragStart,
  onGroupDragEnd,
}: BlockSelectHandleProps) {
  const draggedRef = useRef(false);

  const title = groupDragEnabled ? GROUP_DRAG_TOOLTIP : SELECT_TOOLTIP;

  const selectBtnClass = [
    isSelected ? selectedClass : idleClass,
    groupDragEnabled ? "cursor-grab active:cursor-grabbing" : "",
  ].join(" ");

  return (
    <div className="group/select relative">
      {/* footprint — keeps layout size fixed to the select button */}
      <div className="invisible rounded-md p-0.5" aria-hidden>
        <div className={idleClass}>
          <GroupSelectIcon className="h-4 w-4" />
        </div>
      </div>

      <div
        className={[
          "absolute inset-s-0 top-0 z-20 flex flex-col items-center gap-0 overflow-visible rounded-md bg-paper/95 p-0.5 shadow-sm ring-1",
          isSelected ? "ring-accent" : "ring-rule",
        ].join(" ")}
      >
        <button
          type="button"
          aria-label={`انتخاب بلوک ${label}`}
          aria-pressed={isSelected}
          title={title}
          className={selectBtnClass}
          draggable={groupDragEnabled}
          onClick={(e) => {
            e.stopPropagation();
            if (draggedRef.current) {
              draggedRef.current = false;
              return;
            }
            onSelect(e);
          }}
          onDragStart={(e) => {
            e.stopPropagation();
            draggedRef.current = true;
            onGroupDragStart(e);
          }}
          onDragEnd={() => {
            onGroupDragEnd();
            window.setTimeout(() => {
              draggedRef.current = false;
            }, 0);
          }}
        >
          <GroupSelectIcon className="h-4 w-4" />
        </button>

        <div
          className={[
            "flex flex-col items-center",
            "max-h-0 opacity-0 pointer-events-none overflow-hidden",
            "group-hover/select:max-h-40 group-hover/select:opacity-100 group-hover/select:pointer-events-auto group-hover/select:overflow-visible",
            "group-focus-within/select:max-h-40 group-focus-within/select:opacity-100 group-focus-within/select:pointer-events-auto group-focus-within/select:overflow-visible",
          ].join(" ")}
        >
          <button
            type="button"
            aria-label="بالا (گروه)"
            title="جابه‌جایی انتخاب به بالا"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={canMoveUp === false}
            className={idleClass}
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="پایین (گروه)"
            title="جابه‌جایی انتخاب به پایین"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={canMoveDown === false}
            className={idleClass}
          >
            <ArrowDownIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
