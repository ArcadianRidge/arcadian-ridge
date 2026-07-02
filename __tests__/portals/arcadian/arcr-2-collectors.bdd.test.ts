import { describe, expect, it, beforeEach } from "vitest";
import {
  createSimulatorCollector,
  detectStreamB,
  detectDrift,
  resetCollectorStore,
  setupVoidWindowWatch,
} from "@arcr/collectors";

describe("ARCR-2: County Collectors", () => {
  beforeEach(() => resetCollectorStore());

  it("ARCR-2.1a: backlog collector normalizes rows", async () => {
    const collector = createSimulatorCollector("az-maricopa", [
      { courtCaseNo: "CV2024-001", grossCents: 5_000_000, depositDate: "2024-01-15", stream: "backlog" },
    ]);
    const result = await collector.pull();
    expect(result.events).toHaveLength(1);
    expect(result.events[0].stream).toBe("backlog");
    expect(result.events[0].escheatAt).toBeDefined();
  });

  it("ARCR-2.1c: drift quarantines run", () => {
    detectDrift("az-maricopa", 100);
    expect(detectDrift("az-maricopa", 40)).toBe(true);
  });

  it("ARCR-2.2a: Stream B positive delta flags surplus", () => {
    const r = detectStreamB({ considerationCents: 400_000_00, debtCents: 300_000_00 });
    expect(r.surplus).toBe(true);
    expect(r.deltaCents).toBe(100_000_00);
  });

  it("ARCR-2.2b: AZ void window date computed", () => {
    const { voidEndsAt } = setupVoidWindowWatch("2026-01-01");
    expect(new Date(voidEndsAt).getDate()).toBeGreaterThan(1);
  });
});
