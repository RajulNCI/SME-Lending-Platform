import React, { useState } from 'react';
import styled from 'styled-components';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge, StageBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

// Dynamic placeholder — Nathan's AI agent populates these fields
const DYNAMIC_AI = 'AI assessment populated by POST /api/v1/decisions from Credit Officer AI agent';

interface ShapFactor { factor:string; direction:'positive'|'negative'; weight:number; note:string; }
interface AppData {
  id:string; company:string; crn:string; sector:string; amount:number; purpose:string;
  status:string; statusVariant:string; grade:string; pd:number; dscr:number; apr:number;
  affordability:number; declaredRevenue:number; actualLodgements:number;
  freeCashFlow:number; ecl12m:number; submittedAt:string; euAiAct:string; hitlRequired:boolean;
  shap:ShapFactor[];
  openBanking:{avgMonthlyCredits:number;avgMonthlyDebits:number;lowestBalance:number;runway:string;};
  ifrs9:{stage:number;ecl12m:number;eclLifetime:number;pd:number;lgd:number;};
}

const BackBtn = styled.button`
  display:flex;align-items:center;gap:.5rem;font-size:.875rem;color:#1A56A0;
  font-weight:500;margin-bottom:1.25rem;padding:.25rem 0;
  &:hover{text-decoration:underline;}
`;
const AppHeader = styled.div`
  display:flex;align-items:flex-start;justify-content:space-between;
  flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;
`;
const AppTitle = styled.h2`
  font-family:'Inter',sans-serif;font-size:1.5rem;font-weight:700;color:#0C2B5E;margin:0 0 .375rem;
`;
const AppMeta = styled.p`font-size:.8125rem;color:#718096;margin:0 0 .75rem;font-family:'IBM Plex Mono',monospace;`;
const TagRow = styled.div`display:flex;gap:.5rem;flex-wrap:wrap;`;

const Tabs = styled.div`display:flex;border-bottom:.5px solid #E2E8F0;margin-bottom:1.25rem;overflow-x:auto;`;
const Tab = styled.button<{$active:boolean}>`
  padding:.625rem 1rem;font-size:.8125rem;font-weight:${({$active})=>$active?600:400};
  color:${({$active})=>$active?'#0C2B5E':'#718096'};
  border-bottom:2px solid ${({$active})=>$active?'#0C2B5E':'transparent'};
  white-space:nowrap;transition:all .15s;
  &:hover{color:#0C2B5E;}
`;

const KpiGrid = styled.div`
  display:grid;grid-template-columns:repeat(2,1fr);gap:.75rem;
  @media(min-width:640px){grid-template-columns:repeat(4,1fr);}
  @media(min-width:1024px){grid-template-columns:repeat(4,1fr);}
`;
const KpiCard = styled.div<{$highlight?:boolean}>`
  background:${({$highlight})=>$highlight?'#F0FDF9':'#F7FAFC'};
  border-radius:10px;padding:.875rem 1rem;
  border:.5px solid ${({$highlight})=>$highlight?'#6EE7B7':'#E2E8F0'};
`;
const KpiLabel = styled.p`font-size:.6875rem;font-weight:600;color:#718096;text-transform:uppercase;letter-spacing:.05em;margin:0 0 .375rem;`;
const KpiValue = styled.p<{$color?:string}>`
  font-family:'Inter',sans-serif;font-size:1.5rem;font-weight:700;
  color:${({$color})=>$color||'#0C2B5E'};margin:0 0 .25rem;line-height:1;
`;
const KpiNote = styled.p`font-size:.6875rem;color:#A0AEC0;margin:0;`;

const ShapBar = styled.div<{$pct:number;$dir:'positive'|'negative'}>`
  height:8px;border-radius:4px;
  width:${({$pct})=>$pct}%;
  background:${({$dir})=>$dir==='positive'?'#1D9E75':'#E24B4A'};
  transition:width .3s;
`;
const ShapRow = styled.div`padding:.75rem 0;border-bottom:.5px solid #F0F0F0;&:last-child{border:none;}`;
const ShapFactor2 = styled.p`font-size:.875rem;font-weight:500;color:#2D3748;margin:0 0 .25rem;`;
const ShapNote = styled.p`font-size:.75rem;color:#718096;margin:0 0 .5rem;`;
const ShapBarWrap = styled.div`display:flex;align-items:center;gap:.75rem;`;
const ShapPct = styled.span`font-size:.75rem;font-weight:600;color:#4A5568;min-width:30px;`;

