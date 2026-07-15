import type {
  ArticleBlock,
  BlockType,
} from "@nextgen-cms/contract/types/article";
import { ButtonBlock, ButtonSettings } from "./blocks/ButtonBlock";
import { HeadingBlock, HeadingSettings } from "./blocks/HeadingBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ListBlock, ListSettings } from "./blocks/ListBlock";
import { ParagraphBlock } from "./blocks/ParagraphBlock";
import { ProseSettings } from "./blocks/ProseSettings";
import { QuestionBlock } from "./blocks/QuestionBlock";
import { QuoteBlock } from "./blocks/QuoteBlock";
import { TableBlock, TableSettings } from "./blocks/TableBlock";
import { VideoBlock } from "./blocks/VideoBlock";
import type { BlockMeta } from "./blockTypes";
import {
  ButtonIcon,
  ButtonOutlineIcon,
  ButtonPrimaryIcon,
  ButtonSecondaryIcon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  HeadingIcon,
  ImageIcon,
  ListBulletIcon,
  ListDashIcon,
  ListOrderedIcon,
  ParagraphIcon,
  QuestionIcon,
  QuoteIcon,
  TableIcon,
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
    Settings: ProseSettings,
  },
  heading: {
    type: "heading",
    label: "عنوان",
    group: "text",
    Icon: HeadingIcon,
    createDefault: () => ({ type: "heading", level: 2, content: "" }),
    Editor: HeadingBlock,
    Settings: HeadingSettings,
  },
  quote: {
    type: "quote",
    label: "نقل‌قول",
    group: "text",
    Icon: QuoteIcon,
    createDefault: () => ({ type: "quote", content: "", attribution: "" }),
    Editor: QuoteBlock,
    Settings: ProseSettings,
  },
  list: {
    type: "list",
    label: "لیست",
    group: "text",
    Icon: ListBulletIcon,
    createDefault: () => ({ type: "list", variant: "bullet", items: [""] }),
    Editor: ListBlock,
    Settings: ListSettings,
  },
  question: {
    type: "question",
    label: "پرسش",
    group: "text",
    Icon: QuestionIcon,
    createDefault: () => ({ type: "question", content: "", answer: "" }),
    Editor: QuestionBlock,
    Settings: ProseSettings,
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
  },
  video: {
    type: "video",
    label: "آپارات",
    group: "media",
    Icon: VideoIcon,
    createDefault: () => ({ type: "video", src: "", caption: "" }),
    Editor: VideoBlock,
  },
  table: {
    type: "table",
    label: "جدول",
    group: "media",
    Icon: TableIcon,
    createDefault: () => ({
      type: "table",
      headers: ["", ""],
      rows: [["", ""]],
    }),
    Editor: TableBlock,
    Settings: TableSettings,
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
  },
};

export function getBlockMeta(type: BlockType): BlockMeta {
  return registry[type];
}

export function createBlock(type: BlockType): ArticleBlock {
  return getBlockMeta(type).createDefault();
}

/** Icon for Settings chrome header — reflects heading level / list·button variant. */
export function resolveBlockChromeIcon(block: ArticleBlock): BlockMeta["Icon"] {
  switch (block.type) {
    case "heading":
      if (block.level === 3) return Heading3Icon;
      if (block.level === 4) return Heading4Icon;
      return Heading2Icon;
    case "list":
      if (block.variant === "ordered") return ListOrderedIcon;
      if (block.variant === "dash") return ListDashIcon;
      return ListBulletIcon;
    case "button":
      if (block.variant === "primary") return ButtonPrimaryIcon;
      if (block.variant === "secondary") return ButtonSecondaryIcon;
      return ButtonOutlineIcon;
    default:
      return getBlockMeta(block.type).Icon;
  }
}

/** Label for Settings chrome header icon title. */
export function resolveBlockChromeLabel(block: ArticleBlock): string {
  switch (block.type) {
    case "heading":
      if (block.level === 3) return "زیرعنوان";
      if (block.level === 4) return "ریزعنوان";
      return "عنوان";
    case "list":
      if (block.variant === "ordered") return "لیست شماره‌دار";
      if (block.variant === "dash") return "لیست خط‌تیره";
      return "لیست نقطه‌ای";
    case "button":
      if (block.variant === "primary") return "دکمه پررنگ";
      if (block.variant === "secondary") return "دکمه ثانویه";
      return "دکمه حاشیه‌دار";
    default:
      return getBlockMeta(block.type).label;
  }
}

