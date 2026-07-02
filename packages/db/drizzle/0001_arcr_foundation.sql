-- Arcadian Ridge foundation schema
CREATE TABLE IF NOT EXISTS arcr_jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL,
  county TEXT NOT NULL,
  rule_pack JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  certified_by TEXT,
  certified_at TIMESTAMPTZ,
  effective_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft',
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcr_surplus_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID NOT NULL,
  source TEXT NOT NULL,
  stream TEXT NOT NULL,
  court_case_no TEXT,
  parcel TEXT,
  property_address TEXT,
  sale_date TIMESTAMPTZ,
  deposit_date TIMESTAMPTZ,
  gross_cents INTEGER NOT NULL DEFAULT 0,
  escheat_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  killed_reason TEXT,
  stage TEXT NOT NULL DEFAULT 'ingested',
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcr_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  kind TEXT NOT NULL,
  source TEXT NOT NULL,
  cost_cents INTEGER NOT NULL DEFAULT 0,
  storage_ref TEXT,
  sha256 TEXT,
  acquired_at TIMESTAMPTZ,
  extracted_at TIMESTAMPTZ,
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcr_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  entity_type TEXT,
  address_of_record TEXT,
  counsel_of_record BOOLEAN NOT NULL DEFAULT FALSE,
  priority_hint INTEGER,
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcr_liens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  party_id UUID,
  position INTEGER,
  kind TEXT NOT NULL,
  recorded_ref TEXT,
  face_cents INTEGER,
  est_outstanding_cents INTEGER,
  claim_propensity INTEGER,
  propensity_model_version TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcr_underwriting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  model_version TEXT NOT NULL,
  gross_cents INTEGER NOT NULL,
  expected_junior_cents INTEGER NOT NULL,
  net_to_owner_cents INTEGER NOT NULL,
  fee_est_cents INTEGER NOT NULL,
  grade TEXT NOT NULL,
  features JSONB,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcr_locates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL,
  provider TEXT NOT NULL,
  permissible_purpose TEXT NOT NULL,
  match_score INTEGER,
  addresses_enc TEXT,
  phones_enc TEXT,
  flags JSONB,
  cost_cents INTEGER NOT NULL DEFAULT 0,
  traced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcr_outreach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL,
  event_id UUID NOT NULL,
  template_version TEXT NOT NULL,
  print_job_ref TEXT,
  mail_class TEXT,
  sent_at TIMESTAMPTZ,
  touch_n INTEGER NOT NULL DEFAULT 1,
  attribution_ref TEXT,
  delivered_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  suppression_checks JSONB,
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcr_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_ref TEXT,
  event_id UUID,
  caller_party_id UUID,
  identity_score INTEGER,
  conflict_screen_result TEXT,
  facts_enc TEXT,
  outcome TEXT,
  booked_at TIMESTAMPTZ,
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcr_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  subject_party_id UUID NOT NULL,
  adverse_parties_checked JSONB,
  result TEXT NOT NULL,
  waiver_ref TEXT,
  method TEXT NOT NULL,
  checked_by TEXT NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcr_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  claimant_party_id UUID NOT NULL,
  matter_id UUID,
  fee_posture TEXT NOT NULL,
  fee_terms_ref TEXT,
  agreement_doc_ref TEXT,
  ron_envelope_id TEXT,
  ron_evidence_ref TEXT,
  notarized_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  void_window_checked_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcr_matters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL,
  event_id UUID NOT NULL,
  attorney TEXT NOT NULL,
  court_case_no TEXT,
  stage TEXT NOT NULL DEFAULT 'open',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcr_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID NOT NULL,
  kind TEXT NOT NULL,
  packet_ref TEXT,
  lint_result JSONB,
  attorney_approval_ref TEXT,
  filed_at TIMESTAMPTZ,
  method TEXT,
  service_list JSONB,
  receipts_ref TEXT,
  response_deadline_at TIMESTAMPTZ,
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcr_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID,
  event_id UUID,
  kind TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  alerted_at TIMESTAMPTZ,
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcr_trust_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID NOT NULL,
  direction TEXT NOT NULL,
  kind TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  order_ref TEXT,
  statement_ref TEXT,
  cleared_at TIMESTAMPTZ,
  approval_ref TEXT,
  recon_batch_id TEXT,
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcr_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL,
  subject_ref TEXT NOT NULL,
  evidence JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by TEXT NOT NULL,
  decided_by TEXT,
  decided_at TIMESTAMPTZ,
  trace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arcr_metering_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  task_type TEXT NOT NULL,
  cost_cents INTEGER NOT NULL DEFAULT 0,
  trace_id TEXT NOT NULL,
  metadata JSONB,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tenant_id TEXT NOT NULL DEFAULT 'arcadian-ridge',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS arcr_jurisdictions_state_county_version
  ON arcr_jurisdictions (state, county, version);
CREATE INDEX IF NOT EXISTS arcr_surplus_events_jurisdiction ON arcr_surplus_events (jurisdiction_id);
CREATE INDEX IF NOT EXISTS arcr_surplus_events_stage ON arcr_surplus_events (stage);
CREATE UNIQUE INDEX IF NOT EXISTS arcr_documents_sha256 ON arcr_documents (sha256) WHERE sha256 IS NOT NULL;
