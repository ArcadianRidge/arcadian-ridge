export type ArcrVerticalId = "arcadian-ridge";

export type ArcrWorkItemStage =
  | "ingested"
  | "prefiltered"
  | "acquired"
  | "underwritten"
  | "located"
  | "outreach"
  | "intake"
  | "engaged"
  | "filed"
  | "collected"
  | "surfaced"
  | "killed";

export type ArcrKillReason =
  | "low-signal"
  | "duplicate"
  | "outside-mandate"
  | "bad-economics"
  | "compliance-block"
  | "insufficient-urgency"
  | "weak-fit"
  | "stale-source"
  | "already-filed"
  | "already-released"
  | "escheat-executed"
  | "below-floor";

export type ArcrLegalUsePolicy =
  | "internal-context"
  | "scoring-only"
  | "outreach-eligible"
  | "human-review-required";

export type ArcrModelLane = "frontier" | "spark-local";

export type ArcrRobotId =
  | "collector"
  | "prefilter"
  | "purchaser"
  | "underwriter"
  | "locator"
  | "outreach"
  | "intake"
  | "engagement"
  | "drafter"
  | "trust";

export type ArcrClawId =
  | "county-treasurer"
  | "county-clerk"
  | "recorder"
  | "docket"
  | "skip-trace"
  | "print-mail"
  | "ron"
  | "pacer";

export interface ArcrVerticalDefinition {
  id: ArcrVerticalId;
  name: string;
  commander: string;
  mission: string;
  survivorLabel: string;
  surfacedAction: string;
  compliancePosture: "attorney-gated" | "mail-only-outreach" | "research-only";
}

export interface ArcrClawDefinition {
  id: ArcrClawId;
  name: string;
  description: string;
  legalUsePolicy: ArcrLegalUsePolicy;
  defaultModelLane: ArcrModelLane;
  metered: boolean;
}

export interface ArcrRobotDefinition {
  id: ArcrRobotId;
  name: string;
  description: string;
  defaultModelLane: ArcrModelLane;
  taskType: string;
  ownsStages: ArcrWorkItemStage[];
}

export interface ArcrEvidenceObservation {
  key: string;
  value: string;
  confidence: number;
}

export interface ArcrEvidenceRecord {
  id: string;
  eventId: string;
  clawId: ArcrClawId;
  source: string;
  retrievedAt: string;
  confidence: number;
  costCents: number;
  legalUsePolicy: ArcrLegalUsePolicy;
  observations: ArcrEvidenceObservation[];
}

export interface ArcrDecisionRecord {
  id: string;
  eventId: string;
  robotId: ArcrRobotId | "commander";
  decidedAt: string;
  fromStage: ArcrWorkItemStage;
  toStage: ArcrWorkItemStage;
  reason: string;
  confidence: number;
  modelLane: ArcrModelLane;
  traceId: string;
  killReason?: ArcrKillReason;
}

export interface ArcrWorkItem {
  id: string;
  eventId: string;
  vertical: ArcrVerticalId;
  title: string;
  jurisdictionId: string;
  stage: ArcrWorkItemStage;
  score: number;
  grade?: "A" | "B" | "C" | "D";
  confidence: number;
  grossCents: number;
  netToOwnerCents?: number;
  urgency: "low" | "medium" | "high" | "critical";
  currentRobot?: ArcrRobotId;
  nextAction: string;
  reasonToBelieve: string;
  createdAt: string;
  updatedAt: string;
  killedAt?: string;
  killReason?: ArcrKillReason;
  killExplanation?: string;
  evidenceIds: string[];
  decisionIds: string[];
}

export interface ArcrPipelineColumn {
  stage: ArcrWorkItemStage;
  label: string;
  description: string;
  items: ArcrWorkItem[];
}

export interface ArcrTaskContract {
  taskType: string;
  defaultTier: "micro" | "base" | "goliath" | "titan";
  expertisePrompt: string;
  outputFormat: "json" | "markdown";
}
