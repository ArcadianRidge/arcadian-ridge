import { describe, expect, it } from "vitest";
import {
  classifyNoAdvice,
  conflictScreen,
  createIntakeSession,
  handleInboundTurn,
} from "@arcr/intake";

describe("ARCR-7: Intake Front Desk", () => {
  it("ARCR-7.1a: disclosure on first turn", async () => {
    const session = createIntakeSession("tel:abc");
    const { reply } = await handleInboundTurn(session, "Hello");
    expect(reply).toMatch(/AI|Ridgepoint/i);
  });

  it("ARCR-7.1c: junior caller blocked", () => {
    const r = conflictScreen({
      callerRole: "junior",
      eventParties: [{ role: "owner", name: "Jane" }],
    });
    expect(r.result).toBe("blocked");
  });

  it("ARCR-7.2a: no-advice guard fires", () => {
    const g = classifyNoAdvice("What am I entitled to from this?");
    expect(g.blocked).toBe(true);
  });
});
