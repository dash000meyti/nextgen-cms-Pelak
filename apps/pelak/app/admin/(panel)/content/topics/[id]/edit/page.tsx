import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { TopicFormData } from "@nextgen-cms/studio/cms/mutations/topic";
import { getTopicForAdmin } from "@nextgen-cms/studio/cms/queries";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopicForm } from "@/components/admin/studio/TopicForm";

export const metadata: Metadata = {
  title: "ویرایش موضوع",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditContentTopicPage({ params }: PageProps) {
  await requirePermission("settings.content");
  const { id } = await params;
  const topicId = Number.parseInt(id, 10);
  if (Number.isNaN(topicId)) notFound();

  const topic = await getTopicForAdmin(topicId);
  if (!topic) notFound();

  const initial: TopicFormData = {
    slug: topic.slug,
    name: topic.name,
    description: topic.description,
    showOnHomepage: topic.showOnHomepage === 1,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-xl text-ink">ویرایش موضوع</h2>
        <Link
          href="/admin/content/settings/topics"
          className="text-sm text-ink-muted hover:text-accent"
        >
          بازگشت به موضوعات
        </Link>
      </div>
      <TopicForm mode="edit" topicId={topicId} initial={initial} />
    </div>
  );
}
