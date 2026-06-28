"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success">("idle");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("success");
    event.currentTarget.reset();
    window.setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="نام" name="name" type="text" />
        <Field label="ایمیل" name="email" type="email" />
      </div>
      <Field label="موضوع" name="subject" type="text" />
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-ink">پیام</span>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-lg border border-rule bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
          placeholder="پیام خود را بنویسید..."
        />
      </label>
      <Button type="submit" variant="primary">
        {status === "success" ? "ارسال شد" : "ارسال پیام"}
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
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        name={name}
        type={type}
        required
        className="w-full rounded-lg border border-rule bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
      />
    </label>
  );
}
