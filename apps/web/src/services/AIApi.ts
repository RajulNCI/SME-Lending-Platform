/**
 * services/AIApi.ts
 *
 * The ONLY file that talks to the backend API.
 * All components import from here — never from apiClient directly.
 *
 * Connected to: https://tschbnmf03.execute-api.eu-west-1.amazonaws.com/dev
 * Proxied via Vite dev server at /api/*
 */

import { apiGet, apiPost, apiPostForm } from './apiClient';

// ── Types ────────────────────────────────────────────────────────────────────

export interface SubmitApplicationResponse {
  id: string;
  applicationId?: string;
  status: string;
  createdAt?: string;
  message?: string;
}

export interface ApplicationStatusResponse {
  id: string;
  applicationId?: string;
  status: string;
  companyName?: string;
  company_name?: string;
  sector?: string;
  loanAmount?: number;
  loan_amount?: number;
  loanType?: string;
  loan_purpose?: string;
  assessment?: any;
  decision?: string;
  createdAt?: string;
  updatedAt?: string;
  // AI assessment fields
  pd?: number;
  risk_grade?: string;
  dscr?: number;
  apr?: number;
  affordability?: number;
  lgd?: number;
  ead?: number;
  ecl_12m?: number;
  ecl_lifetime?: number;
  ifrs9_stage?: number;
  narrative?: string;
  recommendation?: string;
  shap_codes?: Array<{ feature: string; weight?: number; value?: number; direction?: string }>;
  checks?: any[];
  bars?: number[];
  fairness_metrics?: { disparateImpact: number; equalOpportunity: number };
  discrepancy?: boolean;
  discrepancy_detail?: string;
  annual_revenue?: number;
  revenue_actual?: number;
  free_cash_flow?: number;
  crn?: string;
  [key: string]: any;
}

export interface QueueApplicationSummary {
  id: string;
  applicationId: string;
  company: string;
  companyName?: string;
  sector: string;
  loanType: string;
  amount: string;
  requestedAmount: number;
  loanAmount?: number;
  status: string;
  hitl: boolean;
  hitlReason?: string;
  riskGrade: string | null;
  pd: number | null;
  dscr: number | null;
  recommendation: string | null;
  recommendedStatus?: string;
  createdAt: string;
  decidedAt: string | null;
  officerDecision: 'approved' | 'referred' | 'declined' | null;
  // Assessment fields from rules engine
  assessment?: any;
}

export interface SubmitDecisionRequest {
  applicationId: string;
  decision: 'APPROVED' | 'REFERRED' | 'DECLINED';
  notes: string;
}

export interface SubmitDecisionResponse {
  success: boolean;
  applicationId: string;
  decision: string;
  message?: string;
}

export interface BorrowerApplication {
  id: string;
  reference: string;
  company_name: string;
  companyName?: string;
  loan_amount: number;
  loanAmount?: number;
  loan_purpose: string;
  loanType?: string;
  status: string;
  created_at: string;
  createdAt?: string;
}

export interface ProgressOut {
  step: number;
  total_steps: number;
  completed: boolean;
  decision?: string | null;
}

export interface AssessmentData {
  revenue?: number;
  revenueActual?: number;
  cashflow?: number;
  dscr?: number;
  pd?: number;
  lgd?: number;
  ead?: number;
  riskGrade?: string;
  apr?: number;
  eclStage?: number;
  ecl12m?: number;
  eclLifetime?: number;
  discrepancy?: boolean;
  discrepancyDetail?: string;
  recommendedStatus?: string;
  fairnessMetrics?: { disparateImpact: number; equalOpportunity: number };
  shapValues?: Array<{ feature: string; value: number; direction: string }>;
  [key: string]: any;
}

// ── Application Submission (Borrower) ────────────────────────────────────────

/**
 * Submit a loan application with file uploads.
 * Uses multipart/form-data to match the backend's expected format.
 */
