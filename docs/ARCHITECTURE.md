# Arcadian Ridge — Architecture

Deed-of-trust surplus recovery engine for AZ/WA/ID. Sibling to Denovo Grow on Rakontevr platform primitives.

## Module layout

```
packages/
  engine/       Rack pipeline stages, robots, task contracts
  db/           17 arcr_* tables + G1-G4 gate enforcement
  rak-bridge/   RSP Gateway inference + metering headers
  command/      Approvals spine + envelope guard
  registry/     ARCR-1 jurisdiction rule packs
  collectors/     ARCR-2 county ingestion
  acquisition/  ARCR-3 pre-filter + purchaser
  underwriting/ ARCR-4 lien graph + scoring
  locator/      ARCR-5 skip waterfall (micro/DGX)
  outreach/     ARCR-6 mail-only solicitation
  intake/       ARCR-7 inbound front desk
  engagement/   ARCR-8 RON + G2
  filings/      ARCR-9 filing factory + G3
  trust/        ARCR-10 IOLTA + G4
  memo/         ARCR-11 weekly memo + P&L
  verify/       ARCR-12 probe suite + launch checklist
apps/
  console/      Operator UI :3200
  inbound/      Attributed landing :4400
  worker/       Collector + pipeline crons
```

## Four hard gates

| Gate | Enforcement |
|------|-------------|
| G1 | Conflict clear before engagement (`@arcr/db/gates`) |
| G2 | AZ void window + notarization before executed |
| G3 | Attorney approval before filedAt |
| G4 | Order + cleared funds + operator approval before disbursement |

## AI routing

All inference via `@arcr/rak-bridge` → RSP Gateway with `arcr-*` task types. Micro tier for PII (locator, intake). Goliath for extraction and packet QA.

## Entity structure

Ridgepoint Group, LLC — law practice. Rakontevr, LLC — flat per-matter platform fee (Rule 5.4 wall).
