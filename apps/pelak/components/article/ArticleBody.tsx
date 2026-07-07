import type {
  ArticleBlock,
  HeadingLevel,
} from "@nextgen-cms/contract/types/article";
import type { TextDirection } from "@nextgen-cms/contract/types/site";
import { getSiteConfig } from "@nextgen-cms/site-data/get-content";
import { articleParagraphClassName } from "@nextgen-cms/site-data/typography";
import { buildAparatEmbedSrc } from "@/lib/aparat";

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

const HEADING_CLASS: Record<HeadingLevel, string> = {
  2: "mt-5 mb-5 font-heading text-lg leading-normal text-ink md:text-xl",
  3: "mt-5 mb-4 font-heading text-base leading-normal text-ink md:text-lg",
  4: "mt-4 mb-3 font-heading text-sm leading-normal text-ink md:text-base",
};

export async function ArticleBody({
  blocks,
  dir,
}: ArticleBodyProps) {
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
          const className = HEADING_CLASS[level] ?? HEADING_CLASS[2];
          if (level === 3) {
            return (
              <h3
                key={key}
                className={`${className} border-s-4 border-accent ps-4 pt-2`}
              >
                {block.content}
              </h3>
            );
          }
          if (level === 4) {
            return (
              <h4
                key={key}
                className={`${className} border-s-4 border-accent ps-4 pt-1`}
              >
                {block.content}
              </h4>
            );
          }
          return (
            <h2
              key={key}
              className={`${className} border-s-4 border-accent ps-4 pt-2`}
            >
              {block.content}
            </h2>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={key}
              className="my-4 border-s-4 border-accent bg-accent-soft/60 py-2 ps-5 text-lg leading-relaxed text-ink"
            >
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
            <figure key={key} className="my-8 w-full overflow-hidden">
              {/* biome-ignore lint/performance/noImgElement: must preserve original image ratio without known dimensions */}
              <img
                src={block.image.src}
                alt={block.image.alt}
                className="h-auto w-full rounded object-contain"
                loading="lazy"
              />
              {block.image.caption ? (
                <figcaption className="mt-3 space-y-1 text-xs leading-relaxed text-ink-muted">
                  <p>{block.image.caption}</p>
                  {block.image.credit ? (
                    <p className="text-xs opacity-80">{block.image.credit}</p>
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
            <figure key={key} className="my-8 w-full overflow-hidden rounded">
              <div className="relative aspect-video w-full overflow-hidden rounded bg-black">
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
                <figcaption className="mt-3 text-xs leading-relaxed text-ink-muted">
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        if (block.type === "list") {
          const ListTag = block.variant === "ordered" ? "ol" : "ul";
          const listClass =
            block.variant === "ordered" ? "list-decimal" : "list-disc";
          return (
            <ListTag
              key={key}
              className={`my-4 space-y-2 ps-6 text-base leading-relaxed text-ink ${listClass}`}
            >
              {block.items
                .filter((item) => item.trim())
                .map((item, itemIndex) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: read-only public render; order is authoritative
                  <li key={`${key}-${itemIndex}`}>{item}</li>
                ))}
            </ListTag>
          );
        }

        if (block.type === "question") {
          const hasAnswer = Boolean(block.answer);
          if (!hasAnswer) {
            return (
              <div
                key={key}
                className="my-4 w-full overflow-hidden rounded-lg border border-rule"
              >
                <div className="flex w-full items-center gap-3 bg-accent-soft/60 py-2 ps-3 pe-5 text-lg leading-relaxed text-ink">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-accent text-paper">
                    <QuestionMarkIcon className="h-5 w-5" />
                  </span>
                  <p className="m-0 flex-1 font-heading">{block.content}</p>
                </div>
              </div>
            );
          }
          return (
            <details
              key={key}
              open
              className="group my-4 w-full overflow-hidden rounded-lg border border-rule"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 bg-accent-soft/60 py-2 ps-3 pe-5 text-lg leading-relaxed text-ink [&::-webkit-details-marker]:hidden">
                <span className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded bg-accent text-paper">
                  <QuestionMarkIcon className="h-4 w-4" />
                  <ChevronIcon className="h-3 w-3 transition-transform group-open:rotate-180" />
                </span>
                <span className="flex-1 font-heading">{block.content}</span>
              </summary>
              <p className="m-0 border-t border-rule bg-surface-2 px-5 py-3 text-base leading-relaxed text-ink">
                {block.answer}
              </p>
            </details>
          );
        }

        if (block.type === "button") {
          const isOutline = block.variant === "outline";
          return (
            <div key={key} className="my-5 w-full">
              <a
                href={block.href}
                className={[
                  "inline-flex items-center rounded-md px-6 py-2.5 text-sm font-medium transition-colors",
                  isOutline
                    ? "border border-accent text-accent hover:bg-accent-soft"
                    : "bg-accent text-paper hover:bg-accent-hover",
                ].join(" ")}
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
