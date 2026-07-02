"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavTab = {
  id: string;
  label: string;
  href: string;
};

type SettingsNavProps = {
  tabs: NavTab[];
};

export function SettingsNav({ tabs }: SettingsNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-rule">
      {tabs.map((tab) => {
        const active =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`border-b-2 px-4 py-2 text-sm transition-colors ${
              active
                ? "border-accent text-accent"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
