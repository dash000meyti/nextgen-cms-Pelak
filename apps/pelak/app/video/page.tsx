import { paginateItems, parsePageParam } from "@nextgen-cms/config/pagination";
import {
  getPlaylists,
  getVideoModuleSettings,
  getVideos,
} from "@nextgen-cms/site-data/get-content";
import { requireFeatureModule } from "@nextgen-cms/site-data/require-feature-module";
import type { Metadata } from "next";
import { SectionHeader } from "@/components/article/SectionHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { ListPagination } from "@/components/ui/ListPagination";
import { PlaylistsSection } from "@/components/video/PlaylistsSection";
import { VideoCard } from "@/components/video/VideoCard";
import { VideoCardGrid } from "@/components/video/VideoCardGrid";

type VideoPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getVideoModuleSettings();
  return {
    title: settings.pageTitle,
    description: "ویدیوها و گفت‌و‌گوهای هفته‌نامه حکمران",
  };
}

export default async function VideoPage({ searchParams }: VideoPageProps) {
  await requireFeatureModule("video");
  const params = await searchParams;
  const [allVideos, settings, playlists] = await Promise.all([
    getVideos(),
    getVideoModuleSettings(),
    getPlaylists(),
  ]);
  const page = parsePageParam(params.page);
  const { items: videos, totalPages } = paginateItems(allVideos, {
    page,
    perPage: settings.itemsPerPage,
  });
  const title = settings.pageTitle;

  return (
    <Container className="py-8 md:py-14">
      <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: title }]} />
      <div className="mt-6">
        <SectionHeader
          title={title}
          description="گفت‌و‌گوها و تحلیل‌های ویدیویی هفته‌نامه حکمران."
        />
      </div>
      <VideoCardGrid>
        {videos.map((video) => (
          <VideoCard key={video.slug} video={video} />
        ))}
      </VideoCardGrid>
      <ListPagination page={page} totalPages={totalPages} basePath="/video" />
      <PlaylistsSection playlists={playlists} />
    </Container>
  );
}
