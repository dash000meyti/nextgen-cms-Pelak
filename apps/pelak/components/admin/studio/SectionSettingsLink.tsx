import Link from "next/link";

type SectionSettingsLinkProps = {
  href: string;
  label?: string;
};

export function SectionSettingsLink({
  href,
  label = "تنظیمات",
}: SectionSettingsLinkProps) {
  return (
    <Link
      href={href}
      className="rounded border border-rule px-4 py-2 text-sm text-ink hover:border-accent hover:text-accent"
    >
      {label}
    </Link>
  );
}
