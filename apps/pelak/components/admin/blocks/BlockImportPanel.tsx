"use client";

import {
  type ImportResult,
  importBlocksFromClipboard,
  importBlocksFromText,
} from "@nextgen-cms/contract/blocks/import/index";
import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import { useCallback, useState } from "react";
import { getBlockMeta } from "./blockRegistry";
import {
  ChevronDownIcon,
  FileImportIcon,
  HtmlWordImportIcon,
  MarkdownImportIcon,
} from "./icons";

type BlockImportPanelProps = {
  onImport: (blocks: ArticleBlock[]) => void;
};

type ImportTab = "markdown" | "html";

type TabDef = {
  id: ImportTab;
  label: string;
  hint: string;
  Icon: typeof HtmlWordImportIcon;
};

const TABS: TabDef[] = [
  {
    id: "html",
    label: "HTML / Word",
    hint: "کد HTML، یا محتوای کپی‌شده از Word و مرورگر را بچسبانید (Ctrl+V).",
    Icon: HtmlWordImportIcon,
  },
  {
    id: "markdown",
    label: "Markdown",
    hint: "متن Markdown را از کلیپ‌بورد بچسبانید (Ctrl+V).",
    Icon: MarkdownImportIcon,
  },
];

function blockPreviewText(block: ArticleBlock): string {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "quote":
    case "question":
      return block.content;
    case "list":
      return block.items.join(" · ");
    case "image":
      return block.image.alt || block.image.src || "تصویر";
    case "video":
      return block.src;
    case "button":
      return `${block.label} → ${block.href}`;
    case "table":
      return block.headers.join(" | ");
    default:
      return "";
  }
}

function truncate(text: string, max = 40): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

