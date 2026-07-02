import { getMondayQueueSummary } from "@arcr/command";
import { callGatewayInference } from "@arcr/rak-bridge";

export interface FunnelCounts {
  events: number;
  survivedKill: number;
  underwritten: number;
  located: number;
  mailed: number;
  inbound: number;
  screened: number;
  signed: number;
  filed: number;
  ordered: number;
  collected: number;
}

export interface CountyMemoSection {
  countyKey: string;
  funnel: FunnelCounts;
  cacPerSignedCents?: number;
  signedFeeInventoryCents: number;
  cashLagWeeks: number;
  escheatRisks: number;
}

export interface WeeklyMemo {
  weekEnding: string;
  sections: CountyMemoSection[];
  mondayQueue: ReturnType<typeof getMondayQueueSummary>;
  platformFeeLineCents: number;
}

export function buildWeeklyMemo(input: {
  sections: CountyMemoSection[];
  meteringSpendCents: number;
  signedCount: number;
}): WeeklyMemo {
  const cac =
    input.signedCount > 0
      ? Math.round(input.meteringSpendCents / input.signedCount)
      : undefined;
  const sections = input.sections.map((s) => ({
    ...s,
    cacPerSignedCents: cac,
  }));
  return {
    weekEnding: new Date().toISOString().slice(0, 10),
    sections,
    mondayQueue: getMondayQueueSummary(),
    platformFeeLineCents: input.signedCount * 500_00,
  };
}

export async function synthesizeMemoNarrative(memo: WeeklyMemo): Promise<string> {
  process.env.ARCR_ALLOW_SIMULATOR = "1";
  const result = await callGatewayInference({
    prompt: JSON.stringify(memo.sections),
    taskType: "arcr-package-synthesis",
    agentTier: "goliath",
    system: "Write honest weekly operator memo. No cash collection promises.",
  });
  return result.content || "Weekly memo generated.";
}

export function buildPnl(input: {
  countyKey: string;
  feesCollectedCents: number;
  dataSpendCents: number;
  mailSpendCents: number;
  aiSpendCents: number;
  platformFeeCents: number;
}) {
  const costs =
    input.dataSpendCents +
    input.mailSpendCents +
    input.aiSpendCents +
    input.platformFeeCents;
  return {
    countyKey: input.countyKey,
    contributionCents: input.feesCollectedCents - costs,
    lines: input,
  };
}
