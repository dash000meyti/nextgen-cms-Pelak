import { THEME_INIT_SCRIPT } from "@nextgen-cms/config/theme/init-script";
import Script from "next/script";

export function ThemeInitScript() {
  return (
    <Script
      id="theme-init"
      strategy="beforeInteractive"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted static theme-init script to prevent FOUC
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
