"use client";

import type { SiteConfig } from "@nextgen-cms/contract/types/site";
import { createContext, useContext } from "react";

const SiteConfigContext = createContext<SiteConfig | null>(null);

type SiteConfigProviderProps = {
  config: SiteConfig;
  children: React.ReactNode;
};

export function SiteConfigProvider({
  config,
  children,
}: SiteConfigProviderProps) {
  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): SiteConfig {
  const config = useContext(SiteConfigContext);
  if (!config) {
    throw new Error("useSiteConfig must be used within SiteConfigProvider");
  }
  return config;
}
