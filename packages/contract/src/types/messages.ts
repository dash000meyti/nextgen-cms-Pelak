export type MessageStatus = "unread" | "reviewed" | "pending_followup";

export type MessageForm = "contact" | "survey" | (string & {});

export type MessagePayload = Record<string, string | undefined>;

export type Message = {
  id: number;
  form: MessageForm;
  status: MessageStatus;
  payload: MessagePayload;
  createdAt: string;
};

export type MessageListItem = {
  id: number;
  form: MessageForm;
  status: MessageStatus;
  summary: string;
  createdAt: string;
};

export type ContactMethod = {
  id: string;
  label: string;
  value: string;
};

export type MessagesSettings = {
  contactMethods: ContactMethod[];
};
