import { normalizeFolderPath } from "@nextgen-cms/contract/media/folder-path";
import Link from "next/link";

type FolderBreadcrumbProps = {
  folder: string;
};

function folderSegments(folder: string): string[] {
  return normalizeFolderPath(folder).split("/").filter(Boolean);
}

export function FolderBreadcrumb({ folder }: FolderBreadcrumbProps) {
  const segments = folderSegments(folder);
  const crumbs: { label: string; href: string }[] = [
    { label: "ریشه", href: "/admin/media" },
  ];

  let path = "";
  for (const segment of segments) {
    path = `${path}${segment}/`;
    crumbs.push({
      label: segment,
      href: `/admin/media?folder=${encodeURIComponent(path)}`,
    });
  }

  return (
    <nav
      aria-label="مسیر پوشه"
      className="flex flex-wrap items-center gap-1 text-sm text-ink-muted"
    >
      {crumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {index > 0 ? <span aria-hidden>/</span> : null}
          {index === crumbs.length - 1 ? (
            <span className="text-ink">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-accent">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
