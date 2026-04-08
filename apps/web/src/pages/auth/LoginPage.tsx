import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { LoginFormData, UserRole } from '../../types/auth';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Responsive helpers ───────────────────────────────────────────────────────
// Mobile first: base styles = mobile, then scale up
const sm = (css: string) => `@media (min-width: 640px)  { ${css} }`;
const md = (css: string) => `@media (min-width: 768px)  { ${css} }`;
const lg = (css: string) => `@media (min-width: 1024px) { ${css} }`;

// ─── Page shell ───────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  min-height: -webkit-fill-available;
  display: flex;
  flex-direction: column;
  ${md('flex-direction: row;')}
`;

// ─── Brand panel (hidden on mobile, shows on md+) ─────────────────────────────
const Brand = styled.aside`
  display: none;
  ${md(`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 45%;
    min-height: 100vh;
    padding: 3rem;
    background: #0C2B5E;
    flex-shrink: 0;
  `)}
  ${lg(`
    width: 50%;
    padding: 4rem;
  `)}
`;

const BrandLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LogoMark = styled.div`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.accent[500]};
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 700;
  font-size: 1.125rem;
  color: #fff;
  flex-shrink: 0;
`;

const LogoName = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
`;

const BrandHero = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem 0;
`;

const BrandHeadline = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.15;
  margin-bottom: 1rem;
  ${lg('font-size: 2.5rem;')}
`;

const BrandSub = styled.p`
  font-size: 1rem;
  color: #85b7eb;
  line-height: 1.75;
  max-width: 380px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

const Stat = styled.div`
  border-top: 1px solid #1a56a0;
  padding-top: 1rem;
`;

const StatValue = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent[500]};
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #85b7eb;
  margin-top: 0.25rem;
`;

// ─── Form panel ───────────────────────────────────────────────────────────────
const FormPanel = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.white};
  padding: 1.5rem 1rem;
  ${sm('padding: 2rem;')}
  ${md('padding: 2rem 3rem; min-height: 100vh;')}
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 420px;
  animation: ${fadeInUp} 0.35s ease both;
`;

// ─── Mobile top bar (visible only on mobile) ──────────────────────────────────
// const MobileHeader = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 0.75rem;
//   margin-bottom: 2rem;
//   ${md('display: none;')}
// `;

const MobileBrand = styled.div`
  background: ${({ theme }) => theme.colors.primary[800]};
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  ${md('display: none;')}
`;

const MobileBrandName = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.125rem;
  font-weight: 600;
  color: #fff;
`;

// ─── Form header ─────────────────────────────────────────────────────────────
const FormHeader = styled.div`
  margin-bottom: 1.5rem;
  ${md('margin-bottom: 2rem;')}
`;

const FormTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary[800]};
  margin-bottom: 0.375rem;
  ${sm('font-size: 2rem;')}
`;

const FormSubtitle = styled.p`
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
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s ease;
  background: ${({ $active, theme }) => ($active ? theme.colors.primary[800] : 'transparent')};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.text.secondary)};
  /* bigger touch target */
  min-height: 40px;
`;

// ─── Fields ───────────────────────────────────────────────────────────────────
const Field = styled.div`
  margin-bottom: 1.25rem;
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
  /* 48px height — better touch target (Apple HIG recommends 44pt min) */
  height: 48px;
  padding: 0 1rem;
  border: 1.5px solid ${({ $error, theme }) => ($error ? theme.colors.error : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  /* always 16px+ to prevent iOS auto-zoom */
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.white};
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  -webkit-appearance: none;
  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }
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
  /* bigger tap area */
  padding: 0.5rem;
  margin: -0.5rem;
  &:hover {
    color: ${({ theme }) => theme.colors.primary[600]};
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const CheckLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  /* bigger tap area */
  padding: 0.25rem 0;
  input {
    accent-color: ${({ theme }) => theme.colors.primary[800]};
  }
`;

const ForgotLink = styled(Link)`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.link};
  font-weight: 500;
  padding: 0.25rem 0;
`;

