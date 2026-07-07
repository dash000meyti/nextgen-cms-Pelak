import { Container } from "@/components/layout/Container";
import { SurveyForm } from "@/components/ui/SurveyForm";

export function SurveyCta() {
  return (
    <Container className="border-t border-rule py-10 md:py-20">
      <div className="rounded-lg bg-surface px-5 py-8 text-center sm:px-8 md:px-12 md:py-10">
        <h2 className="text-card-title text-center">نظرسنجی</h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-ink-muted">
          نظر خود را با ما در میان بگذارید. نام و شماره موبایل اختیاری است؛ در
          صورت وارد کردن آن‌ها، در صورت نیاز می‌توانیم با شما ارتباط برقرار کنیم.
        </p>
        <div className="mx-auto mt-6 max-w-xl">
          <SurveyForm />
        </div>
      </div>
    </Container>
  );
}
