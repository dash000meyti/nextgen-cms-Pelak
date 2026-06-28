import type { MediaAsset } from "@nextgen-cms/contract/types/media";
import { isImageMimeType } from "@nextgen-cms/core/media/constants";

type MediaGridProps = {
  assets: MediaAsset[];
  onDelete: (asset: MediaAsset) => void;
  deletingId: number | null;
  deletableIds: Set<number>;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes.toLocaleString("fa-IR")} بایت`;
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${Number(kb.toFixed(1)).toLocaleString("fa-IR")} کیلوبایت`;
  }
  return `${Number((kb / 1024).toFixed(1)).toLocaleString("fa-IR")} مگابایت`;
}

export function MediaGrid({
  assets,
  onDelete,
  deletingId,
  deletableIds,
}: MediaGridProps) {
  if (assets.length === 0) {
    return (
      <p className="rounded border border-rule bg-surface px-4 py-12 text-center text-sm text-ink-muted">
        فایلی در این پوشه نیست.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {assets.map((asset) => {
        const canDelete = deletableIds.has(asset.id);
        return (
          <article
            key={asset.id}
            className="group overflow-hidden rounded border border-rule bg-surface"
          >
            <div className="flex aspect-square items-center justify-center bg-surface-2">
              {isImageMimeType(asset.mimeType) ? (
                // biome-ignore lint/performance/noImgElement: admin media thumbnails
                <img
                  src={asset.publicUrl}
                  alt={asset.originalName}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-ink-muted">فایل</span>
              )}
            </div>
            <div className="space-y-2 p-3">
              <p
                className="truncate text-xs font-medium text-ink"
                title={asset.originalName}
              >
                {asset.originalName}
              </p>
              <p className="text-[11px] text-ink-muted">
                {formatBytes(asset.sizeBytes)}
              </p>
              <div className="flex gap-2">
                <a
                  href={asset.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-accent hover:underline"
                >
                  مشاهده
                </a>
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(asset)}
                    disabled={deletingId === asset.id}
                    className="text-[11px] text-accent hover:underline disabled:opacity-50"
                  >
                    {deletingId === asset.id ? "در حال حذف…" : "حذف"}
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
