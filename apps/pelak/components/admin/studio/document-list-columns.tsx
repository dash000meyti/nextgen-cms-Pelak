"use client";

import type { DocumentListColumn } from "./DocumentList";
import { TableHeaderIcon } from "./TableActionButton";

export function idColumn<T extends { id: number }>(): DocumentListColumn<T> {
  return {
    key: "id",
    header: <TableHeaderIcon name="id" label="شناسه" />,
    sortable: true,
    sortValue: (row) => row.id,
    searchText: (row) => String(row.id),
    className: "w-20",
    render: (row) => (
      <span dir="ltr">{row.id.toLocaleString("fa-IR")}</span>
    ),
  };
}
