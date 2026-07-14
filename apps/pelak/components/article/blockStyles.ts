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

/** Unordered list with − markers (dash variant). */
export const LIST_DASH_CLASS =
  "my-4 space-y-2 ps-6 text-base leading-relaxed text-ink list-none [&>li]:relative [&>li]:ps-4 [&>li]:before:absolute [&>li]:before:start-0 [&>li]:before:content-['−'] [&>li]:before:text-ink-muted";

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

export const BUTTON_SECONDARY_CLASS =
  "border border-rule bg-surface-2 text-ink hover:bg-surface";

export const QUESTION_SHELL_CLASS =
  "my-4 w-full overflow-hidden rounded-lg border border-rule";

export const QUESTION_HEADER_CLASS =
  "flex w-full items-center gap-3 bg-accent-soft/60 py-2 ps-3 pe-5 text-lg leading-relaxed text-ink";

export const QUESTION_ICON_CLASS =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded bg-accent text-paper";

export const QUESTION_ANSWER_CLASS =
  "m-0 border-t border-rule bg-surface-2 px-5 py-3 text-base leading-relaxed text-ink";

export const TABLE_WRAP_CLASS = "my-6 w-full overflow-x-auto";

export const TABLE_CLASS =
  "w-full border-collapse text-start text-sm leading-relaxed text-ink";

export const TABLE_TH_CLASS =
  "border border-rule bg-surface-2 px-3 py-2 font-medium";

export const TABLE_TD_CLASS = "border border-rule px-3 py-2";

/** Default paragraph class in the editor (site may switch to justify via config). */
export const EDITOR_PARAGRAPH_CLASS = "article-paragraph-start";

export function listVariantClass(
  variant: "bullet" | "ordered" | "dash",
): string {
  if (variant === "dash") return LIST_DASH_CLASS;
  const marker = variant === "ordered" ? "list-decimal" : "list-disc";
  return `${LIST_CLASS} ${marker}`;
}

export function buttonVariantClass(
  variant?: "primary" | "outline" | "secondary",
): string {
  // Missing variant defaults to outline (legacy createDefault / storage).
  const style =
    variant === "primary"
      ? BUTTON_PRIMARY_CLASS
      : variant === "secondary"
        ? BUTTON_SECONDARY_CLASS
        : BUTTON_OUTLINE_CLASS;
  return [BUTTON_BASE_CLASS, style].join(" ");
}
