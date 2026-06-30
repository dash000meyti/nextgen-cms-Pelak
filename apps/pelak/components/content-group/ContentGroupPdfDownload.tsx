function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4v10m0 0l3.5-3.5M12 14l-3.5-3.5M5 18h14"
      />
    </svg>
  );
}

export function ContentGroupPdfDownload() {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      aria-label="دانلود PDF — به‌زودی"
      className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full border border-accent px-5 py-2 text-sm font-medium text-accent opacity-50"
    >
      <DownloadIcon />
      دانلود PDF
    </button>
  );
}
