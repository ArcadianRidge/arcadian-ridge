import { computePipelineMetrics } from "@arcr/engine";
import type { ArcrWorkItem } from "@arcr/engine";
import { getApprovalQueue, getMondayQueueSummary } from "./approvals.js";

export function getCommandSnapshot(items: ArcrWorkItem[]) {
  return {
    generatedAt: new Date().toISOString(),
    metrics: computePipelineMetrics(items),
    approvalQueue: getApprovalQueue({ status: "pending" }),
    mondayQueue: getMondayQueueSummary(),
  };
}
