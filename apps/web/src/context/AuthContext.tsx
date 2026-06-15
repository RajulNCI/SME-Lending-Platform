/**
 * context/AuthContext.tsx
 *
 * Demo-mode authentication context.
 * Validates credentials against the local USERS + PASSWORDS dictionaries.
 * Stores the logged-in user in sessionStorage for persistence across refreshes.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { USERS, PASSWORDS } from '../types/auth';
import type { AuthUser } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
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
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Small delay to simulate network
      await new Promise((r) => setTimeout(r, 300));

      const demoUser = USERS[username];
      const expectedPw = PASSWORDS[username];

      if (!demoUser || password !== expectedPw) {
        return false;
      }

      // Persist to sessionStorage
      sessionStorage.setItem(
        'finpal_auth',
        JSON.stringify({ user: demoUser })
      );

      setUser(demoUser);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('finpal_auth');
    sessionStorage.removeItem('finpal_user'); // legacy cleanup
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
