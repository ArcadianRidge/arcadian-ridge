import { describe, expect, it, beforeEach } from "vitest";
import {
  draftPack,
  certifyPack,
  assertCountyDispatchAllowed,
  seedLaunchPacks,
  validateRulePack,
  resetRegistryStore,
  LAUNCH_PACKS,
} from "@arcr/registry";

describe("ARCR-1: Jurisdiction Rules Registry", () => {
  beforeEach(() => resetRegistryStore());

  it("ARCR-1.1a: invalid packs cannot save", () => {
    expect(() => validateRulePack({ state: "AZ" })).toThrow();
  });

  it("ARCR-1.1b: uncertified county blocks dispatch stages 6-10", () => {
    seedLaunchPacks();
    expect(() => assertCountyDispatchAllowed("az-maricopa")).toThrow(/not certified/);
    certifyPack("az-maricopa", "operator");
    expect(() => assertCountyDispatchAllowed("az-maricopa")).not.toThrow();
  });

  it("ARCR-1.2a: launch packs drafted for 10 counties", () => {
    const packs = seedLaunchPacks();
    expect(packs).toHaveLength(10);
    expect(LAUNCH_PACKS["wa-king"].claimMechanics).toBe("motion");
  });

  it("ARCR-1.2b: AZ packs encode cooling-off and notarization", () => {
    const az = LAUNCH_PACKS["az-maricopa"];
    expect(az.coolingOffDays).toBe(30);
    expect(az.notarizationRequired).toBe(true);
    expect(az.statutePins.feeCap).toContain("2,500");
  });

  it("ARCR-1.2c: WA packs encode 20-day notice", () => {
    const wa = LAUNCH_PACKS["wa-king"];
    expect(wa.noticeRecipe.minNoticeDays).toBe(20);
    expect(wa.feePosture.defaultPosture).toBe("flat");
  });
});
