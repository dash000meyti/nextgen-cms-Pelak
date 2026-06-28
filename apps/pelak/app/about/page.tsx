import { getSiteConfig } from "@nextgen-cms/site-data/get-content";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  return {
    title: "درباره ما",
    description: siteConfig.description,
  };
}

export default async function AboutPage() {
  const siteConfig = await getSiteConfig();

  return (
    <Container variant="narrow" className="py-8 md:py-14">
      <Breadcrumbs
        items={[{ label: "خانه", href: "/" }, { label: "درباره ما" }]}
      />

      <article className="mt-8 space-y-6 text-sm leading-8 text-ink sm:text-base md:leading-9">
        <h1 className="font-heading text-2xl text-ink sm:text-3xl md:text-4xl">
          درباره حکمران
        </h1>
        <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
          {siteConfig.description}
        </p>

        <p>
          هفته‌نامه حکمران، پایگاهی مستقل برای تحلیل راهبردی مسائل سیاسی و
          اقتصادی است. ما باور داریم که فهم عمیق حکمرانی، اقتصاد و نظم جهانی
          پیش‌شرط هر تصمیم جمعی است؛ و این فهم تنها از طریق گفت‌و‌گوی آزاد و مستند
          ممکن می‌شود.
        </p>
        <h2 className="pt-4 font-heading text-xl text-ink md:text-2xl">
          رسالت
        </h2>
        <p>
          رسالت ما تولید محتوایی است که از تحلیل داده تا تفسیر راهبردی را در بر
          بگیرد؛ متنی که نه برای لحظه، که برای فهم بلندمدت نوشته می‌شود.
        </p>
        <h2 className="pt-4 font-heading text-xl text-ink md:text-2xl">
          خط‌مشی تحریریه
        </h2>
        <p>
          تحریریه حکمران به استقلال از منابع مالی و سیاسی پایبند است. هر مطلب با
          ذکر منبع منتشر می‌شود و نظر عضو لزوماً نظر پایگاه نیست.
        </p>
      </article>
    </Container>
  );
}
