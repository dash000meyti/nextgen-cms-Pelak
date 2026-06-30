import type { Video } from "@nextgen-cms/contract/types/article";
import Image from "next/image";
import Link from "next/link";
import { SectionTitle } from "@/components/article/SectionHeader";
import { Container } from "@/components/layout/Container";

type VideoSectionProps = {
  videos: Video[];
};

export function VideoSection({ videos }: VideoSectionProps) {
  if (videos.length === 0) return null;

  return (
    <Container className="border-t border-rule py-10 md:py-8">
      <SectionTitle title="ویدیوها" />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Link key={video.slug} href="/video" className="group space-y-3">
            <div className="relative aspect-video overflow-hidden rounded bg-rule">
              <Image
                src={video.thumbnail.src}
                alt={video.thumbnail.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper/90 text-accent">
                  <svg
                    width="20"
                    height="20"
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
              <h3 className="font-heading text-base leading-normal text-ink transition-colors group-hover:text-accent">
                {video.title}
              </h3>
              <p className="text-xs text-ink-muted">{video.duration}</p>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
