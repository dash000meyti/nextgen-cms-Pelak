import type { MessageStatus } from "@nextgen-cms/contract/types/messages";
import { listMessagesAdmin } from "@nextgen-cms/studio/cms/queries/messages";
import { MessagesAdminList } from "@/components/admin/studio/lists/MessagesAdminList";

type PageProps = {
  searchParams: Promise<{ status?: string; form?: string }>;
};

const VALID_STATUSES: MessageStatus[] = [
  "unread",
  "reviewed",
  "pending_followup",
];

export default async function AdminMessagesPage({ searchParams }: PageProps) {
  const { status: statusParam, form: formParam } = await searchParams;
  const status =
    statusParam && (VALID_STATUSES as readonly string[]).includes(statusParam)
      ? (statusParam as MessageStatus)
      : "all";
  const form = formParam && formParam.trim() !== "" ? formParam : "all";

  const messages = await listMessagesAdmin({
    status: status === "all" ? undefined : status,
    form: form === "all" ? undefined : form,
  });

  return <MessagesAdminList messages={messages} status={status} form={form} />;
}
