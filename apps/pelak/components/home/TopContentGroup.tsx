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
        <div className="flex w-full flex-row items-center justify-between gap-2 py-1 sm:py-2">
          <Link
            href={`/content-group/${group.number}`}
            className={`relative hidden ${contentGroupCoverAspectClass} w-[50px] shrink-0 overflow-hidden rounded-md transition-opacity duration-300 hover:opacity-80 sm:block`}
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
          <Link
            href={`/content-group/${group.number}`}
            className="min-w-0 flex-1"
          >
            <p className="text-start font-heading text-sm text-ink sm:text-center sm:text-base md:text-lg">
              <span className="block px-1 text-ink-muted sm:inline">
                جدیدترین گروه محتوا:{" "}
              </span>{" "}
              {group.label}
            </p>
          </Link>
          <Button
            href={`/content-group/${group.number}`}
            variant="outline"
            className="shrink-0 px-3 py-1 text-xs sm:px-5 sm:py-2 sm:text-sm"
          >
            مشاهده
          </Button>
        </div>

        <div className="h-0.25 bg-rule w-full max-w-6xl mx-auto -mb-0.25" />
      </Container>
    </section>
  );
}
