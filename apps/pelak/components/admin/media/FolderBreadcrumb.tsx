import { getFolderBrowseLabel } from "@nextgen-cms/contract/media/folder-display";
import { normalizeFolderPath } from "@nextgen-cms/contract/media/folder-path";
import Link from "next/link";

type FolderBreadcrumbProps = {
  folder: string;
};

function folderSegments(folder: string): string[] {
  return normalizeFolderPath(folder).split("/").filter(Boolean);
}

export function FolderBreadcrumb({ folder }: FolderBreadcrumbProps) {
  if (!folder) {
    return (
      <nav
        aria-label="مسیر پوشه"
        className="flex flex-wrap items-center gap-1 text-sm text-ink-muted"
      >
        <span className="text-ink">ریشه</span>
      </nav>
    );
  }

  const segments = folderSegments(folder);
  let parentPath = "";
  const labeledCrumbs = segments.map((segment) => {
    const currentPath = `${parentPath}${segment}/`;
    const label = getFolderBrowseLabel(parentPath, currentPath);
    const href = `/admin/media?folder=${encodeURIComponent(currentPath)}`;
    parentPath = currentPath;
    return { label, href };
  });

  return (
    <nav
      aria-label="مسیر پوشه"
      className="flex flex-wrap items-center gap-1 text-sm text-ink-muted"
    >
      <Link href="/admin/media" className="hover:text-accent">
        ریشه
      </Link>
      {labeledCrumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <span aria-hidden>/</span>
          {index === labeledCrumbs.length - 1 ? (
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
