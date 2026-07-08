import type { Video } from "@nextgen-cms/contract/types/article";
import Image from "next/image";
import Link from "next/link";

type VideoCardProps = {
  video: Video;
};

export function VideoCard({ video }: VideoCardProps) {
  const href = video.externalLink || "/video";
  return (
    <article className="group space-y-3">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block space-y-3"
      >
        <div className="relative aspect-video overflow-hidden rounded bg-rule">
          <Image
            src={video.thumbnail.src}
            alt={video.thumbnail.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-paper/90 text-accent">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="font-heading text-base leading-normal text-ink transition-colors group-hover:text-accent">
            {video.title}
          </h2>
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
            {video.description}
          </p>
          <p className="text-xs text-ink-muted">{video.duration}</p>
        </div>
      </Link>
    </article>
  );
}
