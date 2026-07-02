import {
  getContentGroupModuleSettings,
  getContentSettings,
  getMemberSettings,
  getModuleSettings,
  getVideoModuleSettings,
} from "@nextgen-cms/site-data/get-content";
import { logoutAdmin } from "@nextgen-cms/studio/admin/actions";
import { AdminMemberProvider } from "@nextgen-cms/studio/admin/admin-member-context";
import { getMemberSession } from "@nextgen-cms/studio/admin/session";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/studio/AdminSidebar";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getMemberSession();

  if (!session) {
    redirect("/admin/login");
  }

  const [
    moduleSettings,
    contentSettings,
    memberSettings,
    contentGroupSettings,
    videoSettings,
  ] = await Promise.all([
    getModuleSettings(),
    getContentSettings(),
    getMemberSettings(),
    getContentGroupModuleSettings(),
    getVideoModuleSettings(),
  ]);

  const contextValue = {
    memberId: session.memberId,
    email: session.email ?? "",
    role: session.role,
    permissions: session.permissions,
    enabledModules: {
      contentGroup: moduleSettings.contentGroup.enabled,
      video: moduleSettings.video.enabled,
    },
    sectionPageTitles: {
      content: contentSettings.pageTitle,
      members: memberSettings.pageTitle,
      contentGroup: contentGroupSettings.pageTitle,
      video: videoSettings.pageTitle,
    },
  };

  return (
    <AdminMemberProvider value={contextValue}>
      <div className="min-h-screen bg-paper">
        <header className="border-b border-rule bg-surface">
          <div className="mx-auto flex max-w-wide items-center justify-between gap-4 px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="font-heading text-lg text-ink">
                استودیو حکمران
              </Link>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-ink-muted">
                {session.role.name}
                {session.email ? ` · ${session.email}` : ""}
              </span>
              <form action={logoutAdmin}>
                <button
                  type="submit"
                  className="text-ink-muted hover:text-accent"
                >
                  خروج
                </button>
              </form>
              <Link href="/" className="text-ink-muted hover:text-accent">
                سایت
              </Link>
            </div>
          </div>
        </header>
        <div className="mx-auto grid max-w-wide gap-8 px-4 py-8 lg:grid-cols-[14rem_1fr]">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <AdminSidebar />
          </aside>
          <main>{children}</main>
        </div>
      </div>
    </AdminMemberProvider>
  );
}
