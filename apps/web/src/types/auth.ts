export type UserRole = 'admin' | 'user';

export interface LoginFormData {
  email: string;
  password: string;
  role: UserRole;
  rememberMe: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  role: UserRole;
  acceptTerms: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyName?: string;
  token: string;
}
