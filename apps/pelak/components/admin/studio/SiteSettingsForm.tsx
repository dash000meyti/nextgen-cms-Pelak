"use client";

import type { SiteConfig } from "@nextgen-cms/contract/types/site";
import { saveSiteSettings } from "@nextgen-cms/studio/cms/mutations/settings";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import { TextField } from "@/components/admin/fields/TextField";
import { FormMessage } from "@/components/admin/studio/FormMessage";

type SiteSettingsFormProps = {
  siteConfig: SiteConfig;
};

export function SiteSettingsForm({ siteConfig }: SiteSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [site, setSite] = useState(siteConfig);

  function save() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        await saveSiteSettings({
          name: site.name,
          tagline: site.tagline,
          description: site.description,
          logo: site.logo,
          contactEmail: site.contactEmail,
          defaultTheme: site.defaultTheme,
          defaultDirection: site.defaultDirection,
          typography: site.typography,
        });
        setSuccess("ذخیره شد.");
        router.refresh();
      } catch {
        setError("خطا در ذخیرهٔ تنظیمات.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <FormMessage error={error} success={success} />
      <div className="grid max-w-2xl gap-6">
        <TextField
          id="site-name"
          label="نام"
          value={site.name}
          onChange={(name) => setSite({ ...site, name })}
          required
        />
        <TextField
          id="site-tagline"
          label="شعار"
          value={site.tagline}
          onChange={(tagline) => setSite({ ...site, tagline })}
          required
        />
        <TextareaField
          id="site-description"
          label="توضیحات"
          value={site.description}
          onChange={(description) => setSite({ ...site, description })}
          rows={4}
        />
        <TextField
          id="site-logo"
          label="لوگو (مسیر)"
          value={site.logo}
          onChange={(logo) => setSite({ ...site, logo })}
        />
        <TextField
          id="site-email"
          label="ایمیل تماس"
          value={site.contactEmail}
          onChange={(contactEmail) => setSite({ ...site, contactEmail })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium text-ink">تم پیش‌فرض</span>
            <select
              value={site.defaultTheme}
              onChange={(e) =>
                setSite({
                  ...site,
                  defaultTheme: e.target.value as SiteConfig["defaultTheme"],
                })
              }
              className="w-full rounded border border-rule bg-paper px-3 py-2 text-ink"
            >
              <option value="light">روشن</option>
              <option value="dark">تیره</option>
            </select>
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium text-ink">جهت متن</span>
            <select
              value={site.defaultDirection}
              onChange={(e) =>
                setSite({
                  ...site,
                  defaultDirection: e.target
                    .value as SiteConfig["defaultDirection"],
                })
              }
              className="w-full rounded border border-rule bg-paper px-3 py-2 text-ink"
            >
              <option value="rtl">راست‌به‌چپ</option>
              <option value="ltr">چپ‌به‌راست</option>
            </select>
          </label>
        </div>
        <div className="space-y-3 rounded border border-rule bg-surface/50 p-4">
          <p className="text-sm font-medium text-ink">تایپوگرافی بدنهٔ مقاله</p>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={site.typography.articleBody.rtl.justifyParagraphs}
              onChange={(e) =>
                setSite({
                  ...site,
                  typography: {
                    ...site.typography,
                    articleBody: {
                      ...site.typography.articleBody,
                      rtl: {
                        ...site.typography.articleBody.rtl,
                        justifyParagraphs: e.target.checked,
                      },
                    },
                  },
                })
              }
              className="h-4 w-4 rounded border-rule text-accent focus:ring-accent"
            />
            <span>جاستیفای پاراگراف‌ها برای متن راست‌به‌چپ (RTL)</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={site.typography.articleBody.ltr.justifyParagraphs}
              onChange={(e) =>
                setSite({
                  ...site,
                  typography: {
                    ...site.typography,
                    articleBody: {
                      ...site.typography.articleBody,
                      ltr: {
                        ...site.typography.articleBody.ltr,
                        justifyParagraphs: e.target.checked,
                      },
                    },
                  },
                })
              }
              className="h-4 w-4 rounded border-rule text-accent focus:ring-accent"
            />
            <span>جاستیفای پاراگراف‌ها برای متن چپ‌به‌راست (LTR)</span>
          </label>
        </div>
      </div>
      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="rounded bg-accent px-6 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "در حال ذخیره…" : "ذخیره"}
      </button>
    </div>
  );
}
