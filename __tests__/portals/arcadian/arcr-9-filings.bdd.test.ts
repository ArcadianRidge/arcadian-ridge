import { describe, expect, it, beforeEach } from "vitest";
import { GateViolationError } from "@arcr/db";
import { resetApprovalQueue } from "@arcr/command";
import { assemblePacket, lintPacket, approveAndFile } from "@arcr/filings";
import { LAUNCH_PACKS } from "@arcr/registry";

describe("ARCR-9: Filing Factory", () => {
  beforeEach(() => resetApprovalQueue());

  it("ARCR-9.1a: AZ assembles application packet", () => {
    const packet = assemblePacket(LAUNCH_PACKS["az-maricopa"], "m1");
    expect(packet.kind).toBe("application");
    expect(packet.sections.length).toBeGreaterThan(3);
  });

  it("ARCR-9.1c: lint blocks incomplete packets", async () => {
    const packet = assemblePacket(LAUNCH_PACKS["wa-king"], "m1");
    const linted = await lintPacket(packet, {});
    expect(linted.lintResult.passed).toBe(false);
  });

  it("ARCR-9.2a: G3 blocks filing without approval", async () => {
    const packet = assemblePacket(LAUNCH_PACKS["az-maricopa"], "m1");
    await lintPacket(packet, { caption: "X", caseNumber: "Y" });
    expect(() => approveAndFile({ ...packet, lintResult: { passed: false, failures: ["x"] } }, "op")).toThrow();
  });

  it("ARCR-9.2b: approved filing records filedAt", async () => {
    const packet = assemblePacket(LAUNCH_PACKS["az-maricopa"], "m1");
    await lintPacket(packet, { caption: "X", caseNumber: "Y" });
    const filed = approveAndFile(packet, "preston");
    expect(filed.filedAt).toBeTruthy();
  });
});
