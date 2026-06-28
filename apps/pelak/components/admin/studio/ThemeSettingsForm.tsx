"use client";

import type { ThemeTokens } from "@nextgen-cms/contract/types/theme";
import { saveThemeTokens } from "@nextgen-cms/studio/cms/mutations/settings";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ThemePaletteEditor } from "@/components/admin/fields/ThemePaletteEditor";
import { FormMessage } from "@/components/admin/studio/FormMessage";

type ThemeSettingsFormProps = {
  themeTokens: ThemeTokens;
};

export function ThemeSettingsForm({ themeTokens }: ThemeSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [theme, setTheme] = useState(themeTokens);

  function save() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        await saveThemeTokens(theme);
        setSuccess("ذخیره شد.");
        router.refresh();
      } catch {
        setError("خطا در ذخیرهٔ تنظیمات.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <FormMessage error={error} success={success} />
      <ThemePaletteEditor
        label="پالت روشن"
        value={theme.light}
        onChange={(light) => setTheme({ ...theme, light })}
      />
      <ThemePaletteEditor
        label="پالت تیره"
        value={theme.dark}
        onChange={(dark) => setTheme({ ...theme, dark })}
      />
      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="rounded bg-accent px-6 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "در حال ذخیره…" : "ذخیره"}
      </button>
    </div>
  );
}
