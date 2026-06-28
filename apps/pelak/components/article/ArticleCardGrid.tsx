import type { ReactNode } from "react";

type ArticleCardGridProps = {
  children: ReactNode;
  columns?: 2 | 3;
  className?: string;
};

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
} as const;

export function ArticleCardGrid({
  children,
  columns = 3,
  className = "",
}: ArticleCardGridProps) {
  return (
    <div
      className={`grid gap-8 sm:gap-10 lg:gap-8 ${columnClasses[columns]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
