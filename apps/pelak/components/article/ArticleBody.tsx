import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import type { TextDirection } from "@nextgen-cms/contract/types/site";
import { getSiteConfig } from "@nextgen-cms/site-data/get-content";
import { articleParagraphClassName } from "@nextgen-cms/site-data/typography";
import { buildAparatEmbedSrc } from "@/lib/aparat";
import {
  BUTTON_WRAP_CLASS,
  buttonVariantClass,
  FIGURE_CAPTION_CLASS,
  FIGURE_CLASS,
  FIGURE_IMG_CLASS,
  HEADING_CLASS,
  HEADING_TAG,
  listVariantClass,
  QUESTION_ANSWER_CLASS,
  QUESTION_HEADER_CLASS,
  QUESTION_ICON_CLASS,
  QUESTION_SHELL_CLASS,
  QUOTE_CLASS,
  TABLE_CLASS,
  TABLE_TD_CLASS,
  TABLE_TH_CLASS,
  TABLE_WRAP_CLASS,
  VIDEO_FIGURE_CLASS,
  VIDEO_FRAME_CLASS,
} from "./blockStyles";

type IconProps = { className?: string };

function QuestionMarkIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.2a2.5 2.5 0 1 1 3.4 2.3c-.7.4-.9.8-.9 1.5v.5" />
      <circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChevronIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-4 w-4"}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

type ArticleBodyProps = {
  blocks: ArticleBlock[];
  dir?: TextDirection;
};

export async function ArticleBody({ blocks, dir }: ArticleBodyProps) {
  const siteConfig = await getSiteConfig();
  const paragraphClassName = articleParagraphClassName(siteConfig, dir);
  const firstParagraphIndex = blocks.findIndex(
    (block) => block.type === "paragraph",
  );

  return (
    <div className="prose-article flex flex-col justify-start items-start gap-0">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "heading") {
          const level = block.level;
          const Tag = HEADING_TAG[level] ?? "h2";
          const className = HEADING_CLASS[level] ?? HEADING_CLASS[2];
          return (
            <Tag key={key} className={className}>
              {block.content}
            </Tag>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote key={key} className={QUOTE_CLASS}>
              <p className="font-heading">{block.content}</p>
              {block.attribution ? (
                <footer className="mt-2 text-xs font-sans text-ink-muted">
                  — {block.attribution}
                </footer>
              ) : null}
            </blockquote>
          );
        }

        if (block.type === "image") {
          return (
            <figure key={key} className={FIGURE_CLASS}>
              {/* biome-ignore lint/performance/noImgElement: must preserve original image ratio without known dimensions */}
              <img
                src={block.image.src}
                alt={block.image.alt}
                className={FIGURE_IMG_CLASS}
                loading="lazy"
              />
              {block.image.caption ? (
                <figcaption className={FIGURE_CAPTION_CLASS}>
                  <p>{block.image.caption}</p>
                  {block.image.credit ? (
                    <p className="opacity-80">{block.image.credit}</p>
                  ) : null}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        if (block.type === "video") {
          const embedSrc = buildAparatEmbedSrc(block.src);
          if (!embedSrc) return null;
          return (
            <figure key={key} className={VIDEO_FIGURE_CLASS}>
              <div className={VIDEO_FRAME_CLASS}>
                <iframe
                  src={embedSrc}
                  title={`ویدیو آپارات ${index}`}
                  className="absolute inset-0 h-full w-full"
                  frameBorder={0}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              {block.caption ? (
                <figcaption className={FIGURE_CAPTION_CLASS}>
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        if (block.type === "list") {
          const ListTag = block.variant === "ordered" ? "ol" : "ul";
          return (
            <ListTag key={key} className={listVariantClass(block.variant)}>
              {block.items
                .filter((item) => item.trim())
                .map((item, itemIndex) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: read-only public render; order is authoritative
                  <li key={`${key}-${itemIndex}`}>{item}</li>
                ))}
            </ListTag>
          );
        }

        if (block.type === "table") {
          return (
            <div key={key} className={TABLE_WRAP_CLASS}>
              <table className={TABLE_CLASS}>
                <thead>
                  <tr>
                    {block.headers.map((header, col) => (
                      <th
                        // biome-ignore lint/suspicious/noArrayIndexKey: read-only public render; order is authoritative
                        key={`${key}-h-${col}`}
                        className={TABLE_TH_CLASS}
                        scope="col"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr
                      // biome-ignore lint/suspicious/noArrayIndexKey: read-only public render; order is authoritative
                      key={`${key}-r-${rowIndex}`}
                    >
                      {row.map((cell, col) => (
                        <td
                          // biome-ignore lint/suspicious/noArrayIndexKey: read-only public render; order is authoritative
                          key={`${key}-c-${rowIndex}-${col}`}
                          className={TABLE_TD_CLASS}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === "question") {
          const hasAnswer = Boolean(block.answer);
          if (!hasAnswer) {
            return (
              <div key={key} className={QUESTION_SHELL_CLASS}>
                <div className={QUESTION_HEADER_CLASS}>
                  <span className={QUESTION_ICON_CLASS}>
                    <QuestionMarkIcon className="h-5 w-5" />
                  </span>
                  <p className="m-0 flex-1 font-heading">{block.content}</p>
                </div>
              </div>
            );
          }
          return (
            <details key={key} open className={`group ${QUESTION_SHELL_CLASS}`}>
              <summary
                className={`${QUESTION_HEADER_CLASS} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
              >
                <span className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded bg-accent text-paper">
                  <QuestionMarkIcon className="h-4 w-4" />
                  <ChevronIcon className="h-3 w-3 transition-transform group-open:rotate-180" />
                </span>
                <span className="flex-1 font-heading">{block.content}</span>
              </summary>
              <p className={QUESTION_ANSWER_CLASS}>{block.answer}</p>
            </details>
          );
        }

        if (block.type === "button") {
          return (
            <div key={key} className={BUTTON_WRAP_CLASS}>
              <a
                href={block.href}
                className={buttonVariantClass(block.variant)}
              >
                {block.label}
              </a>
            </div>
          );
        }

        const isFirstParagraph = index === firstParagraphIndex;
        const [dropCap = "", ...restChars] = isFirstParagraph
          ? Array.from(block.content)
          : [];
        const restContent = restChars.join("");
        return (
          <p
            key={key}
            className={`${paragraphClassName}${isFirstParagraph ? " first-article-paragraph" : ""}`}
          >
            {isFirstParagraph ? (
              <>
                <span className="article-drop-cap" aria-hidden="true">
                  {dropCap}
                </span>
                <span>{restContent}</span>
              </>
            ) : (
              block.content
            )}
          </p>
        );
      })}
    </div>
  );
}
