"use client";

import type { ThemeTokens } from "@nextgen-cms/contract/types/theme";
import { saveThemeTokens } from "@nextgen-cms/studio/cms/mutations/settings";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ThemePaletteEditor } from "@/components/admin/fields/ThemePaletteEditor";
import { FormMessage } from "@/components/ui/FormMessage";
import { useFormFeedback } from "@/components/ui/useFormFeedback";

type ThemeSettingsFormProps = {
  themeTokens: ThemeTokens;
};

export function ThemeSettingsForm({ themeTokens }: ThemeSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const feedback = useFormFeedback();
  const [theme, setTheme] = useState(themeTokens);

  function save() {
    feedback.clear();
    startTransition(async () => {
      try {
        await saveThemeTokens(theme);
        feedback.reportSuccess("ذخیره شد.");
        router.refresh();
      } catch {
        feedback.reportError("خطا در ذخیرهٔ تنظیمات.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <FormMessage
        error={feedback.error}
        success={feedback.success}
        info={feedback.info}
        onDismiss={feedback.clear}
      />
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
