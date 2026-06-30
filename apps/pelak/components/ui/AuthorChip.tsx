import type { Author } from "@nextgen-cms/contract/types/article";
import Link from "next/link";

type AuthorChipTone = "muted" | "ink";

const authorToneClasses: Record<AuthorChipTone, string> = {
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
      className={`${authorToneClasses[tone]} transition-colors hover:text-accent ${className}`.trim()}
    >
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
            <span className={authorToneClasses[tone]}> و </span>
          ) : null}
        </span>
      ))}
    </span>
  );
}
