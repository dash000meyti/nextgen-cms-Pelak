import { buildContentGroupPdfPath } from "@nextgen-cms/contract/short-links";

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

type ContentGroupPdfDownloadProps = {
  number: number;
};

export function ContentGroupPdfDownload({
  number,
}: ContentGroupPdfDownloadProps) {
  return (
    <a
      href={buildContentGroupPdfPath(number)}
      download
      aria-label="دانلود PDF گروه محتوا"
      className="inline-flex items-center justify-center gap-2 rounded-full border border-accent px-5 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
    >
      <DownloadIcon />
      دانلود PDF
    </a>
  );
}
