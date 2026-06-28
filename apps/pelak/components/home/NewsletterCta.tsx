import { Container } from "@/components/layout/Container";
import { NewsletterForm } from "@/components/ui/NewsletterForm";

export function NewsletterCta() {
  return (
    <Container className="border-t border-rule py-10 md:py-14">
      <div className="rounded-lg bg-surface px-5 py-8 text-center sm:px-8 md:px-12 md:py-10">
        <h2 className="font-heading text-xl text-ink sm:text-2xl md:text-3xl">
          عضویت در خبرنامهٔ رایگان حکمران
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
          هر هفته، منتخب تحلیل‌های راهبردی سیاسی و اقتصادی را در ایمیل خود دریافت
          کنید.
        </p>
        <div className="mx-auto mt-6 max-w-md">
          <NewsletterForm />
        </div>
      </div>
    </Container>
  );
}
