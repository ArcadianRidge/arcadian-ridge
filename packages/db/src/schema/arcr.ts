import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const tenantCols = {
  tenantId: text("tenant_id").notNull().default("arcadian-ridge"),
  traceId: text("trace_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const arcrJurisdictions = pgTable("arcr_jurisdictions", {
  id: uuid("id").primaryKey().defaultRandom(),
  state: text("state").notNull(),
  county: text("county").notNull(),
  rulePack: jsonb("rule_pack").notNull(),
  version: integer("version").notNull().default(1),
  certifiedBy: text("certified_by"),
  certifiedAt: timestamp("certified_at", { withTimezone: true }),
  effectiveAt: timestamp("effective_at", { withTimezone: true }),
  status: text("status").notNull().default("draft"),
  ...tenantCols,
});

export const arcrSurplusEvents = pgTable("arcr_surplus_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  jurisdictionId: uuid("jurisdiction_id").notNull(),
  source: text("source").notNull(),
  stream: text("stream").notNull(),
  courtCaseNo: text("court_case_no"),
  parcel: text("parcel"),
  propertyAddress: text("property_address"),
  saleDate: timestamp("sale_date", { withTimezone: true }),
  depositDate: timestamp("deposit_date", { withTimezone: true }),
  grossCents: integer("gross_cents").notNull().default(0),
  escheatAt: timestamp("escheat_at", { withTimezone: true }),
  status: text("status").notNull().default("active"),
  killedReason: text("killed_reason"),
  stage: text("stage").notNull().default("ingested"),
  ...tenantCols,
});

export const arcrDocuments = pgTable("arcr_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull(),
  kind: text("kind").notNull(),
  source: text("source").notNull(),
  costCents: integer("cost_cents").notNull().default(0),
  storageRef: text("storage_ref"),
  sha256: text("sha256"),
  acquiredAt: timestamp("acquired_at", { withTimezone: true }),
  extractedAt: timestamp("extracted_at", { withTimezone: true }),
  ...tenantCols,
});

export const arcrParties = pgTable("arcr_parties", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull(),
  role: text("role").notNull(),
  name: text("name").notNull(),
  entityType: text("entity_type"),
  addressOfRecord: text("address_of_record"),
  counselOfRecord: boolean("counsel_of_record").notNull().default(false),
  priorityHint: integer("priority_hint"),
  ...tenantCols,
});

export const arcrLiens = pgTable("arcr_liens", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull(),
  partyId: uuid("party_id"),
  position: integer("position"),
  kind: text("kind").notNull(),
  recordedRef: text("recorded_ref"),
  faceCents: integer("face_cents"),
  estOutstandingCents: integer("est_outstanding_cents"),
  claimPropensity: integer("claim_propensity"),
  propensityModelVersion: text("propensity_model_version"),
  status: text("status").notNull().default("active"),
  ...tenantCols,
});

export const arcrUnderwriting = pgTable("arcr_underwriting", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull(),
  modelVersion: text("model_version").notNull(),
  grossCents: integer("gross_cents").notNull(),
  expectedJuniorCents: integer("expected_junior_cents").notNull(),
  netToOwnerCents: integer("net_to_owner_cents").notNull(),
  feeEstCents: integer("fee_est_cents").notNull(),
  grade: text("grade").notNull(),
  features: jsonb("features"),
  scoredAt: timestamp("scored_at", { withTimezone: true }).notNull().defaultNow(),
  ...tenantCols,
});

export const arcrLocates = pgTable("arcr_locates", {
  id: uuid("id").primaryKey().defaultRandom(),
  partyId: uuid("party_id").notNull(),
  provider: text("provider").notNull(),
  permissiblePurpose: text("permissible_purpose").notNull(),
  matchScore: integer("match_score"),
  addressesEnc: text("addresses_enc"),
  phonesEnc: text("phones_enc"),
  flags: jsonb("flags"),
  costCents: integer("cost_cents").notNull().default(0),
  tracedAt: timestamp("traced_at", { withTimezone: true }).notNull().defaultNow(),
  ...tenantCols,
});

