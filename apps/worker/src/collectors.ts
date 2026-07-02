import { createSimulatorCollector } from "@arcr/collectors";
import { seedLaunchPacks, certifyPack } from "@arcr/registry";

async function main() {
  process.env.ARCR_ALLOW_SIMULATOR = "1";
  seedLaunchPacks();
  certifyPack("az-maricopa", "operator");
  const collector = createSimulatorCollector("az-maricopa", [
    { courtCaseNo: "CV2026-001", grossCents: 6_000_000, depositDate: "2025-06-01", stream: "backlog" },
  ]);
  const result = await collector.pull();
  console.log(JSON.stringify({ run: "collectors", events: result.events.length, quarantined: result.quarantined }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
