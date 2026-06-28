import type { FeatureModules } from "@nextgen-cms/contract/types/theme";
import { getFeatureModules } from "@nextgen-cms/site-data/get-content";
import { notFound } from "next/navigation";

export async function requireFeatureModule(module: keyof FeatureModules) {
  const modules = await getFeatureModules();
  if (!modules[module]) notFound();
}
