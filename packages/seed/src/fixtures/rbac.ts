import {
  defaultRoleLabels,
  defaultRolePermissions,
  defaultRoleSlugs,
} from "@nextgen-cms/contract/roles";

export { defaultRolePermissions, defaultRoleSlugs };

export const systemRoles = defaultRoleSlugs.map((slug) => ({
  slug,
  name: defaultRoleLabels[slug],
  isSystem: true,
  description:
    slug === "super_admin"
      ? "دسترسی کامل به همه بخش‌ها"
      : slug === "editor_in_chief"
        ? "مدیریت محتوا و اعضا"
        : "ایجاد و ویرایش محتوای خود",
}));
