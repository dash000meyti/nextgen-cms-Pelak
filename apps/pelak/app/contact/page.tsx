import { getMessagesSettings } from "@nextgen-cms/site-data/messages";
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های ارتباطی با هفته‌نامه حکمران",
};

function isEmail(value: string) {
  return /@/.test(value) && !value.includes(" ");
}

export default async function ContactPage() {
  const messagesSettings = await getMessagesSettings();
  const methods = messagesSettings.contactMethods;

  return (
    <Container variant="narrow" className="py-8 md:py-14">
      <Breadcrumbs
        items={[{ label: "خانه", href: "/" }, { label: "تماس با ما" }]}
      />

      <div className="mt-8 space-y-10">
        <header className="space-y-3">
          <h1 className="text-page-title">تماس با ما</h1>
          <p className="text-lead max-w-xl">
            برای ارسال پیام، پیشنهاد یا همکاری می‌توانید از فرم زیر استفاده کنید.
          </p>
        </header>

        <ContactForm />

        {methods.length > 0 ? (
          <section className="border-t border-rule pt-8">
            <h2 className="text-block-title">راه‌های دیگر</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              {methods.map((method) => (
                <li key={method.id}>
                  <span className="text-ink">{method.label}: </span>
                  {isEmail(method.value) ? (
                    <a
                      href={`mailto:${method.value}`}
                      className="text-accent"
                      dir="ltr"
                    >
                      {method.value}
                    </a>
                  ) : (
                    <span dir="ltr">{method.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </Container>
  );
}
