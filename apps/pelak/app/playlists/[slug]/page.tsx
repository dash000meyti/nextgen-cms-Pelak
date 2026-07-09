import { paginateItems, parsePageParam } from "@nextgen-cms/config/pagination";
import { buildPlaylistPdfPath } from "@nextgen-cms/contract/short-links";
import {
  getPlaylistBySlug,
  getVideoModuleSettings,
  getVideosByPlaylist,
} from "@nextgen-cms/site-data/get-content";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { SectionHeader } from "@/components/article/SectionHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { ListPagination } from "@/components/ui/ListPagination";
import { ShareBar } from "@/components/ui/ShareBar";
import { VideoCard } from "@/components/video/VideoCard";
import { VideoCardGrid } from "@/components/video/VideoCardGrid";
import {
  decodeSlugSegment,
  encodeSlugSegment,
  findBySlugCandidates,
} from "@/lib/slug";

type PlaylistPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
}: PlaylistPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { entity: playlist } = await findBySlugCandidates(
    slug,
    getPlaylistBySlug,
  );
  if (!playlist) return { title: "لیست پخش یافت نشد" };
  return {
    title: playlist.name,
    description: playlist.description,
    openGraph: { title: playlist.name, description: playlist.description },
  };
}

export default async function PlaylistPage({
  params,
  searchParams,
}: PlaylistPageProps) {
  const [{ slug }, query, settings] = await Promise.all([
    params,
    searchParams,
    getVideoModuleSettings(),
  ]);
  const decodedSlug = decodeSlugSegment(slug);
  const { entity: playlist } = await findBySlugCandidates(
    slug,
    getPlaylistBySlug,
  );
  if (!playlist) notFound();
  if (decodedSlug !== playlist.slug) {
    permanentRedirect(`/playlists/${encodeSlugSegment(playlist.slug)}`);
  }
  const allVideos = await getVideosByPlaylist(playlist.slug);
  const page = parsePageParam(query.page);
  const { items: videos, totalPages } = paginateItems(allVideos, {
    page,
    perPage: settings.itemsPerPage,
  });
  return (
    <Container className="py-8 md:py-14">
      <Breadcrumbs
        items={[
          { label: "خانه", href: "/" },
          { label: "ویدیو", href: "/video" },
          { label: playlist.name },
        ]}
      />
      <div className="mt-6">
        <SectionHeader
          title={playlist.name}
          description={playlist.description}
        />
      </div>
      <div className="mt-4">
        <ShareBar
          title={playlist.name}
          shareUrl={`/playlists/${encodeSlugSegment(playlist.slug)}`}
          pdfDownloadUrl={buildPlaylistPdfPath(
            encodeSlugSegment(playlist.slug),
          )}
          pdfFilename={`${playlist.slug}.pdf`}
        />
      </div>
      <VideoCardGrid>
        {videos.map((video) => (
          <VideoCard key={video.slug} video={video} />
        ))}
      </VideoCardGrid>
      <ListPagination
        page={page}
        totalPages={totalPages}
        basePath={`/playlists/${encodeSlugSegment(playlist.slug)}`}
      />
    </Container>
  );
}
