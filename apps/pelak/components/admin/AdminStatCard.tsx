type AdminStatCardProps = {
  label: string;
  value: number;
  hint?: string;
};

export function AdminStatCard({ label, value, hint }: AdminStatCardProps) {
  return (
    <div className="rounded-lg border border-rule bg-surface p-5">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-2 font-heading text-3xl text-ink">
        {value.toLocaleString("fa-IR")}
      </p>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
