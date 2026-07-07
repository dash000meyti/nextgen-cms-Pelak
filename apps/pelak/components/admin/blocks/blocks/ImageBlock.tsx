"use client";

import { ImageField } from "@/components/admin/fields/ImageField";
import type { BlockEditorProps } from "../blockTypes";

export function ImageBlock({
  block: rawBlock,
  blockId,
  onChange,
  uploadContext,
}: BlockEditorProps) {
  if (rawBlock.type !== "image") return null;
  const block = rawBlock;
  const { image } = block;
  return (
    <ImageField
      id={`block-image-${blockId}`}
      src={image.src}
      alt={image.alt}
      caption={image.caption ?? ""}
      credit={image.credit ?? ""}
      onSrcChange={(src) => onChange({ ...block, image: { ...image, src } })}
      onAltChange={(alt) => onChange({ ...block, image: { ...image, alt } })}
      onCaptionChange={(caption) =>
        onChange({ ...block, image: { ...image, caption } })
      }
      onCreditChange={(credit) =>
        onChange({ ...block, image: { ...image, credit } })
      }
      showCaption
      required
      uploadContext={uploadContext}
      twoColumn
    />
  );
}
