import { ARCR_PIPELINE_STAGES, ARCR_VERTICAL } from "./registry.js";
import type { ArcrPipelineColumn, ArcrWorkItem } from "./types.js";

export function buildPipelineBoard(items: ArcrWorkItem[]): ArcrPipelineColumn[] {
  return ARCR_PIPELINE_STAGES.map((stage) => ({
    ...stage,
    items: items.filter((item) => item.stage === stage.stage),
  }));
}

export function computePipelineMetrics(items: ArcrWorkItem[]) {
  const killed = items.filter((i) => i.stage === "killed");
  const surfaced = items.filter((i) => i.stage === "surfaced");
  const active = items.filter((i) => i.stage !== "killed" && i.stage !== "surfaced");
  return {
    vertical: ARCR_VERTICAL,
    sourcedToday: items.length,
    killedToday: killed.length,
    survivedToday: surfaced.length,
    killRate: items.length ? killed.length / items.length : 0,
    activeRuns: active.length,
    queueDepth: active.length + surfaced.length,
    conversionRate: items.length ? surfaced.length / items.length : 0,
  };
}

export function transitionStage(
  item: ArcrWorkItem,
  toStage: ArcrWorkItem["stage"],
  patch: Partial<ArcrWorkItem> = {},
): ArcrWorkItem {
  return {
    ...item,
    ...patch,
    stage: toStage,
    updatedAt: new Date().toISOString(),
  };
}
