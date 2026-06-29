type ErrorWithStatus = Error & { statusCode?: number };

function isBodySizeLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const err = error as ErrorWithStatus;
  return (
    err.statusCode === 413 ||
    /body exceeded|bodysizelimit/i.test(err.message)
  );
}

export function formatServerActionError(error: unknown): string {
  if (isBodySizeLimitError(error)) {
    return "حجم محتوا برای ذخیره بیش از حد مجاز است. متن را کوتاه‌تر کنید یا بلوک‌های اضافی را حذف کنید.";
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "خطای غیرمنتظره رخ داد. دوباره تلاش کنید.";
}
