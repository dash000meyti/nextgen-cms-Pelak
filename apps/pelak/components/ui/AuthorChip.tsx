import type { Author } from "@nextgen-cms/contract/types/article";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";

type AuthorChipTone = "muted" | "ink" | "faint";

const authorToneClasses: Record<AuthorChipTone, string> = {
  faint: "text-xs text-ink-faint",
  muted: "text-sm text-ink-muted",
  ink: "text-base text-ink",
};

type AuthorChipProps = {
  author: Author;
  className?: string;
  tone?: AuthorChipTone;
};

export function AuthorChip({
  author,
  className = "",
  tone = "muted",
}: AuthorChipProps) {
  return (
    <Link
      href={`/members/${author.slug}`}
      className={`inline-flex items-center gap-1.5 ${authorToneClasses[tone]} transition-colors hover:text-accent ${className}`.trim()}
    >
      <Avatar
        src={author.avatar.src}
        alt={author.avatar.alt}
        name={author.name}
        className="size-[1.25em]"
      />
      {author.name}
    </Link>
  );
}

type AuthorChipListProps = {
  authors: Author[];
  className?: string;
  tone?: AuthorChipTone;
};

export function AuthorChipList({
  authors,
  className = "",
  tone = "muted",
}: AuthorChipListProps) {
  return (
    <span className={className}>
      {authors.map((author, index) => (
        <span key={author.slug}>
          <AuthorChip author={author} tone={tone} />
          {index < authors.length - 1 ? (
            <span className={authorToneClasses[tone]}> - </span>
          ) : null}
        </span>
      ))}
    </span>
  );
}
