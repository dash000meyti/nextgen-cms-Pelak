"use client";

import { DEFAULT_MEMBER_AVATAR_SRC } from "@nextgen-cms/contract/media/member-avatar";
import { memberAvatarPath } from "@nextgen-cms/core/media/path-policy";
import { useAdminMember } from "@nextgen-cms/studio/admin/admin-member-context";
import {
  createMemberAndRedirect,
  type MemberFormData,
  removeMember,
  saveMember,
} from "@nextgen-cms/studio/cms/mutations/member";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageField } from "@/components/admin/fields/ImageField";
import { SlugField } from "@/components/admin/fields/SlugField";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import { TextField } from "@/components/admin/fields/TextField";
import { useConfirmDialog } from "@/components/admin/studio/useConfirmDialog";
import { FormMessage } from "@/components/ui/FormMessage";
import { useFormFeedback } from "@/components/ui/useFormFeedback";

type RoleOption = {
  id: number;
  name: string;
  slug: string;
};

type MemberFormProps = {
  mode: "create" | "edit";
  memberId?: number;
  initial: MemberFormData;
  roleOptions: RoleOption[];
  canDelete?: boolean;
};

export function MemberForm({
  mode,
  memberId,
  initial,
  roleOptions,
  canDelete = false,
}: MemberFormProps) {
  const router = useRouter();
  const session = useAdminMember();
  const [pending, startTransition] = useTransition();
  const feedback = useFormFeedback();
  const [form, setForm] = useState(initial);
  const { confirm, dialog } = useConfirmDialog();
  const uploadContext =
    mode === "edit" && memberId
      ? { folder: memberAvatarPath(memberId) }
      : { memberId: session.memberId };

  function update<K extends keyof MemberFormData>(
    key: K,
    value: MemberFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    feedback.clear();
    startTransition(async () => {
      if (mode === "create") {
        const result = await createMemberAndRedirect(form);
        if (result && !result.ok) {
          feedback.reportError(result.error, result.field);
        }
        return;
      }
      if (!memberId) return;
      const result = await saveMember(memberId, form);
      if (!result.ok) {
        feedback.reportError(result.error, result.field);
        return;
      }
      feedback.reportSuccess("ذخیره شد.");
      router.refresh();
    });
  }

  async function handleDelete() {
    if (!memberId) return;
    const confirmed = await confirm({
      title: "حذف عضو",
      message: "این عضو حذف یا غیرفعال شود؟",
      confirmLabel: "حذف",
    });
    if (!confirmed) return;
    feedback.clear();
    startTransition(async () => {
      const result = await removeMember(memberId);
      if (!result.ok) {
        feedback.reportError(result.error, result.field);
        return;
      }
      router.push("/admin/members");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {dialog}
      <FormMessage
        error={feedback.error}
        success={feedback.success}
        info={feedback.info}
        onDismiss={feedback.clear}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <TextField
          id="name"
          label="نام"
          value={form.name}
          onChange={(name) => update("name", name)}
          required
        />
        <SlugField
          id="slug"
          label="نامک"
          value={form.slug}
          onChange={(slug) => update("slug", slug)}
          sourceTitle={mode === "create" ? form.name : undefined}
          required
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TextField
          id="username"
          label="نام کاربری"
          value={form.username}
          onChange={(username) => update("username", username)}
          required
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TextField
          id="email"
          label="ایمیل"
          value={form.email}
          onChange={(email) => update("email", email)}
        />
        <TextField
          id="password"
          label={mode === "create" ? "رمز عبور" : "رمز عبور جدید"}
          value={form.password}
          onChange={(password) => update("password", password)}
          type="password"
          hint={mode === "edit" ? "برای تغییر ندادن، خالی بگذارید." : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TextField
          id="displayRole"
          label="سمت"
          value={form.displayRole}
          onChange={(displayRole) => update("displayRole", displayRole)}
        />
        <div className="space-y-2" data-field="roleId">
          <label
            htmlFor="roleId"
            className="block text-sm font-medium text-ink"
          >
            نقش سیستمی
          </label>
          <select
            id="roleId"
            value={form.roleId}
            onChange={(event) =>
              update("roleId", Number.parseInt(event.target.value, 10))
            }
            className="w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink"
          >
            {roleOptions.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => update("isActive", event.target.checked)}
          className="rounded border-rule"
        />
        حساب فعال
      </label>

      <TextareaField
        id="bio"
        label="بیوگرافی"
        value={form.bio}
        onChange={(bio) => update("bio", bio)}
        rows={5}
      />

      <ImageField
        id="avatar"
        label="تصویر"
        src={form.avatarSrc}
        alt={form.name}
        onSrcChange={(avatarSrc) => update("avatarSrc", avatarSrc)}
        onAltChange={() => {}}
        hideAlt
        emptyPreviewSrc={DEFAULT_MEMBER_AVATAR_SRC}
        uploadContext={uploadContext}
        fieldKey="avatar"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <TextField
          id="socialTwitter"
          label="توییتر"
          value={form.socialTwitter}
          onChange={(socialTwitter) => update("socialTwitter", socialTwitter)}
        />
        <TextField
          id="socialTelegram"
          label="تلگرام"
          value={form.socialTelegram}
          onChange={(socialTelegram) =>
            update("socialTelegram", socialTelegram)
          }
        />
        <TextField
          id="socialInstagram"
          label="اینستاگرام"
          value={form.socialInstagram}
          onChange={(socialInstagram) =>
            update("socialInstagram", socialInstagram)
          }
        />
      </div>

      <div className="flex flex-wrap gap-3 border-t border-rule pt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="rounded bg-accent px-6 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "در حال ذخیره…" : mode === "create" ? "ایجاد" : "ذخیره"}
        </button>
        {canDelete && memberId ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded border border-rule px-6 py-2 text-sm text-ink-muted hover:bg-surface-2 disabled:opacity-50"
          >
            حذف
          </button>
        ) : null}
      </div>
    </div>
  );
}
