import Link from "next/link";

type Crumb = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: Crumb[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="مسیر"
      className="flex flex-wrap items-center gap-2 text-xs text-ink-muted"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span
            key={`${item.label}-${index}`}
            className="flex items-center gap-2"
          >
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-accent">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-ink" : ""}>{item.label}</span>
            )}
            {!isLast ? <span aria-hidden="true">/</span> : null}
          </span>
        );
      })}
    </nav>
  );
}
