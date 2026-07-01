"use client";

import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type UseSingletonSettingsFormOptions<T> = {
  initialValue: T;
  save: (value: T) => Promise<void | MutationResult | undefined>;
};

export function useSingletonSettingsForm<T>({
  initialValue,
  save,
}: UseSingletonSettingsFormOptions<T>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [value, setValue] = useState(initialValue);

  function submit() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const result = await save(value);
        if (result && "ok" in result && !result.ok) {
          setError("دسترسی مجاز نیست.");
          return;
        }
        setSuccess("ذخیره شد.");
        router.refresh();
      } catch {
        setError("خطا در ذخیرهٔ تنظیمات.");
      }
    });
  }

  return {
    value,
    setValue,
    pending,
    error,
    success,
    submit,
  };
}
