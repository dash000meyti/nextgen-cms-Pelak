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

      <article className="mt-8 space-y-6 text-base leading-8 text-ink md:leading-9">
        <h1 className="text-page-title">درباره حکمران</h1>
        <p className="text-lead">{siteConfig.description}</p>

        <p>
          هفته‌نامه حکمران، پایگاهی مستقل برای تحلیل راهبردی مسائل سیاسی و
          اقتصادی است. ما باور داریم که فهم عمیق حکمرانی، اقتصاد و نظم جهانی
          پیش‌شرط هر تصمیم جمعی است؛ و این فهم تنها از طریق گفت‌و‌گوی آزاد و مستند
          ممکن می‌شود.
        </p>
        <h2 className="text-block-title pt-4">رسالت</h2>
        <p>
          رسالت ما تولید محتوایی است که از تحلیل داده تا تفسیر راهبردی را در بر
          بگیرد؛ متنی که نه برای لحظه، که برای فهم بلندمدت نوشته می‌شود.
        </p>
        <h2 className="text-block-title pt-4">خط‌مشی تحریریه</h2>
        <p>
          تحریریه حکمران به استقلال از منابع مالی و سیاسی پایبند است. هر مطلب با
          ذکر منبع منتشر می‌شود و نظر {siteConfig.memberLabel} لزوماً نظر پایگاه
          نیست.
        </p>
      </article>
    </Container>
  );
}
