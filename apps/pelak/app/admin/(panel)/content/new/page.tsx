import { sectionAdminLabels } from "@nextgen-cms/contract/modules/labels";
import { getContentSettings } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { ArticleFormData } from "@nextgen-cms/studio/cms/mutations/article";
import {
  findContentGroupsForPicker,
  findMembersForArticlePicker,
  findTopicsForPicker,
  listArticlesAdmin,
} from "@nextgen-cms/studio/cms/queries";
import { ArticleForm } from "@/components/admin/studio/ArticleForm";

export default async function NewArticlePage() {
  const session = await requirePermission("content.create");
  const [members, topics, contentGroups, contentSettings, articles] =
    await Promise.all([
      findMembersForArticlePicker(),
      findTopicsForPicker(),
      findContentGroupsForPicker(),
      getContentSettings(),
      listArticlesAdmin("all"),
    ]);
  const labels = sectionAdminLabels(contentSettings.pageTitle);

  const initial: ArticleFormData = {
    slug: "",
    title: "",
    subtitle: "",
    excerpt: "",
    status: contentSettings.defaultArticleStatus,
    publishedAt: null,
    readingMinutes: 5,
    heroSrc: "",
    heroAlt: "",
    heroCaption: "",
    heroCredit: "",
    contentGroupIds: [],
    isFeatured: false,
    isEditorsPick: false,
    body: [{ type: "paragraph", content: "" }],
    relatedSlugs: [],
    memberIds: [session.memberId],
    topicIds: [],
  };

  const articleOptions = articles.map((article) => ({
    id: article.id,
    label: article.title,
    slug: article.slug,
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl text-ink">{labels.newItem}</h1>
      <ArticleForm
        mode="create"
        initial={initial}
        members={members}
        topics={topics}
        contentGroups={contentGroups}
        articles={articleOptions}
      />
    </div>
  );
}
