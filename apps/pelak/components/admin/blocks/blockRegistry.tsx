import type {
  ArticleBlock,
  BlockType,
} from "@nextgen-cms/contract/types/article";
import { ButtonBlock, ButtonSettings } from "./blocks/ButtonBlock";
import { HeadingBlock, HeadingSettings } from "./blocks/HeadingBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ListBlock, ListSettings } from "./blocks/ListBlock";
import { ParagraphBlock } from "./blocks/ParagraphBlock";
import { QuestionBlock } from "./blocks/QuestionBlock";
import { QuoteBlock } from "./blocks/QuoteBlock";
import { VideoBlock } from "./blocks/VideoBlock";
import type { BlockMeta } from "./blockTypes";
import {
  ButtonIcon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  HeadingIcon,
  ImageIcon,
  ListBulletIcon,
  ListOrderedIcon,
  ParagraphIcon,
  QuestionIcon,
  QuoteIcon,
  VideoIcon,
} from "./icons";

const TEXT_TYPES: BlockType[] = [
  "paragraph",
  "heading",
  "quote",
  "list",
  "question",
];
const INTERACTIVE_TYPES: BlockType[] = ["button"];

const registry: Record<BlockType, BlockMeta> = {
  paragraph: {
    type: "paragraph",
    label: "پاراگراف",
    group: "text",
    Icon: ParagraphIcon,
    createDefault: () => ({ type: "paragraph", content: "" }),
    Editor: ParagraphBlock,
    convertibleTo: ["heading", "quote", "list", "question"],
  },
  heading: {
    type: "heading",
    label: "عنوان",
    group: "text",
    Icon: HeadingIcon,
    createDefault: () => ({ type: "heading", level: 2, content: "" }),
    Editor: HeadingBlock,
    Settings: HeadingSettings,
    convertibleTo: ["paragraph", "quote", "list", "question"],
  },
  quote: {
    type: "quote",
    label: "نقل‌قول",
    group: "text",
    Icon: QuoteIcon,
    createDefault: () => ({ type: "quote", content: "", attribution: "" }),
    Editor: QuoteBlock,
    convertibleTo: ["paragraph", "heading", "list", "question"],
  },
  list: {
    type: "list",
    label: "لیست",
    group: "text",
    Icon: ListBulletIcon,
    createDefault: () => ({ type: "list", variant: "bullet", items: [""] }),
    Editor: ListBlock,
    Settings: ListSettings,
    convertibleTo: ["paragraph", "heading", "quote", "question"],
  },
  question: {
    type: "question",
    label: "پرسش",
    group: "text",
    Icon: QuestionIcon,
    createDefault: () => ({ type: "question", content: "", answer: "" }),
    Editor: QuestionBlock,
    convertibleTo: ["paragraph", "heading", "quote", "list"],
  },
  image: {
    type: "image",
    label: "تصویر",
    group: "media",
    Icon: ImageIcon,
    createDefault: () => ({
      type: "image",
      image: { src: "", alt: "", caption: "", credit: "" },
    }),
    Editor: ImageBlock,
    convertibleTo: [],
  },
  video: {
    type: "video",
    label: "آپارات",
    group: "media",
    Icon: VideoIcon,
    createDefault: () => ({ type: "video", src: "", caption: "" }),
    Editor: VideoBlock,
    convertibleTo: [],
  },
  button: {
    type: "button",
    label: "دکمه",
    group: "interactive",
    Icon: ButtonIcon,
    createDefault: () => ({
      type: "button",
      label: "",
      href: "",
      variant: "outline",
    }),
    Editor: ButtonBlock,
    Settings: ButtonSettings,
    convertibleTo: [],
  },
};

/** Alternate icon for ordered lists in the insert menu. */
export const orderedListMeta = {
  type: "list" as const,
  label: "لیست شماره‌دار",
  group: "text" as const,
  Icon: ListOrderedIcon,
  createDefault: () => ({
    type: "list" as const,
    variant: "ordered",
    items: [""],
  }),
};

