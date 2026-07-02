import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import type { TextDirection } from "@nextgen-cms/contract/types/site";
import { getSiteConfig } from "@nextgen-cms/site-data/get-content";
import { articleParagraphClassName } from "@nextgen-cms/site-data/typography";
import Image from "next/image";

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
          return (
            <h2
              key={key}
              className="mt-5 mb-5 border-r-4 border-accent pr-4 pt-2 font-heading text-lg leading-normal text-ink md:text-xl"
            >
              {block.content}
            </h2>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={key}
              className="my-4 border-r-4 border-accent bg-accent-soft/60 py-2 pr-5 text-lg leading-relaxed text-ink"
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