export type InsertableEntry = {
  type: BlockType;
  label: string;
  group: BlockMeta["group"];
  Icon: BlockMeta["Icon"];
  payload: ArticleBlock;
};

export type InsertablePaletteRow = {
  main: InsertableEntry;
  secondary: [InsertableEntry, InsertableEntry];
};

/**
 * Five palette rows: one primary insert + two related variants.
 * Primary is the most common choice per family (large button in UI).
 */
export function listInsertablePaletteRows(): InsertablePaletteRow[] {
  return [
    {
      main: {
        type: "heading",
        label: "عنوان",
        group: "text",
        Icon: Heading2Icon,
        payload: { type: "heading", level: 2, content: "" },
      },
      secondary: [
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
      ],
    },
    {
      main: {
        type: "paragraph",
        label: "پاراگراف",
        group: "text",
        Icon: ParagraphIcon,
        payload: { type: "paragraph", content: "" },
      },
      secondary: [
        {
          type: "quote",
          label: "نقل‌قول",
          group: "text",
          Icon: QuoteIcon,
          payload: { type: "quote", content: "", attribution: "" },
        },
        {
          type: "question",
          label: "پرسش",
          group: "text",
          Icon: QuestionIcon,
          payload: { type: "question", content: "", answer: "" },
        },
      ],
    },
    {
      main: {
        type: "list",
        label: "لیست نقطه‌ای",
        group: "text",
        Icon: ListBulletIcon,
        payload: { type: "list", variant: "bullet", items: [""] },
      },
      secondary: [
        {
          type: "list",
          label: "لیست شماره‌دار",
          group: "text",
          Icon: ListOrderedIcon,
          payload: { type: "list", variant: "ordered", items: [""] },
        },
        {
          type: "list",
          label: "لیست خط‌تیره",
          group: "text",
          Icon: ListDashIcon,
          payload: { type: "list", variant: "dash", items: [""] },
        },
      ],
    },
    {
      main: {
        type: "image",
        label: "تصویر",
        group: "media",
        Icon: ImageIcon,
        payload: {
          type: "image",
          image: { src: "", alt: "", caption: "", credit: "" },
        },
      },
      secondary: [
        {
          type: "video",
          label: "آپارات",
          group: "media",
          Icon: VideoIcon,
          payload: { type: "video", src: "", caption: "" },
        },
        {
          type: "table",
          label: "جدول",
          group: "media",
          Icon: TableIcon,
          payload: { type: "table", headers: ["", ""], rows: [["", ""]] },
        },
      ],
    },
    {
      main: {
        type: "button",
        label: "دکمه حاشیه‌دار",
        group: "interactive",
        Icon: ButtonOutlineIcon,
        payload: {
          type: "button",
          label: "",
          href: "",
          variant: "outline",
        },
      },
      secondary: [
        {
          type: "button",
          label: "دکمه پررنگ",
          group: "interactive",
          Icon: ButtonPrimaryIcon,
          payload: {
            type: "button",
            label: "",
            href: "",
            variant: "primary",
          },
        },
        {
          type: "button",
          label: "دکمه ثانویه",
          group: "interactive",
          Icon: ButtonSecondaryIcon,
          payload: {
            type: "button",
            label: "",
            href: "",
            variant: "secondary",
          },
        },
      ],
    },
  ];
}

/** Flat list (main then secondary×2 per row) — same order as palette rows. */
export function listInsertableBlocks(): InsertableEntry[] {
  return listInsertablePaletteRows().flatMap((row) => [
    row.main,
    ...row.secondary,
  ]);
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
    case "table":
      return source.type === "table"
        ? source
        : { type: "table", headers: ["", ""], rows: [["", ""]] };
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
    case "table":
      return "";
    default:
      return "";
  }
}

export { TEXT_TYPES, INTERACTIVE_TYPES };
export type { BlockMeta };
