import { ARCR_VERTICAL, ARCR_PIPELINE_STAGES } from "./registry.js";
import type { ArcrWorkItem } from "./types.js";

export const demoWorkItems: ArcrWorkItem[] = [
  {
    id: "wi-1",
    eventId: "ev-1",
    vertical: "arcadian-ridge",
    title: "Maricopa backlog — $52k surplus",
    jurisdictionId: "az-maricopa",
    stage: "underwritten",
    score: 84,
    grade: "B",
    confidence: 0.78,
    grossCents: 5_200_000,
    netToOwnerCents: 4_100_000,
    urgency: "high",
    currentRobot: "underwriter",
    nextAction: "Run locator waterfall",
    reasonToBelieve: "Past void window; HOA junior only",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    evidenceIds: [],
    decisionIds: [],
  },
  {
    id: "wi-2",
    eventId: "ev-2",
    vertical: "arcadian-ridge",
    title: "King County — motion candidate",
    jurisdictionId: "wa-king",
    stage: "surfaced",
    score: 91,
    grade: "A",
    confidence: 0.85,
    grossCents: 3_800_000,
    urgency: "critical",
    nextAction: "Attorney sign filing (G3)",
    reasonToBelieve: "Uncontested; 20-day clock ready",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    evidenceIds: [],
    decisionIds: [],
  },
];

export function getDemoPipelineMeta() {
  return { vertical: ARCR_VERTICAL, pipeline: ARCR_PIPELINE_STAGES, workItems: demoWorkItems };
}
