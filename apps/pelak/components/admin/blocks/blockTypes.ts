import type {
  ArticleBlock,
  BlockType,
} from "@nextgen-cms/contract/types/article";
import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";
import type { JSX } from "react";

export type EditorBlock = ArticleBlock & { _key: string };

export type BlockEditorProps = {
  block: ArticleBlock;
  blockId: string;
  onChange: (block: ArticleBlock) => void;
  uploadContext?: MediaUploadContext;
};

export type BlockEditorComponent = (
  props: BlockEditorProps,
) => JSX.Element | null;

export type BlockSettingsProps = {
  block: ArticleBlock;
  onChange: (block: ArticleBlock) => void;
  /** Cross-type conversion within a family (Settings chrome). */
  onConvert?: (type: BlockType) => void;
  /** Disable conversion (e.g. multi-select). */
  convertDisabled?: boolean;
};

export type BlockSettingsComponent = (
  props: BlockSettingsProps,
) => JSX.Element | null;

export type BlockIcon = (props: { className?: string }) => JSX.Element;

export type BlockGroup = "text" | "media" | "interactive";

export type BlockMeta = {
  type: BlockType;
  label: string;
  group: BlockGroup;
  Icon: BlockIcon;
  createDefault: () => ArticleBlock;
  Editor: BlockEditorComponent;
  /** Inline settings rendered in the Settings chrome (variants / in-family convert). */
  Settings?: BlockSettingsComponent;
};

export type { BlockType };