export function getBlockMeta(type: BlockType): BlockMeta {
  return registry[type];
}

export function createBlock(type: BlockType): ArticleBlock {
  return getBlockMeta(type).createDefault();
}

type InsertableEntry = {
  type: BlockType;
  label: string;
  group: BlockMeta["group"];
  Icon: BlockMeta["Icon"];
  payload: ArticleBlock;
};

export function listInsertableBlocks(): InsertableEntry[] {
  const base: InsertableEntry[] = Object.values(registry).map((meta) => ({
    type: meta.type,
    label: meta.label,
    group: meta.group,
    Icon: meta.Icon,
    payload: meta.createDefault(),
  }));

  // Replace the single "heading" entry with three level-specific buttons.
  const headingIndex = base.findIndex((entry) => entry.type === "heading");
  if (headingIndex >= 0) {
    const headingLevels: InsertableEntry[] = [
      {
        type: "heading",
        label: "عنوان",
        group: "text",
        Icon: Heading2Icon,
        payload: { type: "heading", level: 2, content: "" },
      },
      {
        type: "heading",
        label: "زیرعنوان",
        group: "text",
        Icon: Heading3Icon,
        payload: { type: "heading", level: 3, content: "" },
      },
      {
        type: "heading",
        label: "ریزعنوان",
        group: "text",
        Icon: Heading4Icon,
        payload: { type: "heading", level: 4, content: "" },
      },
    ];
    base.splice(headingIndex, 1, ...headingLevels);
  }

  // Split the single "list" entry into bullet + ordered for clarity in the menu.
  const listIndex = base.findIndex((entry) => entry.type === "list");
  if (listIndex >= 0) {
    base[listIndex] = {
      type: "list",
      label: "لیست نقطه‌ای",
      group: "text",
      Icon: ListBulletIcon,
      payload: { type: "list", variant: "bullet", items: [""] },
    };
    base.splice(listIndex + 1, 0, {
      type: "list",
      label: "لیست شماره‌دار",
      group: "text",
      Icon: ListOrderedIcon,
      payload: { type: "list", variant: "ordered", items: [""] },
    });
  }
  return base;
}

/**
 * Convert a block to a different type, preserving the primary text payload
 * when both source and target carry single-string content.
 */
export function convertBlock(
  source: ArticleBlock,
  target: BlockType,
): ArticleBlock {
  if (source.type === target) return source;
  const meta = getBlockMeta(target);
  const fallback = meta.createDefault();

  const primaryText = readPrimaryText(source);

  switch (target) {
    case "paragraph":
      return { type: "paragraph", content: primaryText };
    case "heading":
      return {
        type: "heading",
        level: source.type === "heading" ? source.level : 2,
        content: primaryText,
      };
    case "quote":
      return {
        type: "quote",
        content: primaryText,
        ...(source.type === "quote" && source.attribution
          ? { attribution: source.attribution }
          : {}),
      };
    case "list":
      return {
        type: "list",
        variant: "bullet",
        items: primaryText ? [primaryText] : [""],
      };
    case "question":
      return {
        type: "question",
        content: primaryText,
        ...(source.type === "question" && source.answer
          ? { answer: source.answer }
          : {}),
      };
    case "image":
      return source.type === "image"
        ? source
        : {
            type: "image",
            image: { src: "", alt: "", caption: "", credit: "" },
          };
    case "video":
      return source.type === "video"
        ? source
        : { type: "video", src: "", caption: "" };
    case "button":
      return source.type === "button"
        ? source
        : { type: "button", label: primaryText, href: "", variant: "outline" };
    default:
      return fallback;
  }
}

function readPrimaryText(block: ArticleBlock): string {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "quote":
    case "question":
      return block.content;
    case "list":
      return block.items.find((item) => item.trim()) ?? "";
    case "button":
      return block.label;
    case "image":
    case "video":
      return "";
    default:
      return "";
  }
}

export { TEXT_TYPES, INTERACTIVE_TYPES };
export type { BlockMeta };
