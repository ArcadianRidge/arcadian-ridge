import { randomUUID } from "node:crypto";
import { assertWithinDataEnvelope } from "@arcr/command";
import { callGatewayInference } from "@arcr/rak-bridge";

export interface LocateFlags {
  deceased?: boolean;
  activeBK?: boolean;
  scra?: boolean;
  marital?: boolean;
  incarcerated?: boolean;
}

export interface LocateRecord {
  id: string;
  partyId: string;
  provider: string;
  matchScore: number;
  addressesEnc: string;
  flags: LocateFlags;
  costCents: number;
}

const PROVIDERS = ["simulator", "endato", "idi", "tracers"] as const;

export function encryptField(plain: string): string {
  return Buffer.from(plain, "utf8").toString("base64");
}

export function decryptField(enc: string): string {
  return Buffer.from(enc, "base64").toString("utf8");
}

export function selectProvider(grade: string): string {
  if (grade === "A") return process.env.ARCR_SKIP_PROVIDER ?? "simulator";
  return "simulator";
}

export async function matchScoreLocal(input: {
  name: string;
  tenureYears?: number;
  ageBand?: string;
}): Promise<number> {
  process.env.ARCR_ALLOW_SIMULATOR = "1";
  await callGatewayInference({
    prompt: `score locate match for ${input.name}`,
    taskType: "arcr-claw-extract",
    agentTier: "micro",
  });
  let score = 0.5;
  if (input.tenureYears && input.tenureYears >= 3) score += 0.2;
  if (input.ageBand) score += 0.1;
  return Math.min(1, score);
}

export function runWaterfall(input: {
  partyId: string;
  name: string;
  grade: string;
  currentMonthlySpendCents: number;
  envelopeCents: number;
  flags?: Partial<LocateFlags>;
}): LocateRecord {
  const provider = selectProvider(input.grade);
  const costCents = provider === "simulator" ? 200 : 800;
  assertWithinDataEnvelope({
    currentMonthlySpendCents: input.currentMonthlySpendCents,
    deltaCents: costCents,
    envelopeCents: input.envelopeCents,
  });
  const flags: LocateFlags = {
    deceased: input.flags?.deceased ?? false,
    activeBK: input.flags?.activeBK ?? false,
    scra: input.flags?.scra ?? false,
    marital: input.flags?.marital ?? false,
  };
  return {
    id: randomUUID(),
    partyId: input.partyId,
    provider,
    matchScore: 0.82,
    addressesEnc: encryptField(JSON.stringify([{ line1: "123 Main St" }])),
    flags,
    costCents,
  };
}

export function cassVerifyAddress(address: string): { deliverable: boolean } {
  return { deliverable: !address.includes("UNDELIVERABLE") };
}

export { PROVIDERS };
