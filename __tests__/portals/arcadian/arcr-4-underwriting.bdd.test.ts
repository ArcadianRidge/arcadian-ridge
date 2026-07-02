import { describe, expect, it, beforeEach } from "vitest";
import {
  buildLienGraph,
  scoreNetSurplus,
  assertNoProtectedFeatures,
  defaultPropensity,
  resetUnderwritingStore,
} from "@arcr/underwriting";

describe("ARCR-4: Lien Graph and Underwriting", () => {
  beforeEach(() => resetUnderwritingStore());

  it("ARCR-4.1a: AZ HOA propensity ~1.0", () => {
    expect(defaultPropensity("hoa", "AZ")).toBe(1.0);
  });

  it("ARCR-4.2a: grades assigned from net surplus", () => {
    const liens = buildLienGraph([{ kind: "hoa", faceCents: 500_00 }], "AZ");
    const score = scoreNetSurplus({
      eventId: "e1",
      grossCents: 10_000_000,
      liens,
    });
    expect(["A", "B", "C", "D"]).toContain(score.grade);
    expect(score.netToOwnerCents).toBeGreaterThan(0);
  });

  it("ARCR-4.2d: protected features blocked", () => {
    expect(() => assertNoProtectedFeatures({ race: 1 })).toThrow(/Protected feature/);
  });
});
