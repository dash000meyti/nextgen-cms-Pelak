import { getMemberSession } from "@nextgen-cms/studio/admin/session";
import { getMessageForAdmin } from "@nextgen-cms/studio/cms/queries/messages";
import { notFound } from "next/navigation";
import { MessageDetail } from "@/components/admin/studio/MessageDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminMessageDetailPage({ params }: PageProps) {
  const { id } = await params;
  const messageId = Number.parseInt(id, 10);
  if (Number.isNaN(messageId)) notFound();

  const [message, session] = await Promise.all([
    getMessageForAdmin(messageId),
    getMemberSession(),
  ]);
  if (!message) notFound();

  const canEdit = session?.permissions.includes("messages.edit") ?? false;
  const canDelete = session?.permissions.includes("messages.delete") ?? false;

  return (
    <MessageDetail message={message} canEdit={canEdit} canDelete={canDelete} />
  );
}