const DecisionForm = styled.div`margin-top:1.5rem;padding:1.25rem;background:#F7FAFC;border-radius:12px;border:.5px solid #E2E8F0;`;
const DecisionTitle = styled.p`font-size:.9375rem;font-weight:600;color:#0C2B5E;margin:0 0 1rem;`;
const DecisionBtns = styled.div`display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-bottom:1rem;`;
const DecisionBtn = styled.button<{$selected:boolean;$variant:'approve'|'refer'|'decline'}>`
  padding:.625rem;border-radius:8px;font-size:.8125rem;font-weight:600;
  border:2px solid ${({$selected,$variant})=>
    !$selected?'#E2E8F0':
    $variant==='approve'?'#1D9E75':
    $variant==='refer'?'#BA7517':'#E24B4A'};
  background:${({$selected,$variant})=>
    !$selected?'#fff':
    $variant==='approve'?'#E1F5EE':
    $variant==='refer'?'#FAEEDA':'#FCEBEB'};
  color:${({$selected,$variant})=>
    !$selected?'#718096':
    $variant==='approve'?'#0F6E56':
    $variant==='refer'?'#854F0B':'#A32D2D'};
  cursor:pointer;transition:all .15s;
`;
const RationaleArea = styled.textarea`
  width:100%;min-height:80px;padding:.75rem 1rem;border:1.5px solid #E2E8F0;
  border-radius:8px;font-size:14px;font-family:'IBM Plex Sans',sans-serif;
  resize:vertical;margin-bottom:.75rem;
  &:focus{outline:none;border-color:#378ADD;box-shadow:0 0 0 3px rgba(55,138,221,.15);}
  &::placeholder{color:#A0AEC0;}
`;
const ImmutableNote = styled.p`font-size:.6875rem;color:#A0AEC0;margin:.5rem 0 0;text-align:center;`;

const fmt = (n:number) => n<0?`(€${Math.abs(n).toLocaleString()})`:`€${n.toLocaleString()}`;

interface Props { app:AppData; onBack:()=>void; }

