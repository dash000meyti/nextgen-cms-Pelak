import type { ContentGroupSummary } from "@nextgen-cms/contract/types/content-group";
import Image from "next/image";
import Link from "next/link";
import { contentGroupCoverFrameClass } from "@/components/content-group/content-group-cover-aspect";

type ContentGroupCardProps = {
  group: ContentGroupSummary;
};

export function ContentGroupCard({ group }: ContentGroupCardProps) {
  return (
    <Link
      href={`/content-group/${group.number}`}
      className="group block space-y-4"
    >
      <div className={`${contentGroupCoverFrameClass} w-full`}>
        <Image
          src={group.cover.src}
          alt={group.cover.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <div className="space-y-1">
        <p className="font-heading text-base text-ink transition-colors group-hover:text-accent">
          {group.label}
        </p>
        <p className="text-xs text-ink-muted">
          {group.articleCount.toLocaleString("fa-IR")} محتوا
        </p>
      </div>
    </Link>
  );
}
