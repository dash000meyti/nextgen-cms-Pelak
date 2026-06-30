import Link from "next/link";
import type { ReactNode } from "react";

export type DocumentListColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
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
  emptyMessage?: string;
  toolbar?: ReactNode;
};

export function DocumentList<T>({
  title,
  newHref,
  newLabel = "جدید",
  columns,
  rows,
  rowKey,
  editHref,
  viewHref,
  emptyMessage = "موردی یافت نشد.",
  toolbar,
}: DocumentListProps<T>) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl text-ink">{title}</h1>
        <div className="flex items-center gap-3">
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
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-start font-medium ${column.className ?? ""} ${column.headerClassName ?? ""}`}
                >
                  {column.header}
                </th>
              ))}
              <th className="px-4 py-3 text-start font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-8 text-center text-ink-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
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
                    {editHref || viewHref ? (
                      <div className="flex items-center gap-3">
                        {viewUrl ? (
                          <Link
                            href={viewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent hover:underline"
                          >
                            مشاهده
                          </Link>
                        ) : null}
                        {editHref ? (
                          <Link
                            href={editHref(row)}
                            className="text-accent hover:underline"
                          >
                            ویرایش
                          </Link>
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
