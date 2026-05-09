import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME } from '../../types/auth';

import {
  Page,
  Brand,
  BrandTop,
  LogoMark,
  BrandName,
  BrandTitle,
  BrandSub,
  BrandHero,
  BrandHeadline,
  BrandDesc,
  Stats,
  Stat,
  StatVal,
  StatLabel,
  FormPanel,
  MobileNav,
  MobileNavName,
  MobileNavSub,
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
  HintFooter
} from '../../styles/pages/LoginPage.styles';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{username?:string;password?:string}>({});

  const validate = () => {
    const e: {username?:string;password?:string} = {};
    if (!username.trim()) e.username = 'Username is required';
    if (!password) e.password = 'Password is required';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const ok = login(username.trim(), password);
    setLoading(false);
    if (!ok) { setError('Invalid username or password.'); return; }
    const user = JSON.parse(sessionStorage.getItem('finpal_user') || '{}');
    navigate(ROLE_HOME[user.role as keyof typeof ROLE_HOME] || '/dashboard');
  };

  const hints = [
    { user: 'credit.officer',      role: 'Credit Officer' },
    { user: 'risk.manager',        role: 'Risk Manager' },
    { user: 'compliance.officer',  role: 'Compliance Officer' },
    { user: 'ops.manager',         role: 'Ops Manager' },
    { user: 'it.admin',            role: 'IT Admin' },
    { user: 'mrm.analyst',         role: 'MRM Analyst' },
    { user: 'collections.officer', role: 'Collections Officer' },
    { user: 'borrower.sme',        role: 'Borrower (SME)' },
  ];

  return (
    <Page>
      <Brand>
        <BrandTop>
          <LogoMark>F</LogoMark>
          <BrandName>
            <BrandTitle>FinPal</BrandTitle>
            <BrandSub>v5.0 · Trustworthy AI</BrandSub>
          </BrandName>
        </BrandTop>
        <BrandHero>
          <BrandHeadline>Trustworthy AI<br />Loan Intake &<br />Assessment</BrandHeadline>
          <BrandDesc>End-to-end AI-powered SME lending platform. EU AI Act compliant, GDPR Article 22 ready, EBA LOM aligned.</BrandDesc>
        </BrandHero>
        <Stats>
          <Stat><StatVal>500ms</StatVal><StatLabel>Decision time</StatLabel></Stat>
          <Stat><StatVal>70%+</StatVal><StatLabel>STP rate</StatLabel></Stat>
          <Stat><StatVal>99.9%</StatVal><StatLabel>Uptime SLA</StatLabel></Stat>
        </Stats>
      </Brand>

      <FormPanel>
        <MobileNav>
          <LogoMark style={{width:'32px',height:'32px',fontSize:'.875rem'}}>F</LogoMark>
          <div>
            <MobileNavName>FinPal</MobileNavName>
            <MobileNavSub style={{display:'block',marginTop:'1px'}}>v5.0 · Trustworthy AI</MobileNavSub>
          </div>
        </MobileNav>

        <FormScroll>
          <FormCard>
            <FormTitle>Sign in</FormTitle>
            <FormSubtitle>Access the FinPal platform</FormSubtitle>

            {error && <AlertBox>{error}</AlertBox>}

            <form onSubmit={handleSubmit} noValidate>
              <Field>
                <Label htmlFor="username">Username</Label>
                <Input id="username" type="text" placeholder="e.g. credit.officer"
                  value={username} onChange={e=>{setUsername(e.target.value);setFieldErrors(p=>({...p,username:''}));}}
                  $error={!!fieldErrors.username} autoComplete="username" />
                {fieldErrors.username && <ErrorMsg>{fieldErrors.username}</ErrorMsg>}
              </Field>
              <Field>
                <Label htmlFor="password">Password</Label>
                <PwWrapper>
                  <Input id="password" type={showPw?'text':'password'} placeholder="Your password"
                    value={password} onChange={e=>{setPassword(e.target.value);setFieldErrors(p=>({...p,password:''}));}}
                    $error={!!fieldErrors.password} autoComplete="current-password"
                    style={{paddingRight:'64px'}} />
                  <PwToggle type="button" onClick={()=>setShowPw(p=>!p)}>
                    {showPw?'Hide':'Show'}
                  </PwToggle>
                </PwWrapper>
                {fieldErrors.password && <ErrorMsg>{fieldErrors.password}</ErrorMsg>}
              </Field>
              <SubmitBtn type="submit" $loading={loading} disabled={loading} style={{marginTop:'.75rem'}}>
                {loading ? 'Signing in…' : 'Sign in to FinPal'}
              </SubmitBtn>
            </form>

            <HintBox>
              <HintTitle>Demo credentials</HintTitle>
              {hints.map(h => (
                <HintRow key={h.user}>
                  <HintUser>{h.user}</HintUser>
                  <HintRole>{h.role}</HintRole>
                </HintRow>
              ))}
              <HintFooter>
                Password format: FinPal@XX# — see credentials list
              </HintFooter>
            </HintBox>
          </FormCard>
        </FormScroll>
      </FormPanel>
    </Page>
  );
};

export default LoginPage;
