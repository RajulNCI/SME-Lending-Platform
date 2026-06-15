/**
 * services/AIApi.ts
 *
 * The ONLY file that talks to the backend API.
 * All components import from here — never from mockPythonApi directly.
 *
 * ─── TO SWITCH FROM MOCK TO REAL API ────────────────────────────────────────
 * 1. Set USE_REAL_API = true
 * 2. Set PYTHON_API_BASE_URL to Nathan's endpoint
 * 3. Done — nothing else changes
 * ────────────────────────────────────────────────────────────────────────────
 */

import {
  mockSubmitApplication,
  mockGetStatus,
  mockAdvanceStep,
  mockGetQueue,
  mockSubmitDecision,
  mockGetBorrowerApplications,
  mockGetProgress,
  mockCreateApplication,
  type SubmitApplicationResponse,
  type ApplicationStatusResponse,
  type QueueApplicationSummary,
  type SubmitDecisionRequest,
  type SubmitDecisionResponse,
  type BorrowerApplication,
  type ProgressOut
} from './mockPythonApi';

// ── Config — change these when Nathan's API is deployed ──────────────────────
const USE_REAL_API = false;
const PYTHON_API_BASE_URL = 'http://localhost:8000'; // Nathan's FastAPI endpoint

// ── Assessment data types ────────────────────────────────────────────────────

export interface AssessmentData {
  application_id?: string;
  pd?: number;
  risk_grade?: string;
  ai_score?: number;
  dscr?: number;
  apr?: number;
  affordability?: number;
  lgd?: number;
  ead?: number;
  ecl_12m?: number;
  ifrs9_stage?: number;
  shap_codes?: Array<{ feature: string; direction: string; weight: number }>;
  recommendation?: string;
  model_version?: string;
  narrative?: string;
  // Legacy fields (kept for backward compat)
  revenue?: number;
  revenueActual?: number;
  cashflow?: number;
  riskGrade?: string;
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

// ── Extraction response (from /extract endpoint) ─────────────────────────────

export interface ExtractionResponse {
  filename: string;
  content_type: string | null;
  field_count: number;
  fields: {
    company_name?: string;
    crn?: string;
    sector?: string;
    director_name?: string;
    director_email?: string;
    director_phone?: string;
    eircode?: string;
    years_trading?: string;
    annual_revenue?: number;
    ebitda?: number;
    net_profit?: number;
    total_assets?: number;
    total_liabilities?: number;
    existing_debt?: number;
    loan_amount?: number;
    loan_purpose?: string;
    loan_term_months?: number;
    [key: string]: any;
  };
}

// ── Real API calls ───────────────────────────────────────────────────────────

async function realCreateApplication(data: any) {
  const res = await fetch(`${PYTHON_API_BASE_URL}/api/v1/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo-token',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Submit failed: ${res.statusText}`);
  return res.json();
}

async function realSubmitApplication(
  applicationId: string,
  documents: { name: string; size: number; type: string }[]
): Promise<SubmitApplicationResponse> {
  const form = new FormData();
  form.append('application_id', applicationId);
  form.append('documents_meta', JSON.stringify(documents));
  const res = await fetch(`${PYTHON_API_BASE_URL}/api/v1/applications/submit`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`Submit failed: ${res.statusText}`);
  return res.json();
}

async function realGetStatus(applicationId: string): Promise<ApplicationStatusResponse> {
  const res = await fetch(`${PYTHON_API_BASE_URL}/api/v1/applications/${applicationId}/status`, {
    headers: { 'Authorization': 'Bearer demo-token' },
  });
  if (!res.ok) throw new Error(`Status fetch failed: ${res.statusText}`);
  return res.json();
}

async function realGetProgress(applicationId: string): Promise<ProgressOut> {
  const res = await fetch(`${PYTHON_API_BASE_URL}/api/v1/applications/${applicationId}/progress`, {
    headers: { 'Authorization': 'Bearer demo-token' },
  });
  if (!res.ok) throw new Error(`Progress fetch failed: ${res.statusText}`);
  return res.json();
}

async function realGetBorrowerApplications(): Promise<BorrowerApplication[]> {
  const res = await fetch(`${PYTHON_API_BASE_URL}/api/v1/applications`, {
    headers: { 'Authorization': 'Bearer demo-token' },
  });
  if (!res.ok) throw new Error(`Applications fetch failed: ${res.statusText}`);
  return res.json();
}

async function realGetQueue(): Promise<QueueApplicationSummary[]> {
  const res = await fetch(`${PYTHON_API_BASE_URL}/api/v1/queue`, {
    headers: { 'Authorization': 'Bearer demo-token' },
  });
  if (!res.ok) throw new Error(`Queue fetch failed: ${res.statusText}`);
  return res.json();
}

async function realSubmitDecision(req: SubmitDecisionRequest): Promise<SubmitDecisionResponse> {
  const res = await fetch(
    `${PYTHON_API_BASE_URL}/api/v1/applications/${req.applicationId}/decision`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-token',
      },
      body: JSON.stringify(req),
    }
  );
  if (!res.ok) throw new Error(`Decision submit failed: ${res.statusText}`);
  return res.json();
}

