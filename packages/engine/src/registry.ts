import type {
  ArcrClawDefinition,
  ArcrRobotDefinition,
  ArcrVerticalDefinition,
  ArcrWorkItemStage,
} from "./types.js";

export const ARCR_VERTICAL: ArcrVerticalDefinition = {
  id: "arcadian-ridge",
  name: "Arcadian Ridge",
  commander: "ArcadianCommander",
  mission:
    "Deed-of-trust surplus recovery: find funds, locate claimants, convert via mail-only outreach, file under attorney gates.",
  survivorLabel: "Signed-fee inventory queue",
  surfacedAction: "Attorney review filing or disbursement",
  compliancePosture: "attorney-gated",
};

export const ARCR_CLAWS: ArcrClawDefinition[] = [
  {
    id: "county-treasurer",
    name: "County treasurer",
    description: "AZ excess-proceeds deposit lists.",
    legalUsePolicy: "scoring-only",
    defaultModelLane: "spark-local",
    metered: true,
  },
  {
    id: "county-clerk",
    name: "County clerk",
    description: "WA surplus registry indexes.",
    legalUsePolicy: "scoring-only",
    defaultModelLane: "spark-local",
    metered: true,
  },
  {
    id: "recorder",
    name: "Recorder",
    description: "Trustee deeds and NOTS for Stream B detection.",
    legalUsePolicy: "scoring-only",
    defaultModelLane: "spark-local",
    metered: true,
  },
  {
    id: "docket",
    name: "Docket",
    description: "Court docket status and competing applications.",
    legalUsePolicy: "internal-context",
    defaultModelLane: "spark-local",
    metered: true,
  },
  {
    id: "skip-trace",
    name: "Skip trace",
    description: "FCRA/GLBA identity resolution on DGX.",
    legalUsePolicy: "human-review-required",
    defaultModelLane: "spark-local",
    metered: true,
  },
  {
    id: "print-mail",
    name: "Print and mail",
    description: "Solicitation and statutory notice mailings.",
    legalUsePolicy: "outreach-eligible",
    defaultModelLane: "spark-local",
    metered: true,
  },
  {
    id: "ron",
    name: "Remote notarization",
    description: "AZ notarized engagement ceremonies.",
    legalUsePolicy: "human-review-required",
    defaultModelLane: "spark-local",
    metered: true,
  },
  {
    id: "pacer",
    name: "PACER / RECAP",
    description: "Bankruptcy screen for active cases.",
    legalUsePolicy: "scoring-only",
    defaultModelLane: "spark-local",
    metered: true,
  },
];

export const ARCR_ROBOTS: ArcrRobotDefinition[] = [
  {
    id: "collector",
    name: "CollectorRobot",
    description: "Ingests county sources into surplus events.",
    defaultModelLane: "spark-local",
    taskType: "arcr-claw-extract",
    ownsStages: ["ingested"],
  },
  {
    id: "prefilter",
    name: "PrefilterRobot",
    description: "Free docket kill pass before document spend.",
    defaultModelLane: "spark-local",
    taskType: "arcr-initial-score",
    ownsStages: ["prefiltered"],
  },
  {
    id: "purchaser",
    name: "PurchaserRobot",
    description: "Envelope-guarded strategic document buys.",
    defaultModelLane: "spark-local",
    taskType: "arcr-claw-extract",
    ownsStages: ["acquired"],
  },
  {
    id: "underwriter",
    name: "UnderwriterRobot",
    description: "Lien graph extraction and net-surplus scoring.",
    defaultModelLane: "frontier",
    taskType: "arcr-diligence",
    ownsStages: ["underwritten"],
  },
  {
    id: "locator",
    name: "LocatorRobot",
    description: "Skip waterfall and match scoring on DGX.",
    defaultModelLane: "spark-local",
    taskType: "arcr-claw-extract",
    ownsStages: ["located"],
  },
  {
    id: "outreach",
    name: "OutreachRobot",
    description: "Mail-only solicitation with suppression pass.",
    defaultModelLane: "spark-local",
    taskType: "arcr-outreach-review",
    ownsStages: ["outreach"],
  },
  {
    id: "intake",
    name: "IntakeRobot",
    description: "Inbound AI front desk with conflict-first flow.",
    defaultModelLane: "spark-local",
    taskType: "arcr-outreach-review",
    ownsStages: ["intake"],
  },
  {
    id: "engagement",
    name: "EngagementRobot",
    description: "Fee agreement assembly and RON ceremony.",
    defaultModelLane: "spark-local",
    taskType: "arcr-package-synthesis",
    ownsStages: ["engaged"],
  },
  {
    id: "drafter",
    name: "DrafterRobot",
    description: "Filing packet assembly and lint.",
    defaultModelLane: "frontier",
    taskType: "arcr-package-synthesis",
    ownsStages: ["filed"],
  },
  {
    id: "trust",
    name: "TrustRobot",
    description: "IOLTA ledger and settlement statements.",
    defaultModelLane: "spark-local",
    taskType: "arcr-claw-extract",
    ownsStages: ["collected"],
  },
];

