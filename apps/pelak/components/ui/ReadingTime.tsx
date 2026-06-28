type ReadingTimeProps = {
  minutes: number;
};

export function ReadingTime({ minutes }: ReadingTimeProps) {
  return (
    <span className="text-sm text-ink-muted">
      {minutes.toLocaleString("fa-IR")} دقیقه مطالعه
    </span>
  );
}
