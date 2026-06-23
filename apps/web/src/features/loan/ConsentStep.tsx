import React from 'react';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  NavRow, SectionLabel, ConsentCard, CheckBox, ErrorBox, WarningBox,
} from '../../styles/pages/LoanApplicationPage.styles';
import type { Form, Errors } from './types';

const CONSENTS: { name: keyof Form; label: string }[] = [
  {
    name: 'consentData',
    label:
      'I consent to FinPal processing my personal and business data for credit assessment under GDPR Article 6(1)(b).',
  },
  {
    name: 'consentCCR',
    label:
      'I authorise FinPal to submit an enquiry to the Central Credit Register (CCR) operated by the Central Bank of Ireland.',
  },
  {
    name: 'consentAI',
    label:
      'I understand an AI system will assist in the credit decision (GDPR Art.22) and I have the right to request human review and appeal.',
  },
];

interface SummaryRow {
  label: string;
  value: string;
  mono?: boolean;
}

interface Props {
  form: Form;
  appId: string;
  file: File | null;
  errors: Errors;
  apiError: string;
  submitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const num = (s: string) => parseFloat(s.replace(/,/g, '')) || 0;

const ConsentStep: React.FC<Props> = ({
  form, appId, file, errors, apiError, submitting, onChange, onBack, onSubmit,
}) => {
  const summary: SummaryRow[] = [
    { label: 'Application ID', value: appId, mono: true },
    { label: 'Company', value: form.borrower },
    { label: 'Sector', value: form.sector },
    { label: 'Requested amount', value: `€${num(form.requestedAmount).toLocaleString()}` },
    { label: 'Loan purpose', value: form.loanPurpose },
    { label: 'Document type', value: form.documentType },
    { label: 'Accounting period', value: form.accountingPeriod },
    { label: 'Revenue', value: `€${num(form.revenue).toLocaleString()}` },
    { label: 'EBITDA', value: `€${num(form.ebitda).toLocaleString()}` },
    { label: 'DSCR', value: `${form.dscr}×` },
    { label: 'Document', value: file?.name || 'Not uploaded' },
  ];

  return (
    <Card $padding="lg">
      <CardHeader>
        <CardTitle>Confirm &amp; submit</CardTitle>
        <Badge $variant="info">Step 3 of 3</Badge>
      </CardHeader>
      <CardDivider />

      <SectionLabel>Application summary</SectionLabel>
      {summary.map(({ label, value, mono }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '.5rem 0', borderBottom: '.5px solid #F0F0F0', fontSize: '.875rem' }}>
          <span style={{ color: '#718096' }}>{label}</span>
          <span style={{ fontWeight: 500, color: '#2D3748', textAlign: 'right', maxWidth: '55%', wordBreak: 'break-word', fontFamily: mono ? "'IBM Plex Mono',monospace" : 'inherit' }}>
            {value}
          </span>
        </div>
      ))}

      <CardDivider />
      <SectionLabel>Consent &amp; declarations — GDPR Art.22</SectionLabel>

      {CONSENTS.map((c) => (
        <div key={c.name}>
          <ConsentCard $checked={form[c.name] as boolean}>
            <CheckBox $checked={form[c.name] as boolean}>
              {form[c.name] && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </CheckBox>
            <input
              type="checkbox"
              name={c.name}
              checked={form[c.name] as boolean}
              onChange={onChange}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
            />
            <span style={{ fontSize: '.875rem', color: '#2D3748', lineHeight: 1.5 }}>{c.label}</span>
          </ConsentCard>
          {errors[c.name] && (
            <p style={{ fontSize: '.75rem', color: '#E24B4A', margin: '-8px 0 8px 14px' }}>
              {errors[c.name]}
            </p>
          )}
        </div>
      ))}

      {apiError && <ErrorBox>⚠️ {apiError}</ErrorBox>}

      <WarningBox>
        ⚠️ By submitting you confirm all information is accurate and will be sent to the AI credit engine immediately.
      </WarningBox>

      <NavRow>
        <Button $variant="secondary" onClick={onBack}>← Back</Button>
        <Button $variant="primary" $loading={submitting} disabled={submitting} onClick={onSubmit}>
          {submitting ? 'Submitting to AI…' : 'Submit application →'}
        </Button>
      </NavRow>
    </Card>
  );
};

export default ConsentStep;
