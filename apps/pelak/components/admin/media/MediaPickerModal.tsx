"use client";

import type {
  MediaAsset,
  MediaUploadContext,
} from "@nextgen-cms/contract/types/media";
import { isImageMimeType } from "@nextgen-cms/core/media/constants";
import { listMediaForPickerAction } from "@nextgen-cms/studio/cms/mutations/media";
import { useEffect, useState } from "react";

type MediaPickerModalProps = {
  open: boolean;
  uploadContext: MediaUploadContext;
  onSelect: (url: string) => void;
  onClose: () => void;
};

export function MediaPickerModal({
  open,
  uploadContext,
  onSelect,
  onClose,
}: MediaPickerModalProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setError(null);
    void listMediaForPickerAction(uploadContext)
      .then(setAssets)
      .catch(() => setError("بارگذاری مدیا ناموفق بود."))
      .finally(() => setLoading(false));
  }, [open, uploadContext]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="بستن"
        onClick={onClose}
      />
      <div
        className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded border border-rule bg-paper p-4 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="media-picker-title" className="font-heading text-lg text-ink">
            انتخاب از مدیا
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-ink-muted hover:text-ink"
          >
            بستن
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-ink-muted">در حال بارگذاری…</p>
        ) : null}
        {error ? (
          <p className="text-sm text-accent" role="alert">
            {error}
          </p>
        ) : null}
        {!loading && !error && assets.length === 0 ? (
          <p className="text-sm text-ink-muted">مدیایی در این محتوا نیست.</p>
        ) : null}

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {assets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => {
                onSelect(asset.publicUrl);
                onClose();
              }}
              className="overflow-hidden rounded border border-rule hover:border-accent"
            >
              {isImageMimeType(asset.mimeType) ? (
                // biome-ignore lint/performance/noImgElement: admin media picker thumbnails
                <img
                  src={asset.publicUrl}
                  alt={asset.originalName}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <span className="block p-4 text-xs text-ink-muted">
                  {asset.originalName}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
