import { randomUUID } from "node:crypto";
import { assertG4DisbursementAllowed } from "@arcr/db";
import { decideApproval, requestApproval } from "@arcr/command";

export interface TrustEntry {
  id: string;
  matterId: string;
  direction: "in" | "out";
  kind: string;
  amountCents: number;
  orderRef?: string;
  statementRef?: string;
  clearedAt?: string;
  approvalRef?: string;
}

export interface SettlementStatement {
  id: string;
  matterId: string;
  grossCents: number;
  feeCents: number;
  costsCents: number;
  netToClientCents: number;
}

const ledger: TrustEntry[] = [];
let reconciled = true;

export function postDeposit(input: {
  matterId: string;
  amountCents: number;
  orderRef: string;
}): TrustEntry {
  const entry: TrustEntry = {
    id: randomUUID(),
    matterId: input.matterId,
    direction: "in",
    kind: "deposit",
    amountCents: input.amountCents,
    orderRef: input.orderRef,
    clearedAt: new Date().toISOString(),
  };
  ledger.push(entry);
  return entry;
}

export function generateStatement(input: {
  matterId: string;
  grossCents: number;
  feeCents: number;
  costsCents: number;
}): SettlementStatement {
  return {
    id: randomUUID(),
    matterId: input.matterId,
    grossCents: input.grossCents,
    feeCents: input.feeCents,
    costsCents: input.costsCents,
    netToClientCents: input.grossCents - input.feeCents - input.costsCents,
  };
}

export function queueDisbursement(input: {
  matterId: string;
  kind: "client-disbursement" | "fee-transfer";
  amountCents: number;
  orderRef: string;
  statement: SettlementStatement;
  depositCleared: boolean;
}) {
  const card = requestApproval({
    kind: "disbursement",
    subjectRef: input.matterId,
    evidence: input,
    requestedBy: "trust-agent",
  });
  return card;
}

export function executeDisbursement(
  input: {
    matterId: string;
    kind: "client-disbursement" | "fee-transfer";
    amountCents: number;
    orderRef: string;
    statement: SettlementStatement;
    depositCleared: boolean;
  },
  approvalRef: string,
): TrustEntry {
  const feeWithinStatement =
    input.kind !== "fee-transfer" || input.amountCents <= input.statement.feeCents;
  assertG4DisbursementAllowed({
    direction: "out",
    kind: input.kind,
    orderRef: input.orderRef,
    clearedAt: new Date(),
    approvalRef,
    depositCleared: input.depositCleared,
    feeWithinStatement,
  });
  if (!reconciled) throw new Error("Unreconciled month blocks fee transfers");
  const entry: TrustEntry = {
    id: randomUUID(),
    matterId: input.matterId,
    direction: "out",
    kind: input.kind,
    amountCents: input.amountCents,
    orderRef: input.orderRef,
    statementRef: input.statement.id,
    clearedAt: new Date().toISOString(),
    approvalRef,
  };
  ledger.push(entry);
  return entry;
}

export function runThreeWayReconciliation(): { balanced: boolean; exceptions: string[] } {
  const exceptions: string[] = [];
  const inSum = ledger.filter((e) => e.direction === "in").reduce((s, e) => s + e.amountCents, 0);
  const outSum = ledger.filter((e) => e.direction === "out").reduce((s, e) => s + e.amountCents, 0);
  if (inSum < outSum) exceptions.push("ledger exceeds deposits");
  reconciled = exceptions.length === 0;
  return { balanced: reconciled, exceptions };
}

export function resetTrustLedger(): void {
  ledger.length = 0;
  reconciled = true;
}

export function getLedger(): TrustEntry[] {
  return [...ledger];
}
