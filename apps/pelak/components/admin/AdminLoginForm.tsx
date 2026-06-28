"use client";

import { type LoginState, loginAdmin } from "@nextgen-cms/studio/admin/actions";
import { useActionState } from "react";

type AdminLoginFormProps = {
  next: string;
  initialError?: string;
};

export function AdminLoginForm({ next, initialError }: AdminLoginFormProps) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAdmin,
    { error: initialError },
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="block text-sm text-ink-muted">
          ایمیل
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm text-ink"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm text-ink-muted">
          رمز عبور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm text-ink"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-accent" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "در حال ورود…" : "ورود"}
      </button>
    </form>
  );
}
