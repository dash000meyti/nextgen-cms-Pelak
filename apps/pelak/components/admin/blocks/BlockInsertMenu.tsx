"use client";

import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import { useEffect, useRef } from "react";
import { BlockInsertPalette } from "./BlockInsertPalette";

type InsertionMenuProps = {
  onSelect: (block: ArticleBlock) => void;
  onClose: () => void;
};

export function InsertionMenu({ onSelect, onClose }: InsertionMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className="w-max">
      <BlockInsertPalette
        layout="menu"
        onSelect={(block) => {
          onSelect(block);
          onClose();
        }}
      />
    </div>
  );
}
