"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export function SubmissionSuccess({
  title,
  description,
  onReset,
  resetLabel = "ارسال دوباره",
}: {
  title: string;
  description: ReactNode;
  onReset: () => void;
  resetLabel?: string;
}) {
  return (
    <output className="flex flex-col items-center gap-3 rounded-lg border border-rule bg-surface-2 px-6 py-8 text-center">
      <span
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent"
        aria-hidden="true"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>موفقیت</title>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <p className="text-base font-medium text-ink">{title}</p>
      <p className="text-sm text-ink-muted">{description}</p>
      <Button type="button" variant="ghost" onClick={onReset}>
        {resetLabel}
      </Button>
    </output>
  );
}