export const arcrOutreach = pgTable("arcr_outreach", {
  id: uuid("id").primaryKey().defaultRandom(),
  partyId: uuid("party_id").notNull(),
  eventId: uuid("event_id").notNull(),
  templateVersion: text("template_version").notNull(),
  printJobRef: text("print_job_ref"),
  mailClass: text("mail_class"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  touchN: integer("touch_n").notNull().default(1),
  attributionRef: text("attribution_ref"),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  status: text("status").notNull().default("pending"),
  suppressionChecks: jsonb("suppression_checks"),
  ...tenantCols,
});

export const arcrIntakes = pgTable("arcr_intakes", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationRef: text("conversation_ref"),
  eventId: uuid("event_id"),
  callerPartyId: uuid("caller_party_id"),
  identityScore: integer("identity_score"),
  conflictScreenResult: text("conflict_screen_result"),
  factsEnc: text("facts_enc"),
  outcome: text("outcome"),
  bookedAt: timestamp("booked_at", { withTimezone: true }),
  ...tenantCols,
});

export const arcrConflicts = pgTable("arcr_conflicts", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull(),
  subjectPartyId: uuid("subject_party_id").notNull(),
  adversePartiesChecked: jsonb("adverse_parties_checked"),
  result: text("result").notNull(),
  waiverRef: text("waiver_ref"),
  method: text("method").notNull(),
  checkedBy: text("checked_by").notNull(),
  checkedAt: timestamp("checked_at", { withTimezone: true }).notNull().defaultNow(),
  ...tenantCols,
});

export const arcrEngagements = pgTable("arcr_engagements", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull(),
  claimantPartyId: uuid("claimant_party_id").notNull(),
  matterId: uuid("matter_id"),
  feePosture: text("fee_posture").notNull(),
  feeTermsRef: text("fee_terms_ref"),
  agreementDocRef: text("agreement_doc_ref"),
  ronEnvelopeId: text("ron_envelope_id"),
  ronEvidenceRef: text("ron_evidence_ref"),
  notarizedAt: timestamp("notarized_at", { withTimezone: true }),
  signedAt: timestamp("signed_at", { withTimezone: true }),
  voidWindowCheckedAt: timestamp("void_window_checked_at", { withTimezone: true }),
  status: text("status").notNull().default("pending"),
  ...tenantCols,
});

export const arcrMatters = pgTable("arcr_matters", {
  id: uuid("id").primaryKey().defaultRandom(),
  engagementId: uuid("engagement_id").notNull(),
  eventId: uuid("event_id").notNull(),
  attorney: text("attorney").notNull(),
  courtCaseNo: text("court_case_no"),
  stage: text("stage").notNull().default("open"),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  ...tenantCols,
});

export const arcrFilings = pgTable("arcr_filings", {
  id: uuid("id").primaryKey().defaultRandom(),
  matterId: uuid("matter_id").notNull(),
  kind: text("kind").notNull(),
  packetRef: text("packet_ref"),
  lintResult: jsonb("lint_result"),
  attorneyApprovalRef: text("attorney_approval_ref"),
  filedAt: timestamp("filed_at", { withTimezone: true }),
  method: text("method"),
  serviceList: jsonb("service_list"),
  receiptsRef: text("receipts_ref"),
  responseDeadlineAt: timestamp("response_deadline_at", { withTimezone: true }),
  ...tenantCols,
});

export const arcrDeadlines = pgTable("arcr_deadlines", {
  id: uuid("id").primaryKey().defaultRandom(),
  matterId: uuid("matter_id"),
  eventId: uuid("event_id"),
  kind: text("kind").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  source: text("source").notNull(),
  status: text("status").notNull().default("open"),
  alertedAt: timestamp("alerted_at", { withTimezone: true }),
  ...tenantCols,
});

export const arcrTrustEntries = pgTable("arcr_trust_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  matterId: uuid("matter_id").notNull(),
  direction: text("direction").notNull(),
  kind: text("kind").notNull(),
  amountCents: integer("amount_cents").notNull(),
  orderRef: text("order_ref"),
  statementRef: text("statement_ref"),
  clearedAt: timestamp("cleared_at", { withTimezone: true }),
  approvalRef: text("approval_ref"),
  reconBatchId: text("recon_batch_id"),
  ...tenantCols,
});

export const arcrApprovals = pgTable("arcr_approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: text("kind").notNull(),
  subjectRef: text("subject_ref").notNull(),
  evidence: jsonb("evidence"),
  status: text("status").notNull().default("pending"),
  requestedBy: text("requested_by").notNull(),
  decidedBy: text("decided_by"),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  ...tenantCols,
});

export const arcrMeteringEvents = pgTable("arcr_metering_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: text("project_id").notNull(),
  taskType: text("task_type").notNull(),
  costCents: integer("cost_cents").notNull().default(0),
  metadata: jsonb("metadata"),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
  ...tenantCols,
});
