import { sectionAdminLabels } from "@nextgen-cms/contract/modules/labels";
import { getContentSettings } from "@nextgen-cms/site-data/get-content";
import { canDeleteArticle } from "@nextgen-cms/studio/admin/article-access";
import { requireMember } from "@nextgen-cms/studio/admin/require-member";
import type { ArticleFormData } from "@nextgen-cms/studio/cms/mutations/article";
import {
  findContentGroupsForPicker,
  findMembersForArticlePicker,
  findTopicsForPicker,
  getArticleForAdmin,
} from "@nextgen-cms/studio/cms/queries";
import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/studio/ArticleForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const articleId = Number.parseInt(id, 10);
  if (Number.isNaN(articleId)) notFound();

  const session = await requireMember();
  const [article, members, topics, contentGroups, contentSettings] =
    await Promise.all([
      getArticleForAdmin(articleId),
      findMembersForArticlePicker(),
      findTopicsForPicker(),
      findContentGroupsForPicker(),
      getContentSettings(),
    ]);

  if (!article) notFound();
  const labels = sectionAdminLabels(contentSettings.pageTitle);

  const initial: ArticleFormData = {
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    excerpt: article.excerpt,
    status: article.status,
    publishedAt: article.publishedAt,
    readingMinutes: article.readingMinutes,
    heroSrc: article.heroSrc,
    heroAlt: article.heroAlt,
    heroCaption: article.heroCaption ?? "",
    heroCredit: article.heroCredit ?? "",
    contentGroupNumber: article.contentGroupNumber,
    isFeatured: article.isFeatured,
    isEditorsPick: article.isEditorsPick,
    body: article.body,
    relatedSlugs: article.relatedSlugs,
    memberIds: article.memberIds,
    topicIds: article.topicIds,
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl text-ink">{labels.editItem}</h1>
      <ArticleForm
        mode="edit"
        articleId={articleId}
        initial={initial}
        members={members}
        topics={topics}
        contentGroups={contentGroups}
        canDelete={canDeleteArticle(session, {
          createdByMemberId: article.createdByMemberId,
        })}
      />
    </div>
  );
}
