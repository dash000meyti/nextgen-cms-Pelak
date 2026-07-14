"use client";

import type {
  ContactMethod,
  MessagesSettings,
} from "@nextgen-cms/contract/types/messages";
import { saveMessagesSettings } from "@nextgen-cms/studio/cms/mutations/settings";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FormMessage } from "@/components/ui/FormMessage";
import { useFormFeedback } from "@/components/ui/useFormFeedback";

type MessagesSettingsFormProps = {
  value: MessagesSettings;
};

function createMethod(index: number): ContactMethod {
  return { id: `method-${Date.now()}-${index}`, label: "", value: "" };
}

export function MessagesSettingsForm({ value }: MessagesSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const feedback = useFormFeedback();
  const [methods, setMethods] = useState<ContactMethod[]>(
    value.contactMethods.length > 0 ? value.contactMethods : [createMethod(0)],
  );

  function update(index: number, patch: Partial<ContactMethod>) {
    setMethods((prev) =>
      prev.map((method, i) => (i === index ? { ...method, ...patch } : method)),
    );
  }

  function add() {
    setMethods((prev) => [...prev, createMethod(prev.length)]);
  }

  function remove(index: number) {
    setMethods((prev) => prev.filter((_, i) => i !== index));
  }

  function save() {
    feedback.clear();
    const cleaned = methods
      .map((method) => ({
        id: method.id || `method-${Math.random().toString(36).slice(2)}`,
        label: method.label.trim(),
        value: method.value.trim(),
      }))
      .filter((method) => method.label || method.value);
    startTransition(async () => {
      try {
        const result = await saveMessagesSettings({ contactMethods: cleaned });
        if (result && "ok" in result && !result.ok) {
          feedback.reportError("دسترسی مجاز نیست.");
          return;
        }
        setMethods(cleaned.length > 0 ? cleaned : [createMethod(0)]);
        feedback.reportSuccess("ذخیره شد.");
        router.refresh();
      } catch {
        feedback.reportError("خطا در ذخیرهٔ تنظیمات.");
      }
    });
  }

  const inputClassName =
    "w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent";

  return (
    <div className="max-w-xl space-y-6">
      <FormMessage
        error={feedback.error}
        success={feedback.success}
        info={feedback.info}
        onDismiss={feedback.clear}
      />

      <div className="space-y-4">
        {methods.map((method, index) => (
          <div
            key={method.id}
            className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium text-ink">عنوان</span>
              <input
                type="text"
                value={method.label}
                onChange={(e) => update(index, { label: e.target.value })}
                placeholder="مثلاً ایمیل"
                className={inputClassName}
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium text-ink">مقدار</span>
              <input
                type="text"
                value={method.value}
                onChange={(e) => update(index, { value: e.target.value })}
                placeholder="مثلاً info@example.com"
                className={inputClassName}
                dir="ltr"
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => remove(index)}
                className="rounded border border-rule px-3 py-2 text-sm text-ink-muted hover:border-accent hover:text-accent"
                aria-label="حذف ردیف"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="rounded border border-rule px-4 py-2 text-sm text-ink hover:border-accent hover:text-accent"
      >
        افزودن راه ارتباطی
      </button>

      <div>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded bg-accent px-6 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "در حال ذخیره…" : "ذخیره"}
        </button>
      </div>
    </div>
  );
}
