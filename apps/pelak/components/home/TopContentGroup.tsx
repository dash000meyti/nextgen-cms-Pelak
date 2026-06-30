import type { ContentGroup } from "@nextgen-cms/contract/types/content-group";
import Image from "next/image";
import Link from "next/link";
import { contentGroupCoverAspectClass } from "@/components/content-group/content-group-cover-aspect";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

type TopContentGroupProps = {
  group: ContentGroup;
};

export function TopContentGroup({ group }: TopContentGroupProps) {
  return (
    <section className="bg-surface">
      <Container className="flex flex-col items-stretch">
        <div className="w-full flex flex-row items-center justify-between gap-2 py-2">
          <Link
            href={`/content-group/${group.number}`}
            className={`relative ${contentGroupCoverAspectClass} w-[50px] shrink-0 overflow-hidden rounded-md transition-opacity duration-300 hover:opacity-80`}
          >
            <Image
              src={group.cover.src}
              alt={group.cover.alt}
              fill
              className="object-cover"
              sizes="50px"
              priority
            />
          </Link>
          <Link href={`/content-group/${group.number}`}>
            <p className="font-heading text-base text-ink text-center md:text-lg">
              <span className="text-ink-muted block sm:inline px-1">
                جدیدترین گروه محتوا:{" "}
              </span>{" "}
              {group.label}
            </p>
          </Link>
          <Button href={`/content-group/${group.number}`} variant="outline">
            مشاهده
          </Button>
        </div>

        <div className="h-0.25 bg-rule w-full max-w-6xl mx-auto -mb-0.25" />
      </Container>
    </section>
  );
}
