import type { Topic } from "@nextgen-cms/contract/types/article";
import { Tag } from "@/components/ui/Tag";

type TopicTagsProps = {
  topics: Topic[];
};

export function TopicTags({ topics }: TopicTagsProps) {
  return (
    <nav aria-label="موضوعات محتوا" className="flex flex-wrap gap-2">
      {topics.map((topic) => (
        <Tag
          key={topic.slug}
          label={topic.name}
          href={`/topics/${topic.slug}`}
        />
      ))}
    </nav>
  );
}
