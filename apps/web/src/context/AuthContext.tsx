/**
 * context/AuthContext.tsx
 *
 * Authentication context — Cognito (production) with demo fallback.
 *
 * When VITE_COGNITO_USER_POOL_ID is set:
 *   - Login calls AWS Cognito via amazon-cognito-identity-js (SRP flow)
 *   - The Cognito IdToken is stored and sent as Bearer on every API request
 *   - Session is restored on page reload from Cognito's local storage
 *
 * When VITE_COGNITO_USER_POOL_ID is NOT set (local dev without AWS):
 *   - Falls back to the demo /api/v1/auth/login endpoint
 *   - Demo credentials: borrower@company.ie / demo  or  officer@finpal.ie / demo
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiFetch, clearAuth, setAuthToken } from '../services/apiClient';
import { ROLE_LABELS, ROLE_BADGES } from '../types/auth';
import type { AuthUser, UserRole } from '../types/auth';
import { cognitoLogin, cognitoLogout, getCognitoSession } from '../services/cognitoAuth';

// ── Cognito group → internal role ─────────────────────────────────────────────

const GROUP_TO_ROLE: Record<string, UserRole> = {
  Borrower:           'BORROWER',
  CreditOfficer:      'CREDIT_OFFICER',
  RiskManager:        'RISK_ANALYST',
  ComplianceOfficer:  'COMPLIANCE_OFFICER',
  MRMAnalyst:         'RISK_ANALYST',
  OpsManager:         'BRANCH_MANAGER',
  CollectionsOfficer: 'BRANCH_MANAGER',
  Admin:              'ADMIN',
};

// Demo backend role → frontend role (fallback mode)
const BACKEND_TO_FRONTEND_ROLE: Record<string, UserRole> = {
  borrower_sme:        'BORROWER',
  credit_officer:      'CREDIT_OFFICER',
  risk_manager:        'RISK_ANALYST',
  compliance_officer:  'COMPLIANCE_OFFICER',
  ops_manager:         'BRANCH_MANAGER',
  it_admin:            'ADMIN',
  mrm_analyst:         'RISK_ANALYST',
  collections_officer: 'BRANCH_MANAGER',
};

const COGNITO_ENABLED = Boolean(import.meta.env.VITE_COGNITO_USER_POOL_ID);

// ── Context types ─────────────────────────────────────────────────────────────

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  loading: false,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupsToRole(groups: string[]): UserRole {
  for (const g of groups) {
    if (g in GROUP_TO_ROLE) return GROUP_TO_ROLE[g];
  }
  return 'BORROWER';
}

function makeAuthUser(email: string, displayName: string, role: UserRole): AuthUser {
  return {
    email,
    username: email,
    role,
    displayName,
    roleLabel: ROLE_LABELS[role] || role,
    badge: ROLE_BADGES[role] || role.slice(0, 2),
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true); // true until session checked

  // Restore session on mount
  useEffect(() => {
    (async () => {
      if (COGNITO_ENABLED) {
        try {
          const session = await getCognitoSession();
          if (session) {
            setAuthToken(session.idToken);
            const role = groupsToRole(session.groups);
            setUser(makeAuthUser(session.email, session.displayName, role));
          }
        } catch {
          // No valid session — stay logged out
        }
      } else {
        // Demo mode: restore from sessionStorage
        try {
          const raw = sessionStorage.getItem('finpal_auth');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.user) {
              setAuthToken(parsed.token);
              setUser(parsed.user);
            }
          }
        } catch {
          // Ignore corrupt storage
        }
      }
      setLoading(false);
    })();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      if (COGNITO_ENABLED) {
        const session = await cognitoLogin(email, password);
        setAuthToken(session.idToken);
        const role = groupsToRole(session.groups);
        setUser(makeAuthUser(session.email, session.displayName, role));
        return true;
      }

      // Demo fallback
      const res = await apiFetch<any>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: email, password }),
      });
      const token = res.access_token || res.token || '';
      if (!token) return false;

      const backendRole = res.role || 'borrower_sme';
      const role = BACKEND_TO_FRONTEND_ROLE[backendRole] || 'BORROWER';
      const authUser = makeAuthUser(email, res.display_name || email, role);

      setAuthToken(token);
      sessionStorage.setItem('finpal_auth', JSON.stringify({ token, user: authUser }));
      setUser(authUser);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    if (COGNITO_ENABLED) cognitoLogout();
    setUser(null);
    clearAuth();
    sessionStorage.removeItem('finpal_auth');
    sessionStorage.removeItem('finpal_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
