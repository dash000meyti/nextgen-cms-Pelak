"use client";

import { useState } from "react";
import { BlockPlainTextarea } from "@/components/admin/blocks/BlockPlainTextarea";
import {
  FIGURE_CAPTION_CLASS,
  VIDEO_FIGURE_CLASS,
} from "@/components/article/blockStyles";
import { buildAparatEmbedSrc, parseAparatHash } from "@/lib/aparat";
import type { BlockEditorProps } from "../blockTypes";

const chromeInput =
  "w-full rounded border border-rule bg-paper/95 px-2.5 py-1.5 text-xs text-ink outline-none placeholder:text-ink-faint focus:border-accent";

export function VideoBlock({
  block: rawBlock,
  blockId,
  onChange,
}: BlockEditorProps) {
  const [touched, setTouched] = useState(false);
  if (rawBlock.type !== "video") return null;
  const block = rawBlock;

  const embedSrc = buildAparatEmbedSrc(block.src);
  const showInvalid = touched && block.src.trim().length > 0 && !embedSrc;

  return (
    <figure className={`${VIDEO_FIGURE_CLASS} my-0!`}>
      <div className="relative aspect-video w-full overflow-hidden rounded border border-dashed border-rule bg-surface-2">
        {embedSrc ? (
          <div className="absolute inset-0 bg-black">
            <iframe
              src={embedSrc}
              title={`پیش‌نمایش آپارات ${parseAparatHash(block.src) ?? ""}`}
              className="absolute inset-0 h-full w-full"
              frameBorder={0}
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-ink-faint">
            پیش‌نمایش ویدیو
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-linear-to-b from-paper/80 to-transparent p-2">
          <div className="pointer-events-auto space-y-1">
            <input
              id={`block-video-src-${blockId}`}
              type="url"
              value={block.src}
              onChange={(e) => onChange({ ...block, src: e.target.value })}
              onBlur={() => setTouched(true)}
              placeholder="https://www.aparat.com/v/XXXX"
              required
              className={chromeInput}
            />
            {showInvalid ? (
              <p className="text-xs text-accent" role="alert">
                لینک آپارات معتبر نیست.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <figcaption className={FIGURE_CAPTION_CLASS}>
        <BlockPlainTextarea
          id={`block-video-caption-${blockId}`}
          value={block.caption ?? ""}
          onChange={(e) =>
            onChange({
              ...block,
              caption: e.target.value || undefined,
            })
          }
          rows={1}
          placeholder="زیرنویس…"
          className="w-full font-sans text-base! leading-relaxed! text-ink-muted!"
        />
      </figcaption>
    </figure>
  );
}
