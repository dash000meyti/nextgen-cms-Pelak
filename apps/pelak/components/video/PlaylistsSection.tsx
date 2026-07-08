import type { Playlist } from "@nextgen-cms/contract/types/article";
import { SectionTitle } from "@/components/article/SectionHeader";
import { PlaylistCard } from "@/components/video/PlaylistCard";

type PlaylistsSectionProps = {
  playlists: Playlist[];
};

export function PlaylistsSection({ playlists }: PlaylistsSectionProps) {
  if (playlists.length === 0) return null;
  return (
    <section className="mt-12 space-y-6">
      <SectionTitle title="لیست‌های پخش" />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.slug} playlist={playlist} />
        ))}
      </div>
    </section>
  );
}
