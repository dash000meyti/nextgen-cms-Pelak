#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const bump = process.argv[2] ?? "patch";

const corePkgPath = join(root, "packages/core/package.json");
const corePkg = JSON.parse(readFileSync(corePkgPath, "utf-8"));
const [major, minor, patch] = corePkg.version.split(".").map(Number);

const nextVersion =
  bump === "major"
    ? `${major + 1}.0.0`
    : bump === "minor"
      ? `${major}.${minor + 1}.0`
      : `${major}.${minor}.${patch + 1}`;

corePkg.version = nextVersion;
writeFileSync(corePkgPath, `${JSON.stringify(corePkg, null, 2)}\n`);

const rootPkgPath = join(root, "package.json");
const rootPkg = JSON.parse(readFileSync(rootPkgPath, "utf-8"));
rootPkg.version = nextVersion;
writeFileSync(rootPkgPath, `${JSON.stringify(rootPkg, null, 2)}\n`);

console.log(`Released @nextgen-cms/core v${nextVersion}`);
console.log("Update CHANGELOG.md before tagging.");
