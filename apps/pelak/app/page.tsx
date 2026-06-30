import {
  getCurrentContentGroup,
  getEditorsPicks,
  getFeaturedArticles,
  getFeatureModules,
  getLeadEssays,
  getTopicsWithArticles,
  getVideos,
} from "@nextgen-cms/site-data/get-content";
import { CurrentContentGroupHero } from "@/components/home/CurrentContentGroupHero";
import { EditorsPick } from "@/components/home/EditorsPick";
import { FeaturedContent } from "@/components/home/FeaturedContent";
import { SurveyCta } from "@/components/home/SurveyCta";
import { TopicsWithContent } from "@/components/home/TopicsWithContent";
import { TopContentGroup } from "@/components/home/TopContentGroup";
import { VideoSection } from "@/components/home/VideoSection";

export default async function HomePage() {
  const featureModules = await getFeatureModules();

  const [featuredArticles, editorsPicks] = await Promise.all([
    getFeaturedArticles(3),
    getEditorsPicks(5),
  ]);

  const group = featureModules.contentGroup
    ? await getCurrentContentGroup()
    : null;
  const leadEssays = featureModules.contentGroup ? await getLeadEssays(3) : [];
  const videos = featureModules.video ? await getVideos() : [];
  const topicSections = await getTopicsWithArticles(7);

  return (
    <>
      {group ? <TopContentGroup group={group} /> : null}

      <FeaturedContent articles={featuredArticles} />

      {group ? (
        <CurrentContentGroupHero group={group} featured={leadEssays} />
      ) : null}

      <EditorsPick articles={editorsPicks} />

      {featureModules.video && videos.length > 0 ? (
        <VideoSection videos={videos} />
      ) : null}

      <TopicsWithContent sections={topicSections} />

      <SurveyCta />
    </>
  );
}
