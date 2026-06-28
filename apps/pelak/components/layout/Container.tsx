import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  variant?: "narrow" | "wide";
  className?: string;
  as?: "div" | "section" | "main" | "header" | "footer";
};

const variantClasses = {
  narrow: "max-w-content",
  wide: "max-w-wide",
} as const;

export function Container({
  children,
  variant = "wide",
  className = "",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${variantClasses[variant]} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
