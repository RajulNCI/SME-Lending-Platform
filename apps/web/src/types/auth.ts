/**
 * types/auth.ts
 *
 * Authentication types for demo mode.
 * Roles use lowercase snake_case to match Nathan's backend user groups.
 */

// ── Roles ────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'credit_officer'
  | 'risk_manager'
  | 'compliance_officer'
  | 'ops_manager'
  | 'it_admin'
  | 'mrm_analyst'
  | 'collections_officer'
  | 'borrower_sme';

// ── Auth user — stored in sessionStorage ─────────────────────────────────────

export interface AuthUser {
  username: string;
  role: UserRole;
  displayName: string;
  roleLabel: string;
  badge: string;
}

// ── Demo users ───────────────────────────────────────────────────────────────

export const USERS: Record<string, AuthUser> = {
  'credit.officer': {
    username: 'credit.officer',
    role: 'credit_officer',
    displayName: 'Jane Smith',
    roleLabel: 'Credit Officer',
    badge: 'CO',
  },
  'risk.manager': {
    username: 'risk.manager',
    role: 'risk_manager',
    displayName: 'Liam Murphy',
    roleLabel: 'Risk Manager',
    badge: 'RM',
  },
  'compliance.officer': {
    username: 'compliance.officer',
    role: 'compliance_officer',
    displayName: 'Aoife Kelly',
    roleLabel: 'Compliance Officer',
    badge: 'CO',
  },
  'ops.manager': {
    username: 'ops.manager',
    role: 'ops_manager',
    displayName: "Sean O'Brien",
    roleLabel: 'Operations Manager',
    badge: 'OM',
  },
  'it.admin': {
    username: 'it.admin',
    role: 'it_admin',
    displayName: 'Ciara Walsh',
    roleLabel: 'IT Administrator',
    badge: 'IT',
  },
  'mrm.analyst': {
    username: 'mrm.analyst',
    role: 'mrm_analyst',
    displayName: 'Niall Byrne',
    roleLabel: 'MRM Analyst',
    badge: 'MRM',
  },
  'collections.officer': {
    username: 'collections.officer',
    role: 'collections_officer',
    displayName: 'Roisin Doyle',
    roleLabel: 'Collections Officer',
    badge: 'COL',
  },
  'borrower.sme': {
    username: 'borrower.sme',
    role: 'borrower_sme',
    displayName: 'Acme Ltd',
    roleLabel: 'SME Borrower',
    badge: 'SME',
  },
};

export const PASSWORDS: Record<string, string> = {
  'credit.officer': 'FinPal@CO1',
  'risk.manager': 'FinPal@RM2',
  'compliance.officer': 'FinPal@CMP3',
  'ops.manager': 'FinPal@OPS4',
  'it.admin': 'FinPal@ITA5',
  'mrm.analyst': 'FinPal@MRM6',
  'collections.officer': 'FinPal@COL7',
  'borrower.sme': 'FinPal@SME8',
};

// ── Role display helpers ─────────────────────────────────────────────────────

export const ROLE_LABELS: Record<UserRole, string> = {
  credit_officer: 'Credit Officer',
  risk_manager: 'Risk Manager',
  compliance_officer: 'Compliance Officer',
  ops_manager: 'Operations Manager',
  it_admin: 'IT Administrator',
  mrm_analyst: 'MRM Analyst',
  collections_officer: 'Collections Officer',
  borrower_sme: 'SME Borrower',
};

export const ROLE_BADGES: Record<UserRole, string> = {
  credit_officer: 'CO',
  risk_manager: 'RM',
  compliance_officer: 'CMP',
  ops_manager: 'OM',
  it_admin: 'ADM',
  mrm_analyst: 'MRM',
  collections_officer: 'COL',
  borrower_sme: 'SME',
};

// ── Route mapping per role ───────────────────────────────────────────────────

export const ROLE_HOME: Record<UserRole, string> = {
  credit_officer: '/queue',
  risk_manager: '/risk',
  compliance_officer: '/audit',
  ops_manager: '/dashboard',
  it_admin: '/admin/users',
  mrm_analyst: '/mrm',
  collections_officer: '/collections',
  borrower_sme: '/borrower',
};
