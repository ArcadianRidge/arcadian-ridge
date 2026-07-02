import { describe, expect, it, beforeEach } from "vitest";
import {
  registerTemplate,
  certifyTemplate,
  proposeSend,
  runSuppressionPass,
  resetOutreachStore,
  throwKillSwitch,
} from "@arcr/outreach";

describe("ARCR-6: Outreach Desk", () => {
  beforeEach(() => resetOutreachStore());

  it("ARCR-6.1a: uncertified template blocks send", () => {
    registerTemplate({
      id: "t1",
      state: "AZ",
      version: "v1",
      certified: false,
      markings: ["ADVERTISING MATERIAL"],
      body: "ADVERTISING MATERIAL",
    });
    const r = proposeSend({
      eventId: "e1",
      partyId: "p1",
      state: "AZ",
      templateVersion: "v1",
      countyKey: "az-maricopa",
      mailEnvelopeCount: 500,
      flags: {},
    });
    expect("blocked" in r).toBe(true);
  });

  it("ARCR-6.1b: suppression hard-fails deceased", () => {
    const s = runSuppressionPass({ deceased: true });
    expect(s.passed).toBe(false);
  });

  it("ARCR-6.1c: attribution ref on send", () => {
    registerTemplate({
      id: "t1",
      state: "AZ",
      version: "v1",
      certified: true,
      markings: ["ADVERTISING MATERIAL"],
      body: "ADVERTISING MATERIAL",
    });
    certifyTemplate("AZ", "v1");
    const r = proposeSend({
      eventId: "e1",
      partyId: "p1",
      state: "AZ",
      templateVersion: "v1",
      countyKey: "az-maricopa",
      mailEnvelopeCount: 500,
      flags: {},
    });
    expect("attributionRef" in r).toBe(true);
  });

  it("ARCR-6.2c: kill switch pauses sends", () => {
    throwKillSwitch(true);
    registerTemplate({
      id: "t1",
      state: "AZ",
      version: "v1",
      certified: true,
      markings: ["ADVERTISING MATERIAL"],
      body: "ADVERTISING MATERIAL",
    });
    const r = proposeSend({
      eventId: "e1",
      partyId: "p1",
      state: "AZ",
      templateVersion: "v1",
      countyKey: "az-maricopa",
      mailEnvelopeCount: 500,
      flags: {},
    });
    expect(r).toEqual({ blocked: "kill-switch" });
    throwKillSwitch(false);
  });
});
