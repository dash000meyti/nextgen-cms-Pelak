import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "outline" | "ghost";
  type?: "button" | "submit";
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

const variantClasses = {
  primary: "bg-accent text-paper hover:bg-accent-hover border-transparent",
  outline: "border-accent text-accent hover:bg-accent/18 hover:text-paper",
  ghost: "border-rule text-ink-muted hover:border-accent/18 hover:text-accent",
} as const;

export function Button({
  children,
  href,
  variant = "primary",
  type = "button",
  className = "",
  onClick,
  ariaLabel,
}: ButtonProps) {
  const classes =
    `inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition-colors ${variantClasses[variant]} ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
