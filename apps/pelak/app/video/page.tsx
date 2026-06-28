import { getVideos } from "@nextgen-cms/site-data/get-content";
import { requireFeatureModule } from "@nextgen-cms/site-data/require-feature-module";
import type { Metadata } from "next";
import { SectionHeader } from "@/components/article/SectionHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { VideoCard } from "@/components/video/VideoCard";
import { VideoCardGrid } from "@/components/video/VideoCardGrid";

export const metadata: Metadata = {
  title: "ویدیوها",
  description: "ویدیوها و گفت‌و‌گوهای هفته‌نامه حکمران",
};

export default async function VideoPage() {
  await requireFeatureModule("video");
  const videos = await getVideos();

  return (
    <Container className="py-8 md:py-14">
      <Breadcrumbs
        items={[{ label: "خانه", href: "/" }, { label: "ویدیوها" }]}
      />
      <div className="mt-6">
        <SectionHeader
          title="ویدیوها"
          description="گفت‌و‌گوها و تحلیل‌های ویدیویی هفته‌نامه حکمران."
        />
      </div>
      <VideoCardGrid>
        {videos.map((video) => (
          <VideoCard key={video.slug} video={video} />
        ))}
      </VideoCardGrid>
    </Container>
  );
}
