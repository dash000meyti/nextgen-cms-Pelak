import type { ReactNode } from "react";

type ContentGroupCardGridProps = {
  children: ReactNode;
};

export function ContentGroupCardGrid({ children }: ContentGroupCardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
      {children}
    </div>
  );
}
