"use client";

import type { DocumentListColumn } from "./DocumentList";

export function idColumn<T extends { id: number }>(): DocumentListColumn<T> {
  return {
    key: "id",
    header: "شناسه",
    sortable: true,
    sortValue: (row) => row.id,
    searchText: (row) => String(row.id),
    className: "w-20",
    render: (row) => (
      <span dir="ltr" className="font-mono text-xs text-ink-muted">
        {row.id.toLocaleString("fa-IR")}
      </span>
    ),
  };
}
