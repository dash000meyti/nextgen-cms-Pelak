import { sectionAdminLabels } from "@nextgen-cms/contract/modules/labels";
import { getContentSettings } from "@nextgen-cms/site-data/get-content";
import { requireMember } from "@nextgen-cms/studio/admin/require-member";
import type { ArticleFormData } from "@nextgen-cms/studio/cms/mutations/article";
import {
  findContentGroupsForPicker,
  findMembersForArticlePicker,
  findTopicsForPicker,
} from "@nextgen-cms/studio/cms/queries";
import { ArticleForm } from "@/components/admin/studio/ArticleForm";

export default async function NewArticlePage() {
  const session = await requireMember();
  const [members, topics, contentGroups, contentSettings] = await Promise.all([
    findMembersForArticlePicker(),
    findTopicsForPicker(),
    findContentGroupsForPicker(),
    getContentSettings(),
  ]);
  const labels = sectionAdminLabels(contentSettings.pageTitle);

  const initial: ArticleFormData = {
    slug: "",
    title: "",
    subtitle: "",
    excerpt: "",
    status: "draft",
    publishedAt: null,
    readingMinutes: 5,
    heroSrc: "",
    heroAlt: "",
    heroCaption: "",
    heroCredit: "",
    contentGroupNumber: null,
    isFeatured: false,
    isEditorsPick: false,
    body: [{ type: "paragraph", content: "" }],
    relatedSlugs: [],
    memberIds: [session.memberId],
    topicIds: [],
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl text-ink">{labels.newItem}</h1>
      <ArticleForm
        mode="create"
        initial={initial}
        members={members}
        topics={topics}
        contentGroups={contentGroups}
      />
    </div>
  );
}
