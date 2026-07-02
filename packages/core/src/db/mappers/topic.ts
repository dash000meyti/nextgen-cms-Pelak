import type { Topic } from "@nextgen-cms/contract/types/article";
import type { TopicRow } from "@nextgen-cms/core/db/schema/topics";

export function mapTopicRow(row: TopicRow): Topic {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    showOnHomepage: row.showOnHomepage === 1,
  };
}
