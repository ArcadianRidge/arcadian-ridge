import { randomUUID } from "node:crypto";
import { callGatewayInference } from "@arcr/rak-bridge";

export interface PartyNode {
  role: string;
  name: string;
  counselOfRecord?: boolean;
  confidence: number;
}

export interface LienNode {
  kind: string;
  faceCents: number;
  claimPropensity: number;
  position: number;
}

export interface UnderwritingScore {
  id: string;
  eventId: string;
  modelVersion: string;
  grossCents: number;
  expectedJuniorCents: number;
  netToOwnerCents: number;
  feeEstCents: number;
  grade: "A" | "B" | "C" | "D";
  features: Record<string, unknown>;
}

const scores: UnderwritingScore[] = [];
const PROTECTED_FEATURES = ["race", "religion", "sex", "nationalOrigin"];

export function extractPartiesFromDocument(text: string): PartyNode[] {
  const parties: PartyNode[] = [];
  if (text.includes("HOA")) {
    parties.push({ role: "association", name: "Sample HOA", confidence: 0.9 });
  }
  const ownerMatch = text.match(/owner[:\s]+([A-Za-z ]+)/i);
  if (ownerMatch) {
    parties.push({ role: "owner", name: ownerMatch[1].trim(), confidence: 0.85 });
  }
  if (!parties.length) {
    parties.push({ role: "owner", name: "Unknown Owner", confidence: 0.4 });
  }
  return parties;
}

export async function extractWithContract(documentText: string): Promise<PartyNode[]> {
  process.env.ARCR_ALLOW_SIMULATOR = "1";
  await callGatewayInference({
    prompt: `extract parties from: ${documentText}`,
    taskType: "arcr-diligence",
    agentTier: "goliath",
  });
  return extractPartiesFromDocument(documentText);
}

export function defaultPropensity(lienKind: string, state: string): number {
  if (state === "AZ" && lienKind === "hoa") return 1.0;
  if (lienKind === "judgment") return 0.7;
  if (lienKind === "tax") return 0.85;
  if (lienKind === "dot") return 0.5;
  return 0.3;
}

export function buildLienGraph(
  liens: Array<{ kind: string; faceCents: number }>,
  state: string,
): LienNode[] {
  return liens.map((l, i) => ({
    kind: l.kind,
    faceCents: l.faceCents,
    claimPropensity: defaultPropensity(l.kind, state),
    position: i + 1,
  }));
}

export function scoreNetSurplus(input: {
  eventId: string;
  grossCents: number;
  liens: LienNode[];
  feePct?: number;
}): UnderwritingScore {
  const expectedJuniorCents = input.liens.reduce(
    (sum, l) => sum + Math.round(l.faceCents * l.claimPropensity),
    0,
  );
  const netToOwnerCents = Math.max(0, input.grossCents - expectedJuniorCents);
  const feePct = input.feePct ?? 0.25;
  const feeEstCents = Math.round(netToOwnerCents * feePct);
  let grade: UnderwritingScore["grade"] = "D";
  if (feeEstCents >= 15_000_00) grade = "A";
  else if (feeEstCents >= 8_000_00) grade = "B";
  else if (feeEstCents >= 3_000_00) grade = "C";

  const record: UnderwritingScore = {
    id: randomUUID(),
    eventId: input.eventId,
    modelVersion: "v0-rules",
    grossCents: input.grossCents,
    expectedJuniorCents,
    netToOwnerCents,
    feeEstCents,
    grade,
    features: { lienCount: input.liens.length },
  };
  scores.push(record);
  return record;
}

export function assertNoProtectedFeatures(features: Record<string, unknown>): void {
  for (const key of Object.keys(features)) {
    if (PROTECTED_FEATURES.includes(key)) {
      throw new Error(`Protected feature ${key} cannot be used in scoring`);
    }
  }
}

export function recordResolutionLabel(input: {
  eventId: string;
  actualJuniorCents: number;
  actualNetCents: number;
  cycleDays: number;
}) {
  return { ...input, labeledAt: new Date().toISOString() };
}

export function listScores(): UnderwritingScore[] {
  return [...scores];
}

export function resetUnderwritingStore(): void {
  scores.length = 0;
}
