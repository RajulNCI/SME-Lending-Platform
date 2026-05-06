/**
 * services/mockPythonApi.ts
 *
 * Mirrors the EXACT response shape Nathan's Python API will return.
 * When Nathan's real API is ready:
 *   1. Change PYTHON_API_BASE_URL in nathanApi.ts to his endpoint
 *   2. Delete this file
 *   3. Nothing else changes — all components use nathanApi.ts, not this file directly
 */

import type { AIAssessment, ApplicationStatus } from '../types/application';

// ── Step status shape ─────────────────────────────────────────────────────────
export interface StepStatus {
  step: number;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  completedAt?: string;
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
  assessment: AIAssessment | null;
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
  // Track the current step index explicitly — don't derive from step statuses
  currentStep: number;
}

const mockStore: Record<string, MockApplicationRecord> = {};

export const MOCK_QUEUE_APPS: QueueApplicationSummary[] = [];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── mockSubmitApplication ─────────────────────────────────────────────────────
export async function mockSubmitApplication(
  applicationId: string,
  _documents: { name: string; size: number; type: string }[]
): Promise<SubmitApplicationResponse> {
  await delay(300);
  if (!mockStore[applicationId]) {
    mockStore[applicationId] = {
      applicationId,
      company: 'Borrower SME Ltd',
      sector: 'Unknown',
      loanType: 'Working Capital',
      requestedAmount: 0,
      createdAt: new Date().toISOString(),
      status: 'submitted',
      currentStep: 0, // ← explicit tracker
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

// ── mockGetStatus ─────────────────────────────────────────────────────────────
export async function mockGetStatus(applicationId: string): Promise<ApplicationStatusResponse> {
  await delay(100);
  const record = mockStore[applicationId];
  if (!record) throw new Error(`Application ${applicationId} not found`);
  return record;
}

// ── mockAdvanceStep ───────────────────────────────────────────────────────────
// FIX: removed the `if (step > 4) return` guard that blocked step 5 (Fund Release).
// Step 5 is now allowed when the officer has approved.
export async function mockAdvanceStep(applicationId: string, step: number): Promise<void> {
  await delay(50);
  const record = mockStore[applicationId];
  if (!record) return;

  // Only block auto-advance past step 4 if no officer decision yet
  if (step > 4 && !record.officerDecision) return;

  record.currentStep = step; // ← update the explicit tracker
  record.steps = record.steps.map((s, i) => ({
    ...s,
    status: i < step ? 'done' : i === step ? 'running' : 'pending',
  }));
  record.status = step >= 4 && !record.officerDecision ? 'waiting_officer' : 'processing';
}

// ── mockGetQueue ──────────────────────────────────────────────────────────────
export async function mockGetQueue(): Promise<QueueApplicationSummary[]> {
  await delay(200);
  return Object.values(mockStore)
    .map((r) => ({
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
    }))
    .reverse();
}

// ── mockSubmitDecision ────────────────────────────────────────────────────────
export async function mockSubmitDecision(
  req: SubmitDecisionRequest
): Promise<SubmitDecisionResponse> {
  await delay(800);
  const record = mockStore[req.applicationId];
  if (record) {
    record.officerDecision = req.decision;
    record.decidedAt = new Date().toISOString();
    record.status = 'decided';
    // For approved: mark step 5 as running so poll sees it advancing
    // For declined/referred: stay at step 4
    if (req.decision === 'approved') {
      record.currentStep = 5;
      record.steps = record.steps.map((s, i) => ({
        ...s,
        status: i < 5 ? 'done' : i === 5 ? 'running' : 'pending',
      }));
    }
  }
  return {
    success: true,
    applicationId: req.applicationId,
    decision: req.decision,
    loggedAt: new Date().toISOString(),
  };
}

// ── ProgressOut ───────────────────────────────────────────────────────────────
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

// ── mockGetBorrowerApplications ───────────────────────────────────────────────
export async function mockGetBorrowerApplications(): Promise<BorrowerApplication[]> {
  await delay(200);
  return Object.values(mockStore)
    .map((a) => ({
      id: a.applicationId,
      reference: a.applicationId,
      company_name: a.company,
      loan_amount: a.requestedAmount,
      loan_purpose: a.loanType,
      status: a.officerDecision || a.status,
      created_at: a.createdAt,
    }))
    .reverse();
}

// ── mockGetProgress ───────────────────────────────────────────────────────────
// FIX: now reads `record.currentStep` directly instead of scanning step statuses.
// The old findIndex approach always returned 0 because all steps start as 'pending'.
export async function mockGetProgress(applicationId: string): Promise<ProgressOut> {
  await delay(100);
  const record = mockStore[applicationId];

  if (!record) {
    // Not in store — assume completed (fallback for unknown IDs)
    return { step: 6, total_steps: 6, completed: true };
  }

  // Officer has decided → report as complete
  if (record.officerDecision) {
    return {
      step: record.officerDecision === 'approved' ? 6 : 4,
      total_steps: 6,
      completed: true,
      decision: record.officerDecision,
    };
  }

  // Waiting at the Maker-Checker gate (step 4) — do not advance further
  if (record.currentStep >= 4) {
    return {
      step: 4,
      total_steps: 6,
      completed: false,
    };
  }

  // Still running through steps 0–3
  return {
    step: record.currentStep,
    total_steps: 6,
    completed: false,
  };
}

// ── mockCreateApplication ─────────────────────────────────────────────────────
export async function mockCreateApplication(data: any): Promise<{ id: string; reference: string }> {
  await delay(300);
  const id = 'FP-2026-' + Math.floor(Math.random() * 1000);
  mockStore[id] = {
    applicationId: id,
    company: data.company_name || 'Borrower SME Ltd',
    sector: data.sector || 'Unknown',
    loanType: data.loan_purpose || 'Working Capital',
    requestedAmount: data.loan_amount || 0,
    createdAt: new Date().toISOString(),
    status: 'submitted',
    currentStep: 0, // ← starts at 0, advances via mockAdvanceStep
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
