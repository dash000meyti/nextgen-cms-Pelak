export type MutationResult =
  | { ok: true; id?: number }
  | { ok: false; error: string; field?: string };

export function mutationFailure(
  error: string,
  field?: string,
): Extract<MutationResult, { ok: false }> {
  return field ? { ok: false, error, field } : { ok: false, error };
}

export function mutationIssue(issue: {
  message: string;
  field: string;
}): Extract<MutationResult, { ok: false }> {
  return { ok: false, error: issue.message, field: issue.field };
}
