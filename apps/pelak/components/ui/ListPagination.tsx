import Link from "next/link";

type ListPaginationProps = {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
};

function buildHref(
  basePath: string,
  page: number,
  query?: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function ListPagination({
  page,
  totalPages,
  basePath,
  query,
}: ListPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="صفحه‌بندی"
      className="flex items-center justify-center gap-4 pt-8"
    >
      {page > 1 ? (
        <Link
          href={buildHref(basePath, page - 1, query)}
          className="rounded border border-rule px-4 py-2 text-sm text-ink-muted transition-colors hover:border-accent hover:text-accent"
        >
          قبلی
        </Link>
      ) : (
        <span className="rounded border border-rule px-4 py-2 text-sm text-ink-faint">
          قبلی
        </span>
      )}
      <span className="text-sm text-ink-muted">
        صفحه {page.toLocaleString("fa-IR")} از{" "}
        {totalPages.toLocaleString("fa-IR")}
      </span>
      {page < totalPages ? (
        <Link
          href={buildHref(basePath, page + 1, query)}
          className="rounded border border-rule px-4 py-2 text-sm text-ink-muted transition-colors hover:border-accent hover:text-accent"
        >
          بعدی
        </Link>
      ) : (
        <span className="rounded border border-rule px-4 py-2 text-sm text-ink-faint">
          بعدی
        </span>
      )}
    </nav>
  );
}
