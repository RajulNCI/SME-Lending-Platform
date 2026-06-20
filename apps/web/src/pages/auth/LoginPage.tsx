import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME } from '../../types/auth';
import type { UserRole } from '../../types/auth';

import {
  Page,
  Brand,
  BrandTop,
  BrandHero,
  BrandHeadline,
  BrandDesc,
  Stats,
  Stat,
  StatVal,
  StatLabel,
  FormPanel,
  MobileNav,
  FormScroll,
  FormCard,
  FormTitle,
  FormSubtitle,
  Field,
  Label,
  Input,
  ErrorMsg,
  AlertBox,
  PwWrapper,
  PwToggle,
  SubmitBtn,
  HintBox,
  HintTitle,
  HintRow,
  HintUser,
  HintRole,
  HintFooter,
} from '../../styles/pages/LoginPage.styles';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email.trim()) e.email = 'Email is required';
    if (!password) e.password = 'Password is required';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    const ok = await login(email.trim(), password);
    setLoading(false);
    if (!ok) {
      setError('Invalid email or password.');
      return;
    }

    // Read the stored user to get their role for redirect
    try {
      const stored = JSON.parse(sessionStorage.getItem('finpal_auth') || '{}');
      const role = stored.user?.role as UserRole;
      navigate(ROLE_HOME[role] || '/dashboard');
    } catch {
      navigate('/dashboard');
    }
  };

  const hints = [
    { user: 'john@company.com / Test1234!', role: 'Borrower' },
    { user: 'co@finpal.ie / Test1234!', role: 'Credit Officer' },
  ];

  return (
    <Page>
      <Brand>
        <BrandTop>
          <img
            src="/finpal-logo.png"
            alt="FinPal"
            style={{
              height: '60px',
              width: 'auto',
              background: '#0C2965',
              borderRadius: '14px',
              padding: '8px 14px',
            }}
          />
        </BrandTop>
        <BrandHero>
          <BrandHeadline>
            Trustworthy AI
            <br />
            Loan Intake &<br />
            Assessment
          </BrandHeadline>
          <BrandDesc>
            End-to-end AI-powered SME lending platform. EU AI Act compliant, GDPR Article 22 ready,
            EBA LOM aligned.
          </BrandDesc>
        </BrandHero>
        <Stats>
          <Stat>
            <StatVal>500ms</StatVal>
            <StatLabel>Decision time</StatLabel>
          </Stat>
          <Stat>
            <StatVal>70%+</StatVal>
            <StatLabel>STP rate</StatLabel>
          </Stat>
          <Stat>
            <StatVal>99.9%</StatVal>
            <StatLabel>Uptime SLA</StatLabel>
          </Stat>
        </Stats>
      </Brand>

      <FormPanel>
        <MobileNav>
          <img
            src="/finpal-logo.png"
            alt="FinPal"
            style={{
              height: '36px',
              width: 'auto',
              background: '#0C2965',
              borderRadius: '10px',
              padding: '5px 10px',
            }}
          />
        </MobileNav>

        <FormScroll>
          <FormCard>
            <FormTitle>Sign in</FormTitle>
            <FormSubtitle>Access the FinPal platform</FormSubtitle>

            {error && <AlertBox>{error}</AlertBox>}

            <form
              onSubmit={handleSubmit}
              noValidate
            >
              <Field>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. john@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((p) => ({ ...p, email: '' }));
                  }}
                  $error={!!fieldErrors.email}
                  autoComplete="email"
                />
                {fieldErrors.email && <ErrorMsg>{fieldErrors.email}</ErrorMsg>}
              </Field>
              <Field>
                <Label htmlFor="password">Password</Label>
                <PwWrapper>
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((p) => ({ ...p, password: '' }));
                    }}
                    $error={!!fieldErrors.password}
                    autoComplete="current-password"
                    style={{ paddingRight: '64px' }}
                  />
                  <PwToggle
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </PwToggle>
                </PwWrapper>
                {fieldErrors.password && <ErrorMsg>{fieldErrors.password}</ErrorMsg>}
              </Field>
              <SubmitBtn
                type="submit"
                $loading={loading}
                disabled={loading}
                style={{ marginTop: '.75rem' }}
              >
                {loading ? 'Signing in…' : 'Sign in to FinPal'}
              </SubmitBtn>
            </form>

            <HintBox>
              <HintTitle>Demo credentials</HintTitle>
              {hints.map((h) => (
                <HintRow key={h.user}>
                  <HintUser>{h.user}</HintUser>
                  <HintRole>{h.role}</HintRole>
                </HintRow>
              ))}
              <HintFooter>
                Sign up via POST /api/v1/auth/signup or use the credentials above
              </HintFooter>
            </HintBox>
          </FormCard>
        </FormScroll>
      </FormPanel>
    </Page>
  );
};

export default LoginPage;
