import { describe, expect, it } from "vitest";
import { GateViolationError } from "@arcr/db";
import { assembleAgreement, initiateCeremony, completeRonCeremony } from "@arcr/engagement";
import { LAUNCH_PACKS } from "@arcr/registry";

describe("ARCR-8: Engagement Rail", () => {
  it("ARCR-8.1a: agreement from certified posture only", () => {
    const doc = assembleAgreement(LAUNCH_PACKS["az-maricopa"]);
    expect(doc).toContain("contingency");
  });

  it("ARCR-8.1b: G2 blocks AZ ceremony inside void window", () => {
    expect(() =>
      initiateCeremony({
        state: "AZ",
        saleDate: new Date(),
        conflictResult: "clear",
      }),
    ).toThrow(GateViolationError);
  });

  it("ARCR-8.1b: executed requires AZ notarization", () => {
    expect(() =>
      completeRonCeremony({
        engagement: {
          id: "eng1",
          eventId: "e1",
          claimantPartyId: "p1",
          feePosture: "contingency",
          agreementDocRef: "",
          status: "pending",
        },
        state: "AZ",
        ronEvidenceRef: "ron-1",
        signedAt: new Date(),
      }),
    ).toThrow(/notarization/);
  });
});
