import { randomUUID } from "node:crypto";
import { requestApproval } from "@arcr/command";
import { canDispatchOutreachStages, validateRulePack, type RulePack } from "./rule-pack.js";
import { LAUNCH_PACKS } from "./packs/launch-packs.js";

export interface JurisdictionRecord {
  id: string;
  state: string;
  county: string;
  rulePack: RulePack;
  version: number;
  status: "draft" | "certified" | "stale";
  certifiedBy?: string;
  certifiedAt?: string;
  effectiveAt?: string;
}

const store = new Map<string, JurisdictionRecord>();

export function draftPack(key: string, pack: unknown): JurisdictionRecord {
  const validated = validateRulePack(pack);
  const existing = store.get(key);
  const version = (existing?.version ?? 0) + 1;
  const record: JurisdictionRecord = {
    id: existing?.id ?? randomUUID(),
    state: validated.state,
    county: validated.county,
    rulePack: validated,
    version,
    status: "draft",
  };
  store.set(key, record);
  return record;
}

export function certifyPack(
  key: string,
  certifiedBy: string,
): JurisdictionRecord {
  const record = store.get(key);
  if (!record) throw new Error(`Pack ${key} not found`);
  record.status = "certified";
  record.certifiedBy = certifiedBy;
  record.certifiedAt = new Date().toISOString();
  record.effectiveAt = new Date().toISOString();
  store.set(key, record);
  return record;
}

export function markPackStale(key: string): JurisdictionRecord {
  const record = store.get(key);
  if (!record) throw new Error(`Pack ${key} not found`);
  if (record.status === "certified") record.status = "stale";
  store.set(key, record);
  return record;
}

export function getPack(key: string): JurisdictionRecord | undefined {
  return store.get(key);
}

export function listPacks(): JurisdictionRecord[] {
  return [...store.values()];
}

export function assertCountyDispatchAllowed(key: string): void {
  const record = store.get(key);
  if (!record || !canDispatchOutreachStages(record)) {
    throw new Error(`County ${key} pack not certified — stages 6-10 blocked`);
  }
}

export function requestRegistryEditApproval(key: string, diff: Record<string, unknown>) {
  return requestApproval({
    kind: "registry-edit",
    subjectRef: key,
    evidence: diff,
    requestedBy: "registry-agent",
  });
}

export function seedLaunchPacks(): JurisdictionRecord[] {
  return Object.entries(LAUNCH_PACKS).map(([key, pack]) => draftPack(key, pack));
}

export function resetRegistryStore(): void {
  store.clear();
}
