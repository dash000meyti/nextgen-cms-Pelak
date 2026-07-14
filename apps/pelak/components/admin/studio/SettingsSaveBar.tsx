import { FormMessage } from "@/components/ui/FormMessage";

type SettingsSaveBarProps = {
  pending: boolean;
  error: string | null;
  success: string | null;
  info?: string | null;
  onDismiss?: () => void;
  onSave: () => void;
};

export function SettingsSaveBar({
  pending,
  error,
  success,
  info,
  onDismiss,
  onSave,
}: SettingsSaveBarProps) {
  return (
    <div className="space-y-4">
      <FormMessage
        error={error}
        success={success}
        info={info}
        onDismiss={onDismiss}
      />
      <button
        type="button"
        onClick={onSave}
        disabled={pending}
        className="rounded bg-accent px-6 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "در حال ذخیره…" : "ذخیره"}
      </button>
    </div>
  );
}
