type TagProps = {
  label: string;
  href?: string;
};

export function Tag({ label, href }: TagProps) {
  const className =
    "inline-block rounded-full border border-rule px-3 py-1 text-xs text-ink-muted transition-colors hover:border-accent hover:text-accent";

  if (href) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return <span className={className}>{label}</span>;
}