export async function createApplication(data: {
  companyName: string;
  sector: string;
  loanAmount: number;
  loanType: string;
  requestedBy?: string;
  files?: File[];
}): Promise<SubmitApplicationResponse> {
  const form = new FormData();
  form.append('companyName', data.companyName);
  form.append('sector', data.sector);
  form.append('loanAmount', String(data.loanAmount));
  form.append('loanType', data.loanType);

  if (data.requestedBy) {
    form.append('requestedBy', data.requestedBy);
  }

  // Attach files
  if (data.files) {
    for (const file of data.files) {
      form.append('files', file);
    }
  }

  return apiPostForm<SubmitApplicationResponse>('/api/v1/applications/submit', form);
}

// ── Application List (Borrower + Officer) ────────────────────────────────────

export async function getBorrowerApplications(): Promise<BorrowerApplication[]> {
  const data = await apiGet<any[]>('/api/v1/applications');
  // Normalize response shape
  return data.map((app) => ({
    id: app.id || app.applicationId,
    reference: app.reference || app.id || app.applicationId,
    company_name: app.companyName || app.company_name || 'Unknown',
    companyName: app.companyName || app.company_name,
    loan_amount: app.loanAmount || app.loan_amount || 0,
    loanAmount: app.loanAmount || app.loan_amount || 0,
    loan_purpose: app.loanType || app.loan_purpose || 'N/A',
    loanType: app.loanType || app.loan_purpose,
    status: app.status || 'SUBMITTED',
    created_at: app.createdAt || app.created_at || new Date().toISOString(),
    createdAt: app.createdAt || app.created_at,
  }));
}

// ── Single Application Detail ────────────────────────────────────────────────

export async function getApplicationDetail(id: string): Promise<ApplicationStatusResponse> {
  return apiGet<ApplicationStatusResponse>(`/api/v1/applications/${id}`);
}

// ── Application Assessment (Rules Engine Output) ─────────────────────────────

export async function getAssessment(id: string): Promise<AssessmentData> {
  // Local AI pipeline — reads assessment from the FastAPI backend
  return apiGet<AssessmentData>(`/local-ai/applications/${id}/assessment`);
}

// ── Trigger local AI pipeline after submission ───────────────────────────────

export async function processApplicationAI(
  id: string,
  files?: File[]
): Promise<{ id: string; status: string; assessment: AssessmentData }> {
  if (files && files.length > 0) {
    // Send files as multipart FormData
    const form = new FormData();
    for (const file of files) {
      form.append('files', file);
    }
    return apiPostForm(`/local-ai/applications/${id}/process-ai`, form);
  }
  // No files — just trigger the pipeline with application data from DB
  return apiPost(`/local-ai/applications/${id}/process-ai`, { documents: [] });
}

// ── Application Progress (for polling) ───────────────────────────────────────

/**
 * Derive progress from the application status.
 * The backend doesn't have a dedicated /progress endpoint — we infer from status.
 */
export async function getProgress(applicationId: string): Promise<ProgressOut> {
  // Map processing job step names → UI step index (1-based, 6 total)
  const STEP_TO_UI: Record<string, number> = {
    APPLICATION_SUBMITTED: 1,
    IDP_OCR:               2,
    RULES_ENGINE:          3,
    PD_AI_MODEL:           4,
    DECISION_SAVED:        5,
    COMPLETED:             5,
  };

  // Terminal application statuses that complete the UI flow
  const APP_DONE: Record<string, number> = {
    hitl_queue: 5,
    approved:   6,
    declined:   6,
    referred:   6,
  };

  try {
    // Try the processing job status endpoint first (real-time from Lambda)
    const job = await apiGet<any>(`/api/v1/applications/${applicationId}/status`);
    const jobStatus = (job.status || '').toLowerCase();
    const stepName  = (job.current_step || '').toUpperCase();

    if (jobStatus === 'completed' || jobStatus === 'failed') {
      const step = STEP_TO_UI[stepName] ?? 5;
      const decision = jobStatus === 'failed' ? 'failed' : null;
      return { step, total_steps: 6, completed: true, decision };
    }

    const step = STEP_TO_UI[stepName] ?? 1;
    return { step, total_steps: 6, completed: false };
  } catch {
    // Fall back to application status if no processing job exists yet
    try {
      const app = await apiGet<any>(`/api/v1/applications/${applicationId}`);
      const appStatus = (app.status || '').toLowerCase();
      if (appStatus in APP_DONE) {
        const step = APP_DONE[appStatus];
        const completed = appStatus !== 'hitl_queue';
        const decision = completed ? appStatus : null;
        return { step, total_steps: 6, completed, decision };
      }
    } catch { /* ignore */ }
    return { step: 1, total_steps: 6, completed: false };
  }
}

