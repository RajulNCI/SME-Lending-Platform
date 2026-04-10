import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { LoginFormData, UserRole } from '../../types/auth';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── Page shell ────────────────────────────────────────────────────────────────
// Mobile: single column (form only, no brand panel)
// md+   : two columns (brand left, form right)
const Page = styled.div`
  min-height: 100vh;
  min-height: -webkit-fill-available;
  display: grid;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: 45% 1fr;
  }
  @media (min-width: 1100px) {
    grid-template-columns: 50% 1fr;
  }
`;

// ── Brand panel ───────────────────────────────────────────────────────────────
// Hidden on mobile — the form fills the whole screen instead
const Brand = styled.aside`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #0C2B5E;
    padding: 2.5rem;
    min-height: 100vh;
  }

  @media (min-width: 1024px) {
    padding: 3.5rem;
  }
`;

const BrandTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LogoMark = styled.div`
  width: 40px;
  height: 40px;
  background: #1D9E75;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  color: #fff;
  flex-shrink: 0;
`;

const LogoName = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem;
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
  font-family: 'Inter', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 1rem;

  @media (min-width: 1024px) {
    font-size: 2.5rem;
  }
`;

const BrandSub = styled.p`
  font-size: 1rem;
  color: #85B7EB;
  line-height: 1.75;
  max-width: 380px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

const Stat = styled.div`
  border-top: 1px solid #1A56A0;
  padding-top: 1rem;
`;

const StatValue = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 1.375rem;
  font-weight: 700;
  color: #1D9E75;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #85B7EB;
  margin-top: 0.25rem;
`;

// ── Form panel ────────────────────────────────────────────────────────────────
// This is the ONLY thing visible on mobile — takes full viewport height
const FormPanel = styled.main`
  display: flex;
  flex-direction: column;
  background: #fff;
  min-height: 100vh;
  min-height: -webkit-fill-available;
`;

// Mobile top nav bar — only shows on mobile (hidden on md+)
const MobileNav = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: #0C2B5E;
  padding: 1rem 1.25rem;
  flex-shrink: 0;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileNavName = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
`;

// Scrollable form area
const FormScroll = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.25rem;
  overflow-y: auto;

  @media (min-width: 640px) {
    padding: 2.5rem 2rem;
  }
  @media (min-width: 768px) {
    padding: 3rem;
  }
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 400px;
  animation: ${fadeInUp} 0.35s ease both;
`;

// ── Form header ───────────────────────────────────────────────────────────────
const FormTitle = styled.h2`
  font-family: 'Inter', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0C2B5E;
  margin: 0 0 0.375rem;

  @media (min-width: 640px) {
    font-size: 2rem;
  }
`;

const FormSubtitle = styled.p`
  font-size: 0.9375rem;
  color: #718096;
  margin: 0 0 1.75rem;
`;

// ── Role toggle ───────────────────────────────────────────────────────────────
const RoleToggle = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #F7FAFC;
  border-radius: 10px;
  padding: 3px;
  margin-bottom: 1.5rem;
  border: 1px solid #E2E8F0;
`;

const RoleBtn = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  min-height: 42px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  background: ${({ $active }) => $active ? '#0C2B5E' : 'transparent'};
  color: ${({ $active }) => $active ? '#fff' : '#718096'};

  &:hover {
    background: ${({ $active }) => $active ? '#0C2B5E' : '#EBF4FF'};
    color: ${({ $active }) => $active ? '#fff' : '#0C2B5E'};
  }
`;

// ── Fields ────────────────────────────────────────────────────────────────────
const Field = styled.div`
  margin-bottom: 1.125rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #2D3748;
  margin-bottom: 0.375rem;
