import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { RegisterFormData, UserRole } from '../../types/auth';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Page ─────────────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  min-height: -webkit-fill-available;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

// Mobile top nav
const MobileBrand = styled.div`
  background: ${({ theme }) => theme.colors.primary[800]};
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  @media (min-width: 768px) { display: none; }
`;

const MobileBrandName = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.125rem;
  font-weight: 600;
  color: #fff;
`;

const LogoMark = styled.div`
  width: 36px;
  height: 36px;
  background: ${({ theme }) => theme.colors.primary[800]};
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 700;
  font-size: 1rem;
  color: #fff;
  flex-shrink: 0;
`;

const LogoMarkGreen = styled(LogoMark)`
  background: ${({ theme }) => theme.colors.accent[500]};
`;

// ─── Content area ─────────────────────────────────────────────────────────────
const Content = styled.main`
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1.5rem 1rem 3rem;
  @media (min-width: 640px) { padding: 2rem 1.5rem 3rem; }
  @media (min-width: 768px) { 
    align-items: center;
    padding: 3rem 2rem;
    min-height: 100vh;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  padding: 1.75rem 1.25rem;
  width: 100%;
  max-width: 560px;
  animation: ${fadeInUp} 0.35s ease both;
  @media (min-width: 640px) { padding: 2.5rem 2rem; }
  @media (min-width: 768px) { padding: 3rem 2.5rem; }
`;

// Desktop logo (hidden on mobile — shown in top bar instead)
const DesktopLogo = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
`;

const LogoName = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary[800]};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  @media (min-width: 768px) { margin-bottom: 2rem; }
`;

const Title = styled.h1`
  font-size: 1.625rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary[800]};
  margin-bottom: 0.375rem;
  @media (min-width: 640px) { font-size: 1.875rem; }
`;

const Subtitle = styled.p`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// ─── Role toggle ─────────────────────────────────────────────────────────────
const RoleToggle = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: ${({ theme }) => theme.colors.gray[100]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 3px;
  margin-bottom: 1.5rem;
`;

const RoleBtn = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  min-height: 40px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary[800] : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? '#fff' : theme.colors.text.secondary};
`;

// ─── Grid ─────────────────────────────────────────────────────────────────────
// Stack on mobile, side by side on sm+
const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  @media (min-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
`;

// ─── Fields ───────────────────────────────────────────────────────────────────
const Field = styled.div`
  margin-bottom: 1.125rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.375rem;
`;

const Input = styled.input<{ $error?: boolean }>`
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  border: 1.5px solid ${({ $error, theme }) =>
    $error ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.white};
  -webkit-appearance: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  &::placeholder { color: ${({ theme }) => theme.colors.gray[400]}; }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[600]};
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }
`;

const ErrorMsg = styled.span`
  display: block;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.error};
  margin-top: 0.25rem;
`;

const PasswordWrapper = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.muted};
  padding: 0.5rem;
  margin: -0.5rem;
  -webkit-tap-highlight-color: transparent;
  &:hover { color: ${({ theme }) => theme.colors.primary[600]}; }
`;

// ─── Password strength ────────────────────────────────────────────────────────
const StrengthBar = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 0.5rem;
`;

const StrengthSegment = styled.div<{ $filled: boolean; $level: number }>`
  flex: 1;
  height: 3px;
  border-radius: 2px;
  transition: background 0.2s;
  background: ${({ $filled, $level, theme }) => {
    if (!$filled) return theme.colors.gray[200];
    if ($level <= 1) return theme.colors.error;
    if ($level === 2) return theme.colors.warning;
    return theme.colors.success;
  }};
`;

const StrengthLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 0.25rem;
  display: block;
`;

// ─── Terms ────────────────────────────────────────────────────────────────────
const CheckRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  margin-bottom: 1.5rem;
  padding: 0.25rem 0;
  input {
    margin-top: 2px;
    flex-shrink: 0;
    accent-color: ${({ theme }) => theme.colors.primary[800]};
    width: 16px;
    height: 16px;
  }
  a { color: ${({ theme }) => theme.colors.text.link}; font-weight: 500; }
