"use client";

import type { MessagePayload } from "@nextgen-cms/contract/types/messages";
import { submitMessage } from "@nextgen-cms/site-data/messages-actions";
import { type FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { SubmissionSuccess } from "@/components/ui/SubmissionSuccess";
import { useFormFeedback } from "@/components/ui/useFormFeedback";

const FORM = "survey";

export function SurveyForm() {
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const feedback = useFormFeedback();

  const inputClassName =
    "w-full rounded-lg border border-rule bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    feedback.clear();
    setSubmitted(false);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const website = formData.get("website");
    const payload: MessagePayload = {};
    for (const [key, value] of formData.entries()) {
      if (key === "website") continue;
      if (typeof value === "string") payload[key] = value;
    }

    startTransition(async () => {
      const result = await submitMessage({
        form: FORM,
        payload,
        website: typeof website === "string" ? website : undefined,
      });
      if (!result.ok) {
        feedback.reportError(result.error, result.field);
        return;
      }
      setSubmitted(true);
      form.reset();
    });
  }

  if (submitted) {
    return (
      <SubmissionSuccess
        title="ممنون از نظر شما"
        description="نظرتان با موفقیت ثبت شد. خواندن همهٔ نظرات برایمان مهم است."
        resetLabel="ارسال نظر دیگر"
        onReset={() => setSubmitted(false)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-start">
      {/* Honeypot — hidden from humans */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5" data-field="phone">
          <span className="text-sm font-medium text-ink">
            شماره موبایل (اختیاری)
          </span>
          <input
            name="phone"
            type="tel"
            dir="ltr"
            className={`${inputClassName} text-end`}
            placeholder="۰۹۱۲۱۲۳۴۵۶۷"
            autoComplete="tel"
          />
        </label>
        <label className="block space-y-1.5" data-field="name">
          <span className="text-sm font-medium text-ink">نام (اختیاری)</span>
          <input
            name="name"
            type="text"
            className={inputClassName}
            placeholder="نام شما"
            autoComplete="name"
          />
        </label>
      </div>
      <label className="block space-y-1.5" data-field="comment">
        <span className="text-sm font-medium text-ink">متن نظر</span>
        <textarea
          name="comment"
          required
          rows={4}
          className={inputClassName}
          placeholder="نظر خود را بنویسید..."
        />
      </label>
      <FormMessage
        error={feedback.error}
        success={feedback.success}
        info={feedback.info}
        onDismiss={feedback.clear}
      />
      <div className="flex justify-center sm:justify-start">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "در حال ارسال…" : "ارسال نظر"}
        </Button>
      </div>
    </form>
  );
}
