import { randomUUID } from "node:crypto";
import { assertG1ConflictClear, assertG2EngagementExecutable } from "@arcr/db";
import type { RulePack } from "@arcr/registry";

export interface EngagementRecord {
  id: string;
  eventId: string;
  claimantPartyId: string;
  feePosture: string;
  agreementDocRef: string;
  status: string;
  notarizedAt?: string;
  signedAt?: string;
  matterId?: string;
}

export function assembleAgreement(pack: RulePack): string {
  const posture = pack.feePosture.defaultPosture;
  return `FEE AGREEMENT — ${pack.state} ${pack.county}\nPosture: ${posture}\nBounds: certified template only`;
}

export function initiateCeremony(input: {
  state: string;
  saleDate?: Date;
  conflictResult: string;
  communityPropertyDetermination?: string;
  communityPropertyFlag?: boolean;
  now?: Date;
}): void {
  assertG1ConflictClear({ conflictResult: input.conflictResult });
  if (input.communityPropertyFlag && !input.communityPropertyDetermination) {
    throw new Error("Community-property flag requires operator determination before ceremony");
  }
  assertG2EngagementExecutable({
    state: input.state,
    saleDate: input.saleDate,
    now: input.now,
  });
}

export function completeRonCeremony(input: {
  engagement: EngagementRecord;
  state: string;
  ronEvidenceRef: string;
  signedAt: Date;
  notarizedAt?: Date;
}): EngagementRecord {
  if (input.state === "AZ" && !input.notarizedAt) {
    throw new Error("AZ requires notarization evidence");
  }
  return {
    ...input.engagement,
    status: "executed",
    signedAt: input.signedAt.toISOString(),
    notarizedAt: input.notarizedAt?.toISOString(),
    agreementDocRef: input.ronEvidenceRef,
  };
}

export function openMatter(engagement: EngagementRecord, attorney: string) {
  return {
    id: randomUUID(),
    engagementId: engagement.id,
    eventId: engagement.eventId,
    attorney,
    stage: "open",
    openedAt: new Date().toISOString(),
  };
}
