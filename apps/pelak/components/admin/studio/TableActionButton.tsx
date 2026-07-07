import Link from "next/link";
import type { ReactNode } from "react";

const actionButtonClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded border border-rule text-ink-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50";

type TableActionLinkProps = {
  href: string;
  label: string;
  icon: "view" | "edit";
  target?: string;
  rel?: string;
};

type TableActionButtonProps = {
  label: string;
  icon: "restore" | "delete";
  onClick: () => void;
  disabled?: boolean;
};

export function TableActionLink({
  href,
  label,
  icon,
  target,
  rel,
}: TableActionLinkProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      aria-label={label}
      className={actionButtonClass}
    >
      <ActionIcon name={icon} />
    </Link>
  );
}

export function TableActionButton({
  label,
  icon,
  onClick,
  disabled,
}: TableActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={actionButtonClass}
    >
      <ActionIcon name={icon} />
    </button>
  );
}

export function TableHeaderIcon({
  name,
  label,
}: {
  name: "id" | "actions";
  label: string;
}) {
  return (
    <span className="inline-flex items-center">
      <ActionIcon name={name} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function ActionIcon({
  name,
}: {
  name:
    | TableActionLinkProps["icon"]
    | TableActionButtonProps["icon"]
    | "id"
    | "actions";
}) {
  const icons: Record<string, ReactNode> = {
    view: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    edit: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
    restore: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 7v6h6" />
        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.36 2.64L3 13" />
      </svg>
    ),
    delete: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
    ),
    id: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 9h16" />
        <path d="M4 15h16" />
        <path d="M10 3 8 21" />
        <path d="M16 3 14 21" />
      </svg>
    ),
    actions: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  };

  return icons[name];
}
