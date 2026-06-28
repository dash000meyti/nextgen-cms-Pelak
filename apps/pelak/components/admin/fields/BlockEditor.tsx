"use client";

import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";
import { useState } from "react";
import { ImageField } from "@/components/admin/fields/ImageField";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import { TextField } from "@/components/admin/fields/TextField";

type EditorBlock = ArticleBlock & { _key: string };

function newKey() {
  return crypto.randomUUID();
}

function createBlock(type: ArticleBlock["type"]): EditorBlock {
  switch (type) {
    case "heading":
      return { _key: newKey(), type: "heading", content: "" };
    case "quote":
      return { _key: newKey(), type: "quote", content: "", attribution: "" };
    case "image":
      return {
        _key: newKey(),
        type: "image",
        image: { src: "", alt: "", caption: "", credit: "" },
      };
    default:
      return { _key: newKey(), type: "paragraph", content: "" };
  }
}

function toEditorBlocks(blocks: ArticleBlock[]): EditorBlock[] {
  return blocks.map((block) => ({ ...block, _key: newKey() }));
}

function fromEditorBlocks(blocks: EditorBlock[]): ArticleBlock[] {
  return blocks.map((block) => {
    if (block.type === "paragraph" || block.type === "heading") {
      return { type: block.type, content: block.content };
    }
    if (block.type === "quote") {
      return {
        type: "quote",
        content: block.content,
        ...(block.attribution?.trim()
          ? { attribution: block.attribution }
          : {}),
      };
    }
    return {
      type: "image",
      image: {
        src: block.image.src,
        alt: block.image.alt,
        ...(block.image.caption ? { caption: block.image.caption } : {}),
        ...(block.image.credit ? { credit: block.image.credit } : {}),
      },
    };
  });
}

const BLOCK_LABELS: Record<ArticleBlock["type"], string> = {
  paragraph: "پاراگراف",
  heading: "عنوان",
  quote: "نقل‌قول",
  image: "تصویر",
};

type BlockEditorProps = {
  value: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
  uploadContext?: MediaUploadContext;
};

export function BlockEditor({
  value,
  onChange,
  uploadContext,
}: BlockEditorProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() =>
    toEditorBlocks(value),
  );

  function update(next: EditorBlock[]) {
    setBlocks(next);
    onChange(fromEditorBlocks(next));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(target, 0, item);
    update(next);
  }

  function remove(index: number) {
    update(blocks.filter((_, i) => i !== index));
  }

  function patch(index: number, block: EditorBlock) {
    update(blocks.map((item, i) => (i === index ? block : item)));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-ink">بدنهٔ محتوا</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(BLOCK_LABELS) as ArticleBlock["type"][]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update([...blocks, createBlock(type)])}
              className="rounded border border-rule px-3 py-1 text-xs text-ink hover:bg-surface-2"
            >
              + {BLOCK_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {blocks.length === 0 ? (
        <p className="rounded border border-dashed border-rule px-4 py-8 text-center text-sm text-ink-muted">
          بلوکی اضافه نشده است.
        </p>
      ) : (
        blocks.map((block, index) => (
          <div
            key={block._key}
            className="space-y-3 rounded border border-rule bg-surface-2 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-ink-muted">
                {BLOCK_LABELS[block.type]}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded border border-rule px-2 py-1 text-xs disabled:opacity-40"
                  aria-label="بالا"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === blocks.length - 1}
                  className="rounded border border-rule px-2 py-1 text-xs disabled:opacity-40"
                  aria-label="پایین"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="rounded border border-rule px-2 py-1 text-xs text-accent"
                >
                  حذف
                </button>
              </div>
            </div>

            {block.type === "paragraph" || block.type === "heading" ? (
              <TextareaField
                id={`block-${block._key}`}
                label="متن"
                value={block.content}
                onChange={(content) => patch(index, { ...block, content })}
                rows={block.type === "heading" ? 2 : 5}
              />
            ) : null}

            {block.type === "quote" ? (
              <>
                <TextareaField
                  id={`block-${block._key}-quote`}
                  label="نقل‌قول"
                  value={block.content}
                  onChange={(content) => patch(index, { ...block, content })}
                  rows={3}
                />
                <TextField
                  id={`block-${block._key}-attr`}
                  label="نسبت"
                  value={block.attribution ?? ""}
                  onChange={(attribution) =>
                    patch(index, { ...block, attribution })
                  }
                />
              </>
            ) : null}

            {block.type === "image" ? (
              <ImageField
                id={`block-${block._key}`}
                label="تصویر"
                src={block.image.src}
                alt={block.image.alt}
                caption={block.image.caption ?? ""}
                credit={block.image.credit ?? ""}
                onSrcChange={(src) =>
                  patch(index, {
                    ...block,
                    image: { ...block.image, src },
                  })
                }
                onAltChange={(alt) =>
                  patch(index, {
                    ...block,
                    image: { ...block.image, alt },
                  })
                }
                onCaptionChange={(caption) =>
                  patch(index, {
                    ...block,
                    image: { ...block.image, caption },
                  })
                }
                onCreditChange={(credit) =>
                  patch(index, {
                    ...block,
                    image: { ...block.image, credit },
                  })
                }
                showCaption
                required
                uploadContext={uploadContext}
              />
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}
