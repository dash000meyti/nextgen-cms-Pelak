import type { Playlist } from "@nextgen-cms/contract/types/article";
import Image from "next/image";
import Link from "next/link";

type PlaylistCardProps = {
  playlist: Playlist;
};

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link href={`/playlists/${playlist.slug}`} className="group space-y-3">
      <div className="relative aspect-video overflow-hidden rounded bg-rule">
        <Image
          src={playlist.cover.src}
          alt={playlist.cover.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="space-y-1">
        <h3 className="font-heading text-base leading-normal text-ink transition-colors group-hover:text-accent">
          {playlist.name}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
          {playlist.description}
        </p>
      </div>
    </Link>
  );
}