function pastePreview(html: string, plain: string): string {
  if (plain.trim()) return plain.trim();
  if (html.trim()) {
    return html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  return "";
}

function formatLabel(format: ImportResult["format"]): string {
  if (format === "html") return "HTML";
  if (format === "markdown") return "Markdown";
  return "متن";
}

type TabState = {
  preview: string;
  result: ImportResult | null;
};

const emptyTabState = (): TabState => ({ preview: "", result: null });

export function BlockImportPanel({ onImport }: BlockImportPanelProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ImportTab>("html");
  const [tabState, setTabState] = useState<Record<ImportTab, TabState>>({
    markdown: emptyTabState(),
    html: emptyTabState(),
  });
  const [parsing, setParsing] = useState(false);

  const current = tabState[activeTab];
  const activeMeta = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

  const updateTab = useCallback((tab: ImportTab, patch: Partial<TabState>) => {
    setTabState((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], ...patch },
    }));
  }, []);

  async function handleMarkdownPaste(
    event: React.ClipboardEvent<HTMLTextAreaElement>,
  ) {
    const plain = event.clipboardData.getData("text/plain");
    if (!plain.trim()) return;
    event.preventDefault();
    setParsing(true);
    try {
      const parsed = await importBlocksFromText(plain, { format: "markdown" });
      updateTab("markdown", { preview: plain, result: parsed });
    } finally {
      setParsing(false);
    }
  }

  async function handleHtmlPaste(
    event: React.ClipboardEvent<HTMLTextAreaElement>,
  ) {
    const html = event.clipboardData.getData("text/html");
    const plain = event.clipboardData.getData("text/plain");
    if (!html.trim() && !plain.trim()) return;
    event.preventDefault();
    setParsing(true);
    try {
      const parsed = await importBlocksFromClipboard(html, plain);
      updateTab("html", {
        preview: pastePreview(html, plain),
        result: parsed,
      });
    } finally {
      setParsing(false);
    }
  }

  function handleConfirm() {
    if (!current.result || current.result.blocks.length === 0) return;
    onImport(current.result.blocks);
    setTabState({
      markdown: emptyTabState(),
      html: emptyTabState(),
    });
    setOpen(false);
  }

  function handleClear() {
    updateTab(activeTab, emptyTabState());
  }

  const hasBlocks = (current.result?.blocks.length ?? 0) > 0;
  const hasImagePlaceholder = current.result?.blocks.some(
    (b) => b.type === "image" && !b.image.src.trim(),
  );

  return (
    <div
      className={[
        "overflow-hidden rounded border border-rule",
        open ? "ring-1 ring-accent" : "",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title="وارد کردن محتوا"
        aria-label="وارد کردن محتوا"
        aria-expanded={open}
        className={[
          "flex h-9 w-full cursor-pointer items-center gap-2 px-3 text-ink hover:bg-surface-2",
          open ? "border-b border-rule bg-surface-2" : "",
        ].join(" ")}
      >
        <FileImportIcon className="h-5 w-5 shrink-0 text-ink-muted" />
        <span className="min-w-0 flex-1 truncate text-end text-xs text-ink-faint">
          HTML / Word · Markdown
        </span>
        <ChevronDownIcon
          className={[
            "h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open ? (
        <div className="space-y-3 bg-paper p-4">
          <div
            role="tablist"
            aria-label="نوع واردات محتوا"
            className="flex flex-wrap gap-1.5"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                aria-label={tab.label}
                className={[
                  "flex h-9 min-w-9 items-center justify-center gap-1.5 rounded border px-2 text-xs transition-colors",
                  activeTab === tab.id
                    ? "border-accent bg-surface-2 text-ink ring-1 ring-accent"
                    : "border-rule text-ink-muted hover:bg-surface-2 hover:text-accent",
                ].join(" ")}
              >
                <tab.Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <p className="text-xs text-ink-faint">{activeMeta.hint}</p>

          <textarea
            readOnly
            value={current.preview}
            onPaste={(event) =>
              void (activeTab === "markdown"
                ? handleMarkdownPaste(event)
                : handleHtmlPaste(event))
            }
            rows={6}
            placeholder={
              activeTab === "markdown"
                ? "Markdown را اینجا بچسبانید (Ctrl+V)…"
                : "HTML یا محتوای Word/مرورگر را اینجا بچسبانید (Ctrl+V)…"
            }
            className="w-full resize-y rounded-lg border border-dashed border-rule bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:ring-1 focus-visible:ring-accent"
          />

          {parsing ? (
            <p className="text-xs text-ink-faint">در حال پردازش…</p>
          ) : null}

          {current.result ? (
            <div className="space-y-3 rounded-lg bg-surface-2 px-3 py-3">
              <p className="text-sm text-ink">
                {hasBlocks
                  ? `${current.result.blocks.length.toLocaleString("fa-IR")} بلوک آماده افزودن`
                  : "بلوکی شناسایی نشد"}
                <span className="ms-2 text-xs text-ink-faint">
                  ({formatLabel(current.result.format)})
                </span>
              </p>

              {current.result.warnings.length > 0 ? (
                <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-400">
                  {current.result.warnings.map((warning, index) => (
                    <li key={`${warning.code}-${index}`}>
                      • {warning.message}
                    </li>
                  ))}
                  {hasImagePlaceholder ? (
                    <li>
                      • قبل از انتشار، تصاویر واردشده را از MediaPicker پر کنید.
                    </li>
                  ) : null}
                </ul>
              ) : hasImagePlaceholder ? (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  قبل از انتشار، تصاویر واردشده را از MediaPicker پر کنید.
                </p>
              ) : null}

              {hasBlocks ? (
                <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-ink-muted">
                  {current.result.blocks.map((block, index) => (
                    <li
                      key={`preview-${index}-${block.type}`}
                      className="truncate"
                    >
                      <span className="text-ink-faint">
                        {getBlockMeta(block.type).label}:
                      </span>{" "}
                      {truncate(blockPreviewText(block))}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  disabled={!hasBlocks}
                  onClick={handleConfirm}
                  title="افزودن به انتها"
                  aria-label="افزودن به انتها"
                  className="flex h-9 items-center justify-center rounded border border-accent bg-accent px-3 text-xs text-paper disabled:cursor-not-allowed disabled:opacity-40"
                >
                  افزودن به انتها
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  title="پاک کردن"
                  aria-label="پاک کردن"
                  className="flex h-9 w-9 items-center justify-center rounded border border-rule text-ink-muted hover:bg-surface-2 hover:text-accent"
                >
                  ×
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
