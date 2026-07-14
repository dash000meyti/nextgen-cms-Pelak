import type { JSX } from "react";

type IconProps = { className?: string };

function base(className?: string): string {
  return className ?? "h-4 w-4";
}

export function ParagraphIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <path d="M4 6h16M4 10h16M4 14h12M4 18h12" />
    </svg>
  );
}

export function HeadingIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <path d="M6 5v14M18 5v14M6 12h12" />
    </svg>
  );
}

function HeadingLevelIconImpl({
  className,
  level,
}: IconProps & { level: 2 | 3 | 4 }): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className={base(className)} aria-hidden="true">
      <text
        x="12"
        y="16.5"
        fontSize="11"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {`H${level}`}
      </text>
    </svg>
  );
}

export function Heading2Icon({ className }: IconProps): JSX.Element {
  return <HeadingLevelIconImpl className={className} level={2} />;
}

export function Heading3Icon({ className }: IconProps): JSX.Element {
  return <HeadingLevelIconImpl className={className} level={3} />;
}

export function Heading4Icon({ className }: IconProps): JSX.Element {
  return <HeadingLevelIconImpl className={className} level={4} />;
}

export function QuoteIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <path d="M7 7v4a3 3 0 0 1-3 3M7 7H4v4a3 3 0 0 0 3 3M17 7v4a3 3 0 0 1-3 3M17 7h-3v4a3 3 0 0 0 3 3" />
    </svg>
  );
}

export function ImageIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m3 17 5-4 4 3 3-2 6 5" />
    </svg>
  );
}

export function VideoIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ListBulletIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <path d="M11 8h10M11 16h10" />
      <circle cx="5.5" cy="8" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="5.5" cy="16" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ListOrderedIcon({ className }: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className={base(className)} aria-hidden="true">
      <path
        d="M11 8h10M11 16h10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <text
        x="5.5"
        y="10.5"
        fontSize="9"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        1
      </text>
      <text
        x="5.5"
        y="18.5"
        fontSize="9"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        2
      </text>
    </svg>
  );
}

export function ListDashIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <path d="M11 8h10M11 16h10" strokeWidth="1.8" />
      <path d="M3 8h5M3 16h5" />
    </svg>
  );
}

export function TableIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M3 10h18M3 15h18M9 4v16M15 4v16" />
    </svg>
  );
}

export function TableAddColIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="12" height="14" rx="1.5" />
      <path d="M9 5v14M3 12h12M18 8v8M14 12h8" />
    </svg>
  );
}

export function TableRemoveColIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="12" height="14" rx="1.5" />
      <path d="M9 5v14M3 12h12M14 12h8" />
    </svg>
  );
}

export function TableAddRowIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="11" rx="1.5" />
      <path d="M3 8.5h18M12 3v11M12 16v5M9.5 18.5h5" />
    </svg>
  );
}

export function TableRemoveRowIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="11" rx="1.5" />
      <path d="M3 8.5h18M12 3v11M9.5 18.5h5" />
    </svg>
  );
}

export function ButtonPrimaryIcon({ className }: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className={base(className)} aria-hidden="true">
      <rect
        x="3"
        y="8"
        width="18"
        height="8"
        rx="4"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

export function ButtonOutlineIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={base(className)}
      aria-hidden="true"
    >
      <rect x="3" y="8" width="18" height="8" rx="4" />
    </svg>
  );
}

export function ButtonSecondaryIcon({ className }: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className={base(className)} aria-hidden="true">
      <rect
        x="3"
        y="8"
        width="18"
        height="8"
        rx="4"
        fill="currentColor"
        opacity="0.35"
      />
      <rect
        x="3"
        y="8"
        width="18"
        height="8"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function QuestionIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .8-1 1.7v.5" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export function ButtonIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <rect x="3" y="8" width="18" height="8" rx="4" />
      <path d="M12 8v8" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    </svg>
  );
}

export function ArrowUpIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

export function ArrowDownIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}

export function DragHandleIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={base(className)}
      aria-hidden="true"
    >
      <circle cx="9" cy="6" r="1.4" />
      <circle cx="15" cy="6" r="1.4" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <circle cx="9" cy="18" r="1.4" />
      <circle cx="15" cy="18" r="1.4" />
    </svg>
  );
}

/** Select / group-drag handle — stacked layers, distinct from single DragHandleIcon. */
export function GroupSelectIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <path d="M8 7h11a1 1 0 0 1 1 1v7" />
      <rect x="4" y="9" width="13" height="9" rx="1.5" />
    </svg>
  );
}

export function TransformIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <path d="M4 8h12l-3-3M20 16H8l3 3" />
    </svg>
  );
}

export function SaveIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <path d="M5 3h11l3 3v15H5V3z" />
      <path d="M8 3v6h8V3" />
      <path d="M8 17h8" />
    </svg>
  );
}

export function ArchiveIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <path d="M4 5h16v4H4V5z" />
      <path d="M6 9v10h12V9" />
      <path d="M10 13h4" />
    </svg>
  );
}

export function ViewIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={base(className)}
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
