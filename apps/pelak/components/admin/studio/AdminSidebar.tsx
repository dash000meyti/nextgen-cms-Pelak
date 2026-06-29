"use client";

import type { Permission } from "@nextgen-cms/contract/permissions";
import { useAdminMember } from "@nextgen-cms/studio/admin/admin-member-context";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "داشبورد", exact: true },
  { href: "/admin/content", label: "محتوا" },
  {
    href: "/admin/members",
    label: "اعضا",
    permissions: ["members.create", "members.edit", "members.delete"] as const,
  },
  { href: "/admin/media", label: "مدیا" },
  { href: "/admin/settings", label: "تنظیمات" },
] as const;

const MODULE_NAV_ITEMS = [
  {
    href: "/admin/content-group",
    label: "گروه‌های محتوا",
    permission: "modules.contentGroup.view" as Permission,
    module: "contentGroup" as const,
  },
  {
    href: "/admin/videos",
    label: "ویدیو",
    permission: "modules.video.view" as Permission,
    module: "video" as const,
  },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function canSeeNavItem(
  permissions: Permission[],
  item: (typeof NAV_ITEMS)[number],
) {
  if (!("permissions" in item)) return true;
  return item.permissions.some((permission) =>
    permissions.includes(permission),
  );
}

function canSeeModuleNavItem(
  permissions: Permission[],
  enabledModules: { contentGroup: boolean; video: boolean },
  item: (typeof MODULE_NAV_ITEMS)[number],
) {
  if (!enabledModules[item.module]) return false;
  return permissions.includes(item.permission);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { permissions, enabledModules } = useAdminMember();

  const coreItems = NAV_ITEMS.filter((item) =>
    canSeeNavItem(permissions, item),
  );
  const moduleItems = MODULE_NAV_ITEMS.filter((item) =>
    canSeeModuleNavItem(permissions, enabledModules, item),
  );
  const visibleItems = [
    ...coreItems.slice(0, 2),
    ...moduleItems,
    ...coreItems.slice(2),
  ];

  return (
    <nav className="flex flex-col gap-1 text-sm">
      {visibleItems.map((item) => {
        const active = isActive(
          pathname,
          item.href,
          "exact" in item ? item.exact : false,
        );
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded px-3 py-2 transition-colors ${
              active
                ? "bg-accent-soft font-medium text-accent"
                : "text-ink-muted hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
