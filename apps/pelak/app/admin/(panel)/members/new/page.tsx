import type { MemberFormData } from "@nextgen-cms/studio/cms/mutations/member";
import { listSystemRoles } from "@nextgen-cms/studio/cms/queries";
import { MemberForm } from "@/components/admin/studio/MemberForm";

export default async function NewMemberPage() {
  const roles = await listSystemRoles();
  const writerRole = roles.find((role) => role.slug === "writer") ?? roles[0];

  const initial: MemberFormData = {
    slug: "",
    name: "",
    displayRole: "",
    bio: "",
    avatarSrc: "",
    avatarAlt: "",
    socialTwitter: "",
    socialTelegram: "",
    socialInstagram: "",
    email: "",
    password: "",
    roleId: writerRole?.id ?? 0,
    isActive: true,
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl text-ink">عضؤ جدید</h1>
      <MemberForm
        mode="create"
        initial={initial}
        roleOptions={roles.map((role) => ({
          id: role.id,
          name: role.name,
          slug: role.slug,
        }))}
      />
    </div>
  );
}
