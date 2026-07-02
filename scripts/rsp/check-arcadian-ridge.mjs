#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const storiesPath = join(root, "docs/USER-STORIES.md");
const bddDir = join(root, "__tests__/portals/arcadian");
const topics = [
  "registry",
  "collectors",
  "acquisition",
  "underwriting",
  "locator",
  "outreach",
  "intake",
  "engagement",
  "filings",
  "trust",
  "memo",
  "verify",
];
const errors = [];

if (!existsSync(storiesPath)) {
  errors.push("Missing docs/USER-STORIES.md");
} else {
  const stories = readFileSync(storiesPath, "utf8");
  for (let n = 1; n <= 12; n++) {
    if (!stories.includes(`ARCR-${n}:`)) errors.push(`USER-STORIES missing ARCR-${n}`);
  }
}

for (let n = 1; n <= 12; n++) {
  const bddFile = join(bddDir, `arcr-${n}-${topics[n - 1]}.bdd.test.ts`);
  if (!existsSync(bddFile)) errors.push(`Missing BDD: arcr-${n}-${topics[n - 1]}.bdd.test.ts`);
}

if (errors.length) {
  console.error("RSP check FAILED:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log("RSP check OK — ARCR-1..12 stories and BDD present");
process.exit(0);
