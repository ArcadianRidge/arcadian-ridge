# Arcadian Ridge — User Stories

**Initiative:** `arcadian-ridge` | **Epic prefix:** ARCR | **Practice entity:** Ridgepoint Group, LLC

## ARCR-1: Jurisdiction Rules Registry

**Priority:** 1 | **Tier:** base | **agentDispatchable:** true | **Dependencies:** none

### US-ARCR-1.1: Rule pack schema and certification gate

| ID | GIVEN | WHEN | THEN |
|----|-------|------|------|
| ARCR-1.1a | A jurisdiction pack is drafted | Save | Pack validates against typed schema; invalid packs cannot save |
| ARCR-1.1b | Pack awaits certification | Operator reviews | Approve activates pack; uncertified county blocks stages 6-10 |
| ARCR-1.1c | Statute-diff review expires | Review | Pack flips to stale; blocks new engagements not existing matters |

**BDD:** `__tests__/portals/arcadian/arcr-1-registry.bdd.test.ts`

## ARCR-2: County Collectors

**Priority:** 1 | **Tier:** base + Robot Arm | **agentDispatchable:** true | **Dependencies:** ARCR-1

| ID | GIVEN | WHEN | THEN |
|----|-------|------|------|
| ARCR-2.1a | County source registered | Scheduled pull | Normalizes to surplus_events with escheatAt and dedupe |
| ARCR-2.1c | Source drift >30% | Alert | Run quarantined; no silent overwrite |
| ARCR-2.2a | Recorder feed ingests deeds | Match | Positive delta creates stream=newflow event |
| ARCR-2.2b | AZ new-flow created | Clock | Void-window date calendared automatically |

**BDD:** `__tests__/portals/arcadian/arcr-2-collectors.bdd.test.ts`

## ARCR-3: Pre-Filter and Case File Acquisition

**Priority:** 1 | **Dependencies:** ARCR-2

| ID | GIVEN | WHEN | THEN |
|----|-------|------|------|
| ARCR-3.1a | Event enters pipeline | Docket check | Kill if already filed, released, escheat, below floor |
| ARCR-3.1b | Ambiguous docket | Goliath read | Junior-only does not kill |
| ARCR-3.2c | Purchase exceeds envelope | Confirm-first | Approval card with grade and cost |

**BDD:** `__tests__/portals/arcadian/arcr-3-acquisition.bdd.test.ts`

## ARCR-4: Lien Graph and Underwriting

**Priority:** 1 | **Dependencies:** ARCR-3

| ID | GIVEN | WHEN | THEN |
|----|-------|------|------|
| ARCR-4.1a | Document lands | Extraction | Parties/liens extract with confidence |
| ARCR-4.2a | Graph exists | Score | Grade A-D with netToOwner and feeEst |
| ARCR-4.2d | Feature set changes | Guard | Protected-class features excluded |

**BDD:** `__tests__/portals/arcadian/arcr-4-underwriting.bdd.test.ts`

## ARCR-5: Locator

**Priority:** 1 | **Tier:** micro on DGX | **Dependencies:** ARCR-4

| ID | GIVEN | WHEN | THEN |
|----|-------|------|------|
| ARCR-5.1a | Graded event needs owner | Waterfall | Encrypted locate; costs metered |
| ARCR-5.2a | Deceased indicator | Flag | Outreach suppressed |

**BDD:** `__tests__/portals/arcadian/arcr-5-locator.bdd.test.ts`

## ARCR-6: Outreach Desk (mail-only)

**Priority:** 1 | **Dependencies:** ARCR-1, ARCR-5

| ID | GIVEN | WHEN | THEN |
|----|-------|------|------|
| ARCR-6.1a | Template uncertified | Send | Blocked |
| ARCR-6.1b | Send proposed | Suppression | Hard-fail deceased, activeBK, counsel, void window |
| ARCR-6.2c | Kill switch thrown | Halt | Outbound mail stops instantly |

**BDD:** `__tests__/portals/arcadian/arcr-6-outreach.bdd.test.ts`

## ARCR-7: Intake Front Desk

**Priority:** 1 | **Dependencies:** ARCR-1, ARCR-6

| ID | GIVEN | WHEN | THEN |
|----|-------|------|------|
| ARCR-7.1a | Inbound session | Answer | AI disclosure first turn |
| ARCR-7.1c | Junior caller | Screen | Blocked with kind decline |
| ARCR-7.2a | Advice-shaped question | Guard | Scripted no-advice before model |

**BDD:** `__tests__/portals/arcadian/arcr-7-intake.bdd.test.ts`

## ARCR-8: Engagement Rail

**Priority:** 1 | **Dependencies:** ARCR-7

| ID | GIVEN | WHEN | THEN |
|----|-------|------|------|
| ARCR-8.1a | Consult won | Assemble | Fee agreement from certified posture only |
| ARCR-8.1b | AZ event | G2 | Ceremony blocked before saleDate+31d |

**BDD:** `__tests__/portals/arcadian/arcr-8-engagement.bdd.test.ts`

## ARCR-9: Filing Factory

**Priority:** 1 | **Dependencies:** ARCR-8

| ID | GIVEN | WHEN | THEN |
|----|-------|------|------|
| ARCR-9.1a | AZ matter opens | Assemble | Application packet per recipe |
| ARCR-9.2a | Lint passes | G3 | Attorney approval required; no batch |
| ARCR-9.2b | Approved | File | filedAt recorded with artifact |

**BDD:** `__tests__/portals/arcadian/arcr-9-filings.bdd.test.ts`

## ARCR-10: Trust and Treasury

**Priority:** 1 | **Dependencies:** ARCR-9

| ID | GIVEN | WHEN | THEN |
|----|-------|------|------|
| ARCR-10.1a | Funds arrive | Post | Trust deposit with orderRef |
| ARCR-10.2a | Cleared funds | G4 | Operator approval for disbursement |

**BDD:** `__tests__/portals/arcadian/arcr-10-trust.bdd.test.ts`

## ARCR-11: Memo, P&L, Monday Queue

**Priority:** 2 | **Dependencies:** ARCR-4,6,9,10

| ID | GIVEN | WHEN | THEN |
|----|-------|------|------|
| ARCR-11.1a | Week closes | Memo | Funnel, CAC, cash-lag ledger per county |
| ARCR-11.1c | Month closes | P&L | Platform fee line explicit |

**BDD:** `__tests__/portals/arcadian/arcr-11-memo.bdd.test.ts`

## ARCR-12: Verification and Launch Discipline

**Priority:** 1 | **Dependencies:** all

| ID | GIVEN | WHEN | THEN |
|----|-------|------|------|
| ARCR-12.1a | Intake deploy | Probes | Synthetic calls block deploy on failure |
| ARCR-12.1d | Kill switch | Halt | Mail stops; in-flight matters continue |

**BDD:** `__tests__/portals/arcadian/arcr-12-verify.bdd.test.ts`
