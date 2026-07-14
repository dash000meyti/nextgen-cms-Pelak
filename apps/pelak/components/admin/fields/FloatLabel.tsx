type FloatLabelProps = {
  htmlFor?: string;
  text: string;
  floated: boolean;
  required?: boolean;
  /** Vertical position when resting as in-field placeholder (default: center). */
  restClassName?: string;
};

/** Outlined-field label that sits in the field, then floats onto the top border. */
export function FloatLabel({
  htmlFor,
  text,
  floated,
  required,
  restClassName = "top-1/2 -translate-y-1/2",
}: FloatLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={[
        "pointer-events-none absolute start-2 z-10 max-w-[calc(100%-1rem)] truncate bg-paper px-1 transition-all duration-150",
        floated
          ? "-top-2 translate-y-0 text-[10px] leading-none text-ink-muted"
          : `${restClassName} text-sm text-ink-faint`,
      ].join(" ")}
    >
      {text}
      {required ? <span className="text-accent"> *</span> : null}
    </label>
  );
}
