"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;
    setStatus("success");
    setEmail("");
    window.setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="ایمیل شما"
        aria-label="ایمیل"
        className="w-full flex-1 rounded-full border border-rule bg-paper px-4 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
      />
      <Button type="submit" variant="primary">
        {status === "success" ? "ثبت شد" : "عضویت در خبرنامه"}
      </Button>
    </form>
  );
}
