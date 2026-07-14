"use client";

type BlockPlainTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className"
> & {
  className?: string;
};

export function BlockPlainTextarea({
  className,
  rows = 1,
  ...props
}: BlockPlainTextareaProps) {
  return (
    <textarea
      rows={rows}
      className={[
        "w-full resize-none border-0 bg-transparent p-0 text-ink outline-none",
        "rounded-sm transition-[outline-color] duration-150",
        "group-hover:outline group-hover:outline-1 group-hover:outline-accent group-hover:outline-offset-2",
        "focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent focus-visible:outline-offset-2",
        "placeholder:text-ink-faint field-sizing-content",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}