`;

// ─── Submit ───────────────────────────────────────────────────────────────────
const SubmitBtn = styled.button<{ $loading?: boolean }>`
  width: 100%;
  height: 52px;
  background: ${({ theme }) => theme.colors.primary[800]};
  color: #fff;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 1rem;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.heading};
  transition: background 0.15s, transform 0.1s;
  opacity: ${({ $loading }) => ($loading ? 0.7 : 1)};
  cursor: ${({ $loading }) => ($loading ? 'not-allowed' : 'pointer')};
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primary[600]}; }
  &:active:not(:disabled) { transform: scale(0.98); }
`;

const LoginLink = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 1.5rem;
  a {
    color: ${({ theme }) => theme.colors.primary[600]};
    font-weight: 600;
  }
`;

const AlertBox = styled.div`
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #B91C1C;
  margin-bottom: 1.25rem;
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
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
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});

  const strength = getStrength(form.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (fieldErrors[name as keyof RegisterFormData])
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof RegisterFormData, string>> = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.companyName.trim()) errs.companyName = 'Company name is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Min. 8 characters';
    else if (strength < 2) errs.password = 'Password is too weak';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.acceptTerms) errs.acceptTerms = 'You must accept the terms to continue';
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
      <MobileBrand>
        <LogoMarkGreen>S</LogoMarkGreen>
        <MobileBrandName>SME Lending</MobileBrandName>
      </MobileBrand>

      <Content>
        <Card>
          <DesktopLogo>
            <LogoMark style={{ background: '#0C2B5E' }}>S</LogoMark>
            <LogoName>SME Lending Platform</LogoName>
          </DesktopLogo>

          <Header>
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
                <Input id="firstName" name="firstName" type="text"
                  autoComplete="given-name" placeholder="Jane"
                  value={form.firstName} onChange={handleChange}
                  $error={!!fieldErrors.firstName} />
                {fieldErrors.firstName && <ErrorMsg>{fieldErrors.firstName}</ErrorMsg>}
              </Field>
              <Field>
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" name="lastName" type="text"
                  autoComplete="family-name" placeholder="Smith"
                  value={form.lastName} onChange={handleChange}
                  $error={!!fieldErrors.lastName} />
                {fieldErrors.lastName && <ErrorMsg>{fieldErrors.lastName}</ErrorMsg>}
              </Field>
            </Grid2>

            <Field>
              <Label htmlFor="email">Work email</Label>
              <Input id="email" name="email" type="email"
                autoComplete="email" placeholder="jane@company.com"
                value={form.email} onChange={handleChange}
                $error={!!fieldErrors.email} />
              {fieldErrors.email && <ErrorMsg>{fieldErrors.email}</ErrorMsg>}
            </Field>

            <Field>
              <Label htmlFor="companyName">Company name</Label>
              <Input id="companyName" name="companyName" type="text"
                autoComplete="organization" placeholder="Acme Ltd"
                value={form.companyName} onChange={handleChange}
                $error={!!fieldErrors.companyName} />
              {fieldErrors.companyName && <ErrorMsg>{fieldErrors.companyName}</ErrorMsg>}
            </Field>

            <Field>
              <Label htmlFor="password">Password</Label>
              <PasswordWrapper>
                <Input id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password" placeholder="Min. 8 characters"
                  value={form.password} onChange={handleChange}
                  $error={!!fieldErrors.password}
                  style={{ paddingRight: '64px' }} />
                <PasswordToggle type="button"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? 'Hide' : 'Show'}
                </PasswordToggle>
              </PasswordWrapper>
              {form.password && (
                <>
                  <StrengthBar>
                    {[1,2,3,4].map(i => (
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
              <Input id="confirmPassword" name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password" placeholder="Repeat your password"
                value={form.confirmPassword} onChange={handleChange}
                $error={!!fieldErrors.confirmPassword} />
              {fieldErrors.confirmPassword && <ErrorMsg>{fieldErrors.confirmPassword}</ErrorMsg>}
            </Field>

            <CheckRow>
              <input type="checkbox" name="acceptTerms"
                checked={form.acceptTerms} onChange={handleChange} />
              <span>
                I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>
              </span>
            </CheckRow>
            {fieldErrors.acceptTerms && (
              <ErrorMsg style={{ marginTop: '-1rem', marginBottom: '1rem' }}>
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
      </Content>
    </Page>
  );
};

export default RegisterPage;
