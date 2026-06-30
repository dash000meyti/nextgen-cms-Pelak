"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function SurveyForm() {
  const [status, setStatus] = useState<"idle" | "success">("idle");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("success");
    event.currentTarget.reset();
    window.setTimeout(() => setStatus("idle"), 3000);
  }

  const inputClassName =
    "w-full rounded-lg border border-rule bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-start">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">شماره موبایل (اختیاری)</span>
          <input
            name="phone"
            type="tel"
            dir="ltr"
            className={`${inputClassName} text-end`}
            placeholder="۰۹۱۲۱۲۳۴۵۶۷"
            autoComplete="tel"
          />
        </label>
        <label className="block space-y-1.5">
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
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-ink">متن نظر</span>
        <textarea
          name="comment"
          required
          rows={4}
          className={inputClassName}
          placeholder="نظر خود را بنویسید..."
        />
      </label>
      <div className="flex justify-center sm:justify-start">
        <Button type="submit" variant="primary">
          {status === "success" ? "ارسال شد" : "ارسال نظر"}
        </Button>
      </div>
    </form>
  );
}
