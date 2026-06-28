import Link from "next/link";

export default function AdminForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-lg border border-rule bg-surface p-8 text-center">
        <h1 className="font-heading text-xl text-ink">دسترسی مجاز نیست</h1>
        <p className="mt-2 text-sm text-ink-muted">
          شما مجوز دسترسی به این بخش را ندارید.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-block text-sm text-accent hover:underline"
        >
          بازگشت به داشبورد
        </Link>
      </div>
    </div>
  );
}
