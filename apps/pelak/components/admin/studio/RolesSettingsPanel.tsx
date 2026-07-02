"use client";

import {
  assignablePermissionValues,
  isDeprecatedPermission,
  modulePermissionGroups,
  type Permission,
  permissionActionLabels,
  permissionActions,
  permissionResources,
} from "@nextgen-cms/contract/permissions";
import type { RoleRow } from "@nextgen-cms/core/db/schema/roles";
import {
  createRole,
  getRoleFormData,
  type RoleFormData,
  removeRole,
  saveRole,
} from "@nextgen-cms/studio/cms/mutations/role";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import { TextField } from "@/components/admin/fields/TextField";
import { FormMessage } from "@/components/admin/studio/FormMessage";
import { useConfirmDialog } from "@/components/admin/studio/useConfirmDialog";

const PERMISSION_LABELS = permissionActionLabels;

const RESOURCE_LABELS: Record<string, string> = {
  content: "محتوا",
  members: "اعضا",
  media: "مدیا",
  settings: "تنظیمات",
};

const SETTINGS_RESOURCES = permissionResources.filter(
  (resource) => resource !== "modules",
);

const ASSIGNABLE = new Set<Permission>(assignablePermissionValues);

function isAssignablePermission(permission: Permission): boolean {
  return ASSIGNABLE.has(permission);
}

type RolesSettingsPanelProps = {
  roles: RoleRow[];
  selectedId?: number;
};

const EMPTY_FORM: RoleFormData = {
  slug: "",
  name: "",
  description: "",
  permissions: [],
};

export function RolesSettingsPanel({
  roles,
  selectedId,
}: RolesSettingsPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | "new" | null>(
    selectedId ?? roles[0]?.id ?? null,
  );
  const [form, setForm] = useState<RoleFormData>(EMPTY_FORM);
  const [isSystem, setIsSystem] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  useEffect(() => {
    if (activeId === "new") {
      setForm(EMPTY_FORM);
      setIsSystem(false);
      return;
    }
    if (activeId === null) return;

    startTransition(async () => {
      const data = await getRoleFormData(activeId);
      if (data) {
        setForm(data);
        const role = roles.find((r) => r.id === activeId);
        setIsSystem(role?.isSystem ?? false);
      }
    });
  }, [activeId, roles]);

  function togglePermission(permission: Permission) {
    setForm((prev) => {
      const set = new Set(prev.permissions);
      if (set.has(permission)) set.delete(permission);
      else set.add(permission);
      return { ...prev, permissions: [...set] };
    });
  }

  function handleSave() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      if (activeId === "new") {
        const result = await createRole(form);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setSuccess("نقش ایجاد شد.");
        router.refresh();
        if (result.id) setActiveId(result.id);
        return;
      }
      if (typeof activeId !== "number") return;
      const result = await saveRole(activeId, form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("ذخیره شد.");
      router.refresh();
    });
  }

  async function handleDelete() {
    if (typeof activeId !== "number" || isSystem) return;
    const confirmed = await confirm({
      title: "حذف نقش",
      message: "این نقش حذف شود؟",
      confirmLabel: "حذف",
    });
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const result = await removeRole(activeId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setActiveId(roles[0]?.id ?? null);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[14rem_1fr]">
      {dialog}
      <div className="space-y-2">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => setActiveId(role.id)}
            className={`block w-full rounded px-3 py-2 text-start text-sm ${
              activeId === role.id
                ? "bg-accent-soft text-accent"
                : "text-ink-muted hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {role.name}
            {role.isSystem ? (
              <span className="ms-2 text-xs text-ink-faint">سیستمی</span>
            ) : null}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setActiveId("new")}
          className="w-full rounded border border-dashed border-rule px-3 py-2 text-sm text-ink-muted hover:border-accent hover:text-accent"
        >
          + نقش جدید
        </button>
      </div>

      <div className="space-y-6">
        <FormMessage error={error} success={success} />
        {activeId === null ? (
          <p className="text-sm text-ink-muted">نقشی انتخاب نشده است.</p>
        ) : (
          <>
            <div className="grid max-w-xl gap-4">
              <TextField
                id="role-slug"
                label="شناسه (slug)"
                value={form.slug}
                onChange={(slug) => setForm({ ...form, slug })}
                disabled={isSystem || activeId !== "new"}
                required
              />
              <TextField
                id="role-name"
                label="نام"
                value={form.name}
                onChange={(name) => setForm({ ...form, name })}
                disabled={isSystem}
                required
              />
              <TextareaField
                id="role-desc"
                label="توضیحات"
                value={form.description}
                onChange={(description) => setForm({ ...form, description })}
                disabled={isSystem}
                rows={2}
              />
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-ink">مجوزها</p>
              {form.permissions.some(isDeprecatedPermission) ? (
                <p className="text-xs text-ink-faint">
                  مجوزهای منسوخ (فقط نمایش):{" "}
                  {form.permissions
                    .filter(isDeprecatedPermission)
                    .map((perm) => {
                      const action = perm.split(".").pop() ?? perm;
                      return PERMISSION_LABELS[action] ?? perm;
                    })
                    .join("، ")}
                </p>
              ) : null}
              {SETTINGS_RESOURCES.map((resource) => (
                <div key={resource} className="space-y-2">
                  <p className="text-xs font-medium text-ink-muted">
                    {RESOURCE_LABELS[resource] ?? resource}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {permissionActions[resource].map((action) => {
                      const permission = `${resource}.${action}` as Permission;
                      if (!isAssignablePermission(permission)) return null;
                      return (
                        <label
                          key={permission}
                          className="flex items-center gap-2 text-sm text-ink"
                        >
                          <input
                            type="checkbox"
                            checked={form.permissions.includes(permission)}
                            onChange={() => togglePermission(permission)}
                            className="accent-accent"
                          />
                          <span>{PERMISSION_LABELS[action] ?? action}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="space-y-3">
                <p className="text-xs font-medium text-ink-muted">ماژول‌ها</p>
                {modulePermissionGroups.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <p className="text-xs text-ink-faint">{group.label}</p>
                    <div className="flex flex-wrap gap-3">
                      {group.actions.map((action) => {
                        const permission =
                          `modules.${group.id}.${action}` as Permission;
                        if (!isAssignablePermission(permission)) return null;
                        return (
                          <label
                            key={permission}
                            className="flex items-center gap-2 text-sm text-ink"
                          >
                            <input
                              type="checkbox"
                              checked={form.permissions.includes(permission)}
                              onChange={() => togglePermission(permission)}
                              className="accent-accent"
                            />
                            <span>{PERMISSION_LABELS[action] ?? action}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={pending}
                className="rounded bg-accent px-6 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
              >
                {pending ? "در حال ذخیره…" : "ذخیره"}
              </button>
              {!isSystem && typeof activeId === "number" ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={pending}
                  className="rounded border border-rule px-6 py-2 text-sm text-ink-muted hover:border-accent hover:text-accent disabled:opacity-50"
                >
                  حذف نقش
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
