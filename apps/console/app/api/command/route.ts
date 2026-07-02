import { getCommandSnapshot } from "@arcr/command";
import { getDemoPipelineMeta } from "@arcr/engine";

export async function GET() {
  const { vertical, pipeline, workItems } = getDemoPipelineMeta();
  return Response.json({
    vertical,
    pipeline,
    workItems,
    command: getCommandSnapshot(workItems),
  });
}
