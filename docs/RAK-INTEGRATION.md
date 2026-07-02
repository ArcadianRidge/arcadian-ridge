# Rak Integration — Arcadian Ridge

Arcadian Ridge owns console, domain logic, and Postgres. Rakontevr owns inference, metering, and RSP pipeline.

## Gateway inference

```typescript
import { callGatewayInference } from "@arcr/rak-bridge";

await callGatewayInference({
  prompt: "...",
  taskType: "arcr-diligence",
  agentTier: "goliath",
  projectId: "az-maricopa",
});
```

Headers: `X-Trace-Id`, `X-Task-Type`, `X-Metering-User-Id`, `X-Agent-Tier`, `X-Project-Id`.

## RSP dispatch

```bash
rak autonomous start --initiative arcadian-ridge
npm run rsp:check
```

Stories: `docs/USER-STORIES.md` | Config: `config/rsp/arcadian-ridge.yaml`

## Offline development

Set `ARCR_ALLOW_SIMULATOR=1` when gateway is unavailable. BDD tests set this automatically.
