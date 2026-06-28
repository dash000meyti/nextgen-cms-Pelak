"use client";

import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";
import { uploadMedia } from "@nextgen-cms/studio/cms/mutations/media";
import { useRef, useState } from "react";
import { TextField } from "@/components/admin/fields/TextField";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";

type ImageFieldProps = {
  id: string;
  label: string;
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  onSrcChange: (value: string) => void;
  onAltChange: (value: string) => void;
  onCaptionChange?: (value: string) => void;
  onCreditChange?: (value: string) => void;
  showCaption?: boolean;
  required?: boolean;
  uploadContext?: MediaUploadContext;
};

export function ImageField({
  id,
  label,
  src,
  alt,
  caption = "",
  credit = "",
  onSrcChange,
  onAltChange,
  onCaptionChange,
  onCreditChange,
  showCaption = false,
  required,
  uploadContext,
}: ImageFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadMedia(formData, uploadContext);
    setUploading(false);
    if (!result.ok) {
      setUploadError(result.error);
      return;
    }
    if (result.url) onSrcChange(result.url);
  }

  return (
    <div className="space-y-4 rounded border border-rule bg-surface-2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-ink">{label}</h3>
        <div className="flex gap-2">
          {uploadContext ? (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="rounded border border-rule px-3 py-1.5 text-xs text-ink hover:bg-surface"
            >
              انتخاب از مدیا
            </button>
          ) : null}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded border border-rule px-3 py-1.5 text-xs text-ink hover:bg-surface disabled:opacity-50"
          >
            {uploading ? "در حال آپلود…" : "آپلود"}
          </button>
        </div>
      </div>

      {uploadContext ? (
        <MediaPickerModal
          open={pickerOpen}
          uploadContext={uploadContext}
          onSelect={onSrcChange}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}

      {uploadError ? (
        <p className="text-xs text-accent" role="alert">
          {uploadError}
        </p>
      ) : null}

      <TextField
        id={`${id}-src`}
        label="آدرس تصویر"
        value={src}
        onChange={onSrcChange}
        required={required}
      />
      <TextField
        id={`${id}-alt`}
        label="متن جایگزین"
        value={alt}
        onChange={onAltChange}
        required={required}
      />
      {showCaption && onCaptionChange ? (
        <TextField
          id={`${id}-caption`}
          label="زیرنویس"
          value={caption}
          onChange={onCaptionChange}
        />
      ) : null}
      {showCaption && onCreditChange ? (
        <TextField
          id={`${id}-credit`}
          label="اعتبار"
          value={credit}
          onChange={onCreditChange}
        />
      ) : null}

      {src ? (
        // biome-ignore lint/performance/noImgElement: admin preview of arbitrary upload URLs
        <img
          src={src}
          alt={alt || label}
          className="max-h-40 rounded border border-rule"
        />
      ) : null}
    </div>
  );
}
