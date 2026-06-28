import type { ImageMeta } from "@nextgen-cms/contract/types/article";
import Image from "next/image";

type ArticleHeroProps = {
  image: ImageMeta;
  priority?: boolean;
  className?: string;
};

export function ArticleHero({
  image,
  priority = false,
  className = "",
}: ArticleHeroProps) {
  return (
    <figure className={`overflow-hidden ${className}`.trim()}>
      <div className="relative aspect-video w-full overflow-hidden rounded bg-rule lg:aspect-square">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover"
          sizes="(max-width: 1023px) 100vw, 50vw"
          priority={priority}
        />
      </div>
      {image.caption ? (
        <figcaption className="mt-3 space-y-1 text-sm leading-relaxed text-ink-muted">
          <p>{image.caption}</p>
          {image.credit ? (
            <p className="text-xs opacity-80">{image.credit}</p>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
