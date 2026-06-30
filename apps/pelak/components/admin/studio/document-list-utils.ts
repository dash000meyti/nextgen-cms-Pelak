import type { DocumentListColumn } from "./DocumentList";

export type SortDirection = "asc" | "desc";

export type DocumentListSort = {
  key: string;
  direction: SortDirection;
};

function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase("fa");
}

function cellSearchText<T>(row: T, column: DocumentListColumn<T>): string {
  if (column.searchText) {
    return column.searchText(row);
  }
  if (column.sortValue) {
    const value = column.sortValue(row);
    if (value == null) return "";
    if (value instanceof Date) return value.toISOString();
    return String(value);
  }
  return "";
}

export function filterRows<T>(
  rows: T[],
  query: string,
  columns: DocumentListColumn<T>[],
): T[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return rows;

  return rows.filter((row) =>
    columns.some((column) =>
      normalizeSearchText(cellSearchText(row, column)).includes(
        normalizedQuery,
      ),
    ),
  );
}

function compareValues(
  left: string | number | Date | null | undefined,
  right: string | number | Date | null | undefined,
): number {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;

  if (left instanceof Date && right instanceof Date) {
    return left.getTime() - right.getTime();
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right), "fa", {
    numeric: true,
    sensitivity: "base",
  });
}

export function sortRows<T>(
  rows: T[],
  sort: DocumentListSort | null,
  columns: DocumentListColumn<T>[],
): T[] {
  if (!sort) return rows;

  const column = columns.find((item) => item.key === sort.key);
  if (!column?.sortable || !column.sortValue) return rows;

  const sorted = [...rows].sort((left, right) => {
    const comparison = compareValues(
      column.sortValue?.(left),
      column.sortValue?.(right),
    );
    return sort.direction === "asc" ? comparison : -comparison;
  });

  return sorted;
}

export function nextSortState(
  current: DocumentListSort | null,
  columnKey: string,
): DocumentListSort {
  if (current?.key !== columnKey) {
    return { key: columnKey, direction: "asc" };
  }
  return {
    key: columnKey,
    direction: current.direction === "asc" ? "desc" : "asc",
  };
}
