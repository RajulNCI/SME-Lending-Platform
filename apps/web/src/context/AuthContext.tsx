import React, { createContext, useContext, useState, useCallback } from 'react';
import { AuthUser, USERS, PASSWORDS } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const s = sessionStorage.getItem('finpal_user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const login = useCallback((username: string, password: string): boolean => {
    const u = USERS[username];
    if (!u) return false;
    if (PASSWORDS[username] !== password) return false;
    setUser(u);
    sessionStorage.setItem('finpal_user', JSON.stringify(u));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('finpal_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
