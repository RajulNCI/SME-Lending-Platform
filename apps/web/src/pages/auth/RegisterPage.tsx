import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { RegisterFormData, UserRole } from '../../types/auth';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Layout ──────────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[4]};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  padding: ${({ theme }) => theme.spacing[10]};
  width: 100%;
  max-width: 560px;
  animation: ${fadeInUp} 0.4s ease both;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing[6]};
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const LogoMark = styled.div`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.primary[800]};
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.white};
`;

const LogoName = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.primary[800]};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary[800]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// ─── Role toggle ─────────────────────────────────────────────────────────────
const RoleToggle = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: ${({ theme }) => theme.colors.gray[100]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing[1]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const RoleBtn = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[4]}`};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: all ${({ theme }) => theme.transitions.fast};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary[800] : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.white : theme.colors.text.secondary};
`;

// ─── Form fields ─────────────────────────────────────────────────────────────
const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[4]};
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[5]};
`;

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const Input = styled.input<{ $error?: boolean }>`
  width: 100%;
  height: 44px;
  padding: 0 ${({ theme }) => theme.spacing[4]};
  border: 1.5px solid ${({ $error, theme }) =>
    $error ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.white};
  transition: border-color ${({ theme }) => theme.transitions.fast},
              box-shadow ${({ theme }) => theme.transitions.fast};
  &::placeholder { color: ${({ theme }) => theme.colors.gray[400]}; }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[600]};
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }
`;

const ErrorMsg = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const PasswordWrapper = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing[4]};
  top: 50%;
  transform: translateY(-50%);
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  &:hover { color: ${({ theme }) => theme.colors.primary[600]}; }
`;

// ─── Password strength ────────────────────────────────────────────────────────
const StrengthBar = styled.div`
  display: flex;
  gap: 4px;
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const StrengthSegment = styled.div<{ $filled: boolean; $level: number }>`
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: ${({ $filled, $level, theme }) => {
    if (!$filled) return theme.colors.gray[200];
    if ($level <= 1) return theme.colors.error;
    if ($level === 2) return theme.colors.warning;
    return theme.colors.success;
  }};
  transition: background 0.2s;
`;

const StrengthLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: ${({ theme }) => theme.spacing[1]};
  display: block;
`;

// ─── Terms checkbox ───────────────────────────────────────────────────────────
const CheckRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  input {
    margin-top: 2px;
    flex-shrink: 0;
    accent-color: ${({ theme }) => theme.colors.primary[800]};
  }
  a { color: ${({ theme }) => theme.colors.text.link}; font-weight: 500; }
`;

// ─── Submit ───────────────────────────────────────────────────────────────────
const SubmitBtn = styled.button<{ $loading?: boolean }>`
  width: 100%;
  height: 48px;
  background: ${({ theme }) => theme.colors.primary[800]};
  color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-family: ${({ theme }) => theme.fonts.heading};
  transition: background ${({ theme }) => theme.transitions.fast},
              transform ${({ theme }) => theme.transitions.fast};
  opacity: ${({ $loading }) => ($loading ? 0.7 : 1)};
  cursor: ${({ $loading }) => ($loading ? 'not-allowed' : 'pointer')};
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary[600]};
    transform: translateY(-1px);
  }
  &:active:not(:disabled) { transform: translateY(0); }
`;

const LoginLink = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing[6]};
  a {
    color: ${({ theme }) => theme.colors.primary[600]};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
  }
`;

const AlertBox = styled.div`
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: #B91C1C;
  margin-bottom: ${({ theme }) => theme.spacing[5]};
`;

// ─── Password strength helper ─────────────────────────────────────────────────
const getStrength = (pw: string): number => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

