"use client";

import type {
  ArticleBlock,
  BlockType,
} from "@nextgen-cms/contract/types/article";
import { useEffect, useRef } from "react";
import { listInsertableBlocks } from "./blockRegistry";
import type { BlockIcon } from "./blockTypes";

type InsertionMenuProps = {
  onSelect: (block: ArticleBlock) => void;
  onClose: () => void;
};

const GROUP_LABEL: Record<string, string> = {
  text: "متن",
  media: "رسانه",
  interactive: "تعاملی",
};
const GROUP_ORDER = ["text", "media", "interactive"];

export function InsertionMenu({ onSelect, onClose }: InsertionMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const items = listInsertableBlocks();

  useEffect(() => {
    function handlePointer(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: items.filter((item) => item.group === group),
  })).filter((entry) => entry.items.length > 0);

  return (
    <div
      ref={ref}
      role="menu"
      className="absolute z-30 mt-1 w-56 rounded-lg border border-rule bg-paper p-1.5 shadow-lg"
    >
      {grouped.map(({ group, items: groupItems }) => (
        <div key={group} className="mb-1 last:mb-0">
          <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-ink-faint">
            {GROUP_LABEL[group]}
          </p>
          {groupItems.map((item) => (
            <MenuButton
              key={`${item.type}-${item.label}`}
              Icon={item.Icon}
              label={item.label}
              onSelect={() => onSelect(item.payload)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function MenuButton({
  Icon,
  label,
  onSelect,
}: {
  Icon: BlockIcon;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-surface-2"
    >
      <Icon className="h-4 w-4 text-ink-muted" />
      <span>{label}</span>
    </button>
  );
}

export type { BlockType };
