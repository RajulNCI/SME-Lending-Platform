/**
 * Nathan's AI Agent API — https://finpals-prototype.vercel.app
 * 
 * Endpoints:
 *   POST /api/v1/uploads              — upload documents + form data
 *   POST /api/v1/decisions/analyze    — trigger AI credit analysis
 *   POST /api/v1/decisions            — submit HITL decision
 *   GET  /api/v1/decisions            — list all decisions
 *   GET  /api/v1/reports/{applicationId} — get full report
 *   GET  /api/v1/audit                — audit trail
 *   GET  /api/v1/health               — health check
 */

const NATHAN_BASE_URL = 'https://finpals-prototype.vercel.app';

// ── Types matching Nathan's API ───────────────────────────────────────────────

export interface UploadPayload {
  applicationId: string;
  borrower: string;
  requestedAmount: number;
  sector: string;
  documentType: string;
  accountingPeriod: string;
  revenue: number;
  ebitda: number;
  dscr: number;
  notes?: string;
}

export interface AnalyzePayload {
  applicationId: string;
  borrower: string;
  requestedAmount: number;
  revenue: number;
  ebitda: number;
  dscr: number;
}

export interface DecisionPayload {
  applicationId: string;
  outcome: 'approved' | 'declined' | 'referred';
  rationale: string;
  officerName: string;
}

export interface AIDecisionResult {
  applicationId: string;
  borrower?: string;
  recommendation?: string;
  riskGrade?: string;
  pd?: number;
  score?: number;
  reasoning?: string;
  shapCodes?: Array<{ factor: string; direction: string; weight: number; note?: string }>;
  createdAt?: string;
  [key: string]: unknown;
}

export interface AuditEntry {
  id?: string;
  applicationId?: string;
  eventType?: string;
  description?: string;
  timestamp?: string;
  actor?: string;
  [key: string]: unknown;
}

// ── API client ────────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${NATHAN_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Nathan API ${path} failed (${res.status}): ${text}`);
  }

  return res.json();
}

// ── Exported API calls ─────────────────────────────────────────────────────────

/** Step 1 — upload form data + documents to Nathan's backend */
export async function uploadApplication(
  payload: UploadPayload,
  files: File[]
): Promise<{ applicationId: string; status: string; [key: string]: unknown }> {
  // Nathan's upload endpoint accepts multipart OR JSON depending on implementation
  // Try JSON first; if he wants multipart, swap to FormData
  const formData = new FormData();
  formData.append('data', JSON.stringify(payload));
  files.forEach((f) => formData.append('documents', f, f.name));

  const res = await fetch(`${NATHAN_BASE_URL}/api/v1/uploads`, {
    method: 'POST',
    body: formData,
    // No Content-Type header — browser sets multipart boundary automatically
  });

  if (!res.ok) {
    // Fallback: try JSON only (if Nathan's endpoint doesn't support multipart yet)
    return request('/api/v1/uploads', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  return res.json();
}

/** Step 2 — trigger AI credit analysis */
export async function analyzeApplication(
  payload: AnalyzePayload
): Promise<AIDecisionResult> {
  return request('/api/v1/decisions/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Submit HITL decision (Credit Officer approve/decline/refer) */
export async function submitDecision(
  payload: DecisionPayload
): Promise<{ id: string; status: string; [key: string]: unknown }> {
  return request('/api/v1/decisions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Get all decisions */
export async function getDecisions(): Promise<AIDecisionResult[]> {
  return request('/api/v1/decisions');
}

/** Get full AI report for an application */
export async function getReport(applicationId: string): Promise<AIDecisionResult> {
  return request(`/api/v1/reports/${applicationId}`);
}

/** Get audit trail */
export async function getAuditTrail(): Promise<AuditEntry[]> {
  return request('/api/v1/audit');
}

/** Health check */
export async function checkHealth(): Promise<{ status: string }> {
  return request('/api/v1/health');
}

/** Generate application ID in Nathan's expected format */
export function generateApplicationId(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 900) + 100).padStart(3, '0');
  return `FIN-${year}-${num}`;
}
