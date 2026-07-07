"use client";

import { sectionAdminLabels } from "@nextgen-cms/contract/modules/labels";
import { useAdminMember } from "@nextgen-cms/studio/admin/admin-member-context";
import { DocumentList } from "@/components/admin/studio/DocumentList";
import { idColumn } from "@/components/admin/studio/document-list-columns";
import { SectionSettingsLink } from "@/components/admin/studio/SectionSettingsLink";

export type ContentGroupAdminListRow = {
  id: number;
  number: number;
  label: string;
  season: string;
  year: number;
};

type ContentGroupAdminListProps = {
  groups: ContentGroupAdminListRow[];
};

export function ContentGroupAdminList({ groups }: ContentGroupAdminListProps) {
  const { sectionPageTitles } = useAdminMember();
  const labels = sectionAdminLabels(sectionPageTitles.contentGroup);

  return (
    <DocumentList
      title={labels.listTitle}
      newHref="/admin/content-group/new"
      newLabel={labels.newItem}
      toolbar={<SectionSettingsLink href="/admin/content-group/settings" />}
      rows={groups}
      rowKey={(row) => row.id}
      defaultSort={{ key: "number", direction: "asc" }}
      editHref={(row) => `/admin/content-group/${row.id}/edit`}
      columns={[
        idColumn<ContentGroupAdminListRow>(),
        {
          key: "number",
          header: "شماره",
          sortable: true,
          sortValue: (row) => row.number,
          searchText: (row) => String(row.number),
          render: (row) => row.number.toLocaleString("fa-IR"),
        },
        {
          key: "label",
          header: "برچسب",
          sortable: true,
          sortValue: (row) => row.label,
          searchText: (row) => row.label,
          render: (row) => row.label,
        },
        {
          key: "season",
          header: "فصل / سال",
          sortable: true,
          sortValue: (row) => `${row.season} ${row.year}`,
          searchText: (row) => `${row.season} ${row.year}`,
          render: (row) => `${row.season} ${row.year.toLocaleString("fa-IR")}`,
        },
      ]}
    />
  );
}
