import type {
  ArticleBlock,
  HeadingLevel,
} from "@nextgen-cms/contract/types/article";
import type { TextDirection } from "@nextgen-cms/contract/types/site";
import { getSiteConfig } from "@nextgen-cms/site-data/get-content";
import { articleParagraphClassName } from "@nextgen-cms/site-data/typography";
import Image from "next/image";
import { buildAparatEmbedSrc } from "@/lib/aparat";

type ArticleBodyProps = {
  blocks: ArticleBlock[];
  dir?: TextDirection;
};

const HEADING_CLASS: Record<HeadingLevel, string> = {
  2: "mt-5 mb-5 font-heading text-lg leading-normal text-ink md:text-xl",
  3: "mt-5 mb-4 font-heading text-base leading-normal text-ink md:text-lg",
  4: "mt-4 mb-3 font-heading text-sm leading-normal text-ink md:text-base",
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
            <figure key={key} className="my-8 overflow-hidden">
              <div className="relative aspect-video w-full overflow-hidden rounded bg-rule">
                <Image
                  src={block.image.src}
                  alt={block.image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 42rem"
                />
              </div>
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
          return (
            <details
              key={key}
              className="my-4 rounded-lg border border-rule bg-surface-2 px-5 py-3"
            >
              <summary className="cursor-pointer font-heading text-base text-ink marker:font-sans">
                {block.content}
              </summary>
              {block.answer ? (
                <p className="mt-3 text-base leading-relaxed text-ink">
                  {block.answer}
                </p>
              ) : null}
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
