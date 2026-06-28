import type { Author } from "@nextgen-cms/contract/types/article";
import Link from "next/link";

type AuthorChipProps = {
  author: Author;
  className?: string;
};

export function AuthorChip({ author, className = "" }: AuthorChipProps) {
  return (
    <Link
      href={`/members/${author.slug}`}
      className={`text-sm text-ink-muted transition-colors hover:text-accent ${className}`.trim()}
    >
      {author.name}
    </Link>
  );
}

type AuthorChipListProps = {
  authors: Author[];
  className?: string;
};

export function AuthorChipList({
  authors,
  className = "",
}: AuthorChipListProps) {
  return (
    <span className={className}>
      {authors.map((author, index) => (
        <span key={author.slug}>
          <AuthorChip author={author} />
          {index < authors.length - 1 ? (
            <span className="text-ink-muted"> و </span>
          ) : null}
        </span>
      ))}
    </span>
  );
}
