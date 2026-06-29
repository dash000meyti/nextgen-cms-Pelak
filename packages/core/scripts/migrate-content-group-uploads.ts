import { existsSync, renameSync } from "node:fs";
import { join } from "node:path";
import { resolveUploadsDir } from "../src/platform/paths";

function main() {
  const root = resolveUploadsDir();
  const legacy = join(root, "issues");
  const target = join(root, "content-group");

  if (!existsSync(legacy)) {
    console.log("No legacy issues upload folder; nothing to migrate.");
    return;
  }

  if (existsSync(target)) {
    console.log("content-group upload folder already exists; skipping rename.");
    return;
  }

  renameSync(legacy, target);
  console.log(`Moved uploads: ${legacy} -> ${target}`);
}

main();
