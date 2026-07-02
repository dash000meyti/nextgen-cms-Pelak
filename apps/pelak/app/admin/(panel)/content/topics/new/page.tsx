import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { TopicFormData } from "@nextgen-cms/studio/cms/mutations/topic";
import type { Metadata } from "next";
import Link from "next/link";
import { TopicForm } from "@/components/admin/studio/TopicForm";

export const metadata: Metadata = {
  title: "موضوع جدید",
  robots: { index: false, follow: false },
};

const EMPTY_FORM: TopicFormData = {
  slug: "",
  name: "",
  description: "",
  showOnHomepage: false,
};

export default async function NewContentTopicPage() {
  await requirePermission("settings.content");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-xl text-ink">موضوع جدید</h2>
        <Link
          href="/admin/content/settings/topics"
          className="text-sm text-ink-muted hover:text-accent"
        >
          بازگشت به موضوعات
        </Link>
      </div>
      <TopicForm mode="create" initial={EMPTY_FORM} />
    </div>
  );
}