// ── Public API — these are the functions all components use ──────────────────

/**
 * Create a new loan application.
 */
export async function createApplication(data: {
  companyName?: string;
  company_name?: string;
  sector: string;
  loanAmount?: number;
  loan_amount?: number;
  loanType?: string;
  loan_purpose?: string;
  requestedBy?: string;
  files?: File[];
}): Promise<any> {
  // Normalize to snake_case for Nathan's API
  const normalized = {
    company_name: data.company_name || data.companyName || 'Borrower SME Ltd',
    sector: data.sector || 'Technology',
    loan_amount: data.loan_amount || data.loanAmount || 0,
    loan_purpose: data.loan_purpose || data.loanType || 'Working Capital',
  };
  return USE_REAL_API ? realCreateApplication(normalized) : mockCreateApplication(normalized);
}

/**
 * Get application progress (for polling in the borrower flow).
 */
export async function getProgress(applicationId: string): Promise<ProgressOut> {
  return USE_REAL_API ? realGetProgress(applicationId) : mockGetProgress(applicationId);
}

/**
 * Get all applications for the current borrower.
 */
export async function getBorrowerApplications(): Promise<BorrowerApplication[]> {
  return USE_REAL_API ? realGetBorrowerApplications() : mockGetBorrowerApplications();
}

/**
 * Called when borrower submits documents.
 */
export async function submitApplication(
  applicationId: string,
  documents: { name: string; size: number; type: string }[]
): Promise<SubmitApplicationResponse> {
  return USE_REAL_API
    ? realSubmitApplication(applicationId, documents)
    : mockSubmitApplication(applicationId, documents);
}

/**
 * Poll this every 1s to get current pipeline step status.
 */
export async function getApplicationStatus(
  applicationId: string
): Promise<ApplicationStatusResponse> {
  return USE_REAL_API ? realGetStatus(applicationId) : mockGetStatus(applicationId);
}

/**
 * Called by the borrower pipeline to advance steps in mock mode.
 * No-op in real mode — Nathan's pipeline advances automatically.
 */
export async function advanceStep(applicationId: string, step: number): Promise<void> {
  if (!USE_REAL_API) {
    await mockAdvanceStep(applicationId, step);
  }
}

/**
 * Called by QueuePage to load all applications for the credit officer.
 */
export async function getQueue(): Promise<QueueApplicationSummary[]> {
  return USE_REAL_API ? realGetQueue() : mockGetQueue();
}

/**
 * Called by DecisionGate when credit officer submits approve/refer/decline.
 */
export async function submitDecision(req: SubmitDecisionRequest): Promise<SubmitDecisionResponse> {
  return USE_REAL_API ? realSubmitDecision(req) : mockSubmitDecision(req);
}

// ── NEW: Document Extraction (Engine 1 — IDP) ───────────────────────────────

/**
 * Upload a financial document and get extracted FinPal fields back as JSON.
 * Used to auto-populate the application form before the borrower submits.
 *
 * POST /api/v1/extract — multipart/form-data with file
 */
export async function extractDocument(file: File): Promise<ExtractionResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${PYTHON_API_BASE_URL}/api/v1/extract`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer demo-token' },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Extraction failed: ${res.statusText}`);
  }
  return res.json();
}

// ── NEW: Stateless AI Assessment (Engine 2) ──────────────────────────────────

/**
 * Run a stateless AI credit assessment.
 * POST /api/v1/assess — JSON fields in, assessment JSON out.
 */
export async function assessApplication(data: {
  sector: string;
  annual_revenue: number;
  net_profit?: number;
  ebitda?: number;
  total_assets?: number;
  total_liabilities?: number;
  existing_debt?: number;
  loan_amount: number;
  loan_term_months?: number;
  loan_purpose?: string;
  has_collateral?: boolean;
  reference?: string;
}): Promise<AssessmentData> {
  const res = await fetch(`${PYTHON_API_BASE_URL}/api/v1/assess`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo-token',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Assessment failed: ${res.statusText}`);
  }
  return res.json();
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

// ── Legacy assessment fetch (for queue enrichment) ───────────────────────────

export async function getAssessment(id: string): Promise<AssessmentData> {
  if (!USE_REAL_API) {
    // Mock — return empty assessment
    return {} as AssessmentData;
  }
  const res = await fetch(`${PYTHON_API_BASE_URL}/api/v1/applications/${id}/assess`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo-token',
    },
  });
  if (!res.ok) throw new Error(`Assessment fetch failed: ${res.statusText}`);
  return res.json();
}

// ── Re-export types ──────────────────────────────────────────────────────────

export type { AssessmentData as AIAssessmentData };
export type {
  SubmitApplicationResponse,
  ApplicationStatusResponse,
  QueueApplicationSummary,
  SubmitDecisionRequest,
  SubmitDecisionResponse,
  BorrowerApplication,
  ProgressOut,
};
