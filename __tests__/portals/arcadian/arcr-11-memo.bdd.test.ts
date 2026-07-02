import { describe, expect, it } from "vitest";
import { buildWeeklyMemo, buildPnl } from "@arcr/memo";
import { requestApproval } from "@arcr/command";

describe("ARCR-11: Memo and P&L", () => {
  it("ARCR-11.1a: weekly memo includes funnel sections", () => {
    const memo = buildWeeklyMemo({
      sections: [
        {
          countyKey: "az-maricopa",
          funnel: {
            events: 100,
            survivedKill: 60,
            underwritten: 50,
            located: 40,
            mailed: 200,
            inbound: 10,
            screened: 8,
            signed: 2,
            filed: 1,
            ordered: 0,
            collected: 0,
          },
          signedFeeInventoryCents: 25_000_00,
          cashLagWeeks: 10,
          escheatRisks: 3,
        },
      ],
      meteringSpendCents: 80_000,
      signedCount: 2,
    });
    expect(memo.sections[0].cacPerSignedCents).toBe(40_000);
    expect(memo.platformFeeLineCents).toBe(1000_00);
  });

  it("ARCR-11.1b: confirm-first lands in monday queue", () => {
    requestApproval({
      kind: "filing",
      subjectRef: "f1",
      evidence: {},
      requestedBy: "agent",
    });
    const memo = buildWeeklyMemo({ sections: [], meteringSpendCents: 0, signedCount: 0 });
    expect(memo.mondayQueue.pendingCount).toBeGreaterThan(0);
  });

  it("ARCR-11.1c: P&L includes platform fee line", () => {
    const pnl = buildPnl({
      countyKey: "az-maricopa",
      feesCollectedCents: 20_000_00,
      dataSpendCents: 500_00,
      mailSpendCents: 300_00,
      aiSpendCents: 200_00,
      platformFeeCents: 500_00,
    });
    expect(pnl.contributionCents).toBeLessThan(20_000_00);
  });
});
