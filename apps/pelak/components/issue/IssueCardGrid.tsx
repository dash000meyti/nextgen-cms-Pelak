import type { ReactNode } from "react";

type IssueCardGridProps = {
  children: ReactNode;
};

export function IssueCardGrid({ children }: IssueCardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
      {children}
    </div>
  );
}
