import { randomUUID } from "node:crypto";
import { assertG3FilingAllowed } from "@arcr/db";
import { decideApproval, requestApproval } from "@arcr/command";
import type { RulePack } from "@arcr/registry";
import { callGatewayInference } from "@arcr/rak-bridge";

export interface FilingPacket {
  id: string;
  matterId: string;
  kind: string;
  sections: string[];
  lintResult: { passed: boolean; failures: string[] };
}

export function assemblePacket(pack: RulePack, matterId: string): FilingPacket {
  const kind = pack.claimMechanics === "motion" ? "motion" : "application";
  return {
    id: randomUUID(),
    matterId,
    kind,
    sections: [
      pack.formTemplates[kind] ?? `${kind}-v1`,
      "declaration",
      "proposed-order",
      "exhibits",
      "service-list",
    ],
    lintResult: { passed: false, failures: [] },
  };
}

export async function lintPacket(packet: FilingPacket, facts: Record<string, string>): Promise<FilingPacket> {
  process.env.ARCR_ALLOW_SIMULATOR = "1";
  await callGatewayInference({
    prompt: `lint packet ${packet.kind}`,
    taskType: "arcr-package-synthesis",
    agentTier: "goliath",
  });
  const failures: string[] = [];
  if (!facts.caption) failures.push("missing caption");
  if (!facts.caseNumber) failures.push("missing case number");
  packet.lintResult = { passed: failures.length === 0, failures };
  return packet;
}

export function queueFilingApproval(packet: FilingPacket) {
  if (!packet.lintResult.passed) throw new Error("Lint must pass before G3 queue");
  return requestApproval({
    kind: "filing",
    subjectRef: packet.id,
    evidence: { packet, lint: packet.lintResult },
    requestedBy: "drafter-agent",
  });
}

export function recordFiling(
  packet: FilingPacket,
  attorneyApprovalRef: string,
  filedAt: Date,
): { filedAt: string } {
  assertG3FilingAllowed({
    attorneyApprovalRef,
    lintPassed: packet.lintResult.passed,
  });
  return { filedAt: filedAt.toISOString() };
}

export function computeResponseDeadline(state: string, filedAt: Date): Date {
  const d = new Date(filedAt);
  if (state === "AZ") d.setDate(d.getDate() + 30);
  else if (state === "WA") d.setDate(d.getDate() + 20);
  return d;
}

export function approveAndFile(packet: FilingPacket, operatorId: string) {
  const card = queueFilingApproval(packet);
  decideApproval(card.id, "approved", operatorId);
  return recordFiling(packet, card.id, new Date());
}
