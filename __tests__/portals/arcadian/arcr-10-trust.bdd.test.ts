import { describe, expect, it, beforeEach } from "vitest";
import { GateViolationError } from "@arcr/db";
import { resetApprovalQueue, decideApproval } from "@arcr/command";
import {
  postDeposit,
  generateStatement,
  executeDisbursement,
  resetTrustLedger,
  queueDisbursement,
} from "@arcr/trust";

describe("ARCR-10: Trust and Treasury", () => {
  beforeEach(() => {
    resetTrustLedger();
    resetApprovalQueue();
  });

  it("ARCR-10.1a: deposit posts with orderRef", () => {
    const d = postDeposit({ matterId: "m1", amountCents: 50_000_00, orderRef: "order-1" });
    expect(d.direction).toBe("in");
    expect(d.orderRef).toBe("order-1");
  });

  it("ARCR-10.1b: statement math is record", () => {
    const stmt = generateStatement({
      matterId: "m1",
      grossCents: 50_000_00,
      feeCents: 12_500_00,
      costsCents: 500_00,
    });
    expect(stmt.netToClientCents).toBe(37_000_00);
  });

  it("ARCR-10.2a: G4 blocks disbursement without approval", () => {
    const stmt = generateStatement({
      matterId: "m1",
      grossCents: 50_000_00,
      feeCents: 12_500_00,
      costsCents: 500_00,
    });
    expect(() =>
      executeDisbursement(
        {
          matterId: "m1",
          kind: "client-disbursement",
          amountCents: 37_000_00,
          orderRef: "order-1",
          statement: stmt,
          depositCleared: true,
        },
        "",
      ),
    ).toThrow(GateViolationError);
  });

  it("ARCR-10.2a: approved disbursement posts", () => {
    postDeposit({ matterId: "m1", amountCents: 50_000_00, orderRef: "order-1" });
    const stmt = generateStatement({
      matterId: "m1",
      grossCents: 50_000_00,
      feeCents: 12_500_00,
      costsCents: 500_00,
    });
    const card = queueDisbursement({
      matterId: "m1",
      kind: "client-disbursement",
      amountCents: 37_000_00,
      orderRef: "order-1",
      statement: stmt,
      depositCleared: true,
    });
    decideApproval(card.id, "approved", "preston");
    const entry = executeDisbursement(
      {
        matterId: "m1",
        kind: "client-disbursement",
        amountCents: 37_000_00,
        orderRef: "order-1",
        statement: stmt,
        depositCleared: true,
      },
      card.id,
    );
    expect(entry.approvalRef).toBe(card.id);
  });
});
