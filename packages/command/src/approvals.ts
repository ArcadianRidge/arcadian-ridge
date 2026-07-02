import { randomUUID } from "node:crypto";

export type ApprovalKind =
  | "over-envelope-spend"
  | "template-change"
  | "envelope-change"
  | "filing"
  | "disbursement"
  | "registry-edit"
  | "model-deploy";

export interface ApprovalCard {
  id: string;
  kind: ApprovalKind;
  subjectRef: string;
  evidence: Record<string, unknown>;
  status: "pending" | "approved" | "declined";
  requestedBy: string;
  decidedBy?: string;
  decidedAt?: string;
  traceId: string;
  createdAt: string;
}

const queue: ApprovalCard[] = [];

export function requestApproval(input: {
  kind: ApprovalKind;
  subjectRef: string;
  evidence: Record<string, unknown>;
  requestedBy: string;
  traceId?: string;
}): ApprovalCard {
  const card: ApprovalCard = {
    id: randomUUID(),
    kind: input.kind,
    subjectRef: input.subjectRef,
    evidence: input.evidence,
    status: "pending",
    requestedBy: input.requestedBy,
    traceId: input.traceId ?? randomUUID(),
    createdAt: new Date().toISOString(),
  };
  queue.push(card);
  return card;
}

export function decideApproval(
  id: string,
  decision: "approved" | "declined",
  decidedBy: string,
): ApprovalCard {
  const card = queue.find((c) => c.id === id);
  if (!card) throw new Error(`Approval ${id} not found`);
  if (card.status !== "pending") throw new Error(`Approval ${id} already decided`);
  card.status = decision;
  card.decidedBy = decidedBy;
  card.decidedAt = new Date().toISOString();
  return card;
}

export function getApprovalQueue(filter?: { status?: ApprovalCard["status"] }): ApprovalCard[] {
  if (!filter?.status) return [...queue];
  return queue.filter((c) => c.status === filter.status);
}

export function resetApprovalQueue(): void {
  queue.length = 0;
}

export function getMondayQueueSummary() {
  const pending = getApprovalQueue({ status: "pending" });
  const oldest = pending.sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  return {
    pendingCount: pending.length,
    oldestAgeHours: oldest
      ? (Date.now() - new Date(oldest.createdAt).getTime()) / 3_600_000
      : 0,
    kinds: [...new Set(pending.map((c) => c.kind))],
  };
}
