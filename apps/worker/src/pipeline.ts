import { prefilterEvent } from "@arcr/acquisition";
import type { NormalizedSurplusEvent } from "@arcr/collectors";

async function main() {
  const event: NormalizedSurplusEvent = {
    id: "e1",
    jurisdictionKey: "az-maricopa",
    source: "county-treasurer",
    stream: "backlog",
    grossCents: 5_000_000,
    status: "active",
    stage: "ingested",
    traceId: "worker-1",
  };
  const result = prefilterEvent(event, {});
  console.log(JSON.stringify({ run: "pipeline", survived: result.survived }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
