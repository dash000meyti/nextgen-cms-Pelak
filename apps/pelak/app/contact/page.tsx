import { getSiteConfig } from "@nextgen-cms/site-data/get-content";
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های ارتباطی با هفته‌نامه حکمران",
};

export default async function ContactPage() {
  const siteConfig = await getSiteConfig();

  return (
    <Container variant="narrow" className="py-8 md:py-14">
      <Breadcrumbs
        items={[{ label: "خانه", href: "/" }, { label: "تماس با ما" }]}
      />

      <div className="mt-8 space-y-10">
        <header className="space-y-3">
          <h1 className="font-heading text-3xl text-ink md:text-4xl">
            تماس با ما
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-ink-muted">
            برای ارسال پیام، پیشنهاد یا همکاری می‌توانید از فرم زیر استفاده کنید.
          </p>
        </header>

        <ContactForm />

        <section className="border-t border-rule pt-8">
          <h2 className="font-heading text-lg text-ink">راه‌های دیگر</h2>
          <p className="mt-2 text-sm text-ink-muted">
            ایمیل:{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="text-accent"
            >
              {siteConfig.contactEmail}
            </a>
          </p>
        </section>
      </div>
    </Container>
  );
}
