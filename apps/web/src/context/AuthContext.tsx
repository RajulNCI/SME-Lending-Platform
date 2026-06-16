/**
 * context/AuthContext.tsx
 *
 * Authentication context — calls the real AWS Cognito login endpoint.
 * Stores JWT token + user info in sessionStorage.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiFetch, clearAuth } from '../services/apiClient';
import { decodeJwt, ROLE_LABELS, ROLE_BADGES } from '../types/auth';
import type { AuthUser, UserRole, LoginResponse, SignupRequest, SignupResponse } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupRequest) => Promise<{ ok: boolean; message: string }>;
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
      const res = await apiFetch<any>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // The backend may return tokens in various shapes.
      // Common patterns: { idToken, accessToken } or { IdToken, AccessToken } or { token }
      const idToken = res.idToken || res.IdToken || res.id_token || res.token || '';
      const accessToken = res.accessToken || res.AccessToken || res.access_token || idToken;

      if (!idToken) {
        console.error('Login response missing token:', res);
        return false;
      }

      // Decode the JWT to extract user info
      const payload = decodeJwt(idToken);
      const groups: string[] = payload['cognito:groups'] || [];
      const role = (groups[0] || 'BORROWER') as UserRole;

      const authUser: AuthUser = {
        email: payload.email || email,
        username: payload.sub || payload['cognito:username'] || email,
        role,
        displayName: payload.name || payload.email || email,
        roleLabel: ROLE_LABELS[role] || role,
        badge: ROLE_BADGES[role] || role.slice(0, 2),
      };

      // Persist to sessionStorage
      sessionStorage.setItem(
        'finpal_auth',
        JSON.stringify({
          token: idToken,
          accessToken,
          refreshToken: res.refreshToken || res.RefreshToken || '',
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

  // ── Signup ───────────────────────────────────────────────────────────────
  const signup = useCallback(async (data: SignupRequest): Promise<{ ok: boolean; message: string }> => {
    setLoading(true);
    try {
      const res = await apiFetch<any>('/api/v1/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return { ok: true, message: res.message || 'Account created successfully' };
    } catch (err: any) {
      return { ok: false, message: err.message || 'Signup failed' };
    } finally {
      setLoading(false);
    }
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
