"use client";

import { useState } from "react";
import { TextField } from "@/components/admin/fields/TextField";
import { buildAparatEmbedSrc, parseAparatHash } from "@/lib/aparat";
import type { BlockEditorProps } from "../blockTypes";

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
    <div className="space-y-2">
      <TextField
        id={`block-video-src-${blockId}`}
        label="لینک ویدیو آپارات"
        value={block.src}
        onChange={(src) => onChange({ ...block, src })}
        onBlur={() => setTouched(true)}
        placeholder="https://www.aparat.com/v/XXXX"
        hint={showInvalid ? "لینک آپارات معتبر نیست." : undefined}
        required
      />
      <TextField
        id={`block-video-caption-${blockId}`}
        label="زیرنویس (اختیاری)"
        value={block.caption ?? ""}
        onChange={(caption) => onChange({ ...block, caption })}
        placeholder="توضیح ویدیو"
      />
      {embedSrc ? (
        <div className="relative aspect-video w-full overflow-hidden rounded border border-rule bg-black">
          <iframe
            src={embedSrc}
            title={`پیش‌نمایش آپارات ${parseAparatHash(block.src) ?? ""}`}
            className="absolute inset-0 h-full w-full"
            frameBorder={0}
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : null}
    </div>
  );
}
