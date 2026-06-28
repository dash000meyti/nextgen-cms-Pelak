import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import { getMemberSession } from "@nextgen-cms/studio/admin/session";
import type { MemberFormData } from "@nextgen-cms/studio/cms/mutations/member";
import {
  getMemberForAdmin,
  listSystemRoles,
} from "@nextgen-cms/studio/cms/queries";
import { notFound } from "next/navigation";
import { MemberForm } from "@/components/admin/studio/MemberForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMemberPage({ params }: PageProps) {
  await requirePermission("members.edit");

  const { id } = await params;
  const memberId = Number.parseInt(id, 10);
  if (Number.isNaN(memberId)) notFound();

  const [member, roles, session] = await Promise.all([
    getMemberForAdmin(memberId),
    listSystemRoles(),
    getMemberSession(),
  ]);
  if (!member) notFound();

  const initial: MemberFormData = {
    slug: member.slug,
    name: member.name,
    displayRole: member.displayRole,
    bio: member.bio,
    avatarSrc: member.avatar.src,
    avatarAlt: member.avatar.alt,
    socialTwitter: member.social?.twitter ?? "",
    socialTelegram: member.social?.telegram ?? "",
    socialInstagram: member.social?.instagram ?? "",
    email: member.email ?? "",
    password: "",
    roleId: member.role.id,
    isActive: member.isActive,
  };

  const canDelete = session?.permissions.includes("members.delete") ?? false;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl text-ink">ویرایش عضو</h1>
      <MemberForm
        mode="edit"
        memberId={memberId}
        initial={initial}
        roleOptions={roles.map((role) => ({
          id: role.id,
          name: role.name,
          slug: role.slug,
        }))}
        canDelete={canDelete}
      />
    </div>
  );
}
