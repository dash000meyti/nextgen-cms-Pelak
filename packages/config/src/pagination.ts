export type PaginateOptions = {
  page: number;
  perPage: number;
};

export type PaginateResult<T> = {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

export function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function paginateItems<T>(
  allItems: T[],
  { page, perPage }: PaginateOptions,
): PaginateResult<T> {
  const safePerPage = Math.max(1, perPage);
  const totalItems = allItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePerPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safePerPage;

  return {
    items: allItems.slice(start, start + safePerPage),
    page: safePage,
    perPage: safePerPage,
    totalItems,
    totalPages,
  };
}
