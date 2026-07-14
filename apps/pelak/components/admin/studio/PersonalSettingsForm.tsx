"use client";

import { DEFAULT_MEMBER_AVATAR_SRC } from "@nextgen-cms/contract/media/member-avatar";
import type { Member } from "@nextgen-cms/contract/types/member";
import { savePersonalSettings } from "@nextgen-cms/studio/cms/mutations/member";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageField } from "@/components/admin/fields/ImageField";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import { TextField } from "@/components/admin/fields/TextField";
import { FormMessage } from "@/components/ui/FormMessage";
import { useFormFeedback } from "@/components/ui/useFormFeedback";

type PersonalSettingsFormProps = {
  member: Member;
};

export function PersonalSettingsForm({ member }: PersonalSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const feedback = useFormFeedback();
  const [name, setName] = useState(member.name);
  const [username, setUsername] = useState(member.username);
  const [email, setEmail] = useState(member.email ?? "");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState(member.bio);
  const [avatarSrc, setAvatarSrc] = useState(member.avatar.src);

  function handleSave() {
    feedback.clear();
    startTransition(async () => {
      const result = await savePersonalSettings({
        name,
        username: username || undefined,
        email: email || undefined,
        password: password || undefined,
        bio,
        avatarSrc,
        avatarAlt: name,
      });
      if (!result.ok) {
        feedback.reportError(result.error, result.field);
        return;
      }
      setPassword("");
      feedback.reportSuccess("ذخیره شد.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <FormMessage
        error={feedback.error}
        success={feedback.success}
        info={feedback.info}
        onDismiss={feedback.clear}
      />

      <div className="grid max-w-2xl gap-6">
        <TextField
          id="personal-name"
          label="نام"
          value={name}
          onChange={setName}
          required
        />
        <TextField
          id="personal-username"
          label="نام کاربری"
          value={username}
          onChange={setUsername}
          required
        />
        <TextField
          id="personal-email"
          label="ایمیل"
          type="email"
          value={email}
          onChange={setEmail}
        />
        <TextField
          id="personal-password"
          label="رمز عبور جدید"
          type="password"
          value={password}
          onChange={setPassword}
          hint="برای تغییر ندادن، خالی بگذارید."
        />
        <TextareaField
          id="personal-bio"
          label="بیوگرافی"
          value={bio}
          onChange={setBio}
          rows={4}
        />
        <ImageField
          id="personal-avatar"
          label="آواتار"
          src={avatarSrc}
          alt={name}
          onSrcChange={setAvatarSrc}
          onAltChange={() => {}}
          hideAlt
          emptyPreviewSrc={DEFAULT_MEMBER_AVATAR_SRC}
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="rounded bg-accent px-6 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "در حال ذخیره…" : "ذخیره"}
      </button>
    </div>
  );
}
