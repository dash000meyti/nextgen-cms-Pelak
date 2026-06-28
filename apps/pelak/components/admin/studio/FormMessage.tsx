export function FormMessage({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  if (!error && !success) return null;

  return (
    <div
      className={`rounded px-4 py-3 text-sm ${
        error ? "bg-accent-soft text-accent" : "bg-surface-2 text-ink"
      }`}
      role={error ? "alert" : "status"}
    >
      {error ?? success}
    </div>
  );
}
