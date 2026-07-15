import type { ArticleBlock } from "../../types/article";

export type ImportFormat = "markdown" | "html" | "plain";

export type ImportWarningCode =
  | "image_placeholder"
  | "unsupported_element"
  | "empty_input";

export type ImportWarning = {
  code: ImportWarningCode;
  message: string;
};

export type ImportResult = {
  format: ImportFormat;
  blocks: ArticleBlock[];
  warnings: ImportWarning[];
};

export type ImportOptions = {
  format?: ImportFormat | "auto";
};
