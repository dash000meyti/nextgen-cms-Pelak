import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container
      variant="narrow"
      className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center"
    >
      <p className="font-heading text-6xl text-accent md:text-8xl">۴۰۴</p>
      <h1 className="mt-4 font-heading text-2xl text-ink md:text-3xl">
        صفحه یافت نشد
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
        صفحه‌ای که به دنبال آن بودید وجود ندارد یا منتقل شده است.
      </p>
      <div className="mt-8">
        <Button href="/" variant="primary">
          بازگشت به خانه
        </Button>
      </div>
      <Link
        href="/content"
        className="mt-4 text-sm text-ink-muted hover:text-accent"
      >
        مشاهده آخرین محتوا
      </Link>
    </Container>
  );
}
