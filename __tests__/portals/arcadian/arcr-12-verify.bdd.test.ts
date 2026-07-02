import { describe, expect, it } from "vitest";
import {
  runIntakeProbeSuite,
  assertTemplateMarkings,
  testKillSwitch,
  allProbesPassed,
} from "@arcr/verify";

describe("ARCR-12: Verification and Launch Discipline", () => {
  it("ARCR-12.1a: intake probe suite passes", async () => {
    const results = await runIntakeProbeSuite();
    expect(allProbesPassed(results)).toBe(true);
  });

  it("ARCR-12.1b: missing marking fails render check", () => {
    const r = assertTemplateMarkings("AZ", "Hello", ["ADVERTISING MATERIAL"]);
    expect(r.passed).toBe(false);
  });

  it("ARCR-12.1d: kill switch test passes", () => {
    expect(testKillSwitch().passed).toBe(true);
  });
});
