"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import {
  type DocumentListSort,
  filterRows,
  nextSortState,
  type SortDirection,
  sortRows,
} from "./document-list-utils";
import { TableActionLink, TableHeaderIcon } from "./TableActionButton";

export type DocumentListColumn<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number | Date | null | undefined;
  searchText?: (row: T) => string;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
};

type DocumentListProps<T> = {
  title: string;
  newHref?: string;
  newLabel?: string;
  columns: DocumentListColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  editHref?: (row: T) => string;
  viewHref?: (row: T) => string | undefined;
  renderActions?: (row: T) => ReactNode;
  emptyMessage?: string;
  toolbar?: ReactNode;
  searchPlaceholder?: string;
  defaultSort?: DocumentListSort | null;
};

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  return (
    <span
      className={`ms-1 inline-flex flex-col leading-none ${active ? "text-accent" : "text-ink-faint"}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 8 5"
        className={`size-2 ${active && direction === "asc" ? "opacity-100" : "opacity-40"}`}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4 0 7.5 5H.5z" />
      </svg>
      <svg
        viewBox="0 0 8 5"
        className={`-mt-px size-2 ${active && direction === "desc" ? "opacity-100" : "opacity-40"}`}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4 5 .5 0h7z" />
      </svg>
    </span>
  );
}

export function DocumentList<T>({
  title,
  newHref,
  newLabel = "جدید",
  columns,
  rows,
  rowKey,
  editHref,
  viewHref,
  renderActions,
  emptyMessage = "موردی یافت نشد.",
  toolbar,
  searchPlaceholder = "جستجو…",
  defaultSort,
}: DocumentListProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<DocumentListSort | null>(
    defaultSort ?? null,
  );

  const visibleRows = useMemo(() => {
    const filtered = filterRows(rows, query, columns);
    return sortRows(filtered, sort, columns);
  }, [rows, query, sort, columns]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {title ? (
          <h1 className="font-heading text-2xl text-ink">{title}</h1>
        ) : (
          <div />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative">
            <span className="sr-only">{searchPlaceholder}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-48 rounded border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none sm:w-56"
            />
          </label>
          {toolbar}
          {newHref ? (
            <Link
              href={newHref}
              className="rounded bg-accent px-4 py-2 text-sm text-paper hover:bg-accent-hover"
            >
              {newLabel}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-rule bg-surface">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-rule bg-surface-2 text-ink-muted">
              {columns.map((column) => {
                const isSortable = Boolean(column.sortable && column.sortValue);
                const isActive = sort?.key === column.key;

                return (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-start font-medium ${column.className ?? ""} ${column.headerClassName ?? ""}`}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSort((current) =>
                            nextSortState(current, column.key),
                          )
                        }
                        className="inline-flex items-center hover:text-ink"
                      >
                        {column.header}
                        <SortIndicator
                          active={isActive}
                          direction={
                            isActive ? (sort?.direction ?? "asc") : "asc"
                          }
                        />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
              <th className="px-4 py-3 text-start font-medium">
                <TableHeaderIcon name="actions" label="عملیات" />
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-8 text-center text-ink-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => {
                const viewUrl = viewHref?.(row);
                return (
                  <tr
                    key={rowKey(row)}
                    className="border-b border-rule last:border-0"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-ink ${column.className ?? ""} ${column.cellClassName ?? ""}`}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      {renderActions ? (
                        <div className="flex items-center gap-1.5">
                          {renderActions(row)}
                        </div>
                      ) : editHref || viewHref ? (
                        <div className="flex items-center gap-1.5">
                          {viewUrl ? (
                            <TableActionLink
                              href={viewUrl}
                              target="_blank"
                              rel="noreferrer"
                              label="مشاهده"
                              icon="view"
                            />
                          ) : null}
                          {editHref ? (
                            <TableActionLink
                              href={editHref(row)}
                              label="ویرایش"
                              icon="edit"
                            />
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-ink-faint">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
