import {
  getArticlesByTopic,
  getCurrentIssue,
  getEditorsPicks,
  getFeatureModules,
  getLeadEssays,
  getMostRead,
  getTopics,
  getVideos,
} from "@nextgen-cms/site-data/get-content";
import { CurrentIssueHero } from "@/components/home/CurrentIssueHero";
import { EditorsPick } from "@/components/home/EditorsPick";
import { LeadEssays } from "@/components/home/LeadEssays";
import { MostReadList } from "@/components/home/MostReadList";
import { NewsletterCta } from "@/components/home/NewsletterCta";
import { TopIssue } from "@/components/home/TopIssue";
import { TopicColumns } from "@/components/home/TopicColumns";
import { VideoSection } from "@/components/home/VideoSection";
import { Container } from "@/components/layout/Container";

export default async function HomePage() {
  const featureModules = await getFeatureModules();

  const [mostRead, editorsPicks, topics] = await Promise.all([
    getMostRead(8),
    getEditorsPicks(3),
    getTopics(),
  ]);

  const issue = featureModules.issues ? await getCurrentIssue() : null;
  const leadEssays = featureModules.issues ? await getLeadEssays(3) : [];
  const videos = featureModules.video ? await getVideos() : [];

  const topicColumns = await Promise.all(
    topics.slice(0, 3).map(async (topic) => ({
      topic,
      articles: await getArticlesByTopic(topic.slug),
    })),
  );

  return (
    <>
      {issue ? (
        <>
          <TopIssue issue={issue} />
          <CurrentIssueHero issue={issue} featured={leadEssays} />
        </>
      ) : null}

      <Container className="border-t border-rule py-10 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-16">
          <TopicColumns topics={topicColumns} />
          <MostReadList articles={mostRead} />
        </div>
      </Container>

      {leadEssays.length > 0 ? <LeadEssays articles={leadEssays} /> : null}

      <EditorsPick articles={editorsPicks} />

      {featureModules.video && videos.length > 0 ? (
        <VideoSection videos={videos} />
      ) : null}

      {featureModules.newsletter ? <NewsletterCta /> : null}
    </>
  );
}
