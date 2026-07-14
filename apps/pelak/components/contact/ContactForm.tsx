"use client";

import type { MessagePayload } from "@nextgen-cms/contract/types/messages";
import { submitMessage } from "@nextgen-cms/site-data/messages-actions";
import { type FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { SubmissionSuccess } from "@/components/ui/SubmissionSuccess";
import { useFormFeedback } from "@/components/ui/useFormFeedback";

const FORM = "contact";

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const feedback = useFormFeedback();

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
        title="ممنون از پیام شما"
        description="پیامتان با موفقیت ارسال شد. در کوتاه‌ترین فرصت آن را می‌خوانیم و در صورت نیاز پاسخ می‌دهیم."
        resetLabel="ارسال پیام دیگر"
        onReset={() => setSubmitted(false)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Field label="نام" name="name" type="text" />
        <Field label="ایمیل" name="email" type="email" />
      </div>
      <Field label="موضوع" name="subject" type="text" />
      <label className="block space-y-1.5" data-field="message">
        <span className="text-sm font-medium text-ink">پیام</span>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-lg border border-rule bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
          placeholder="پیام خود را بنویسید..."
        />
      </label>
      <FormMessage
        error={feedback.error}
        success={feedback.success}
        info={feedback.info}
        onDismiss={feedback.clear}
      />
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "در حال ارسال…" : "ارسال پیام"}
      </Button>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type: string;
};

function Field({ label, name, type }: FieldProps) {
  return (
    <label className="block space-y-1.5" data-field={name}>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        name={name}
        type={type}
        className="w-full rounded-lg border border-rule bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
      />
    </label>
  );
}
