import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { LoginFormData, UserRole } from '../../types/auth';

// ─── Animations ──────────────────────────────────────────────────────────────
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Layout ──────────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const Brand = styled.aside`
  background: ${({ theme }) => theme.colors.primary[800]};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[12]};
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) { display: none; }
`;

const BrandLogo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
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
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.white};
`;

const LogoName = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.white};
`;

const BrandHero = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const BrandHeadline = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.white};
  line-height: 1.15;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const BrandSub = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.primary[300]};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  max-width: 400px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
`;

const Stat = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.primary[600]};
  padding-top: ${({ theme }) => theme.spacing[4]};
`;

const StatValue = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.accent[500]};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary[300]};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

// ─── Form panel ──────────────────────────────────────────────────────────────
const FormPanel = styled.main`
  background: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[8]};
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 420px;
  animation: ${fadeInUp} 0.4s ease both;
`;

const FormHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const MobileLogo = styled.div`
  display: none;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) { display: flex; }
`;

const FormTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary[800]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const FormSubtitle = styled.p`
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

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const CheckLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  input { accent-color: ${({ theme }) => theme.colors.primary[800]}; }
`;

const ForgotLink = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.link};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

// ─── Submit button ────────────────────────────────────────────────────────────
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  margin: ${({ theme }) => theme.spacing[6]} 0;
  span {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text.muted};
    white-space: nowrap;
  }
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

const RegisterLink = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
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

// ─── Component ───────────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<LoginFormData>({
    email: '', password: '', role: 'user', rememberMe: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (fieldErrors[name as keyof LoginFormData]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof LoginFormData, string>> = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      // TODO: replace with real API call
      await new Promise(r => setTimeout(r, 1200));
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      {/* ── Left brand panel ── */}
      <Brand>
        <BrandLogo>
          <LogoMark>S</LogoMark>
          <LogoName>SME Lending Platform</LogoName>
        </BrandLogo>

        <BrandHero>
          <BrandHeadline>
            Fast, fair credit<br />for growing businesses
          </BrandHeadline>
          <BrandSub>
            Get an instant credit decision in under 500ms.
            Automated underwriting, transparent pricing, and full
            regulatory compliance built in.
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

      {/* ── Right form panel ── */}
      <FormPanel>
        <FormCard>
          <MobileLogo>
            <LogoMark>S</LogoMark>
            <LogoName>SME Lending</LogoName>
          </MobileLogo>

          <FormHeader>
            <FormTitle>Welcome back</FormTitle>
            <FormSubtitle>
              {role === 'admin'
                ? 'Sign in to the admin portal'
                : 'Sign in to your account'}
            </FormSubtitle>
          </FormHeader>

          {/* Role selector */}
          <RoleToggle>
            <RoleBtn
              type="button"
              $active={role === 'user'}
              onClick={() => { setRole('user'); setError(''); }}
            >
              Business user
            </RoleBtn>
            <RoleBtn
              type="button"
              $active={role === 'admin'}
              onClick={() => { setRole('admin'); setError(''); }}
            >
              Administrator
            </RoleBtn>
          </RoleToggle>

          {error && <AlertBox>{error}</AlertBox>}

          <form onSubmit={handleSubmit} noValidate>
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
              {fieldErrors.password && <ErrorMsg>{fieldErrors.password}</ErrorMsg>}
            </Field>

            <Row>
              <CheckLabel>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                />
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
      </FormPanel>
    </Page>
  );
};

export default LoginPage;
