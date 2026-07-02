import { randomUUID } from "node:crypto";
import { assertG1ConflictClear } from "@arcr/db";
import { callGatewayInference } from "@arcr/rak-bridge";

const ADVICE_PATTERNS =
  /\b(should i|what am i entitled|do i have to|can i sue|legal advice)\b/i;

export function classifyNoAdvice(userText: string): {
  blocked: boolean;
  response?: string;
} {
  if (ADVICE_PATTERNS.test(userText)) {
    return {
      blocked: true,
      response:
        "I cannot provide legal advice. I can explain the process and offer to book a call with the attorney.",
    };
  }
  return { blocked: false };
}

export interface ConflictScreenInput {
  callerRole: string;
  eventParties: Array<{ role: string; name: string }>;
}

export function conflictScreen(input: ConflictScreenInput): {
  result: "clear" | "blocked" | "waivable";
  reason: string;
} {
  const ownerParty = input.eventParties.find((p) => p.role === "owner");
  if (input.callerRole === "junior" && ownerParty) {
    return { result: "blocked", reason: "caller is junior on owner-targeted event" };
  }
  if (input.callerRole === "owner") {
    return { result: "clear", reason: "owner representation" };
  }
  return { result: "clear", reason: "no adversity detected" };
}

export interface IntakeSession {
  id: string;
  attributionRef?: string;
  eventId?: string;
  disclosurePlayed: boolean;
  conflictResult?: string;
  outcome?: string;
  transcript: string[];
}

export async function handleInboundTurn(
  session: IntakeSession,
  userText: string,
): Promise<{ session: IntakeSession; reply: string; escalate?: boolean }> {
  const guard = classifyNoAdvice(userText);
  if (guard.blocked) {
    return { session, reply: guard.response! };
  }
  if (/distress|hostile|confused/i.test(userText)) {
    return {
      session: { ...session, outcome: "escalated" },
      reply: "Connecting you with the attorney team.",
      escalate: true,
    };
  }
  process.env.ARCR_ALLOW_SIMULATOR = "1";
  await callGatewayInference({
    prompt: userText,
    taskType: "arcr-outreach-review",
    agentTier: "micro",
    system: "Arcadian Ridge intake. No legal advice. Disclose AI first.",
  });
  const reply = session.disclosurePlayed
    ? "Thank you. Let me verify a few facts about your property."
    : "This call may be handled by AI. Ridgepoint Group, LLC.";
  return {
    session: {
      ...session,
      disclosurePlayed: true,
      transcript: [...session.transcript, userText],
    },
    reply,
  };
}

export function createIntakeSession(attributionRef?: string): IntakeSession {
  return {
    id: randomUUID(),
    attributionRef,
    disclosurePlayed: false,
    transcript: [],
  };
}

export function finalizeIntakeForEngagement(session: IntakeSession): void {
  assertG1ConflictClear({ conflictResult: session.conflictResult });
}
