import type { ReactNode } from "react";
import { FormMessage } from "@/components/admin/studio/FormMessage";

type DocumentFormProps = {
  title?: string;
  error?: string | null;
  success?: string | null;
  children: ReactNode;
  actions?: ReactNode;
};

export function DocumentForm({
  title,
  error,
  success,
  children,
  actions,
}: DocumentFormProps) {
  return (
    <div className="space-y-6">
      {title ? (
        <h2 className="font-heading text-lg text-ink">{title}</h2>
      ) : null}
      <FormMessage error={error} success={success} />
      <div className="space-y-6">{children}</div>
      {actions ? (
        <div className="flex flex-wrap gap-3 border-t border-rule pt-6">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
