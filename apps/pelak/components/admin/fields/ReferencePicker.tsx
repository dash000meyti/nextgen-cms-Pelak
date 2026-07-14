"use client";

import type { PickerOption } from "@nextgen-cms/studio/cms/queries";
import { useEffect, useId, useMemo, useRef, useState } from "react";

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
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => options.filter((option) => selectedIds.includes(option.id)),
    [options, selectedIds],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = multiple
      ? options.filter((opt) => !selectedIds.includes(opt.id))
      : options;
    if (!q) return pool;
    return pool.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, query, multiple, selectedIds]);

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function select(id: number) {
    if (multiple) {
      if (selectedIds.includes(id)) return;
      onChange([...selectedIds, id]);
      setQuery("");
      return;
    }
    onChange([id]);
    setQuery("");
    setOpen(false);
  }

  function remove(id: number) {
    onChange(selectedIds.filter((item) => item !== id));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const first = filtered[0];
      if (first) select(first.id);
    }
    if (e.key === "Backspace" && query === "" && selectedIds.length > 0) {
      const last = selectedIds[selectedIds.length - 1];
      if (last != null) remove(last);
    }
  }

  return (
    <div ref={rootRef} className="relative space-y-1.5">
      <span className="block text-sm font-medium text-ink">{label}</span>

      {readOnly ? (
        <div className="flex min-h-10 flex-wrap gap-1.5 rounded border border-rule bg-surface-2 px-2 py-1.5">
          {selected.length === 0 ? (
            <span className="text-sm text-ink-muted">—</span>
          ) : (
            selected.map((option) => (
              <span
                key={option.id}
                className="rounded bg-paper px-2 py-0.5 text-xs text-ink ring-1 ring-rule"
              >
                {option.label}
              </span>
            ))
          )}
        </div>
      ) : (
        <>
          <div
            className={[
              "flex min-h-10 flex-wrap items-center gap-1.5 rounded border bg-paper px-2 py-1.5",
              open ? "border-accent" : "border-rule",
            ].join(" ")}
          >
            {selected.map((option) => (
              <span
                key={option.id}
                className="inline-flex max-w-full items-center gap-1 rounded bg-accent-soft px-2 py-0.5 text-xs text-accent"
              >
                <span className="truncate">{option.label}</span>
                <button
                  type="button"
                  aria-label={`حذف ${option.label}`}
                  onClick={() => remove(option.id)}
                  className="shrink-0 rounded text-accent/80 hover:text-accent"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={selected.length === 0 ? "جستجو…" : "افزودن…"}
              aria-expanded={open}
              aria-controls={listId}
              role="combobox"
              autoComplete="off"
              className="min-w-24 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
          </div>

          {open ? (
            <div
              id={listId}
              role="listbox"
              className="absolute inset-x-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border border-rule bg-paper p-1 shadow-lg"
            >
              {filtered.length === 0 ? (
                <p className="px-2 py-2 text-sm text-ink-muted">
                  موردی یافت نشد.
                </p>
              ) : (
                filtered.map((option) => {
                  const active = selectedIds.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => select(option.id)}
                      className={[
                        "flex w-full items-center rounded-md px-2 py-1.5 text-start text-sm",
                        active
                          ? "bg-accent-soft text-accent"
                          : "text-ink hover:bg-surface-2",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  );
                })
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
