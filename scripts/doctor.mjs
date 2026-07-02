#!/usr/bin/env node
const checks = [];

function pass(msg) {
  checks.push({ ok: true, msg });
  console.log(`  ✓ ${msg}`);
}
function warn(msg) {
  checks.push({ ok: true, warn: true, msg });
  console.log(`  ⚠ ${msg}`);
}
function fail(msg) {
  checks.push({ ok: false, msg });
  console.log(`  ✗ ${msg}`);
}

console.log("Arcadian Ridge doctor\n");

if (process.env.DATABASE_URL?.trim()) pass("DATABASE_URL set");
else warn("DATABASE_URL not set (in-memory stores used in dev)");

const gw = process.env.RAK_GATEWAY_URL || process.env.RAKONTEVR_GATEWAY_URL;
if (gw && process.env.RAK_API_KEY) pass("RSP gateway env configured");
else warn("Gateway not configured — ARCR_ALLOW_SIMULATOR=1 for offline tests");

if (process.env.ARCR_TOKEN_ENCRYPTION_KEY) pass("ARCR_TOKEN_ENCRYPTION_KEY set");
else warn("ARCR_TOKEN_ENCRYPTION_KEY not set (dev fallback in locator)");

const failed = checks.filter((c) => !c.ok);
console.log(failed.length ? "\nDoctor: FAIL" : "\nDoctor: OK");
process.exit(failed.length ? 1 : 0);
