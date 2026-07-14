import type { ReactNode } from "react";
import { FormMessage } from "@/components/ui/FormMessage";

type DocumentFormProps = {
  title?: string;
  error?: string | null;
  success?: string | null;
  info?: string | null;
  onDismiss?: () => void;
  children: ReactNode;
  actions?: ReactNode;
};

export function DocumentForm({
  title,
  error,
  success,
  info,
  onDismiss,
  children,
  actions,
}: DocumentFormProps) {
  return (
    <div className="space-y-6">
      {title ? (
        <h2 className="font-heading text-lg text-ink">{title}</h2>
      ) : null}
      <FormMessage
        error={error}
        success={success}
        info={info}
        onDismiss={onDismiss}
      />
      <div className="space-y-6">{children}</div>
      {actions ? (
        <div className="flex flex-wrap gap-3 border-t border-rule pt-6">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
