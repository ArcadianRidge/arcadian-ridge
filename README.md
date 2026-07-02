# Arcadian Ridge

Attorney-operated deed-of-trust surplus recovery engine (AZ / WA / ID), built on the Rakontevr platform.

## Monorepo

| Package / App | Purpose |
|---------------|---------|
| `packages/engine` | Rack deal-flow pipeline: stages, robots, claws, work items |
| `packages/db` | Drizzle schema + migrations (own Postgres) |
| `packages/rak-bridge` | RSP Gateway + metering via `@rakontevr/sdk` |
| `packages/registry` … `verify` | ARCR-1 through ARCR-12 domain modules |
| `apps/console` | Operator UI (Next.js, port 3200) |
| `apps/inbound` | Attributed intake landing (port 4400) |
| `apps/worker` | Collector + pipeline cron jobs |

## Quick start

```bash
cp .env.example .env
npm install
npm run build
npm run db:migrate
npm run db:seed-demo
npm run test
npm run dev:console
```

## Rak integration

See [docs/RAK-INTEGRATION.md](docs/RAK-INTEGRATION.md).

```bash
npm run doctor
npm run rsp:check
rak autonomous start --initiative arcadian-ridge
```
