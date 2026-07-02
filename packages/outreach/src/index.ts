import { randomUUID } from "node:crypto";
import { assertWithinMailEnvelope } from "@arcr/command";
import type { LocateFlags } from "@arcr/locator";

export interface LetterTemplate {
  id: string;
  state: string;
  version: string;
  certified: boolean;
  markings: string[];
  body: string;
}

export interface SuppressionContext {
  deceased?: boolean;
  activeBK?: boolean;
  counselOfRecord?: boolean;
  doNotContact?: boolean;
  unverifiedAddress?: boolean;
  azVoidWindowActive?: boolean;
  signatureSoliciting?: boolean;
}

export interface OutreachSend {
  id: string;
  eventId: string;
  partyId: string;
  templateVersion: string;
  attributionRef: string;
  touchN: number;
  status: string;
  suppressionChecks: Record<string, boolean>;
}

const templates = new Map<string, LetterTemplate>();
let mailCountByCounty = new Map<string, number>();
let killSwitch = false;

export function registerTemplate(t: LetterTemplate): LetterTemplate {
  templates.set(`${t.state}:${t.version}`, t);
  return t;
}

export function certifyTemplate(state: string, version: string): LetterTemplate {
  const t = templates.get(`${state}:${version}`);
  if (!t) throw new Error("Template not found");
  t.certified = true;
  return t;
}

export function runSuppressionPass(ctx: SuppressionContext): {
  passed: boolean;
  checks: Record<string, boolean>;
  blockedReason?: string;
} {
  const checks = {
    notDeceased: !ctx.deceased,
    notActiveBK: !ctx.activeBK,
    notCounselOfRecord: !ctx.counselOfRecord,
    notDnc: !ctx.doNotContact,
    addressVerified: !ctx.unverifiedAddress,
    azVoidCompliant: !(ctx.azVoidWindowActive && ctx.signatureSoliciting),
  };
  const passed = Object.values(checks).every(Boolean);
  let blockedReason: string | undefined;
  if (!checks.notDeceased) blockedReason = "deceased";
  else if (!checks.notActiveBK) blockedReason = "activeBK";
  else if (!checks.azVoidCompliant) blockedReason = "az-void-window";
  return { passed, checks, blockedReason };
}

export function proposeSend(input: {
  eventId: string;
  partyId: string;
  state: string;
  templateVersion: string;
  countyKey: string;
  mailEnvelopeCount: number;
  flags: LocateFlags & SuppressionContext;
  touchN?: number;
}): OutreachSend | { blocked: string } {
  if (killSwitch) return { blocked: "kill-switch" };
  const template = templates.get(`${input.state}:${input.templateVersion}`);
  if (!template?.certified) return { blocked: "template-not-certified" };
  const suppression = runSuppressionPass(input.flags);
  if (!suppression.passed) return { blocked: suppression.blockedReason ?? "suppression" };
  const current = mailCountByCounty.get(input.countyKey) ?? 0;
  try {
    assertWithinMailEnvelope({
      currentMonthlyCount: current,
      deltaCount: 1,
      envelopeCount: input.mailEnvelopeCount,
    });
  } catch {
    return { blocked: "mail-envelope" };
  }
  mailCountByCounty.set(input.countyKey, current + 1);
  const attributionRef = `tel:${randomUUID().slice(0, 8)}`;
  return {
    id: randomUUID(),
    eventId: input.eventId,
    partyId: input.partyId,
    templateVersion: input.templateVersion,
    attributionRef,
    touchN: input.touchN ?? 1,
    status: "posted",
    suppressionChecks: suppression.checks,
  };
}

export function throwKillSwitch(active: boolean): void {
  killSwitch = active;
}

export function resetOutreachStore(): void {
  templates.clear();
  mailCountByCounty = new Map();
  killSwitch = false;
}