const SubmitBtn = styled.button<{ $loading?: boolean }>`
  width: 100%;
  /* 52px — comfortable touch target */
  height: 52px;
  background: ${({ theme }) => theme.colors.primary[800]};
  color: #fff;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 1rem;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.heading};
  transition:
    background 0.15s,
    transform 0.1s;
  opacity: ${({ $loading }) => ($loading ? 0.7 : 1)};
  cursor: ${({ $loading }) => ($loading ? 'not-allowed' : 'pointer')};
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary[600]};
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  span {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text.muted};
    white-space: nowrap;
  }
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

const RegisterLink = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  a {
    color: ${({ theme }) => theme.colors.primary[600]};
    font-weight: 600;
    padding: 0.25rem 0;
  }
`;

const AlertBox = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #b91c1c;
  margin-bottom: 1.25rem;
`;

// ─── Component ────────────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<LoginFormData>({
    email: '',
    password: '',
    role: 'user',
    rememberMe: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const signInLabel = role === 'admin' ? 'Sign in as admin' : 'Sign in';
  const buttonLabel = loading ? 'Signing in…' : signInLabel;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (fieldErrors[name as keyof LoginFormData])
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof LoginFormData, string>> = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Min. 8 characters';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      navigate(role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      {/* Mobile top nav bar */}
      <MobileBrand>
        <LogoMark>S</LogoMark>
        <MobileBrandName>SME Lending Platform</MobileBrandName>
      </MobileBrand>

      {/* Desktop brand panel */}
      <Brand>
        <BrandLogo>
          <LogoMark>S</LogoMark>
          <LogoName>SME Lending Platform</LogoName>
        </BrandLogo>
        <BrandHero>
          <BrandHeadline>
            Fast, fair credit
            <br />
            for growing businesses
          </BrandHeadline>
          <BrandSub>
            Get an instant credit decision in under 500ms. Automated underwriting, transparent
            pricing, and full regulatory compliance built in.
          </BrandSub>
        </BrandHero>
        <Stats>
          <Stat>
            <StatValue>500ms</StatValue>
            <StatLabel>Decision time</StatLabel>
          </Stat>
          <Stat>
            <StatValue>70%+</StatValue>
            <StatLabel>Straight-through</StatLabel>
          </Stat>
          <Stat>
            <StatValue>99.9%</StatValue>
            <StatLabel>Uptime SLA</StatLabel>
          </Stat>
        </Stats>
      </Brand>

      {/* Form */}
      <FormPanel>
        <FormCard>
          <FormHeader>
            <FormTitle>Welcome back</FormTitle>
            <FormSubtitle>
              {role === 'admin' ? 'Sign in to the admin portal' : 'Sign in to your account'}
            </FormSubtitle>
          </FormHeader>

          <RoleToggle>
            <RoleBtn
              type="button"
              $active={role === 'user'}
              onClick={() => {
                setRole('user');
                setError('');
              }}
            >
              Business user
            </RoleBtn>
            <RoleBtn
              type="button"
              $active={role === 'admin'}
              onClick={() => {
                setRole('admin');
                setError('');
              }}
            >
              Administrator
            </RoleBtn>
          </RoleToggle>

          {error && <AlertBox>{error}</AlertBox>}

          <form
            onSubmit={handleSubmit}
            noValidate
          >
            <Field>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                $error={!!fieldErrors.email}
              />
              {fieldErrors.email && <ErrorMsg>{fieldErrors.email}</ErrorMsg>}
            </Field>

            <Field>
              <Label htmlFor="password">Password</Label>
              <PasswordWrapper>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  $error={!!fieldErrors.password}
                  style={{ paddingRight: '64px' }}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </PasswordToggle>
              </PasswordWrapper>
              {fieldErrors.password && <ErrorMsg>{fieldErrors.password}</ErrorMsg>}
            </Field>

            <Row>
              <CheckLabel>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                />{' '}
                {/* NOSONAR */}
                Remember me
              </CheckLabel>
              <ForgotLink to="/auth/forgot-password">Forgot password?</ForgotLink>
            </Row>

            <SubmitBtn
              type="submit"
              $loading={loading}
              disabled={loading}
            >
              {buttonLabel}
            </SubmitBtn>
          </form>

          <Divider>
            <span>New to SME Lending?</span>
          </Divider>
          <RegisterLink>
            Don't have an account? <Link to="/auth/register">Create one free</Link>
          </RegisterLink>
        </FormCard>
      </FormPanel>
    </Page>
  );
};

export default LoginPage;