export const ARCR_PIPELINE_STAGES: Array<{
  stage: ArcrWorkItemStage;
  label: string;
  description: string;
}> = [
  { stage: "ingested", label: "Ingested", description: "County collectors normalized surplus events." },
  { stage: "prefiltered", label: "Pre-filtered", description: "Dead cases killed for free." },
  { stage: "acquired", label: "Acquired", description: "Strategic documents purchased." },
  { stage: "underwritten", label: "Underwritten", description: "Lien graph and grade assigned." },
  { stage: "located", label: "Located", description: "Claimant identity resolved." },
  { stage: "outreach", label: "Outreach", description: "Mail sequence in flight." },
  { stage: "intake", label: "Intake", description: "Inbound contact and conflict screen." },
  { stage: "engaged", label: "Engaged", description: "Executed notarized fee agreement." },
  { stage: "filed", label: "Filed", description: "Attorney-signed filing submitted." },
  { stage: "collected", label: "Collected", description: "Funds received in trust." },
  { stage: "surfaced", label: "Surfaced", description: "Ready for operator gate action." },
  { stage: "killed", label: "Killed", description: "Terminal rejects with replayable reasons." },
];

export const ARCR_TASK_CONTRACTS = {
  "arcr-commander-adjudication": {
    taskType: "arcr-commander-adjudication",
    defaultTier: "goliath" as const,
    expertisePrompt:
      "You are ArcadianCommander. Make accountable stage-transition decisions for surplus recovery. Optimize for high kill rate, low wasted spend, clear evidence. Output JSON with decision, confidence, killReason, nextStage, nextAction.",
    outputFormat: "json" as const,
  },
  "arcr-claw-extract": {
    taskType: "arcr-claw-extract",
    defaultTier: "micro" as const,
    expertisePrompt:
      "Extract normalized observations from county records. Return facts, provenance, confidence only.",
    outputFormat: "json" as const,
  },
  "arcr-initial-score": {
    taskType: "arcr-initial-score",
    defaultTier: "base" as const,
    expertisePrompt:
      "Apply surplus recovery kill rules aggressively. Return score, passOrKill, killReason, explanation.",
    outputFormat: "json" as const,
  },
  "arcr-diligence": {
    taskType: "arcr-diligence",
    defaultTier: "goliath" as const,
    expertisePrompt:
      "Validate lien graph, junior propensity, net-to-owner estimate. Return structured findings.",
    outputFormat: "json" as const,
  },
  "arcr-package-synthesis": {
    taskType: "arcr-package-synthesis",
    defaultTier: "goliath" as const,
    expertisePrompt:
      "Assemble filing packets or engagement documents from certified templates. Closed-world assembly only.",
    outputFormat: "markdown" as const,
  },
  "arcr-outreach-review": {
    taskType: "arcr-outreach-review",
    defaultTier: "goliath" as const,
    expertisePrompt:
      "Review mail templates and intake transcripts for compliance. Never invent legal advice.",
    outputFormat: "markdown" as const,
  },
};
