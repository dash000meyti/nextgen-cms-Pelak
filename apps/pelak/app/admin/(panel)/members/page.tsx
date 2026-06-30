import { getMemberSession } from "@nextgen-cms/studio/admin/session";
import { listMembersAdmin } from "@nextgen-cms/studio/cms/queries";
import { MembersAdminList } from "@/components/admin/studio/lists/MembersAdminList";

export default async function AdminMembersPage() {
  const [members, session] = await Promise.all([
    listMembersAdmin(),
    getMemberSession(),
  ]);
  const canEdit = session?.permissions.includes("members.edit") ?? false;

  return <MembersAdminList members={members} canEdit={canEdit} />;
}
