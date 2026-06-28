import type { Issue } from "@nextgen-cms/contract/types/issue";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

type TopIssueProps = {
  issue: Issue;
};

export function TopIssue({ issue }: TopIssueProps) {
  return (
    <Container className="flex flex-col items-stretch">
      <div className="w-full flex flex-row items-center justify-between gap-2 py-2">
        <Link href={`/issues/${issue.number}`}>
          <Image
            src={issue.cover.src}
            alt={issue.cover.alt}
            width={50}
            height={75}
            className="rounded-md hover:opacity-80 transition-opacity duration-300"
            priority
          />
        </Link>
        <Link href={`/issues/${issue.number}`}>
          <p className="font-heading text-base text-ink text-center md:text-lg">
            <span className="text-ink-muted block sm:inline px-1">
              جدید ترین هفته نامه :{" "}
            </span>{" "}
            {issue.label}
          </p>
        </Link>
        <Button href={`/issues/${issue.number}`} variant="outline">
          مشاهده
        </Button>
      </div>

      {/* Accent rule */}
      <div className="h-0.25 bg-rule w-full max-w-6xl mx-auto -mb-0.25" />
    </Container>
  );
}
