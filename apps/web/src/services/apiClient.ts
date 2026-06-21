/**
 * services/apiClient.ts
 *
 * Centralized HTTP client for the FinPal AWS API Gateway backend.
 * - Automatic JWT injection from sessionStorage
 * - 401 → redirect to /login
 * - Typed request helpers
 */

// Empty base in both dev and prod:
//   Dev  → Vite proxy (vite.config.ts) rewrites /api/* to AWS
//   Prod → Vercel rewrite (vercel.json) proxies /api/* to AWS
// Both keep requests same-origin, avoiding CORS entirely.
const API_BASE = '';

// ── Token helpers ────────────────────────────────────────────────────────────

// In-memory token — set on login, cleared on logout (supports both Cognito JWTs and demo tokens)
let _memoryToken: string | null = null;

export function setAuthToken(token: string): void {
  _memoryToken = token;
}

export function getStoredAuth(): { token: string; user: any } | null {
  try {
    const raw = sessionStorage.getItem('finpal_auth');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return _memoryToken ?? getStoredAuth()?.token ?? null;
}

export function clearAuth(): void {
  sessionStorage.removeItem('finpal_auth');
  _memoryToken = null;
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { skipContentType?: boolean }
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options?.skipContentType ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // Session expired or invalid token
  if (res.status === 401) {
    clearAuth();
    window.location.href = '/login';
    throw new Error('Session expired — please log in again');
  }

  // Forbidden
  if (res.status === 403) {
    throw new Error('You do not have permission to access this resource');
  }

  // Validation errors
  if (res.status === 422) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.message || 'Validation error');
  }

  // Other errors
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.message || `API error: ${res.status}`);
  }

  // Handle empty responses (204 No Content, etc.)
  const text = await res.text();
  if (!text) return {} as T;

  return JSON.parse(text) as T;
}

// ── Convenience methods ──────────────────────────────────────────────────────

export async function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: 'GET' });
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * POST multipart/form-data (for file uploads).
 * Does NOT set Content-Type — let the browser set it with boundary.
 */
export async function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: formData,
    skipContentType: true,
  });
}
