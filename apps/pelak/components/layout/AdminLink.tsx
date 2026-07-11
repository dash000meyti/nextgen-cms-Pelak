import Link from "next/link";

export function AdminLink() {
  return (
    <Link
      href="/admin"
      aria-label="رفتن به مدیریت"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rule text-ink-muted transition-colors hover:border-accent hover:text-accent"
    >
      <GridIcon />
    </Link>
  );
}

function GridIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
