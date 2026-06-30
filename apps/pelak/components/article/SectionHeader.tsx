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
          <h1 className="text-section-title">{title}</h1>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {description ? (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function SectionTitle({
  title,
  action,
  bordered,
  titleClassName = "",
  titleWeight = "heading",
}: {
  title: string;
  action?: React.ReactNode;
  bordered?: boolean;
  titleClassName?: string;
  titleWeight?: "heading" | "normal";
}) {
  const titleTypography =
    titleWeight === "heading"
      ? "text-block-title"
      : "m-0 font-sans text-lg leading-relaxed font-normal text-accent";

  const TitleTag = titleWeight === "heading" ? "h2" : "p";

  return (
    <div
      className={`flex items-center justify-between pb-3${bordered ? " border-b border-rule" : ""}`}
    >
      <TitleTag
        className={`${titleTypography} flex items-center gap-2.5 ${titleClassName}`.trim()}
      >
        {title}
      </TitleTag>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
