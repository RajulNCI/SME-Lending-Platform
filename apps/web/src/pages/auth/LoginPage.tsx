import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME } from '../../types/auth';

const fadeIn = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;

const Page = styled.div`
  min-height:100vh; display:grid; grid-template-columns:1fr;
  @media(min-width:768px){grid-template-columns:45% 1fr;}
  @media(min-width:1100px){grid-template-columns:50% 1fr;}
`;

const Brand = styled.aside`
  display:none;
  @media(min-width:768px){
    display:flex; flex-direction:column; justify-content:space-between;
    background:#0C2B5E; padding:2.5rem; min-height:100vh;
  }
`;

const BrandTop = styled.div`display:flex;align-items:center;gap:.75rem;`;
const LogoMark = styled.div`
  width:40px;height:40px;background:#1D9E75;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:1.125rem;color:#fff;flex-shrink:0;
`;
const BrandName = styled.div``;
const BrandTitle = styled.div`font-family:'Inter',sans-serif;font-size:1.125rem;font-weight:700;color:#fff;`;
const BrandSub = styled.div`font-size:.6875rem;color:#1D9E75;letter-spacing:.08em;font-weight:600;text-transform:uppercase;`;

const BrandHero = styled.div`flex:1;display:flex;flex-direction:column;justify-content:center;padding:2rem 0;`;
const BrandHeadline = styled.h1`font-family:'Inter',sans-serif;font-size:2rem;font-weight:700;color:#fff;line-height:1.2;margin-bottom:1rem;`;
const BrandDesc = styled.p`font-size:.9375rem;color:#85B7EB;line-height:1.75;max-width:360px;`;

const Stats = styled.div`display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;`;
const Stat = styled.div`border-top:1px solid #1A56A0;padding-top:1rem;`;
const StatVal = styled.div`font-family:'Inter',sans-serif;font-size:1.25rem;font-weight:700;color:#1D9E75;`;
const StatLabel = styled.div`font-size:.6875rem;color:#85B7EB;margin-top:.25rem;`;

const FormPanel = styled.main`
  display:flex;flex-direction:column;background:#fff;min-height:100vh;
`;
const MobileNav = styled.div`
  display:flex;align-items:center;gap:.625rem;background:#0C2B5E;padding:1rem 1.25rem;flex-shrink:0;
  @media(min-width:768px){display:none;}
`;
const MobileNavName = styled.span`font-family:'Inter',sans-serif;font-size:1rem;font-weight:700;color:#fff;`;
const MobileNavSub = styled.span`font-size:.6875rem;color:#1D9E75;font-weight:600;letter-spacing:.06em;`;

const FormScroll = styled.div`
  flex:1;display:flex;align-items:center;justify-content:center;
  padding:2rem 1.25rem;overflow-y:auto;
  @media(min-width:768px){padding:3rem;}
`;
const FormCard = styled.div`width:100%;max-width:400px;animation:${fadeIn} .35s ease both;`;
const FormTitle = styled.h2`font-family:'Inter',sans-serif;font-size:1.75rem;font-weight:700;color:#0C2B5E;margin:0 0 .25rem;`;
const FormSubtitle = styled.p`font-size:.9375rem;color:#718096;margin:0 0 1.75rem;`;

const Field = styled.div`margin-bottom:1.125rem;`;
const Label = styled.label`display:block;font-size:.875rem;font-weight:500;color:#2D3748;margin-bottom:.375rem;`;
const Input = styled.input<{$error?:boolean}>`
  width:100%;height:48px;padding:0 1rem;
  border:1.5px solid ${({$error})=>$error?'#E24B4A':'#E2E8F0'};
  border-radius:8px;font-size:16px;color:#2D3748;background:#fff;
  -webkit-appearance:none;transition:border-color .15s,box-shadow .15s;
  &::placeholder{color:#A0AEC0;}
  &:focus{outline:none;border-color:#378ADD;box-shadow:0 0 0 3px rgba(55,138,221,.2);}
`;
const ErrorMsg = styled.p`font-size:.75rem;color:#E24B4A;margin:.25rem 0 0;`;
const AlertBox = styled.div`background:#FFF5F5;border:1px solid #FED7D7;border-radius:8px;padding:.75rem 1rem;font-size:.875rem;color:#C53030;margin-bottom:1.25rem;`;

const PwWrapper = styled.div`position:relative;`;
const PwToggle = styled.button`
  position:absolute;right:1rem;top:50%;transform:translateY(-50%);
  font-size:.8125rem;font-weight:500;color:#718096;padding:.5rem;margin:-.5rem;
  &:hover{color:#1A56A0;}
`;

const SubmitBtn = styled.button<{$loading?:boolean}>`
  width:100%;height:52px;background:#0C2B5E;color:#fff;border-radius:10px;
  font-size:1rem;font-weight:600;font-family:'Inter',sans-serif;
  transition:background .15s,transform .1s;
  opacity:${({$loading})=>$loading?.7:1};
  cursor:${({$loading})=>$loading?'not-allowed':'pointer'};
  &:hover:not(:disabled){background:#1A56A0;}
  &:active:not(:disabled){transform:scale(.98);}
`;

const HintBox = styled.div`
  margin-top:1.5rem;background:#F7FAFC;border:1px solid #E2E8F0;border-radius:10px;
  padding:1rem;font-size:.8125rem;color:#4A5568;
`;
const HintTitle = styled.p`font-weight:600;color:#0C2B5E;margin:0 0 .5rem;font-size:.8125rem;`;
const HintRow = styled.div`display:flex;justify-content:space-between;padding:.25rem 0;border-bottom:.5px solid #E2E8F0;&:last-child{border:none;}`;
const HintUser = styled.span`color:#1A56A0;font-family:'IBM Plex Mono',monospace;font-size:.75rem;`;
const HintRole = styled.span`color:#718096;font-size:.75rem;`;

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
              <p style={{fontSize:'.6875rem',color:'#A0AEC0',margin:'.5rem 0 0'}}>
                Password format: FinPal@XX# — see credentials list
              </p>
            </HintBox>
          </FormCard>
        </FormScroll>
      </FormPanel>
    </Page>
  );
};

export default LoginPage;
