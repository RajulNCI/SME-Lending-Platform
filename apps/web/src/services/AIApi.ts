/**
 * services/nathanApi.ts
 *
 * The ONLY file that talks to Nathan's Python backend.
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

// ── Config — change these when Nathan's API is ready ─────────────────────────
const USE_REAL_API = false;
const PYTHON_API_BASE_URL = 'http://localhost:8000'; // Nathan's FastAPI endpoint

// ── Real API calls (filled in when Nathan is ready) ──────────────────────────

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
  const res = await fetch(`${PYTHON_API_BASE_URL}/api/v1/applications/${applicationId}/status`);
  if (!res.ok) throw new Error(`Status fetch failed: ${res.statusText}`);
  return res.json();
}

async function realGetQueue(): Promise<QueueApplicationSummary[]> {
  const res = await fetch(`${PYTHON_API_BASE_URL}/api/v1/queue`);
  if (!res.ok) throw new Error(`Queue fetch failed: ${res.statusText}`);
  return res.json();
}

async function realSubmitDecision(req: SubmitDecisionRequest): Promise<SubmitDecisionResponse> {
  const res = await fetch(
    `${PYTHON_API_BASE_URL}/api/v1/applications/${req.applicationId}/decision`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    }
  );
  if (!res.ok) throw new Error(`Decision submit failed: ${res.statusText}`);
  return res.json();
}

// ── Public API — these are the functions all components use ──────────────────

// ── New API calls for Borrower Flow ──────────────────────────────────────────

async function realCreateApplication(data: any) {
  const res = await fetch(`${PYTHON_API_BASE_URL}/api/v1/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer dummy-token'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Submit failed: ${res.statusText}`);
  return res.json();
}

async function realGetProgress(applicationId: string): Promise<ProgressOut> {
  const res = await fetch(`${PYTHON_API_BASE_URL}/api/v1/applications/${applicationId}/progress`, {
    headers: { 'Authorization': 'Bearer dummy-token' }
  });
  if (!res.ok) throw new Error(`Progress fetch failed: ${res.statusText}`);
  return res.json();
}

async function realGetBorrowerApplications(): Promise<BorrowerApplication[]> {
  const res = await fetch(`${PYTHON_API_BASE_URL}/api/v1/applications`, {
    headers: { 'Authorization': 'Bearer dummy-token' }
  });
  if (!res.ok) throw new Error(`Applications fetch failed: ${res.statusText}`);
  return res.json();
}

export async function createApplication(data: any) {
  return USE_REAL_API ? realCreateApplication(data) : mockCreateApplication(data);
}

export async function getProgress(applicationId: string): Promise<ProgressOut> {
  return USE_REAL_API ? realGetProgress(applicationId) : mockGetProgress(applicationId);
}

export async function getBorrowerApplications(): Promise<BorrowerApplication[]> {
  return USE_REAL_API ? realGetBorrowerApplications() : mockGetBorrowerApplications();
}

export type { BorrowerApplication, ProgressOut };

// --- LEGACY STUBS FOR UNUSED PAGES TO PASS TSC ---
export interface UploadResponse { id: string; borrower: string; sector: string; requestedAmount: number; revenue: number; ebitda: number; dscr: number; accountingPeriod: string; documentType: string; }
export interface AuditEntry { id: string; timestamp: string; user: string; action: string; details: any; applicationId?: string; eventType?: string; description?: string; actor?: string; }
export const uploadApplication = async (id: string, file: File): Promise<UploadResponse> => ({ id, borrower: '', sector: '', requestedAmount: 0, revenue: 0, ebitda: 0, dscr: 0, accountingPeriod: '', documentType: '' });
export const analyzeApplication = async (data: any): Promise<any> => ({});
export const generateApplicationId = () => `FP-${Date.now()}`;
export const getDecisions = async (): Promise<any[]> => [];
export const getAuditTrail = async (): Promise<AuditEntry[]> => [];
export const getReport = async (appId?: string): Promise<any> => ({});



/**
 * Called when borrower submits documents.
 * Creates the application record in Nathan's backend.
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
 * Returns step array + assessment (once AI completes) + officerDecision.
 */
export async function getApplicationStatus(
  applicationId: string
): Promise<ApplicationStatusResponse> {
  return USE_REAL_API ? realGetStatus(applicationId) : mockGetStatus(applicationId);
}

/**
 * Called by the borrower pipeline to advance steps in mock mode.
 * Remove this call when real API is used — Nathan's backend advances steps internally.
 */
export async function advanceStep(applicationId: string, step: number): Promise<void> {
  if (!USE_REAL_API) {
    await mockAdvanceStep(applicationId, step);
  }
  // No-op in real mode — Nathan's pipeline advances automatically
}

/**
 * Called by QueuePage to load all applications for the credit officer.
 * Returns live counts — not static mock counts.
 */
export async function getQueue(): Promise<QueueApplicationSummary[]> {
  return USE_REAL_API ? realGetQueue() : mockGetQueue();
}

/**
 * Called by DecisionGate when credit officer submits approve/refer/decline.
 * Logs immutably per EU AI Act Art.12.
 */
export async function submitDecision(req: SubmitDecisionRequest): Promise<SubmitDecisionResponse> {
  return USE_REAL_API ? realSubmitDecision(req) : mockSubmitDecision(req);
}

// Re-export types so components only need to import from nathanApi
export type {
  SubmitApplicationResponse,
  ApplicationStatusResponse,
  QueueApplicationSummary,
  SubmitDecisionRequest,
  SubmitDecisionResponse,
};
