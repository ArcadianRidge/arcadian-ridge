import { describe, expect, it, beforeEach } from "vitest";
import {
  prefilterEvent,
  purchaseDocument,
  planStrategicPurchase,
  resetAcquisitionStore,
} from "@arcr/acquisition";
import { resetApprovalQueue } from "@arcr/command";
import type { NormalizedSurplusEvent } from "@arcr/collectors";

const baseEvent: NormalizedSurplusEvent = {
  id: "e1",
  jurisdictionKey: "az-maricopa",
  source: "county-treasurer",
  stream: "backlog",
  grossCents: 5_000_000,
  status: "active",
  stage: "ingested",
  traceId: "t1",
};

describe("ARCR-3: Pre-Filter and Acquisition", () => {
  beforeEach(() => {
    resetAcquisitionStore();
    resetApprovalQueue();
  });

  it("ARCR-3.1a: kills already-filed cases", () => {
    const r = prefilterEvent(baseEvent, { docketStatus: "owner-application-filed" });
    expect(r.survived).toBe(false);
    expect(r.killedReason).toBe("already-filed");
  });

  it("ARCR-3.1b: junior-only does not kill", () => {
    const r = prefilterEvent(baseEvent, { docketStatus: "junior-only-application" });
    expect(r.survived).toBe(true);
    expect(r.juniorOnlyApplication).toBe(true);
  });

  it("ARCR-3.2a: AZ purchase plan is deposit complaint", () => {
    expect(planStrategicPurchase("AZ")).toBe("deposit-complaint");
  });

  it("ARCR-3.2c: over-envelope triggers confirm-first", () => {
    const r = purchaseDocument({
      eventId: "e1",
      kind: "deposit-complaint",
      content: "doc",
      costCents: 10_000,
      currentMonthlySpendCents: 49_500,
      envelopeCents: 50_000,
    });
    expect("confirmFirst" in r && r.confirmFirst).toBe(true);
  });
});
