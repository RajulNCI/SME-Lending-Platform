import React from 'react';
import styled from 'styled-components';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const StepList = styled.div`display:flex;flex-direction:column;gap:.75rem;`;
const StepCard = styled.div`
  display:flex;gap:1rem;padding:1.25rem;background:#F7FAFC;
  border-radius:12px;border:.5px solid #E2E8F0;align-items:flex-start;
`;
const StepNum = styled.div<{$color:string}>`
  width:40px;height:40px;border-radius:10px;background:${({$color})=>$color};
  display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0;
`;
const StepBody = styled.div`flex:1;`;
const StepLabel = styled.p`font-size:.6875rem;font-weight:700;color:#1A56A0;text-transform:uppercase;letter-spacing:.08em;margin:0 0 .25rem;`;
const StepTitle = styled.p`font-size:.9375rem;font-weight:600;color:#0C2B5E;margin:0 0 .375rem;`;
const StepDesc = styled.p`font-size:.8125rem;color:#718096;margin:0 0 .625rem;line-height:1.6;`;
const TagList = styled.div`display:flex;gap:.375rem;flex-wrap:wrap;`;
const ItemTag = styled.span`font-size:.6875rem;padding:2px 8px;background:#EDF2F7;color:#4A5568;border-radius:4px;font-family:'IBM Plex Mono',monospace;`;

const IntakePage: React.FC = () => {
  const navigate = useNavigate();
  const steps = [
    { num:'1', label:'Step 1', color:'#E6F1FB', icon:'📝',
      title:'Borrower application submission',
      desc:'Borrower accesses the self-service intake portal and submits company details, loan amount, and loan purpose. GDPR Art.13/14 notice presented automatically. Consent for automated processing (Art.22) captured and timestamped.',
      tags:['Company name, CRN','Loan amount & purpose','GDPR consent (Art.13/14, Art.22)','Identity verification consent'] },
    { num:'2', label:'Step 2', color:'#EAF3DE', icon:'📎',
      title:'Document upload',
      desc:'Borrower uploads supporting documents through the secure intake portal. All documents encrypted in transit (TLS 1.3) and at rest (AES-256) within the lender\'s dedicated tenant environment.',
      tags:['Passport / Director photo ID','Management accounts (PDF)','Company registration (CRO)','Tax clearance (ROS)','Bank statements 6–24 months'] },
    { num:'3', label:'Step 3', color:'#EEEDFE', icon:'🤖',
      title:'IDP — Intelligent Document Processing',
      desc:'FinPal\'s AI runs OCR and structured data extraction on all uploaded documents. No raw document data leaves the lender\'s tenant environment. Dedicated per-lender model instance — no shared compute.',
      tags:['OCR financial statements PDF','Extract P&L, balance sheet data','Validate against declared figures','Flag discrepancies for review','GDPR data minimisation applied'] },
    { num:'4', label:'Step 4', color:'#FAEEDA', icon:'⚡',
      title:'AI credit assessment',
      desc:'Credit assessment pipeline runs: CCR check → rules engine → PD/LGD/EAD models → SHAP explainability → pricing → HITL routing decision. All outputs logged immutably per EU AI Act Art.12.',
      tags:['CCR enquiry (OECB API)','Rules engine evaluation','PD model (finpal-pd-v2.4.1)','SHAP reason codes generated','HITL routing decision','Immutable audit log write'] },
  ];

  return (
    <PageLayout title="Intake Pipeline" notifCount={3}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem',flexWrap:'wrap',gap:'.75rem'}}>
        <div>
          <p style={{fontSize:'.8125rem',color:'#718096',margin:0}}>
            AI-powered loan application intake · IDP · Document Processing · Assessment
          </p>
        </div>
        <Button $variant="primary" onClick={()=>navigate('/applications/new')}>
          + New application
        </Button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'.75rem',marginBottom:'1.5rem'}}>
        {[
          {label:'Applications today',value:'4',color:'#0C2B5E'},
          {label:'In processing',value:'1',color:'#BA7517'},
          {label:'Awaiting HITL',value:'2',color:'#A32D2D'},
          {label:'Completed today',value:'1',color:'#0F6E56'},
        ].map(s=>(
          <div key={s.label} style={{background:'#F7FAFC',borderRadius:'10px',padding:'.875rem 1rem',border:'.5px solid #E2E8F0'}}>
            <p style={{fontSize:'.6875rem',fontWeight:600,color:'#718096',textTransform:'uppercase',letterSpacing:'.05em',margin:'0 0 .25rem'}}>{s.label}</p>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:'1.5rem',fontWeight:700,color:s.color,margin:0}}>{s.value}</p>
          </div>
        ))}
      </div>

      <Card $padding="md">
        <CardHeader>
          <div>
            <CardTitle>AI-powered loan application intake pipeline</CardTitle>
            <p style={{fontSize:'.8125rem',color:'#718096',margin:'.25rem 0 0'}}>
              FinPal is not a CRM. The core product is the AI-powered intake, document processing and credit assessment pipeline. The real value is in Steps 1–4: automating the slow, manual intake process that costs lenders hours per application.
            </p>
          </div>
          <Badge $variant="info">IDP · Assessment</Badge>
        </CardHeader>
        <CardDivider />
        <StepList>
          {steps.map(s=>(
            <StepCard key={s.num}>
              <StepNum $color={s.color}>{s.icon}</StepNum>
              <StepBody>
                <StepLabel>{s.label}</StepLabel>
                <StepTitle>{s.title}</StepTitle>
                <StepDesc>{s.desc}</StepDesc>
                <TagList>{s.tags.map(t=><ItemTag key={t}>{t}</ItemTag>)}</TagList>
              </StepBody>
            </StepCard>
          ))}
        </StepList>
      </Card>
    </PageLayout>
  );
};

export default IntakePage;
