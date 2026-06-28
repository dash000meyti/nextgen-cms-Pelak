import type { ReactNode } from "react";

type VideoCardGridProps = {
  children: ReactNode;
};

export function VideoCardGrid({ children }: VideoCardGridProps) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}
