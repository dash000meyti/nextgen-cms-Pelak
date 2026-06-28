"use client";

import type { PickerOption } from "@nextgen-cms/studio/cms/queries";
import { useMemo, useState } from "react";

type ReferencePickerProps = {
  label: string;
  options: PickerOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  multiple?: boolean;
  readOnly?: boolean;
};

export function ReferencePicker({
  label,
  options,
  selectedIds,
  onChange,
  multiple = false,
  readOnly = false,
}: ReferencePickerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, query]);

  function toggle(id: number) {
    if (multiple) {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter((item) => item !== id));
      } else {
        onChange([...selectedIds, id]);
      }
      return;
    }
    onChange([id]);
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-ink">{label}</span>
      {readOnly ? (
        <div className="rounded border border-rule bg-surface-2 px-3 py-2 text-sm text-ink">
          {selectedIds.length === 0
            ? "—"
            : options
                .filter((option) => selectedIds.includes(option.id))
                .map((option) => option.label)
                .join("، ")}
        </div>
      ) : (
        <>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو…"
            className="w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <div className="max-h-48 space-y-1 overflow-y-auto rounded border border-rule bg-paper p-2">
            {filtered.length === 0 ? (
              <p className="px-2 py-3 text-sm text-ink-muted">
                موردی یافت نشد.
              </p>
            ) : (
              filtered.map((option) => {
                const checked = selectedIds.includes(option.id);
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-surface-2 ${
                      checked ? "bg-accent-soft text-accent" : "text-ink"
                    }`}
                  >
                    <input
                      type={multiple ? "checkbox" : "radio"}
                      name={label}
                      checked={checked}
                      onChange={() => toggle(option.id)}
                      className="accent-accent"
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })
            )}
          </div>
          {multiple && selectedIds.length > 0 ? (
            <p className="text-xs text-ink-faint">
              {selectedIds.length.toLocaleString("fa-IR")} مورد انتخاب شده
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
