"use client";

import type { Permission } from "@nextgen-cms/contract/permissions";
import type { Member } from "@nextgen-cms/contract/types/member";
import type { SiteConfig } from "@nextgen-cms/contract/types/site";
import type {
  FeatureModules,
  ThemeTokens,
} from "@nextgen-cms/contract/types/theme";
import { useAdminMember } from "@nextgen-cms/studio/admin/admin-member-context";
import {
  saveFeatureModules,
  saveSiteSettings,
  saveThemeTokens,
} from "@nextgen-cms/studio/cms/mutations/settings";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { FeatureModulesToggle } from "@/components/admin/fields/FeatureModulesToggle";
import { TextareaField } from "@/components/admin/fields/TextareaField";
import { TextField } from "@/components/admin/fields/TextField";
import { ThemePaletteEditor } from "@/components/admin/fields/ThemePaletteEditor";
import { FormMessage } from "@/components/admin/studio/FormMessage";
import { PersonalSettingsForm } from "@/components/admin/studio/PersonalSettingsForm";

type SettingsEditorProps = {
  memberProfile: Member;
  siteConfig: SiteConfig;
  themeTokens: ThemeTokens;
  featureModules: FeatureModules;
};

type Tab = "personal" | "site" | "theme" | "modules";

const TAB_PERMISSIONS: Record<Exclude<Tab, "personal">, Permission> = {
  site: "settings.site",
  theme: "settings.theme",
  modules: "settings.modules",
};

export function SettingsEditor({
  memberProfile,
  siteConfig,
  themeTokens,
  featureModules,
}: SettingsEditorProps) {
  const { permissions } = useAdminMember();
  const router = useRouter();
  const tabs = useMemo(() => {
    const items: { id: Tab; label: string }[] = [];
    if (permissions.includes("settings.personal")) {
      items.push({ id: "personal", label: "اطلاعات شخصی" });
    }
    if (permissions.includes("settings.site")) {
      items.push({ id: "site", label: "سایت" });
    }
    if (permissions.includes("settings.theme")) {
      items.push({ id: "theme", label: "رنگ‌ها" });
    }
    if (permissions.includes("settings.modules")) {
      items.push({ id: "modules", label: "ماژول‌ها" });
    }
    return items;
  }, [permissions]);

  const [tab, setTab] = useState<Tab>(tabs[0]?.id ?? "personal");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [site, setSite] = useState(siteConfig);
  const [theme, setTheme] = useState(themeTokens);
  const [modules, setModules] = useState(featureModules);

  function save() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        if (tab === "site") {
          await saveSiteSettings({
            name: site.name,
            tagline: site.tagline,
            description: site.description,
            logo: site.logo,
            contactEmail: site.contactEmail,
            defaultTheme: site.defaultTheme,
            defaultDirection: site.defaultDirection,
          });
        } else if (tab === "theme") {
          await saveThemeTokens(theme);
        } else if (tab === "modules") {
          await saveFeatureModules(modules);
        } else {
          return;
        }
        setSuccess("ذخیره شد.");
        router.refresh();
      } catch {
        setError("خطا در ذخیرهٔ تنظیمات.");
      }
    });
  }

  const activeTab = tabs.some((item) => item.id === tab)
    ? tab
    : (tabs[0]?.id ?? "personal");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-rule">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`border-b-2 px-4 py-2 text-sm transition-colors ${
              activeTab === item.id
                ? "border-accent text-accent"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {activeTab === "personal" ? (
        <PersonalSettingsForm member={memberProfile} />
      ) : (
        <>
          <FormMessage error={error} success={success} />

          {activeTab === "site" ? (
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
                        defaultTheme: e.target
                          .value as SiteConfig["defaultTheme"],
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
            </div>
          ) : null}

          {activeTab === "theme" ? (
            <div className="space-y-6">
              <ThemePaletteEditor
                label="پالت روشن"
                value={theme.light}
                onChange={(light) => setTheme({ ...theme, light })}
              />
              <ThemePaletteEditor
                label="پالت تیره"
                value={theme.dark}
                onChange={(dark) => setTheme({ ...theme, dark })}
              />
            </div>
          ) : null}

          {activeTab === "modules" ? (
            <div className="max-w-md">
              <FeatureModulesToggle value={modules} onChange={setModules} />
            </div>
          ) : null}

          {permissions.includes(TAB_PERMISSIONS[activeTab]) ? (
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="rounded bg-accent px-6 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
            >
              {pending ? "در حال ذخیره…" : "ذخیره"}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
