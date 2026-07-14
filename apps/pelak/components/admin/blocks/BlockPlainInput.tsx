"use client";

import { forwardRef } from "react";

type BlockPlainInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "className"
> & {
  className?: string;
};

export const BlockPlainInput = forwardRef<
  HTMLInputElement,
  BlockPlainInputProps
>(function BlockPlainInput({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={[
        "w-full border-0 bg-transparent p-0 text-ink outline-none",
        "rounded-sm transition-[outline-color] duration-150",
        "group-hover:outline group-hover:outline-1 group-hover:outline-accent group-hover:outline-offset-2",
        "focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent focus-visible:outline-offset-2",
        "placeholder:text-ink-faint",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});