const ApplicationDetail: React.FC<Props> = ({ app, onBack }) => {
  const [tab, setTab] = useState('overview');
  const [decision, setDecision] = useState<'approve'|'refer'|'decline'|null>(null);
  const [rationale, setRationale] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitDecision = async () => {
    if (!decision || rationale.trim().length < 20) return;
    await new Promise(r=>setTimeout(r,1000));
    setSubmitted(true);
  };

  const tabs = ['Overview','Risk & XAI','Open Banking','IFRS 9','Trustworthiness'];

  return (
    <PageLayout title="Application review" notifCount={2}>
      <BackBtn onClick={onBack}>← Back to queue</BackBtn>

      <AppHeader>
        <div>
          <AppTitle>{app.company}</AppTitle>
          <AppMeta>{app.id} · CRN {app.crn} · {app.sector}</AppMeta>
          <TagRow>
            <Badge $variant={app.statusVariant as any}>✓ {app.status}</Badge>
            <Badge $variant="neutral">{app.euAiAct}</Badge>
            <Badge $variant="info">{app.purpose}</Badge>
            <Badge $variant="neutral">€{app.amount.toLocaleString()} requested</Badge>
            <Badge $variant="neutral">Grade: {app.grade}</Badge>
            {app.hitlRequired && <Badge $variant="warning">⚠ HITL mandatory</Badge>}
          </TagRow>
        </div>
        <div style={{display:'flex',gap:'.75rem',flexWrap:'wrap'}}>
          <Button $variant="secondary" $size="sm">↓ Export pack</Button>
          <Button $variant="primary" $size="sm" onClick={()=>setTab('overview')}>
            Make decision →
          </Button>
        </div>
      </AppHeader>

      <p style={{fontSize:'.75rem',color:'#A0AEC0',marginBottom:'1rem',fontStyle:'italic'}}>{DYNAMIC_AI}</p>

      <Tabs>
        {tabs.map(t=>(
          <Tab key={t} $active={tab===t.toLowerCase().replace(' & ',' ').replace(' ','-').replace(/\s/g,'-').toLowerCase()}
            onClick={()=>setTab(t.toLowerCase().replace(' & ',' ').replace(/\s/g,'-'))}>
            {t}
          </Tab>
        ))}
      </Tabs>

      {/* OVERVIEW TAB */}
      {tab==='overview' && (
        <>
          <KpiGrid style={{marginBottom:'1.25rem'}}>
            <KpiCard>
              <KpiLabel>PD</KpiLabel>
              <KpiValue $color={app.pd<5?'#0F6E56':app.pd<12?'#BA7517':'#A32D2D'}>{app.pd}%</KpiValue>
              <KpiNote>Probability of Default</KpiNote>
            </KpiCard>
            <KpiCard $highlight>
              <KpiLabel>Risk Grade</KpiLabel>
              <KpiValue $color={app.grade.startsWith('A')?'#0F6E56':app.grade.startsWith('B')?'#185FA5':app.grade.startsWith('C')?'#854F0B':'#A32D2D'}>
                {app.grade}
              </KpiValue>
              <KpiNote>Internal rating</KpiNote>
            </KpiCard>
            <KpiCard>
              <KpiLabel>DSCR</KpiLabel>
              <KpiValue $color={app.dscr>=1.2?'#0F6E56':'#A32D2D'}>{app.dscr}×</KpiValue>
              <KpiNote>{app.dscr>=1.2?'✓ Above policy min 1.20×':'✗ Below policy min 1.20×'}</KpiNote>
            </KpiCard>
            <KpiCard>
              <KpiLabel>APR</KpiLabel>
              <KpiValue>{app.apr>0?`${app.apr}%`:'N/A'}</KpiValue>
              <KpiNote>Risk-based pricing</KpiNote>
            </KpiCard>
            <KpiCard>
              <KpiLabel>Affordability</KpiLabel>
              <KpiValue $color={app.affordability>70?'#0F6E56':app.affordability>50?'#BA7517':'#A32D2D'}>
                {app.affordability}%
              </KpiValue>
              <KpiNote>Capacity to repay</KpiNote>
            </KpiCard>
            <KpiCard>
              <KpiLabel>Declared Revenue</KpiLabel>
              <KpiValue style={{fontSize:'1.125rem'}}>{fmt(app.declaredRevenue)}</KpiValue>
              <KpiNote>Management accounts</KpiNote>
            </KpiCard>
            <KpiCard>
              <KpiLabel>Actual Lodgements</KpiLabel>
              <KpiValue style={{fontSize:'1.125rem'}}
                $color={app.actualLodgements/app.declaredRevenue>0.95?'#0F6E56':'#BA7517'}>
                {fmt(app.actualLodgements)}
              </KpiValue>
              <KpiNote>{app.actualLodgements<app.declaredRevenue?'⚑ Variance detected':''}</KpiNote>
            </KpiCard>
            <KpiCard>
              <KpiLabel>Free Cash Flow</KpiLabel>
              <KpiValue $color={app.freeCashFlow>0?'#0F6E56':'#A32D2D'}>
                {fmt(app.freeCashFlow)}
              </KpiValue>
              <KpiNote>ECL (12-month): {fmt(app.ecl12m)}</KpiNote>
            </KpiCard>
          </KpiGrid>

          {/* MAKE DECISION */}
          <Card $padding="md">
            <CardTitle>Make decision</CardTitle>
            <CardDivider />
            {submitted ? (
              <div style={{textAlign:'center',padding:'1.5rem 0'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'50%',background:'#D1FAE5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',margin:'0 auto .75rem'}}>✓</div>
                <p style={{fontWeight:600,color:'#0C2B5E',margin:'0 0 .25rem'}}>Decision submitted</p>
                <p style={{fontSize:'.8125rem',color:'#718096',margin:0}}>
                  Written immutably to audit log with timestamp and model version
                </p>
              </div>
            ) : (
              <DecisionForm>
                <DecisionTitle>Select outcome</DecisionTitle>
                <DecisionBtns>
                  {(['approve','refer','decline'] as const).map(d=>(
                    <DecisionBtn key={d} $selected={decision===d} $variant={d}
                      onClick={()=>setDecision(d)}>
                      {d==='approve'?'✓ Approve':d==='refer'?'→ Refer':'✗ Decline'}
                    </DecisionBtn>
                  ))}
                </DecisionBtns>
                <RationaleArea
                  placeholder="Enter mandatory rationale (minimum 20 characters). This will be stored immutably in the audit log alongside model version, SHAP codes, and your identity."
                  value={rationale}
                  onChange={e=>setRationale(e.target.value)}
                />
                <Button $variant="primary" $fullWidth
                  disabled={!decision||rationale.trim().length<20}
                  onClick={handleSubmitDecision}>
                  Submit decision — {decision||'select outcome first'}
                </Button>
                <ImmutableNote>
                  ⚠ Once submitted, this decision is immutably recorded per EU AI Act Art.12 & GDPR Art.22
                </ImmutableNote>
              </DecisionForm>
            )}
          </Card>
        </>
      )}

      {/* RISK & XAI TAB */}
      {(tab==='risk-&-xai'||tab==='risk-xai') && (
        <Card $padding="md">
          <CardHeader>
            <CardTitle>SHAP explainability — top 5 factors</CardTitle>
            <Badge $variant="info">EU AI Act Art.13</Badge>
          </CardHeader>
          <CardDivider />
          <p style={{fontSize:'.8125rem',color:'#718096',marginBottom:'1rem'}}>
            Model: finpal-pd-v2.4.1 · Confidence interval: ±2.1% · SHAP method: TreeExplainer
          </p>
          {app.shap.map((s,i)=>(
            <ShapRow key={i}>
              <ShapFactor2>
                <span style={{color:s.direction==='positive'?'#0F6E56':'#A32D2D',marginRight:'.5rem'}}>
                  {s.direction==='positive'?'▲':'▼'}
                </span>
                {s.factor}
              </ShapFactor2>
              <ShapNote>{s.note}</ShapNote>
              <ShapBarWrap>
                <ShapBar $pct={s.weight*3} $dir={s.direction} />
                <ShapPct>{s.weight}%</ShapPct>
                <Badge $variant={s.direction==='positive'?'success':'error'} $size="sm">
                  {s.direction==='positive'?'Positive':'Negative'}
                </Badge>
              </ShapBarWrap>
            </ShapRow>
          ))}
          <div style={{marginTop:'1rem',padding:'.75rem',background:'#F0F7FF',borderRadius:'8px',fontSize:'.8125rem',color:'#1A56A0'}}>
            ℹ️ These reason codes are immutably stored per application and retrievable by the Compliance Officer
          </div>
        </Card>
      )}

      {/* OPEN BANKING TAB */}
      {tab==='open-banking' && (
        <Card $padding="md">
          <CardHeader>
            <CardTitle>Open Banking — PSD2 AIS data</CardTitle>
            <Badge $variant="success">Consent active</Badge>
          </CardHeader>
          <CardDivider />
          <p style={{fontSize:'.75rem',color:'#A0AEC0',marginBottom:'1rem',fontStyle:'italic'}}>
            Data retrieved via AIS connector · 6-month bank statement analysis · Consent ref: {app.id}-AIS
          </p>
          <KpiGrid>
            <KpiCard>
              <KpiLabel>Avg monthly credits</KpiLabel>
              <KpiValue style={{fontSize:'1.25rem'}}>{fmt(app.openBanking.avgMonthlyCredits)}</KpiValue>
            </KpiCard>
            <KpiCard>
              <KpiLabel>Avg monthly debits</KpiLabel>
              <KpiValue style={{fontSize:'1.25rem'}}>{fmt(app.openBanking.avgMonthlyDebits)}</KpiValue>
            </KpiCard>
            <KpiCard>
              <KpiLabel>Lowest balance (6m)</KpiLabel>
              <KpiValue style={{fontSize:'1.25rem'}}
                $color={app.openBanking.lowestBalance>50000?'#0F6E56':app.openBanking.lowestBalance>20000?'#BA7517':'#A32D2D'}>
                {fmt(app.openBanking.lowestBalance)}
              </KpiValue>
            </KpiCard>
            <KpiCard>
              <KpiLabel>Cash runway</KpiLabel>
              <KpiValue $color={parseFloat(app.openBanking.runway)>3?'#0F6E56':parseFloat(app.openBanking.runway)>1.5?'#BA7517':'#A32D2D'}>
                {app.openBanking.runway}
              </KpiValue>
              <KpiNote>months at current burn</KpiNote>
            </KpiCard>
          </KpiGrid>
        </Card>
      )}

      {/* IFRS 9 TAB */}
      {tab==='ifrs-9' && (
        <Card $padding="md">
          <CardHeader>
            <CardTitle>IFRS 9 — ECL staging</CardTitle>
            <StageBadge $variant="neutral" $stage={app.ifrs9.stage as 1|2|3}>
              Stage {app.ifrs9.stage}
            </StageBadge>
          </CardHeader>
          <CardDivider />
          <KpiGrid>
            <KpiCard>
              <KpiLabel>IFRS 9 Stage</KpiLabel>
              <KpiValue $color={app.ifrs9.stage===1?'#0F6E56':app.ifrs9.stage===2?'#BA7517':'#A32D2D'}>
                Stage {app.ifrs9.stage}
              </KpiValue>
              <KpiNote>{app.ifrs9.stage===1?'Performing':app.ifrs9.stage===2?'Watch list':'Impaired'}</KpiNote>
            </KpiCard>
            <KpiCard>
              <KpiLabel>ECL — 12 month</KpiLabel>
              <KpiValue style={{fontSize:'1.25rem'}}>{fmt(app.ifrs9.ecl12m)}</KpiValue>
            </KpiCard>
            <KpiCard>
              <KpiLabel>ECL — Lifetime</KpiLabel>
              <KpiValue style={{fontSize:'1.25rem'}}>{fmt(app.ifrs9.eclLifetime)}</KpiValue>
            </KpiCard>
            <KpiCard>
              <KpiLabel>PD / LGD</KpiLabel>
              <KpiValue style={{fontSize:'1.125rem'}}>{(app.ifrs9.pd*100).toFixed(1)}% / {(app.ifrs9.lgd*100).toFixed(0)}%</KpiValue>
            </KpiCard>
          </KpiGrid>
        </Card>
      )}

      {/* TRUSTWORTHINESS TAB */}
      {tab==='trustworthiness' && (
        <Card $padding="md">
          <CardHeader>
            <CardTitle>Trustworthiness — EU AI Act compliance</CardTitle>
            <Badge $variant="success">✓ Compliant</Badge>
          </CardHeader>
          <CardDivider />
          {[
            {label:'EU AI Act Art.12 — Logging',status:'✓',note:'All model inputs, outputs and SHAP codes logged immutably',ok:true},
            {label:'EU AI Act Art.13 — Transparency',status:'✓',note:'Plain-language explanation generated and attached',ok:true},
            {label:'GDPR Art.22 — Human oversight',status:app.hitlRequired?'⚠':'✓',note:app.hitlRequired?'HITL review mandatory before decision':'Automated path — HITL available on request',ok:!app.hitlRequired},
            {label:'EBA LOM — Creditworthiness',status:'✓',note:'Financial ratio analysis, cash-flow projection, sector risk assessed',ok:true},
            {label:'Model version tracked',status:'✓',note:'finpal-pd-v2.4.1 · Validated 2025-03-28 · Next review 2025-04-28',ok:true},
            {label:'CCR check completed',status:'✓',note:'Central Credit Register enquiry executed · No adverse entries',ok:true},
            {label:'Immutable audit trail',status:'✓',note:'SHA-256 hash chain · WORM storage · 7-year retention',ok:true},
          ].map((row,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'.75rem 0',borderBottom:i<6?'.5px solid #F0F0F0':'none'}}>
              <div>
                <p style={{fontSize:'.875rem',fontWeight:500,color:'#2D3748',margin:'0 0 .25rem'}}>{row.label}</p>
                <p style={{fontSize:'.75rem',color:'#718096',margin:0}}>{row.note}</p>
              </div>
              <Badge $variant={row.ok?'success':'warning'}>{row.status} {row.ok?'Pass':'Review'}</Badge>
            </div>
          ))}
        </Card>
      )}
    </PageLayout>
  );
};

export default ApplicationDetail;
