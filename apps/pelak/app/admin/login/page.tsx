import { getMemberSession } from "@nextgen-cms/studio/admin/session";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

type AdminLoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const session = await getMemberSession();
  if (session) {
    redirect("/admin");
  }

  const params = await searchParams;
  const forbidden = params.error === "forbidden";
  const next = params.next ?? "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-lg border border-rule bg-surface p-8">
        <h1 className="font-heading text-xl text-ink">ورود به پنل ادمین</h1>
        <p className="mt-2 text-sm text-ink-muted">
          با ایمیل و رمز عبور حساب خود وارد شوید.
        </p>

        <AdminLoginForm
          next={next}
          initialError={
            forbidden ? "شما مجوز دسترسی به این بخش را ندارید." : undefined
          }
        />

        <p className="mt-6 text-center text-sm text-ink-muted">
          <Link href="/" className="hover:text-accent">
            بازگشت به سایت
          </Link>
        </p>
      </div>
    </div>
  );
}