`;

const Input = styled.input<{ $error?: boolean }>`
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  border: 1.5px solid ${({ $error }) => $error ? '#E24B4A' : '#E2E8F0'};
  border-radius: 8px;
  font-size: 16px;
  color: #2D3748;
  background: #fff;
  -webkit-appearance: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder { color: #A0AEC0; }
  &:focus {
    outline: none;
    border-color: #378ADD;
    box-shadow: 0 0 0 3px rgba(55, 138, 221, 0.2);
  }
`;

const ErrorMsg = styled.span`
  display: block;
  font-size: 0.75rem;
  color: #E24B4A;
  margin-top: 0.25rem;
`;

const PwWrapper = styled.div`
  position: relative;
`;

const PwToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8125rem;
  font-weight: 500;
  color: #718096;
  padding: 0.5rem;
  margin: -0.5rem;
  -webkit-tap-highlight-color: transparent;
  &:hover { color: #1A56A0; }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const CheckLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4A5568;
  cursor: pointer;
  padding: 0.25rem 0;
  input { accent-color: #0C2B5E; }
`;

const ForgotLink = styled(Link)`
  font-size: 0.875rem;
  color: #1A56A0;
  font-weight: 500;
  padding: 0.25rem 0;
  &:hover { text-decoration: underline; }
`;

const SubmitBtn = styled.button<{ $loading?: boolean }>`
  width: 100%;
  height: 52px;
  background: #0C2B5E;
  color: #fff;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: background 0.15s, transform 0.1s;
  opacity: ${({ $loading }) => $loading ? 0.7 : 1};
  cursor: ${({ $loading }) => $loading ? 'not-allowed' : 'pointer'};
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:hover:not(:disabled) { background: #1A56A0; }
  &:active:not(:disabled) { transform: scale(0.98); }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;

  span {
    font-size: 0.8125rem;
    color: #A0AEC0;
    white-space: nowrap;
  }
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #E2E8F0;
  }
`;

const RegisterLink = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: #718096;

  a {
    color: #1A56A0;
    font-weight: 600;
    &:hover { text-decoration: underline; }
  }
`;

const AlertBox = styled.div`
  background: #FFF5F5;
  border: 1px solid #FED7D7;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #C53030;
  margin-bottom: 1.25rem;
`;

// ── Component ─────────────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('user');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<LoginFormData>({
    email: '', password: '', role: 'user', rememberMe: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (fieldErrors[name as keyof LoginFormData])
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof LoginFormData, string>> = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Minimum 8 characters';
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
      navigate(role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      {/* ── Left: brand panel (desktop only) ── */}
      <Brand>
        <BrandTop>
          <LogoMark>S</LogoMark>
          <LogoName>SME Lending</LogoName>
        </BrandTop>

        <BrandHero>
          <BrandHeadline>
            Fast, fair credit<br />for growing businesses
          </BrandHeadline>
          <BrandSub>
            Instant credit decisions in under 500ms. Automated underwriting,
            transparent pricing, and full EU regulatory compliance built in.
          </BrandSub>
        </BrandHero>

        <Stats>
          <Stat><StatValue>500ms</StatValue><StatLabel>Decision time</StatLabel></Stat>
          <Stat><StatValue>70%+</StatValue><StatLabel>Straight-through</StatLabel></Stat>
          <Stat><StatValue>99.9%</StatValue><StatLabel>Uptime SLA</StatLabel></Stat>
        </Stats>
      </Brand>

      {/* ── Right: form panel (full screen on mobile) ── */}
      <FormPanel>
        {/* Navy bar — replaces brand panel on mobile */}
        <MobileNav>
          <LogoMark style={{ width: '32px', height: '32px', fontSize: '0.875rem' }}>S</LogoMark>
          <MobileNavName>SME Lending</MobileNavName>
        </MobileNav>

        <FormScroll>
          <FormCard>
            <FormTitle>Welcome back</FormTitle>
            <FormSubtitle>
              {role === 'admin' ? 'Sign in to the admin portal' : 'Sign in to your account'}
            </FormSubtitle>

            <RoleToggle>
              <RoleBtn type="button" $active={role === 'user'}
                onClick={() => { setRole('user'); setError(''); }}>
                Business user
              </RoleBtn>
              <RoleBtn type="button" $active={role === 'admin'}
                onClick={() => { setRole('admin'); setError(''); }}>
                Administrator
              </RoleBtn>
            </RoleToggle>

            {error && <AlertBox>{error}</AlertBox>}

            <form onSubmit={handleSubmit} noValidate>
              <Field>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email" name="email" type="email"
                  autoComplete="email" placeholder="you@company.com"
                  value={form.email} onChange={handleChange}
                  $error={!!fieldErrors.email}
                />
                {fieldErrors.email && <ErrorMsg>{fieldErrors.email}</ErrorMsg>}
              </Field>

              <Field>
                <Label htmlFor="password">Password</Label>
                <PwWrapper>
                  <Input
                    id="password" name="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Min. 8 characters"
                    value={form.password} onChange={handleChange}
                    $error={!!fieldErrors.password}
                    style={{ paddingRight: '64px' }}
                  />
                  <PwToggle type="button" onClick={() => setShowPw(p => !p)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}>
                    {showPw ? 'Hide' : 'Show'}
                  </PwToggle>
                </PwWrapper>
                {fieldErrors.password && <ErrorMsg>{fieldErrors.password}</ErrorMsg>}
              </Field>

              <Row>
                <CheckLabel>
                  <input type="checkbox" name="rememberMe"
                    checked={form.rememberMe} onChange={handleChange} />
                  Remember me
                </CheckLabel>
                <ForgotLink to="/auth/forgot-password">Forgot password?</ForgotLink>
              </Row>

              <SubmitBtn type="submit" $loading={loading} disabled={loading}>
                {loading ? 'Signing in…' : `Sign in${role === 'admin' ? ' as admin' : ''}`}
              </SubmitBtn>
            </form>

            <Divider><span>New to SME Lending?</span></Divider>

            <RegisterLink>
              Don't have an account?{' '}
              <Link to="/auth/register">Create one free</Link>
            </RegisterLink>
          </FormCard>
        </FormScroll>
      </FormPanel>
    </Page>
  );
};

export default LoginPage;
