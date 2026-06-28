import type { DocumentField } from "@nextgen-cms/contract/cms-schema/types";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import { TextField } from "@/components/admin/fields/TextField";

type FieldRendererProps = {
  field: DocumentField;
  value: string;
  onChange: (value: string) => void;
};

export function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  switch (field.kind) {
    case "textarea":
      return (
        <TextareaField
          id={field.key}
          label={field.label}
          value={value}
          onChange={onChange}
          required={field.required}
          hint={field.hint}
        />
      );
    default:
      return (
        <TextField
          id={field.key}
          label={field.label}
          value={value}
          onChange={onChange}
          required={field.required}
          hint={field.hint}
        />
      );
  }
}