// ── Queue (Credit Officer) ───────────────────────────────────────────────────

export async function getQueue(): Promise<QueueApplicationSummary[]> {
  const data = await apiGet<any[]>('/api/v1/applications');
  return data.map((app) => ({
    id: app.id || app.applicationId,
    applicationId: app.id || app.applicationId,
    company: app.company_name || app.companyName || app.company || 'Unknown',
    companyName: app.company_name || app.companyName || app.company,
    sector: app.sector || 'N/A',
    loanType: app.loan_purpose || app.loanType || 'N/A',
    amount: `€${(parseFloat(app.loan_amount || app.loanAmount || 0)).toLocaleString()}`,
    requestedAmount: parseFloat(app.loan_amount || app.loanAmount || 0),
    loanAmount: parseFloat(app.loan_amount || app.loanAmount || 0),
    status: app.status || 'submitted',
    hitl: app.status === 'hitl_queue',
    hitlReason: app.status === 'hitl_queue' ? 'Awaiting officer review' : undefined,
    riskGrade: app.risk_grade || app.riskGrade || null,
    pd: app.pd != null ? app.pd : null,
    dscr: app.dscr != null ? app.dscr : null,
    recommendation: app.recommendation || null,
    recommendedStatus: app.recommendation || null,
    createdAt: app.created_at || app.createdAt || '',
    decidedAt: app.decidedAt || null,
    officerDecision: null,
    assessment: null,
  }));
}

// ── Submit Decision (Credit Officer) ─────────────────────────────────────────

export async function submitDecision(req: SubmitDecisionRequest): Promise<SubmitDecisionResponse> {
  // Backend route is plural `/decisions` and expects { outcome (lowercase), rationale }.
  const res = await apiPost<any>(`/api/v1/applications/${req.applicationId}/decisions`, {
    outcome: req.decision.toLowerCase(),
    rationale: req.notes,
  });
  return {
    success: true,
    applicationId: req.applicationId,
    decision: req.decision,
    message: res.message || 'Decision submitted',
  };
}

// ── Step advance (no-op in real API — backend handles internally) ────────────

export async function advanceStep(_applicationId: string, _step: number): Promise<void> {
  // No-op — the AWS backend advances steps automatically via its worker
}

// ── Application status polling helper ────────────────────────────────────────

export async function getApplicationStatus(applicationId: string): Promise<ApplicationStatusResponse> {
  return getApplicationDetail(applicationId);
}

export async function submitApplication(
  applicationId: string,
  documents: { name: string; size: number; type: string }[]
): Promise<SubmitApplicationResponse> {
  // This is used by the old flow — delegate to createApplication
  return createApplication({
    companyName: 'Borrower SME Ltd',
    sector: 'Unknown',
    loanAmount: 0,
    loanType: 'WORKING_CAPITAL',
  });
}

// ── Legacy stubs (kept so other pages compile) ───────────────────────────────

export interface UploadResponse {
  id: string;
  borrower: string;
  sector: string;
  requestedAmount: number;
  revenue: number;
  ebitda: number;
  dscr: number;
  accountingPeriod: string;
  documentType: string;
}
export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: any;
  applicationId?: string;
  eventType?: string;
  description?: string;
  actor?: string;
}

export const uploadApplication = async (
  id: string,
  _file: File
): Promise<UploadResponse> => ({
  id,
  borrower: '',
  sector: '',
  requestedAmount: 0,
  revenue: 0,
  ebitda: 0,
  dscr: 0,
  accountingPeriod: '',
  documentType: '',
});
export const analyzeApplication = async (_data: any): Promise<any> => ({});
export const generateApplicationId = () => `FP-${Date.now()}`;
export const getDecisions = async (): Promise<any[]> => [];
export const getAuditTrail = async (): Promise<AuditEntry[]> => [];
export const getReport = async (_appId?: string): Promise<any> => ({});

// ── Re-export types ──────────────────────────────────────────────────────────

export type { AssessmentData as AIAssessmentData };