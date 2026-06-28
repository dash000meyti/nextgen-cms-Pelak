type IssueBadgeProps = {
  label: string;
};

export function IssueBadge({ label }: IssueBadgeProps) {
  return (
    <span className="inline-flex items-center border border-rule px-2.5 py-1 text-xs tracking-wide text-ink-muted uppercase">
      {label}
    </span>
  );
}
