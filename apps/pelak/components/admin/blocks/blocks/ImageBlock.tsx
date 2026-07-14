"use client";

import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";
import { uploadMedia } from "@nextgen-cms/studio/cms/mutations/media";
import { useRef, useState } from "react";
import { BlockPlainInput } from "@/components/admin/blocks/BlockPlainInput";
import { BlockPlainTextarea } from "@/components/admin/blocks/BlockPlainTextarea";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import {
  FIGURE_CAPTION_CLASS,
  FIGURE_CLASS,
  FIGURE_IMG_CLASS,
} from "@/components/article/blockStyles";
import type { BlockEditorProps } from "../blockTypes";

const chromeBtn =
  "shrink-0 rounded border border-rule bg-paper/95 px-2.5 py-1.5 text-xs text-ink shadow-sm hover:bg-surface disabled:opacity-50";

const chromeInput =
  "w-full rounded border border-rule bg-paper/95 px-2.5 py-1.5 text-xs text-ink outline-none placeholder:text-ink-faint focus:border-accent";

export function ImageBlock({
  block: rawBlock,
  blockId,
  onChange,
  uploadContext,
}: BlockEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  if (rawBlock.type !== "image") return null;
  const block = rawBlock;
  const { image } = block;

  async function handleUpload(file: File, context?: MediaUploadContext) {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadMedia(formData, context);
      if (!result.ok) {
        setUploadError(result.error);
        return;
      }
      if (result.url) {
        onChange({ ...block, image: { ...image, src: result.url } });
      }
    } catch {
      setUploadError("خطا در آپلود — دوباره تلاش کنید.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <figure className={`${FIGURE_CLASS} my-0!`}>
      {uploadContext ? (
        <MediaPickerModal
          open={pickerOpen}
          uploadContext={uploadContext}
          onSelect={(src) =>
            onChange({ ...block, image: { ...image, src } })
          }
          onClose={() => setPickerOpen(false)}
        />
      ) : null}

      <div className="relative aspect-video w-full overflow-hidden rounded border border-dashed border-rule bg-surface-2">
        {image.src ? (
          // biome-ignore lint/performance/noImgElement: must preserve original image ratio without known dimensions
          <img
            src={image.src}
            alt={image.alt || "پیش‌نمایش تصویر"}
            className={`${FIGURE_IMG_CLASS} absolute inset-0 h-full w-full object-contain`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-ink-faint">
            پیش‌نمایش تصویر
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between gap-2 bg-linear-to-b from-paper/80 via-transparent to-paper/80 p-2">
          <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
            <input
              id={`block-image-src-${blockId}`}
              type="url"
              value={image.src}
              onChange={(e) =>
                onChange({
                  ...block,
                  image: { ...image, src: e.target.value },
                })
              }
              placeholder="آدرس تصویر…"
              required
              className={`${chromeInput} min-w-0 flex-1`}
            />
            {uploadContext ? (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className={chromeBtn}
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
                if (file) void handleUpload(file, uploadContext);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className={chromeBtn}
            >
              {uploading ? "در حال آپلود…" : "آپلود"}
            </button>
          </div>

          <input
            id={`block-image-alt-${blockId}`}
            type="text"
            value={image.alt}
            onChange={(e) =>
              onChange({
                ...block,
                image: { ...image, alt: e.target.value },
              })
            }
            placeholder="متن جایگزین…"
            required
            className={`${chromeInput} pointer-events-auto`}
          />
        </div>
      </div>

      {uploadError ? (
        <p className="mt-2 text-xs text-accent" role="alert">
          {uploadError}
        </p>
      ) : null}

      <figcaption className={FIGURE_CAPTION_CLASS}>
        <BlockPlainTextarea
          id={`block-image-caption-${blockId}`}
          value={image.caption ?? ""}
          onChange={(e) =>
            onChange({
              ...block,
              image: { ...image, caption: e.target.value || undefined },
            })
          }
          rows={1}
          placeholder="زیرنویس…"
          className="w-full font-sans text-base! leading-relaxed! text-ink-muted!"
        />
        <BlockPlainInput
          id={`block-image-credit-${blockId}`}
          value={image.credit ?? ""}
          onChange={(e) =>
            onChange({
              ...block,
              image: { ...image, credit: e.target.value || undefined },
            })
          }
          placeholder="اعتبار…"
          className="w-full font-sans text-base! leading-relaxed! text-ink-muted! opacity-80"
        />
      </figcaption>
    </figure>
  );
}
