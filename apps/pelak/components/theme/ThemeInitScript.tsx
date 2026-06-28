import { THEME_INIT_SCRIPT } from "@nextgen-cms/config/theme/init-script";

export function ThemeInitScript() {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted static theme-init script to prevent FOUC
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
