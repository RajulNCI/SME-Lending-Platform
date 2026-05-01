/**
 * types/application.ts
 * Single source of truth for all application-related types.
 * Used by borrower, queue, and context layers.
 */

// ── Enums / unions ────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'draft' // borrower hasn't submitted yet
  | 'submitted' // borrower submitted, pipeline starting
  | 'processing' // steps 1–4 running (AI)
  | 'waiting_officer' // step 4 done, waiting for human (step 5)
  | 'decided' // officer has acted
  | 'flagged'; // system flagged — needs escalation

export type OfficerDecision = 'approved' | 'referred' | 'declined';

export type PipelineStep =
  | 'intake'
  | 'idp_ocr'
  | 'rules_engine'
  | 'oecb_check'
  | 'maker_checker'
  | 'fund_release';

export type CheckStatus = 'pass' | 'warn' | 'fail' | 'pending';

export type EclStage = 1 | 2 | 3;

export type LoanType =
  | 'Working Capital'
  | 'Asset Finance'
  | 'Term Loan'
  | 'Invoice Finance'
  | 'Other';

// ── Sub-types ─────────────────────────────────────────────────────────────────

export interface UploadedDocument {
  name: string;
  size: number; // bytes
  type: string; // mime or extension
  uploadedAt: string; // ISO timestamp
}

export interface ShapValue {
  feature: string;
  value: number; // absolute SHAP value
  direction: 'positive' | 'negative';
}

export interface FairnessMetrics {
  disparateImpact: number; // target >0.80
  equalOpportunity: number; // target <0.10
}

export interface ComplianceCheck {
  name: string;
  detail: string;
  status: CheckStatus;
  time: string; // HH:MM:SS
}

export interface AccountabilityEntry {
  role: string;
  name: string;
  credential: string;
  ts: string; // timestamp or label
}

export interface AuditEvent {
  event: string;
  detail: string;
  ts: string; // ISO timestamp
}

// ── AI Assessment — populated by Nathan's API ─────────────────────────────────
// All fields nullable — only available once AI processing completes.

export interface AIAssessment {
  // Financial extraction (IDP / OCR — Step 2)
  revenue: string | null; // e.g. '€2.84M'
  cashflow: string | null;
  dscr: number | null; // debt service coverage ratio
  discrepancy: boolean;
  discrepancyDetail: string | null;

  // Credit model outputs (Step 3)
  pd: number | null; // probability of default %
  pdLow: number | null;
  pdHigh: number | null;
  lgd: number | null; // loss given default
  ead: number | null; // exposure at default
  riskGrade: string | null; // e.g. 'A1', 'B1', 'C2'
  apr: number | null; // risk-based pricing %

  // IFRS 9
  eclStage: EclStage | null;
  ecl12m: number | null;
  eclLifetime: number | null;

  // Explainability
  shapValues: ShapValue[];
  fairnessMetrics: FairnessMetrics | null;

  // Narrative + recommendation
  narrative: string | null; // HTML string
  recommendation: string | null;
  reasoning: string | null;

  // Checks & accountability
  checks: ComplianceCheck[];
  accountabilityChain: AccountabilityEntry[];
}

// ── Core application ──────────────────────────────────────────────────────────

export interface Application {
  // Identity
  id: string; // e.g. 'FP-2025-0041'
  createdAt: string; // ISO timestamp

  // Borrower-supplied (Step 1)
  company: string;
  sector: string;
  loanType: LoanType;
  requestedAmount: number; // numeric, e.g. 420000
  amount: string; // formatted, e.g. '€420,000'
  crn: string; // company registration number
  documents: UploadedDocument[];

  // Pipeline state
  status: ApplicationStatus;
  currentPipelineStep: number; // 0-indexed, -1 = not started
  hitl: boolean;
  hitlReason?: string;

  // Officer decision (Step 5) — null until decided
  officerDecision: OfficerDecision | null;
  officerRationale: string | null;
  officerName: string | null;
  decidedAt: string | null; // ISO timestamp

  // AI assessment — null until Step 3+ complete
  // When Nathan's API is ready, replace mock values with API response
  assessment: AIAssessment | null;

  // Audit trail
  auditLog: AuditEvent[];
}

// ── Context shape ─────────────────────────────────────────────────────────────

export interface ApplicationContextValue {
  applications: Application[];

  // Borrower actions
  submitApplication: (
    company: string,
    sector: string,
    loanType: LoanType,
    requestedAmount: number,
    documents: UploadedDocument[]
  ) => Application;

  updatePipelineStep: (id: string, step: number) => void;
  setWaitingForOfficer: (id: string) => void;

  // Officer actions
  submitDecision: (
    id: string,
    decision: OfficerDecision,
    rationale: string,
    officerName: string
  ) => void;

  // Getters
  getApplication: (id: string) => Application | undefined;
  getPendingApplications: () => Application[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export const formatAmount = (n: number): string => `€${n.toLocaleString('en-IE')}`;

export const generateAppId = (): string => {
  const n = Math.floor(Math.random() * 900) + 100;
  return `FP-2025-0${n}`;
};

export const makeAuditEvent = (event: string, detail: string): AuditEvent => ({
  event,
  detail,
  ts: new Date().toISOString(),
});
