/**
 * nathanApi.ts — updated to match Nathan's confirmed field names exactly
 *
 * Upload response shape (confirmed by Nathan):
 * {
 *   applicationId, borrower, sector, revenue, ebitda, dscr,
 *   requestedAmount, accountingPeriod, documentType, id, createdAt
 * }
 */

const IS_DEV = import.meta.env.DEV;

const NATHAN_BASE = IS_DEV
  ? '/ai-api' // Vite proxy — change 'ai-api' to whatever you named it in vite.config.ts
  : 'https://finpals-prototype.vercel.app';

// ── Confirmed response shape from Nathan ────────────────────────────────────
export interface UploadResponse {
  applicationId: string;
  borrower: string;
  sector: string;
  revenue: number;
  ebitda: number;
  dscr: number;
  requestedAmount: number;
  accountingPeriod: string;
  documentType: string;
  id: string; // Nathan's internal upload ID e.g. "UP-..."
  createdAt: string; // ISO timestamp
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
  dscr?: number;
  score?: number;
  reasoning?: string;
  shapCodes?: Array<{
    factor: string;
    direction: 'positive' | 'negative';
    weight: number;
    note?: string;
  }>;
  modelVersion?: string;
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

// ── Base request helper ─────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${NATHAN_BASE}${path}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[${res.status}] ${path}: ${text}`);
  }
  return res.json();
}

// ── POST /api/v1/uploads ────────────────────────────────────────────────────
// Send as multipart/form-data (Nathan confirmed this is supported)
// Returns confirmed UploadResponse shape
export async function uploadApplication(
  applicationId: string,
  file: File | null
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('applicationId', applicationId);
  if (file) {
    formData.append('file', file, file.name);
  }
  // No Content-Type header — browser sets multipart boundary automatically
  const res = await fetch(`${NATHAN_BASE}/api/v1/uploads`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[${res.status}] /api/v1/uploads: ${text}`);
  }
  return res.json();
}

// ── POST /api/v1/decisions/analyze ─────────────────────────────────────────
export async function analyzeApplication(payload: AnalyzePayload): Promise<AIDecisionResult> {
  return request('/api/v1/decisions/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// ── POST /api/v1/decisions ─────────────────────────────────────────────────
export async function submitDecision(
  payload: DecisionPayload
): Promise<{ id: string; status: string; [key: string]: unknown }> {
  return request('/api/v1/decisions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// ── GET /api/v1/decisions ──────────────────────────────────────────────────
export async function getDecisions(): Promise<AIDecisionResult[]> {
  return request('/api/v1/decisions');
}

// ── GET /api/v1/reports/{applicationId} ────────────────────────────────────
export async function getReport(applicationId: string): Promise<AIDecisionResult> {
  return request(`/api/v1/reports/${applicationId}`);
}

// ── GET /api/v1/audit ─────────────────────────────────────────────────────
export async function getAuditTrail(): Promise<AuditEntry[]> {
  return request('/api/v1/audit');
}

// ── GET /api/v1/health ────────────────────────────────────────────────────
export async function checkHealth(): Promise<{ status: string }> {
  return request('/api/v1/health');
}

// ── Utility ───────────────────────────────────────────────────────────────
export function generateApplicationId(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 900) + 100).padStart(3, '0');
  return `FIN-${year}-${num}`;
}
