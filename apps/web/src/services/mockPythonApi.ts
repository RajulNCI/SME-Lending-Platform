/**
 * services/mockPythonApi.ts
 *
 * Mirrors the EXACT response shape Nathan's Python API will return.
 * When Nathan's real API is ready:
 *   1. Change PYTHON_API_BASE_URL in nathanApi.ts to his endpoint
 *   2. Delete this file
 *   3. Nothing else changes — all components use nathanApi.ts, not this file directly
 *
 * Response shapes are intentionally typed to match expected Python/FastAPI output.
 */

import type { AIAssessment, ApplicationStatus } from '../types/application';

// ── Step status shape ─────────────────────────────────────────────────────────
export interface StepStatus {
  step: number; // 0-indexed: 0=intake,1=idp,2=rules,3=oecb,4=maker_checker,5=fund_release
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  completedAt?: string; // ISO timestamp
  error?: string;
}

// ── Submit response ───────────────────────────────────────────────────────────
export interface SubmitApplicationResponse {
  applicationId: string;
  status: 'submitted';
  createdAt: string;
}

// ── Status poll response ──────────────────────────────────────────────────────
export interface ApplicationStatusResponse {
  applicationId: string;
  status: ApplicationStatus;
  steps: StepStatus[];
  assessment: AIAssessment | null; // null until step 3 completes
  officerDecision: 'approved' | 'referred' | 'declined' | null;
  decidedAt: string | null;
}

// ── Officer queue response ────────────────────────────────────────────────────
export interface QueueApplicationSummary {
  applicationId: string;
  company: string;
  sector: string;
  loanType: string;
  amount: string;
  requestedAmount: number;
  status: ApplicationStatus;
  hitl: boolean;
  hitlReason?: string;
  riskGrade: string | null;
  pd: number | null;
  dscr: number | null;
  recommendation: string | null;
  createdAt: string;
  decidedAt: string | null;
  officerDecision: 'approved' | 'referred' | 'declined' | null;
}

// ── Decision submit ───────────────────────────────────────────────────────────
export interface SubmitDecisionRequest {
  applicationId: string;
  decision: 'approved' | 'referred' | 'declined';
  rationale: string;
  officerName: string;
}

export interface SubmitDecisionResponse {
  success: boolean;
  applicationId: string;
  decision: string;
  loggedAt: string;
}

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
// All mock data lives here. Delete when real API is ready.

const STEP_LABELS = [
  'Application Intake',
  'IDP / OCR Document Read',
  'Rules Engine Assessment',
  'OECB CCR Check',
  'Maker-Checker Approval Gate',
  'Fund Release to Ledger',
];

interface MockApplicationRecord extends ApplicationStatusResponse {
  company: string;
  sector: string;
  loanType: string;
  requestedAmount: number;
  createdAt: string;
}

// In-memory store for mock submissions (survives within the session)
const mockStore: Record<string, MockApplicationRecord> = {};

// Pre-seeded mock queue applications (cleared as per request to only show dynamic data)
export const MOCK_QUEUE_APPS: QueueApplicationSummary[] = [];

// Delay helper
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Mock API functions ─────────────────────────────────────────────────────────
// These have the SAME signature as nathanApi.ts functions.
// Nathan replaces the internals, not the signatures.

export async function mockSubmitApplication(
  applicationId: string,
  _documents: { name: string; size: number; type: string }[]
): Promise<SubmitApplicationResponse> {
  await delay(300);
  // Ensure the record exists; if it does, don't overwrite its context
  if (!mockStore[applicationId]) {
    mockStore[applicationId] = {
      applicationId,
      company: 'Borrower SME Ltd',
      sector: 'Unknown',
      loanType: 'Working Capital',
      requestedAmount: 0,
      createdAt: new Date().toISOString(),
      status: 'submitted',
      steps: STEP_LABELS.map((label, i) => ({
        step: i,
        label,
        status: 'pending' as const,
      })),
      assessment: null,
      officerDecision: null,
      decidedAt: null,
    };
  }
  return { applicationId, status: 'submitted', createdAt: mockStore[applicationId].createdAt };
}