// ─── Component ───────────────────────────────────────────────────────────────
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<RegisterFormData>({
    firstName: '', lastName: '', email: '', password: '',
    confirmPassword: '', companyName: '', role: 'user', acceptTerms: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  const strength = getStrength(form.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (fieldErrors[name as keyof RegisterFormData]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof RegisterFormData, string>> = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.companyName.trim()) errs.companyName = 'Company name is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Min. 8 characters';
    else if (strength < 2) errs.password = 'Password is too weak';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.acceptTerms) errs.acceptTerms = 'You must accept the terms';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      navigate('/auth/login?registered=true');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Card>
        <Header>
          <LogoRow>
            <LogoMark>S</LogoMark>
            <LogoName>SME Lending</LogoName>
          </LogoRow>
          <Title>Create your account</Title>
          <Subtitle>
            {role === 'admin'
              ? 'Set up an administrator account'
              : 'Start your SME lending journey'}
          </Subtitle>
        </Header>

        <RoleToggle>
          <RoleBtn type="button" $active={role === 'user'} onClick={() => setRole('user')}>
            Business user
          </RoleBtn>
          <RoleBtn type="button" $active={role === 'admin'} onClick={() => setRole('admin')}>
            Administrator
          </RoleBtn>
        </RoleToggle>

        {error && <AlertBox>{error}</AlertBox>}

        <form onSubmit={handleSubmit} noValidate>
          <Grid2>
            <Field>
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName" name="firstName" type="text"
                placeholder="Jane" value={form.firstName}
                onChange={handleChange} $error={!!fieldErrors.firstName}
              />
              {fieldErrors.firstName && <ErrorMsg>{fieldErrors.firstName}</ErrorMsg>}
            </Field>
            <Field>
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName" name="lastName" type="text"
                placeholder="Smith" value={form.lastName}
                onChange={handleChange} $error={!!fieldErrors.lastName}
              />
              {fieldErrors.lastName && <ErrorMsg>{fieldErrors.lastName}</ErrorMsg>}
            </Field>
          </Grid2>

          <Field>
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email" name="email" type="email" autoComplete="email"
              placeholder="jane@company.com" value={form.email}
              onChange={handleChange} $error={!!fieldErrors.email}
            />
            {fieldErrors.email && <ErrorMsg>{fieldErrors.email}</ErrorMsg>}
          </Field>

          <Field>
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName" name="companyName" type="text"
              placeholder="Acme Ltd" value={form.companyName}
              onChange={handleChange} $error={!!fieldErrors.companyName}
            />
            {fieldErrors.companyName && <ErrorMsg>{fieldErrors.companyName}</ErrorMsg>}
          </Field>

          <Field>
            <Label htmlFor="password">Password</Label>
            <PasswordWrapper>
              <Input
                id="password" name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters" value={form.password}
                onChange={handleChange} $error={!!fieldErrors.password}
                style={{ paddingRight: '60px' }}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </PasswordToggle>
            </PasswordWrapper>
            {form.password && (
              <>
                <StrengthBar>
                  {[1, 2, 3, 4].map(i => (
                    <StrengthSegment key={i} $filled={strength >= i} $level={strength} />
                  ))}
                </StrengthBar>
                <StrengthLabel>{strengthLabels[strength]}</StrengthLabel>
              </>
            )}
            {fieldErrors.password && <ErrorMsg>{fieldErrors.password}</ErrorMsg>}
          </Field>

          <Field>
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword" name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat your password" value={form.confirmPassword}
              onChange={handleChange} $error={!!fieldErrors.confirmPassword}
            />
            {fieldErrors.confirmPassword && <ErrorMsg>{fieldErrors.confirmPassword}</ErrorMsg>}
          </Field>

          <CheckRow>
            <input
              type="checkbox" name="acceptTerms"
              checked={form.acceptTerms} onChange={handleChange}
            />
            <span>
              I agree to the{' '}
              <Link to="/terms">Terms of Service</Link> and{' '}
              <Link to="/privacy">Privacy Policy</Link>
            </span>
          </CheckRow>
          {fieldErrors.acceptTerms && (
            <ErrorMsg style={{ marginTop: '-16px', marginBottom: '16px' }}>
              {fieldErrors.acceptTerms}
            </ErrorMsg>
          )}

          <SubmitBtn type="submit" $loading={loading} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </SubmitBtn>
        </form>

        <LoginLink>
          Already have an account? <Link to="/auth/login">Sign in</Link>
        </LoginLink>
      </Card>
    </Page>
  );
};

export default RegisterPage;
