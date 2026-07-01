"use client";

import type { Permission } from "@nextgen-cms/contract/permissions";
import type { Role } from "@nextgen-cms/contract/types/member";
import { createContext, useContext } from "react";

export type AdminMemberContextValue = {
  memberId: number;
  email: string;
  role: Role;
  permissions: Permission[];
  enabledModules: {
    contentGroup: boolean;
    video: boolean;
  };
  moduleLabels: {
    contentGroup: string;
    video: string;
  };
};

const AdminMemberContext = createContext<AdminMemberContextValue | null>(null);

export function AdminMemberProvider({
  value,
  children,
}: {
  value: AdminMemberContextValue;
  children: React.ReactNode;
}) {
  return (
    <AdminMemberContext.Provider value={value}>
      {children}
    </AdminMemberContext.Provider>
  );
}

export function useAdminMember() {
  const context = useContext(AdminMemberContext);
  if (!context) {
    throw new Error("useAdminMember must be used within AdminMemberProvider");
  }
  return context;
}