export async function mockGetStatus(applicationId: string): Promise<ApplicationStatusResponse> {
  await delay(100);

  const record = mockStore[applicationId];
  if (!record) throw new Error(`Application ${applicationId} not found`);
  return record;
  if (!record) throw new Error(`Application ${applicationId} not found`);
  return record;
}

export async function mockAdvanceStep(applicationId: string, step: number): Promise<void> {
  await delay(50);
  if (step > 4) return; // Do not advance past Maker-Checker automatically
  const record = mockStore[applicationId];
  if (!record) return;
  if (step > 4 && !record.officerDecision) {
    return; // Pause advancement until officer decides
  }
  
  record.steps = record.steps.map((s, i) => ({
    ...s,
    status: i < step ? 'done' : i === step ? 'running' : 'pending',
  }));
  record.status = step >= 4 && !record.officerDecision ? 'waiting_officer' : 'processing';
}

export async function mockGetQueue(): Promise<QueueApplicationSummary[]> {
  await delay(200);
  return Object.values(mockStore).map((r) => ({
    applicationId: r.applicationId,
    company: r.company,
    sector: r.sector,
    loanType: r.loanType,
    amount: `€${r.requestedAmount.toLocaleString()}`,
    requestedAmount: r.requestedAmount,
    status: r.status,
    hitl: false,
    riskGrade: null,
    pd: null,
    dscr: null,
    recommendation: 'Pending',
    createdAt: r.createdAt,
    decidedAt: r.decidedAt,
    officerDecision: r.officerDecision,
  })).reverse();
}

export async function mockSubmitDecision(
  req: SubmitDecisionRequest
): Promise<SubmitDecisionResponse> {
  await delay(800);
  // Update live data
  const record = mockStore[req.applicationId];
  if (record) {
    record.officerDecision = req.decision;
    record.decidedAt = new Date().toISOString();
    record.status = 'decided';
  }
  return {
    success: true,
    applicationId: req.applicationId,
    decision: req.decision,
    loggedAt: new Date().toISOString(),
  };
}

export interface ProgressOut {
  step: number;
  total_steps: number;
  completed: boolean;
  decision?: string | null;
}

export interface BorrowerApplication {
  id: string;
  reference: string;
  company_name: string;
  loan_amount: number;
  loan_purpose: string;
  status: string;
  created_at: string;
}

export async function mockGetBorrowerApplications(): Promise<BorrowerApplication[]> {
  await delay(200);
  return Object.values(mockStore).map(a => ({
    id: a.applicationId,
    reference: a.applicationId,
    company_name: a.company,
    loan_amount: a.requestedAmount,
    loan_purpose: a.loanType,
    status: a.officerDecision || a.status,
    created_at: a.createdAt
  })).reverse();
}

export async function mockGetProgress(applicationId: string): Promise<ProgressOut> {
  await delay(100);
  const record = mockStore[applicationId];
  if (!record) {
    return { step: 6, total_steps: 6, completed: true }; // Assume done if not in mock store
  }
  
  if (record.officerDecision) {
    return {
      step: record.officerDecision === 'approved' ? 6 : 4,
      total_steps: 6,
      completed: true,
      decision: record.officerDecision
    };
  }

  const currentStepIndex = record.steps.findIndex(s => s.status === 'running' || s.status === 'pending');
  const step = currentStepIndex === -1 ? 4 : currentStepIndex;
  
  return {
    step,
    total_steps: 6,
    completed: false
  };
}

// Update mockSubmitApplication to take amount and purpose
export async function mockCreateApplication(data: any): Promise<{ id: string; reference: string }> {
  await delay(300);
  const id = "FP-2026-" + Math.floor(Math.random() * 1000);
  mockStore[id] = {
    applicationId: id,
    company: data.company_name || 'Borrower SME Ltd',
    sector: data.sector || 'Unknown',
    loanType: data.loan_purpose || 'Working Capital',
    requestedAmount: data.loan_amount || 0,
    createdAt: new Date().toISOString(),
    status: 'submitted',
    steps: STEP_LABELS.map((label, i) => ({
      step: i,
      label,
      status: 'pending' as const,
    })),
    assessment: null,
    officerDecision: null,
    decidedAt: null,
  };
  return { id, reference: id };
}
