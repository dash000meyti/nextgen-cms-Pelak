import { formatJalali } from "@nextgen-cms/core/platform/datetime";

type JalaliDateProps = {
  value: string;
  dateTime?: string;
  className?: string;
  style?: "short" | "long";
};

export function JalaliDate({
  value,
  dateTime,
  className,
  style = "short",
}: JalaliDateProps) {
  let display = value;
  try {
    display = formatJalali(value, style);
  } catch {
    display = value;
  }

  return (
    <time dateTime={dateTime ?? value} className={className ?? "fa-num"}>
      {display}
    </time>
  );
}
