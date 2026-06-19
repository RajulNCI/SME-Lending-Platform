/**
 * context/AuthContext.tsx
 *
 * Authentication context — LOCAL DEMO MODE.
 * Calls the local FastAPI /api/v1/auth/login endpoint which returns a simple
 * demo token + user info (no JWT, no Cognito).
 *
 * TODO: Replace with AWS Cognito integration for production.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiFetch, clearAuth } from '../services/apiClient';
import { ROLE_LABELS, ROLE_BADGES } from '../types/auth';
import type { AuthUser, UserRole } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: any) => Promise<{ ok: boolean; message: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  signup: async () => ({ ok: false, message: '' }),
  logout: () => {},
  loading: false,
});

// ── Role mapping: backend role → frontend role ──────────────────────────────

const BACKEND_TO_FRONTEND_ROLE: Record<string, UserRole> = {
  borrower_sme: 'BORROWER',
  credit_officer: 'CREDIT_OFFICER',
  risk_manager: 'RISK_ANALYST',
  compliance_officer: 'COMPLIANCE_OFFICER',
  ops_manager: 'BRANCH_MANAGER',
  it_admin: 'ADMIN',
  mrm_analyst: 'RISK_ANALYST',
  collections_officer: 'BRANCH_MANAGER',
};

// ── Restore session from storage ─────────────────────────────────────────────
function restoreUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem('finpal_auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.user ?? null;
  } catch {
    return null;
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(restoreUser);
  const [loading, setLoading] = useState(false);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Call the local demo auth endpoint
      const res = await apiFetch<any>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: email, password }),
      });

      // The demo backend returns: { access_token, role, display_name, ... }
      const token = res.access_token || res.token || '';
      if (!token) {
        console.error('Login response missing token:', res);
        return false;
      }

      // Map backend role (e.g. "borrower_sme") → frontend role (e.g. "BORROWER")
      const backendRole = res.role || 'borrower_sme';
      const role = BACKEND_TO_FRONTEND_ROLE[backendRole] || 'BORROWER';

      const authUser: AuthUser = {
        email: email,
        username: email,
        role,
        displayName: res.display_name || email,
        roleLabel: ROLE_LABELS[role] || role,
        badge: ROLE_BADGES[role] || role.slice(0, 2),
      };

      // Persist to sessionStorage
      sessionStorage.setItem(
        'finpal_auth',
        JSON.stringify({
          token,
          user: authUser,
        })
      );

      setUser(authUser);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Signup (stub for demo) ──────────────────────────────────────────────
  const signup = useCallback(async (_data: any): Promise<{ ok: boolean; message: string }> => {
    return { ok: false, message: 'Signup is disabled in demo mode. Use the demo credentials.' };
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    clearAuth();
    sessionStorage.removeItem('finpal_user'); // legacy cleanup
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
