"use client";

import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useFormFeedback } from "@/components/ui/useFormFeedback";

type UseSingletonSettingsFormOptions<T> = {
  initialValue: T;
  save: (value: T) => Promise<MutationResult | undefined>;
};

export function useSingletonSettingsForm<T>({
  initialValue,
  save,
}: UseSingletonSettingsFormOptions<T>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const feedback = useFormFeedback();
  const [value, setValue] = useState(initialValue);

  function submit() {
    feedback.clear();
    startTransition(async () => {
      try {
        const result = await save(value);
        if (result && "ok" in result && !result.ok) {
          feedback.reportError(result.error, result.field);
          return;
        }
        feedback.reportSuccess("ذخیره شد.");
        router.refresh();
      } catch {
        feedback.reportError("خطا در ذخیرهٔ تنظیمات.");
      }
    });
  }

  return {
    value,
    setValue,
    pending,
    error: feedback.error,
    success: feedback.success,
    info: feedback.info,
    clear: feedback.clear,
    submit,
  };
}
