import React from 'react';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Grid2, Field, Label, Req, Input, Select, Textarea, ErrMsg, Hint,
  CurrWrap, CurrSym, NavRow, SectionLabel, PrefilledNote, InfoBox,
} from '../../styles/pages/LoanApplicationPage.styles';
import type { Form, Prefilled, Errors } from './types';

const SECTORS = [
  'Agriculture & Forestry', 'Construction', 'Education', 'Food & Beverage',
  'Healthcare', 'Hospitality & Tourism', 'IT & Technology', 'Manufacturing',
  'Professional Services', 'Retail', 'Transport & Logistics', 'Other',
];
const DOC_TYPES = [
  'Financial statement', 'Management accounts', 'Audited financial statements',
  'Bank statements', 'Tax clearance', 'Company registration',
];
const PERIODS = [
  'YE Dec 2024', 'YE Dec 2023', 'YE Mar 2025', 'YE Mar 2024',
  'Half-year Jun 2024', 'Q3 2024', 'YTD 2025',
];
const LOAN_PURPOSES = [
  'Working capital', 'Equipment purchase', 'Business expansion',
  'Property acquisition', 'Refinancing', 'Invoice financing', 'Other',
];

interface Props {
  form: Form;
  prefilled: Prefilled;
  errors: Errors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onBack: () => void;
  onNext: () => void;
}

const ReviewStep: React.FC<Props> = ({ form, prefilled, errors, onChange, onBack, onNext }) => {
  const autoCount = Object.keys(prefilled).length;

  return (
    <Card $padding="lg">
      <CardHeader>
        <CardTitle>Review &amp; complete details</CardTitle>
        <Badge $variant="info">Step 2 of 3</Badge>
      </CardHeader>
      <CardDivider />

      {autoCount > 0 && (
        <>
          <PrefilledNote>✓ {autoCount} fields auto-filled from document</PrefilledNote>
          <p style={{ fontSize: '.8125rem', color: '#718096', marginBottom: '1.25rem' }}>
            Fields with a green border were extracted from your document. Review and correct if needed.
          </p>
        </>
      )}

      <SectionLabel>Company &amp; loan</SectionLabel>
      <Grid2>
        <Field>
          <Label>Company / borrower name <Req>*</Req></Label>
          <Input name="borrower" placeholder="Acme Manufacturing Ltd" value={form.borrower} onChange={onChange} $error={!!errors.borrower} $prefilled={prefilled.borrower} />
          {errors.borrower && <ErrMsg>{errors.borrower}</ErrMsg>}
        </Field>
        <Field>
          <Label>Sector <Req>*</Req></Label>
          <Select name="sector" value={form.sector} onChange={onChange} $error={!!errors.sector}>
            <option value="">Select sector</option>
            {SECTORS.map((s) => <option key={s}>{s}</option>)}
          </Select>
          {errors.sector && <ErrMsg>{errors.sector}</ErrMsg>}
        </Field>
      </Grid2>
      <Grid2>
        <Field>
          <Label>Requested amount <Req>*</Req></Label>
          <CurrWrap>
            <CurrSym>€</CurrSym>
            <Input name="requestedAmount" placeholder="50,000" value={form.requestedAmount} onChange={onChange} $error={!!errors.requestedAmount} $prefilled={prefilled.requestedAmount} style={{ paddingLeft: '2rem' }} />
          </CurrWrap>
          {errors.requestedAmount && <ErrMsg>{errors.requestedAmount}</ErrMsg>}
          <Hint>Min €10,000</Hint>
        </Field>
        <Field>
          <Label>Loan purpose <Req>*</Req></Label>
          <Select name="loanPurpose" value={form.loanPurpose} onChange={onChange} $error={!!errors.loanPurpose}>
            <option value="">Select purpose</option>
            {LOAN_PURPOSES.map((p) => <option key={p}>{p}</option>)}
          </Select>
          {errors.loanPurpose && <ErrMsg>{errors.loanPurpose}</ErrMsg>}
        </Field>
      </Grid2>

      <CardDivider />
      <SectionLabel>Document details</SectionLabel>
      <Grid2>
        <Field>
          <Label>Document type <Req>*</Req></Label>
          <Select name="documentType" value={form.documentType} onChange={onChange} $error={!!errors.documentType}>
            <option value="">Select type</option>
            {DOC_TYPES.map((d) => <option key={d}>{d}</option>)}
          </Select>
          {errors.documentType && <ErrMsg>{errors.documentType}</ErrMsg>}
        </Field>
        <Field>
          <Label>Accounting period <Req>*</Req></Label>
          <Select name="accountingPeriod" value={form.accountingPeriod} onChange={onChange} $error={!!errors.accountingPeriod}>
            <option value="">Select period</option>
            {PERIODS.map((p) => <option key={p}>{p}</option>)}
          </Select>
          {errors.accountingPeriod && <ErrMsg>{errors.accountingPeriod}</ErrMsg>}
        </Field>
      </Grid2>

      <CardDivider />
      <SectionLabel>Financial figures — sent to AI agent <Req>*</Req></SectionLabel>
      <InfoBox>ℹ️ These values are sent directly to the AI credit analysis engine.</InfoBox>
      <Grid2>
        <Field>
          <Label>Annual revenue <Req>*</Req></Label>
          <CurrWrap>
            <CurrSym>€</CurrSym>
            <Input name="revenue" placeholder="1,250,000" value={form.revenue} onChange={onChange} $error={!!errors.revenue} $prefilled={prefilled.revenue} style={{ paddingLeft: '2rem' }} />
          </CurrWrap>
          {errors.revenue && <ErrMsg>{errors.revenue}</ErrMsg>}
        </Field>
        <Field>
          <Label>EBITDA <Req>*</Req></Label>
          <CurrWrap>
            <CurrSym>€</CurrSym>
            <Input name="ebitda" placeholder="240,000" value={form.ebitda} onChange={onChange} $error={!!errors.ebitda} $prefilled={prefilled.ebitda} style={{ paddingLeft: '2rem' }} />
          </CurrWrap>
          {errors.ebitda && <ErrMsg>{errors.ebitda}</ErrMsg>}
          <Hint>Earnings before interest, tax, depreciation &amp; amortisation</Hint>
        </Field>
      </Grid2>
      <Grid2>
        <Field>
          <Label>DSCR <Req>*</Req></Label>
          <Input name="dscr" type="number" step="0.01" placeholder="1.8" value={form.dscr} onChange={onChange} $error={!!errors.dscr} $prefilled={prefilled.dscr} />
          {errors.dscr && <ErrMsg>{errors.dscr}</ErrMsg>}
          <Hint>Debt Service Coverage Ratio — policy min 1.20×</Hint>
        </Field>
        <Field>
          <Label>Notes</Label>
          <Textarea name="notes" rows={3} placeholder="Additional context for the credit officer…" value={form.notes} onChange={onChange} />
        </Field>
      </Grid2>

      <NavRow>
        <Button $variant="secondary" onClick={onBack}>← Back</Button>
        <Button $variant="primary" onClick={onNext}>Next: Confirm →</Button>
      </NavRow>
    </Card>
  );
};

export default ReviewStep;
