"use client";

import { setTopicShowOnHomepage } from "@nextgen-cms/studio/cms/mutations/topic";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DocumentList } from "@/components/admin/studio/DocumentList";
import { idColumn } from "@/components/admin/studio/document-list-columns";

export type TopicsAdminListRow = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  showOnHomepage: number;
};

type TopicsAdminListProps = {
  topics: TopicsAdminListRow[];
};

function ShowOnHomepageToggle({
  topicId,
  checked: initialChecked,
}: {
  topicId: number;
  checked: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [checked, setChecked] = useState(initialChecked);

  function handleChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      const result = await setTopicShowOnHomepage(topicId, next);
      if (!result.ok) {
        setChecked(!next);
        return;
      }
      router.refresh();
    });
  }

  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={pending}
      onChange={(e) => handleChange(e.target.checked)}
      className="accent-accent"
      aria-label="نمایش در صفحه اول"
    />
  );
}

export function TopicsAdminList({ topics }: TopicsAdminListProps) {
  return (
    <DocumentList
      title=""
      newHref="/admin/content/topics/new"
      newLabel="موضوع جدید"
      rows={topics}
      rowKey={(row) => row.id}
      defaultSort={{ key: "name", direction: "asc" }}
      editHref={(row) => `/admin/content/topics/${row.id}/edit`}
      columns={[
        idColumn<TopicsAdminListRow>(),
        {
          key: "name",
          header: "نام",
          sortable: true,
          sortValue: (row) => row.name,
          searchText: (row) => `${row.name} ${row.slug}`,
          render: (row) => (
            <div>
              <p className="font-medium">{row.name}</p>
              <p className="text-xs text-ink-faint" dir="ltr">
                {row.slug}
              </p>
            </div>
          ),
        },
        {
          key: "description",
          header: "توضیحات",
          sortable: true,
          sortValue: (row) => row.description ?? "",
          searchText: (row) => row.description ?? "",
          render: (row) => row.description || "—",
        },
        {
          key: "showOnHomepage",
          header: "نمایش در صفحه اول",
          sortable: true,
          sortValue: (row) => (row.showOnHomepage === 1 ? 1 : 0),
          render: (row) => (
            <ShowOnHomepageToggle
              topicId={row.id}
              checked={row.showOnHomepage === 1}
            />
          ),
        },
      ]}
    />
  );
}
