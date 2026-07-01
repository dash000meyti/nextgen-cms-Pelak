import { FormMessage } from "@/components/admin/studio/FormMessage";

type SettingsSaveBarProps = {
  pending: boolean;
  error: string | null;
  success: string | null;
  onSave: () => void;
};

export function SettingsSaveBar({
  pending,
  error,
  success,
  onSave,
}: SettingsSaveBarProps) {
  return (
    <div className="space-y-4">
      <FormMessage error={error} success={success} />
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
