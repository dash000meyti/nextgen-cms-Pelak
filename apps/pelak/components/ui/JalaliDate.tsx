import { formatJalali } from "@nextgen-cms/core/platform/datetime";

type JalaliDateProps = {
  value: string;
  dateTime?: string;
  className?: string;
};

export function JalaliDate({ value, dateTime, className }: JalaliDateProps) {
  let display = value;
  try {
    display = formatJalali(value);
  } catch {
    display = value;
  }

  return (
    <time dateTime={dateTime ?? value} className={className ?? "fa-num"}>
      {display}
    </time>
  );
}
