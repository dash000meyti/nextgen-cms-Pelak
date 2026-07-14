import type { HeadingLevel } from "@nextgen-cms/contract/types/article";

export const HEADING_CLASS: Record<HeadingLevel, string> = {
  2: "mt-5 mb-5 font-heading text-lg leading-normal text-ink md:text-xl border-s-4 border-accent ps-4 pt-2",
  3: "mt-5 mb-4 font-heading text-base leading-normal text-ink md:text-lg border-s-4 border-accent/70 ps-4 pt-2",
  4: "mt-4 mb-3 font-heading text-sm leading-normal text-ink md:text-base border-s-4 border-accent/45 ps-4 pt-1",
};

export const HEADING_TAG: Record<HeadingLevel, "h2" | "h3" | "h4"> = {
  2: "h2",
  3: "h3",
  4: "h4",
};

export const QUOTE_CLASS =
  "my-4 w-full border-s-4 border-accent bg-accent-soft/60 py-2 ps-5 text-lg leading-relaxed text-ink";

export const QUOTE_CONTENT_CLASS = "font-heading w-full";

export const QUOTE_ATTRIBUTION_CLASS =
  "mt-2 w-full text-xs font-sans text-ink-muted";

export const LIST_CLASS =
  "my-4 space-y-2 ps-6 text-base leading-relaxed text-ink";

export const FIGURE_CLASS = "my-8 w-full overflow-hidden";

export const FIGURE_IMG_CLASS = "h-auto w-full rounded object-contain";

export const FIGURE_CAPTION_CLASS =
  "mt-3 space-y-1 text-base leading-relaxed text-ink-muted";

export const VIDEO_FIGURE_CLASS = "my-8 w-full overflow-hidden rounded";

export const VIDEO_FRAME_CLASS =
  "relative aspect-video w-full overflow-hidden rounded bg-black";

export const BUTTON_WRAP_CLASS = "my-5 w-full";

export const BUTTON_BASE_CLASS =
  "inline-flex items-center rounded-md px-6 py-2.5 text-sm font-medium transition-colors";

export const BUTTON_PRIMARY_CLASS =
  "bg-accent text-paper hover:bg-accent-hover";

export const BUTTON_OUTLINE_CLASS =
  "border border-accent text-accent hover:bg-accent-soft";

export const QUESTION_SHELL_CLASS =
  "my-4 w-full overflow-hidden rounded-lg border border-rule";

export const QUESTION_HEADER_CLASS =
  "flex w-full items-center gap-3 bg-accent-soft/60 py-2 ps-3 pe-5 text-lg leading-relaxed text-ink";

export const QUESTION_ICON_CLASS =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded bg-accent text-paper";

export const QUESTION_ANSWER_CLASS =
  "m-0 border-t border-rule bg-surface-2 px-5 py-3 text-base leading-relaxed text-ink";

/** Default paragraph class in the editor (site may switch to justify via config). */
export const EDITOR_PARAGRAPH_CLASS = "article-paragraph-start";

export function buttonVariantClass(variant?: "primary" | "outline"): string {
  const isOutline = variant !== "primary";
  return [
    BUTTON_BASE_CLASS,
    isOutline ? BUTTON_OUTLINE_CLASS : BUTTON_PRIMARY_CLASS,
  ].join(" ");
}
