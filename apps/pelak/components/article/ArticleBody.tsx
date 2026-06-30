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

  return (
    <div className="prose-article space-y-7">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "heading") {
          return (
            <h2
              key={key}
              className="mt-10! border-r-4 border-accent pr-4 pt-2 font-heading text-lg leading-normal text-ink md:text-xl"
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

        return (
          <p key={key} className={paragraphClassName}>
            {block.content}
          </p>
        );
      })}
    </div>
  );
}
