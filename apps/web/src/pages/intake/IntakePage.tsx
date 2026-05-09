import React from 'react';
import styled from 'styled-components';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

import {
  StepList,
  StepCard,
  StepNum,
  StepBody,
  StepLabel,
  StepTitle,
  StepDesc,
  TagList,
  ItemTag,
  HeaderRow,
  HeaderDesc,
  StatsGrid,
  StatCard,
  StatLabel,
  StatValue,
  TitleDesc
} from '../../styles/pages/IntakePage.styles';

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
      <HeaderRow>
        <div>
          <HeaderDesc>
            AI-powered loan application intake · IDP · Document Processing · Assessment
          </HeaderDesc>
        </div>
        <Button $variant="primary" onClick={()=>navigate('/applications/new')}>
          + New application
        </Button>
      </HeaderRow>

      <StatsGrid>
        {[
          {label:'Applications today',value:'4',color:'#0C2B5E'},
          {label:'In processing',value:'1',color:'#BA7517'},
          {label:'Awaiting HITL',value:'2',color:'#A32D2D'},
          {label:'Completed today',value:'1',color:'#0F6E56'},
        ].map(s=>(
          <StatCard key={s.label}>
            <StatLabel>{s.label}</StatLabel>
            <StatValue $color={s.color}>{s.value}</StatValue>
          </StatCard>
        ))}
      </StatsGrid>

      <Card $padding="md">
        <CardHeader>
          <div>
            <CardTitle>AI-powered loan application intake pipeline</CardTitle>
            <TitleDesc>
              FinPal is not a CRM. The core product is the AI-powered intake, document processing and credit assessment pipeline. The real value is in Steps 1–4: automating the slow, manual intake process that costs lenders hours per application.
            </TitleDesc>
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
