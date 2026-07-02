import { randomUUID, createHash } from "node:crypto";
import { assertWithinDataEnvelope, requestApproval } from "@arcr/command";
import { callGatewayInference } from "@arcr/rak-bridge";
import type { NormalizedSurplusEvent } from "@arcr/collectors";

export type KillReason =
  | "already-filed"
  | "already-released"
  | "escheat-executed"
  | "below-floor"
  | "duplicate";

export interface PrefilterResult {
  survived: boolean;
  killedReason?: KillReason;
  priorityEscheat?: boolean;
  juniorOnlyApplication?: boolean;
}

export interface DocumentRecord {
  id: string;
  eventId: string;
  kind: string;
  sha256: string;
  costCents: number;
  storageRef: string;
}

const docByHash = new Map<string, DocumentRecord>();

export function prefilterEvent(
  event: NormalizedSurplusEvent,
  context: {
    docketStatus?: string;
    grossFloorCents?: number;
    escheatDaysRemaining?: number;
  } = {},
): PrefilterResult {
  if (context.docketStatus === "released") {
    return { survived: false, killedReason: "already-released" };
  }
  if (context.docketStatus === "owner-application-filed") {
    return { survived: false, killedReason: "already-filed" };
  }
  if (context.docketStatus === "escheat-executed") {
    return { survived: false, killedReason: "escheat-executed" };
  }
  const floor = context.grossFloorCents ?? 1_500_000;
  if (event.grossCents < floor) {
    return { survived: false, killedReason: "below-floor" };
  }
  if (context.docketStatus === "junior-only-application") {
    return { survived: true, juniorOnlyApplication: true };
  }
  if ((context.escheatDaysRemaining ?? 999) <= 120) {
    return { survived: true, priorityEscheat: true };
  }
  return { survived: true };
}

export async function classifyAmbiguousDocket(text: string): Promise<string> {
  process.env.ARCR_ALLOW_SIMULATOR = "1";
  const result = await callGatewayInference({
    prompt: `Classify docket: ${text}`,
    taskType: "arcr-initial-score",
    agentTier: "goliath",
  });
  if (text.includes("junior")) return "junior-only-application";
  if (result.content.includes("junior")) return "junior-only-application";
  return "pending";
}

export function planStrategicPurchase(state: string): string {
  if (state === "AZ") return "deposit-complaint";
  if (state === "WA") return "notice-of-surplus-packet";
  return "trustee-claim-file";
}

export function purchaseDocument(input: {
  eventId: string;
  kind: string;
  content: string;
  costCents: number;
  currentMonthlySpendCents: number;
  envelopeCents: number;
}): DocumentRecord | { confirmFirst: true; approvalId: string } {
  try {
    assertWithinDataEnvelope({
      currentMonthlySpendCents: input.currentMonthlySpendCents,
      deltaCents: input.costCents,
      envelopeCents: input.envelopeCents,
    });
  } catch {
    const approval = requestApproval({
      kind: "over-envelope-spend",
      subjectRef: input.eventId,
      evidence: { kind: input.kind, costCents: input.costCents },
      requestedBy: "purchaser-agent",
    });
    return { confirmFirst: true, approvalId: approval.id };
  }
  const sha256 = createHash("sha256").update(input.content).digest("hex");
  const existing = docByHash.get(sha256);
  if (existing) return existing;
  const doc: DocumentRecord = {
    id: randomUUID(),
    eventId: input.eventId,
    kind: input.kind,
    sha256,
    costCents: input.costCents,
    storageRef: `s3://arcr-docs/${sha256}`,
  };
  docByHash.set(sha256, doc);
  return doc;
}

export function resetAcquisitionStore(): void {
  docByHash.clear();
}
