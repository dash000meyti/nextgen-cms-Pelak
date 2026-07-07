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

export type BlockIcon = (props: { className?: string }) => JSX.Element;

export type BlockGroup = "text" | "media" | "interactive";

export type BlockMeta = {
  type: BlockType;
  label: string;
  group: BlockGroup;
  Icon: BlockIcon;
  createDefault: () => ArticleBlock;
  Editor: BlockEditorComponent;
  /** Types this block can be transformed into via the toolbar. */
  convertibleTo: BlockType[];
};

export type { BlockType };
