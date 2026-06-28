import type { Permission } from "@nextgen-cms/contract/permissions";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { roles } from "./roles";

export const rolePermissions = sqliteTable(
  "role_permissions",
  {
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permission: text("permission").notNull().$type<Permission>(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permission] })],
);

export type RolePermissionRow = typeof rolePermissions.$inferSelect;
export type RolePermissionInsert = typeof rolePermissions.$inferInsert;
