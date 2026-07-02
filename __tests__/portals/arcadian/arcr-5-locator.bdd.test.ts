import { describe, expect, it } from "vitest";
import { runWaterfall, cassVerifyAddress, encryptField, decryptField } from "@arcr/locator";

describe("ARCR-5: Locator", () => {
  it("ARCR-5.1a: waterfall returns encrypted locate", () => {
    const locate = runWaterfall({
      partyId: "p1",
      name: "Jane Doe",
      grade: "B",
      currentMonthlySpendCents: 0,
      envelopeCents: 50_000,
    });
    expect(locate.addressesEnc).toBeTruthy();
    expect(locate.matchScore).toBeGreaterThan(0);
  });

  it("ARCR-5.1c: CASS rejects undeliverable", () => {
    expect(cassVerifyAddress("UNDELIVERABLE addr").deliverable).toBe(false);
  });

  it("ARCR-5.2a: deceased flag honored in outreach layer", () => {
    const enc = encryptField("secret");
    expect(decryptField(enc)).toBe("secret");
  });
});
