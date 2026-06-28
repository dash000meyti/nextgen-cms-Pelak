import type { Topic } from "@nextgen-cms/contract/types/article";
import Link from "next/link";

type SectionBadgeProps = {
  topic: Topic;
  className?: string;
};

export function SectionBadge({ topic, className = "" }: SectionBadgeProps) {
  return (
    <Link
      href={`/topics/${topic.slug}`}
      className={`inline-block font-heading text-xs font-bold tracking-wide text-accent uppercase transition-opacity hover:opacity-70 ${className}`.trim()}
    >
      {topic.name}
    </Link>
  );
}
