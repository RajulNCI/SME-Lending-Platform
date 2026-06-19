/**
 * types/auth.ts
 *
 * Authentication types for LOCAL DEMO MODE.
 * TODO: Replace with AWS Cognito types for production.
 */

// ── Roles ────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'BORROWER'
  | 'CREDIT_OFFICER'
  | 'SENIOR_CREDIT_OFFICER'
  | 'RISK_ANALYST'
  | 'COMPLIANCE_OFFICER'
  | 'BRANCH_MANAGER'
  | 'ADMIN'
  | 'AUDITOR';

// Keep the old lowercase roles as aliases for backward compat in guards
export type LegacyRole =
  | 'credit_officer'
  | 'risk_manager'
  | 'compliance_officer'
  | 'ops_manager'
  | 'it_admin'
  | 'mrm_analyst'
  | 'collections_officer'
  | 'borrower_sme';

// Map legacy roles → new roles (used by RoleGuard)
export const LEGACY_TO_COGNITO: Record<LegacyRole, UserRole> = {
  credit_officer: 'CREDIT_OFFICER',
  risk_manager: 'RISK_ANALYST',
  compliance_officer: 'COMPLIANCE_OFFICER',
  ops_manager: 'BRANCH_MANAGER',
  it_admin: 'ADMIN',
  mrm_analyst: 'RISK_ANALYST',
  collections_officer: 'BRANCH_MANAGER',
  borrower_sme: 'BORROWER',
};

// ── Auth user — stored in sessionStorage ─────────────────────────────────────

export interface AuthUser {
  email: string;
  username: string;
  role: UserRole;
  displayName: string;
  roleLabel: string;
  badge: string;
}

// ── API request/response shapes ──────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
  display_name: string;
  expires_in: number;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface SignupResponse {
  message: string;
  userId?: string;
}

// ── Role display labels ──────────────────────────────────────────────────────

export const ROLE_LABELS: Record<UserRole, string> = {
  BORROWER: 'SME Borrower',
  CREDIT_OFFICER: 'Credit Officer',
  SENIOR_CREDIT_OFFICER: 'Senior Credit Officer',
  RISK_ANALYST: 'Risk Analyst',
  COMPLIANCE_OFFICER: 'Compliance Officer',
  BRANCH_MANAGER: 'Branch Manager',
  ADMIN: 'Administrator',
  AUDITOR: 'Auditor',
};

export const ROLE_BADGES: Record<UserRole, string> = {
  BORROWER: 'SME',
  CREDIT_OFFICER: 'CO',
  SENIOR_CREDIT_OFFICER: 'SCO',
  RISK_ANALYST: 'RA',
  COMPLIANCE_OFFICER: 'CMP',
  BRANCH_MANAGER: 'BM',
  ADMIN: 'ADM',
  AUDITOR: 'AUD',
};

// ── Route mapping per role ───────────────────────────────────────────────────

export const ROLE_HOME: Record<UserRole, string> = {
  BORROWER: '/borrower',
  CREDIT_OFFICER: '/queue',
  SENIOR_CREDIT_OFFICER: '/queue',
  RISK_ANALYST: '/risk',
  COMPLIANCE_OFFICER: '/audit',
  BRANCH_MANAGER: '/dashboard',
  ADMIN: '/admin/users',
  AUDITOR: '/audit',
};

// ── JWT decode helper (kept for backward compat, not used in demo mode) ──────

export function decodeJwt(token: string): Record<string, any> {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return {};
  }
}

// ── Demo users (for reference — actual auth is handled by backend) ───────────

export const DEMO_USERS: Record<string, { email: string; password: string; role: string }> = {
  borrower: { email: 'borrower@company.ie', password: 'demo', role: 'SME Borrower' },
  officer: { email: 'officer@finpal.ie', password: 'demo', role: 'Credit Officer' },
};

// Legacy exports (kept for backward compat)
export const USERS: Record<string, AuthUser> = {};
export const PASSWORDS: Record<string, string> = {};
