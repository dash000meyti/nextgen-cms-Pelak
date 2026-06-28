type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function SectionHeader({
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <header className="mb-10 border-b border-rule pb-5">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-3">
          <span
            className="inline-block h-1 w-10 rounded-full bg-accent"
            aria-hidden="true"
          />
          <h1 className="font-heading text-2xl text-ink sm:text-3xl md:text-4xl">
            {title}
          </h1>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {description ? (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center justify-between border-b border-rule pb-3">
      <h2 className="flex items-center gap-2.5 font-heading text-lg text-ink md:text-xl">
        <span
          className="inline-block h-4 w-1 rounded-full bg-accent"
          aria-hidden="true"
        />
        {title}
      </h2>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
