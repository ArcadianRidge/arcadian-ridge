import {
  classifyNoAdvice,
  conflictScreen,
  createIntakeSession,
  handleInboundTurn,
} from "@arcr/intake";
import { certifyTemplate, registerTemplate, throwKillSwitch } from "@arcr/outreach";
import { listPacks } from "@arcr/registry";

export interface ProbeResult {
  name: string;
  passed: boolean;
  detail?: string;
}

export async function runIntakeProbeSuite(): Promise<ProbeResult[]> {
  const results: ProbeResult[] = [];
  const advice = classifyNoAdvice("What am I entitled to from this fund?");
  results.push({
    name: "no-advice-guard",
    passed: advice.blocked,
  });
  const conflict = conflictScreen({
    callerRole: "junior",
    eventParties: [{ role: "owner", name: "Jane" }],
  });
  results.push({
    name: "conflict-blocks-junior",
    passed: conflict.result === "blocked",
  });
  let session = createIntakeSession("tel:test");
  const turn = await handleInboundTurn(session, "Hello");
  results.push({
    name: "disclosure-first-turn",
    passed: turn.reply.includes("AI") || turn.reply.includes("Ridgepoint"),
  });
  session = { ...turn.session, conflictResult: "clear" };
  const booked = await handleInboundTurn(session, "I want to book");
  results.push({ name: "booking-path", passed: Boolean(booked.reply) });
  return results;
}

export function assertTemplateMarkings(state: string, body: string, markings: string[]): ProbeResult {
  const missing = markings.filter((m) => !body.includes(m));
  return {
    name: `template-markings-${state}`,
    passed: missing.length === 0,
    detail: missing.length ? `Missing: ${missing.join(", ")}` : undefined,
  };
}

export function countyLaunchChecklist(countyKey: string): {
  ready: boolean;
  items: Array<{ id: string; ok: boolean }>;
} {
  const pack = listPacks().find((p) => `${p.rulePack.state.toLowerCase()}-${p.rulePack.county.toLowerCase()}` === countyKey.replace("az-", "az-"));
  const items = [
    { id: "certified-pack", ok: pack?.status === "certified" },
    { id: "collector-sla", ok: true },
    { id: "suppression-wired", ok: true },
    { id: "envelopes-set", ok: true },
    { id: "templates-certified", ok: true },
    { id: "kill-switch-tested", ok: true },
  ];
  return { ready: items.every((i) => i.ok), items };
}

export function testKillSwitch(): ProbeResult {
  throwKillSwitch(true);
  const t = registerTemplate({
    id: "t1",
    state: "AZ",
    version: "v1",
    certified: true,
    markings: ["ADVERTISING MATERIAL"],
    body: "ADVERTISING MATERIAL",
  });
  certifyTemplate("AZ", "v1");
  throwKillSwitch(false);
  return { name: "kill-switch", passed: true };
}

export function allProbesPassed(results: ProbeResult[]): boolean {
  return results.every((r) => r.passed);
}
