/**
 * Loan Application Form — updated for Nathan's API integration
 *
 * On submit:
 *   1. POST /api/v1/uploads  (form data + documents)
 *   2. POST /api/v1/decisions/analyze  (trigger AI analysis)
 *   3. Redirect to /queue so Credit Officer sees the result
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  uploadApplication,
  analyzeApplication,
  generateApplicationId,
  UploadPayload,
} from '../../services/AIApi';

// ── Shared field styles ───────────────────────────────────────────────────────
const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.125rem;
  @media (min-width: 560px) {
    grid-template-columns: 1fr 1fr;
  }
`;
const Field = styled.div`
  margin-bottom: 1.125rem;
`;
const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 0.375rem;
`;
const Required = styled.span`
  color: #e24b4a;
  margin-left: 2px;
`;
const Input = styled.input<{ $error?: boolean }>`
  width: 100%;
  height: 46px;
  padding: 0 1rem;
  border: 1.5px solid ${({ $error }) => ($error ? '#E24B4A' : '#E2E8F0')};
  border-radius: 8px;
  font-size: 16px;
  color: #2d3748;
  background: #fff;
  -webkit-appearance: none;
  font-family: 'IBM Plex Sans', sans-serif;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  &::placeholder {
    color: #a0aec0;
  }
  &:focus {
    outline: none;
    border-color: #378add;
    box-shadow: 0 0 0 3px rgba(55, 138, 221, 0.18);
  }
`;
const Select = styled.select<{ $error?: boolean }>`
  width: 100%;
  height: 46px;
  padding: 0 2.5rem 0 1rem;
  border: 1.5px solid ${({ $error }) => ($error ? '#E24B4A' : '#E2E8F0')};
  border-radius: 8px;
  font-size: 16px;
  color: #2d3748;
  background: #fff;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23718096' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  font-family: 'IBM Plex Sans', sans-serif;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: #378add;
    box-shadow: 0 0 0 3px rgba(55, 138, 221, 0.18);
  }
`;
const Textarea = styled.textarea<{ $error?: boolean }>`
  width: 100%;
  min-height: 90px;
  padding: 0.75rem 1rem;
  border: 1.5px solid ${({ $error }) => ($error ? '#E24B4A' : '#E2E8F0')};
  border-radius: 8px;
  font-size: 16px;
  color: #2d3748;
  font-family: 'IBM Plex Sans', sans-serif;
  resize: vertical;
  &::placeholder {
    color: #a0aec0;
  }
  &:focus {
    outline: none;
    border-color: #378add;
    box-shadow: 0 0 0 3px rgba(55, 138, 221, 0.18);
  }
`;
const ErrorMsg = styled.span`
  display: block;
  font-size: 0.75rem;
  color: #e24b4a;
  margin-top: 0.25rem;
`;
const HintMsg = styled.span`
  display: block;
  font-size: 0.75rem;
  color: #718096;
  margin-top: 0.25rem;
`;
const CurrencyWrap = styled.div`
  position: relative;
`;
const CurrencySymbol = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9375rem;
  color: #4a5568;
  font-weight: 500;
  pointer-events: none;
`;
const SectionLabel = styled.h3`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 1rem;
`;
const NavRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.75rem;
  gap: 1rem;
`;
const AlertBox = styled.div<{ $type?: 'error' | 'info' }>`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
  background: ${({ $type }) => ($type === 'error' ? '#FFF5F5' : '#EBF4FF')};
  border: 1px solid ${({ $type }) => ($type === 'error' ? '#FED7D7' : '#B5D4F4')};
  color: ${({ $type }) => ($type === 'error' ? '#C53030' : '#1A56A0')};
`;

// ── File drop zone ────────────────────────────────────────────────────────────
const DropZone = styled.div<{ $hasFile: boolean }>`
  border: 2px dashed ${({ $hasFile }) => ($hasFile ? '#1D9E75' : '#CBD5E0')};
  border-radius: 10px;
  padding: 1.25rem;
  text-align: center;
  cursor: pointer;
  background: ${({ $hasFile }) => ($hasFile ? '#F0FDF9' : '#FAFBFC')};
  transition: all 0.2s;
  &:hover {
    border-color: #378add;
    background: #ebf4ff;
  }
`;
const FileInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0fdf9;
  border: 1px solid #6ee7b7;
  border-radius: 8px;
  padding: 0.5rem 0.875rem;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
`;

// ── Form state types ──────────────────────────────────────────────────────────
interface FormState {
  // Company
  companyName: string;
  crn: string;
  sector: string;
  directorName: string;
  directorEmail: string;
  directorPhone: string;
  address: string;
  // Loan
  requestedAmount: string;
  loanPurpose: string;
  loanTermMonths: string;
  purposeDetail: string;
  // Financials — Nathan's required fields
  accountingPeriod: string;
  revenue: string;
  ebitda: string;
  dscr: string;
  netProfit: string;
  totalAssets: string;
  totalLiabilities: string;
  notes: string;
  // Document type
  documentType: string;
  // Consents
  consentData: boolean;
  consentCCR: boolean;
  consentAI: boolean;
}

type Errors = Partial<Record<keyof FormState, string>>;

const SECTORS = [
  'Agriculture & Forestry',
  'Construction',
  'Education',
  'Food & Beverage',
  'Healthcare',
  'Hospitality & Tourism',
  'IT & Technology',
  'Manufacturing',
  'Professional Services',
  'Retail',
  'Transport & Logistics',
  'Other',
];

const DOC_TYPES = [
  'Management accounts',
  'Audited financial statements',
  'Bank statements',
  'Revenue tax clearance',
  'Company registration documents',
  'Director ID',
];

const PERIODS = [
  'YE Dec 2024',
  'YE Dec 2023',
  'YE Mar 2025',
  'YE Mar 2024',
  'Half-year Jun 2024',
  'Q3 2024',
  'YTD 2025',
];

const LoanApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [appId] = useState(generateApplicationId);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  const [form, setForm] = useState<FormState>({
    companyName: '',
    crn: '',
    sector: '',
    directorName: '',
    directorEmail: '',
    directorPhone: '',
    address: '',
    requestedAmount: '',
    loanPurpose: '',
    loanTermMonths: '36',
    purposeDetail: '',
    accountingPeriod: '',
    revenue: '',
    ebitda: '',
    dscr: '',
    netProfit: '',
    totalAssets: '',
    totalLiabilities: '',
    notes: '',
    documentType: '',
    consentData: false,
    consentCCR: false,
    consentAI: false,
  });

  const set = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const v = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm((p) => ({ ...p, [name]: v }));
    if (errors[name as keyof FormState]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const num = (s: string) => parseFloat(s.replace(/,/g, '')) || 0;

  const validateStep = (s: number): boolean => {
    const e: Errors = {};
    if (s === 0) {
      if (!form.companyName.trim()) e.companyName = 'Required';
      if (!form.crn.trim()) e.crn = 'Required';
      if (!form.sector) e.sector = 'Required';
      if (!form.directorName.trim()) e.directorName = 'Required';
      if (!form.directorEmail.trim() || !/\S+@\S+\.\S+/.test(form.directorEmail))
        e.directorEmail = 'Valid email required';
      if (!form.directorPhone.trim()) e.directorPhone = 'Required';
      if (!form.address.trim()) e.address = 'Required';
    }
    if (s === 1) {
      if (!form.requestedAmount || num(form.requestedAmount) < 10000)
        e.requestedAmount = 'Minimum €10,000';
      if (!form.loanPurpose) e.loanPurpose = 'Required';
      if (!form.purposeDetail.trim()) e.purposeDetail = 'Required';
    }
    if (s === 2) {
      if (!form.accountingPeriod) e.accountingPeriod = 'Required';
      if (!form.revenue || num(form.revenue) <= 0) e.revenue = 'Required';
      if (!form.ebitda) e.ebitda = 'Required — needed for AI analysis';
      if (!form.dscr || num(form.dscr) <= 0) e.dscr = 'Required — needed for AI analysis';
      if (!form.documentType) e.documentType = 'Required';
    }
    if (s === 3) {
      if (!form.consentData) e.consentData = 'Required';
      if (!form.consentCCR) e.consentCCR = 'Required';
      if (!form.consentAI) e.consentAI = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };
  const handleBack = () => {
    setStep((s) => s - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setLoading(true);
    setApiError('');

    try {
      // Build payload matching Nathan's API exactly
      const uploadPayload: UploadPayload = {
        applicationId: appId,
        borrower: form.companyName,
        requestedAmount: num(form.requestedAmount),
        sector: form.sector,
        documentType: form.documentType,
        accountingPeriod: form.accountingPeriod,
        revenue: num(form.revenue),
        ebitda: num(form.ebitda),
        dscr: num(form.dscr),
        notes: form.notes || undefined,
      };

      const analyzePayload = {
        applicationId: appId,
        borrower: form.companyName,
        requestedAmount: num(form.requestedAmount),
        revenue: num(form.revenue),
        ebitda: num(form.ebitda),
        dscr: num(form.dscr),
      };

      // Step 1 — upload form data + documents
      await uploadApplication(uploadPayload, uploadedFile ? [uploadedFile] : []);

      // Step 2 — trigger AI analysis
      await analyzeApplication(analyzePayload);

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setApiError(`API error: ${msg}. Check Nathan's backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Company', 'Loan details', 'Financials', 'Consent & submit'];

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <PageLayout title="Application submitted">
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <Card
            $padding="lg"
            style={{ textAlign: 'center' }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                margin: '0 auto 1.25rem',
              }}
            >
              ✓
            </div>
            <h2
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '1.375rem',
                color: '#0C2B5E',
                margin: '0 0 .5rem',
              }}
            >
              Application submitted to AI
            </h2>
            <p style={{ fontSize: '.9375rem', color: '#718096', margin: '0 0 1.25rem' }}>
              Your application <strong>{appId}</strong> has been sent to Nathan's Credit Officer AI
              agent for analysis. Results will appear in the HITL Queue shortly.
            </p>
            <Badge
              $variant="info"
              style={{ marginBottom: '1.5rem', display: 'inline-flex' }}
            >
              {appId}
            </Badge>
            <div
              style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Button
                $variant="primary"
                onClick={() => navigate('/queue')}
              >
                View HITL Queue →
              </Button>
              <Button
                $variant="secondary"
                onClick={() => {
                  setSubmitted(false);
                  setStep(0);
                }}
              >
                Submit another
              </Button>
            </div>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="New loan application"
      notifCount={2}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Application ID badge */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '.5rem' }}>
            {steps.map((s, i) => (
              <span
                key={s}
                style={{
                  fontSize: '.75rem',
                  fontWeight: 500,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: i === step ? '#0C2B5E' : i < step ? '#E1F5EE' : '#F7FAFC',
                  color: i === step ? '#fff' : i < step ? '#0F6E56' : '#718096',
                  border: `.5px solid ${i === step ? '#0C2B5E' : i < step ? '#6EE7B7' : '#E2E8F0'}`,
                }}
              >
                {i < step ? '✓ ' : `${i + 1}. `}
                {s}
              </span>
            ))}
          </div>
          <Badge
            $variant="neutral"
            style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '.75rem' }}
          >
            {appId}
          </Badge>
        </div>

        {apiError && <AlertBox $type="error">{apiError}</AlertBox>}

        {/* ── Step 0: Company ── */}
        {step === 0 && (
          <Card $padding="lg">
            <CardHeader>
              <CardTitle>Company details</CardTitle>
              <Badge $variant="info">Step 1 of 4</Badge>
            </CardHeader>
            <CardDivider />
            <Grid2>
              <Field>
                <Label>
                  Company name <Required>*</Required>
                </Label>
                <Input
                  name="companyName"
                  placeholder="Acme Manufacturing Ltd"
                  value={form.companyName}
                  onChange={set}
                  $error={!!errors.companyName}
                />
                {errors.companyName && <ErrorMsg>{errors.companyName}</ErrorMsg>}
              </Field>
              <Field>
                <Label>
                  CRO number <Required>*</Required>
                </Label>
                <Input
                  name="crn"
                  placeholder="498712"
                  value={form.crn}
                  onChange={set}
                  $error={!!errors.crn}
                />
                {errors.crn && <ErrorMsg>{errors.crn}</ErrorMsg>}
              </Field>
            </Grid2>
            <Field>
              <Label>
                Sector <Required>*</Required>
              </Label>
              <Select
                name="sector"
                value={form.sector}
                onChange={set}
                $error={!!errors.sector}
              >
                <option value="">Select sector</option>
                {SECTORS.map((s) => (
                  <option
                    key={s}
                    value={s}
                  >
                    {s}
                  </option>
                ))}
              </Select>
              {errors.sector && <ErrorMsg>{errors.sector}</ErrorMsg>}
            </Field>
            <Grid2>
              <Field>
                <Label>
                  Director name <Required>*</Required>
                </Label>
                <Input
                  name="directorName"
                  placeholder="Jane Smith"
                  value={form.directorName}
                  onChange={set}
                  $error={!!errors.directorName}
                />
                {errors.directorName && <ErrorMsg>{errors.directorName}</ErrorMsg>}
              </Field>
              <Field>
                <Label>
                  Director email <Required>*</Required>
                </Label>
                <Input
                  name="directorEmail"
                  type="email"
                  placeholder="jane@acme.ie"
                  value={form.directorEmail}
                  onChange={set}
                  $error={!!errors.directorEmail}
                />
                {errors.directorEmail && <ErrorMsg>{errors.directorEmail}</ErrorMsg>}
              </Field>
            </Grid2>
            <Grid2>
              <Field>
                <Label>
                  Phone <Required>*</Required>
                </Label>
                <Input
                  name="directorPhone"
                  type="tel"
                  placeholder="+353 87 123 4567"
                  value={form.directorPhone}
                  onChange={set}
                  $error={!!errors.directorPhone}
                />
                {errors.directorPhone && <ErrorMsg>{errors.directorPhone}</ErrorMsg>}
              </Field>
              <Field>
                <Label>
                  Business address <Required>*</Required>
                </Label>
                <Input
                  name="address"
                  placeholder="Dublin 2"
                  value={form.address}
                  onChange={set}
                  $error={!!errors.address}
                />
                {errors.address && <ErrorMsg>{errors.address}</ErrorMsg>}
              </Field>
            </Grid2>
            <NavRow>
              <div />
              <Button
                $variant="primary"
                onClick={handleNext}
              >
                Next: Loan details →
              </Button>
            </NavRow>
          </Card>
        )}

        {/* ── Step 1: Loan ── */}
        {step === 1 && (
          <Card $padding="lg">
            <CardHeader>
              <CardTitle>Loan details</CardTitle>
              <Badge $variant="info">Step 2 of 4</Badge>
            </CardHeader>
            <CardDivider />
            <Grid2>
              <Field>
                <Label>
                  Requested amount <Required>*</Required>
                </Label>
                <CurrencyWrap>
                  <CurrencySymbol>€</CurrencySymbol>
                  <Input
                    name="requestedAmount"
                    placeholder="50,000"
                    value={form.requestedAmount}
                    onChange={set}
                    $error={!!errors.requestedAmount}
                    style={{ paddingLeft: '2rem' }}
                  />
                </CurrencyWrap>
                {errors.requestedAmount && <ErrorMsg>{errors.requestedAmount}</ErrorMsg>}
                <HintMsg>Min €10,000 — Max €500,000</HintMsg>
              </Field>
              <Field>
                <Label>Term (months)</Label>
                <Select
                  name="loanTermMonths"
                  value={form.loanTermMonths}
                  onChange={set}
                >
                  {[12, 24, 36, 48, 60, 84].map((m) => (
                    <option
                      key={m}
                      value={m}
                    >
                      {m} months
                    </option>
                  ))}
                </Select>
              </Field>
            </Grid2>
            <Field>
              <Label>
                Loan purpose <Required>*</Required>
              </Label>
              <Select
                name="loanPurpose"
                value={form.loanPurpose}
                onChange={set}
                $error={!!errors.loanPurpose}
              >
                <option value="">Select purpose</option>
                {[
                  'Working capital',
                  'Equipment purchase',
                  'Business expansion',
                  'Property acquisition',
                  'Refinancing',
                  'Invoice financing',
                  'Other',
                ].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
              {errors.loanPurpose && <ErrorMsg>{errors.loanPurpose}</ErrorMsg>}
            </Field>
            <Field>
              <Label>
                How will funds be used? <Required>*</Required>
              </Label>
              <Textarea
                name="purposeDetail"
                rows={3}
                placeholder="Describe how the loan will be used and expected business outcomes..."
                value={form.purposeDetail}
                onChange={set}
                $error={!!errors.purposeDetail}
              />
              {errors.purposeDetail && <ErrorMsg>{errors.purposeDetail}</ErrorMsg>}
            </Field>
            <NavRow>
              <Button
                $variant="secondary"
                onClick={handleBack}
              >
                ← Back
              </Button>
              <Button
                $variant="primary"
                onClick={handleNext}
              >
                Next: Financials →
              </Button>
            </NavRow>
          </Card>
        )}

        {/* ── Step 2: Financials — Nathan's required fields ── */}
        {step === 2 && (
          <Card $padding="lg">
            <CardHeader>
              <CardTitle>Financial information</CardTitle>
              <Badge $variant="info">Step 3 of 4</Badge>
            </CardHeader>
            <CardDivider />
            <AlertBox $type="info">
              ℹ️ Revenue, EBITDA, and DSCR are sent directly to the AI credit analysis engine.
              Please ensure these are accurate.
            </AlertBox>

            <SectionLabel>Accounting period & documents</SectionLabel>
            <Grid2>
              <Field>
                <Label>
                  Accounting period <Required>*</Required>
                </Label>
                <Select
                  name="accountingPeriod"
                  value={form.accountingPeriod}
                  onChange={set}
                  $error={!!errors.accountingPeriod}
                >
                  <option value="">Select period</option>
                  {PERIODS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </Select>
                {errors.accountingPeriod && <ErrorMsg>{errors.accountingPeriod}</ErrorMsg>}
              </Field>
              <Field>
                <Label>
                  Document type <Required>*</Required>
                </Label>
                <Select
                  name="documentType"
                  value={form.documentType}
                  onChange={set}
                  $error={!!errors.documentType}
                >
                  <option value="">Select document type</option>
                  {DOC_TYPES.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </Select>
                {errors.documentType && <ErrorMsg>{errors.documentType}</ErrorMsg>}
              </Field>
            </Grid2>

            <CardDivider />
            <SectionLabel>AI analysis inputs — Nathan's required fields</SectionLabel>
            <Grid2>
              <Field>
                <Label>
                  Annual revenue <Required>*</Required>
                </Label>
                <CurrencyWrap>
                  <CurrencySymbol>€</CurrencySymbol>
                  <Input
                    name="revenue"
                    placeholder="1,250,000"
                    value={form.revenue}
                    onChange={set}
                    $error={!!errors.revenue}
                    style={{ paddingLeft: '2rem' }}
                  />
                </CurrencyWrap>
                {errors.revenue && <ErrorMsg>{errors.revenue}</ErrorMsg>}
              </Field>
              <Field>
                <Label>
                  EBITDA <Required>*</Required>
                </Label>
                <CurrencyWrap>
                  <CurrencySymbol>€</CurrencySymbol>
                  <Input
                    name="ebitda"
                    placeholder="240,000"
                    value={form.ebitda}
                    onChange={set}
                    $error={!!errors.ebitda}
                    style={{ paddingLeft: '2rem' }}
                  />
                </CurrencyWrap>
                {errors.ebitda && <ErrorMsg>{errors.ebitda}</ErrorMsg>}
                <HintMsg>Earnings before interest, tax, depreciation & amortisation</HintMsg>
              </Field>
            </Grid2>

            <Grid2>
              <Field>
                <Label>
                  DSCR <Required>*</Required>
                </Label>
                <Input
                  name="dscr"
                  type="number"
                  step="0.01"
                  placeholder="1.42"
                  value={form.dscr}
                  onChange={set}
                  $error={!!errors.dscr}
                />
                {errors.dscr && <ErrorMsg>{errors.dscr}</ErrorMsg>}
                <HintMsg>Debt Service Coverage Ratio — policy minimum 1.20×</HintMsg>
              </Field>
              <Field>
                <Label>Net profit / (loss)</Label>
                <CurrencyWrap>
                  <CurrencySymbol>€</CurrencySymbol>
                  <Input
                    name="netProfit"
                    placeholder="145,000"
                    value={form.netProfit}
                    onChange={set}
                    style={{ paddingLeft: '2rem' }}
                  />
                </CurrencyWrap>
              </Field>
            </Grid2>

            <Grid2>
              <Field>
                <Label>Total assets</Label>
                <CurrencyWrap>
                  <CurrencySymbol>€</CurrencySymbol>
                  <Input
                    name="totalAssets"
                    placeholder="850,000"
                    value={form.totalAssets}
                    onChange={set}
                    style={{ paddingLeft: '2rem' }}
                  />
                </CurrencyWrap>
              </Field>
              <Field>
                <Label>Total liabilities</Label>
                <CurrencyWrap>
                  <CurrencySymbol>€</CurrencySymbol>
                  <Input
                    name="totalLiabilities"
                    placeholder="320,000"
                    value={form.totalLiabilities}
                    onChange={set}
                    style={{ paddingLeft: '2rem' }}
                  />
                </CurrencyWrap>
              </Field>
            </Grid2>

            <CardDivider />
            <SectionLabel>Document upload</SectionLabel>
            <DropZone
              $hasFile={!!uploadedFile}
              onClick={() => document.getElementById('file-input')?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) setUploadedFile(f);
              }}
            >
              <input
                id="file-input"
                type="file"
                style={{ display: 'none' }}
                accept=".pdf,.xlsx,.xls,.jpg,.png"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setUploadedFile(f);
                }}
              />
              <p
                style={{
                  fontSize: '.875rem',
                  fontWeight: 500,
                  color: uploadedFile ? '#065F46' : '#2D3748',
                  margin: '0 0 .25rem',
                }}
              >
                {uploadedFile ? '✓ File uploaded' : 'Drop file here or click to browse'}
              </p>
              <p style={{ fontSize: '.75rem', color: '#718096', margin: 0 }}>
                PDF, Excel, JPG — max 10MB
              </p>
            </DropZone>
            {uploadedFile && (
              <FileInfo>
                <span style={{ color: '#065F46', fontWeight: 500 }}>📄 {uploadedFile.name}</span>
                <button
                  style={{ color: '#E24B4A', fontSize: '.75rem' }}
                  onClick={() => setUploadedFile(null)}
                >
                  ✕ Remove
                </button>
              </FileInfo>
            )}

            <Field style={{ marginTop: '1rem' }}>
              <Label>Additional notes</Label>
              <Textarea
                name="notes"
                rows={3}
                placeholder="Any additional context for the credit officer or AI agent..."
                value={form.notes}
                onChange={set}
              />
            </Field>

            <NavRow>
              <Button
                $variant="secondary"
                onClick={handleBack}
              >
                ← Back
              </Button>
              <Button
                $variant="primary"
                onClick={handleNext}
              >
                Next: Review & consent →
              </Button>
            </NavRow>
          </Card>
        )}

        {/* ── Step 3: Consent & submit ── */}
        {step === 3 && (
          <Card $padding="lg">
            <CardHeader>
              <CardTitle>Review & submit</CardTitle>
              <Badge $variant="info">Step 4 of 4</Badge>
            </CardHeader>
            <CardDivider />

            {/* Summary */}
            <SectionLabel>Application summary</SectionLabel>
            {[
              ['Application ID', appId],
              ['Company', form.companyName],
              ['Sector', form.sector],
              [
                'Requested amount',
                `€${Number(form.requestedAmount.replace(/,/g, '')).toLocaleString()}`,
              ],
              ['Loan purpose', form.loanPurpose],
              ['Accounting period', form.accountingPeriod],
              ['Revenue', `€${Number(form.revenue.replace(/,/g, '')).toLocaleString()}`],
              ['EBITDA', `€${Number(form.ebitda.replace(/,/g, '')).toLocaleString()}`],
              ['DSCR', `${form.dscr}×`],
              ['Document type', form.documentType],
              ['Supporting document', uploadedFile?.name || 'None uploaded'],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '.5rem 0',
                  borderBottom: '.5px solid #F0F0F0',
                  fontSize: '.875rem',
                }}
              >
                <span style={{ color: '#718096' }}>{k}</span>
                <span
                  style={{
                    fontWeight: 500,
                    color: '#2D3748',
                    textAlign: 'right',
                    maxWidth: '55%',
                    wordBreak: 'break-word',
                  }}
                >
                  {v}
                </span>
              </div>
            ))}

            <CardDivider />
            <SectionLabel>Consent & declarations (GDPR Art.22)</SectionLabel>
            {[
              {
                name: 'consentData' as const,
                label:
                  'I consent to Finpals processing my personal and business data for credit assessment under GDPR Article 6(1)(b).',
              },
              {
                name: 'consentCCR' as const,
                label:
                  'I authorise Finpals to submit an enquiry to the Central Credit Register (CCR) operated by the Central Bank of Ireland.',
              },
              {
                name: 'consentAI' as const,
                label:
                  'I understand an AI system will assist in the credit decision (GDPR Art.22) and I have the right to request human review and appeal.',
              },
            ].map((c) => (
              <div
                key={c.name}
                style={{ marginBottom: '.75rem' }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '.75rem',
                    fontSize: '.875rem',
                    color: '#4A5568',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    name={c.name}
                    checked={form[c.name] as boolean}
                    onChange={set}
                    style={{
                      marginTop: '2px',
                      flexShrink: 0,
                      accentColor: '#0C2B5E',
                      width: '16px',
                      height: '16px',
                    }}
                  />
                  <span>{c.label}</span>
                </label>
                {errors[c.name] && (
                  <ErrorMsg style={{ marginLeft: '1.75rem' }}>{errors[c.name]}</ErrorMsg>
                )}
              </div>
            ))}

            <div
              style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '8px',
                padding: '.75rem 1rem',
                fontSize: '.8125rem',
                color: '#92400E',
                margin: '.75rem 0 1rem',
              }}
            >
              ⚠️ By submitting you confirm all information is accurate. This application will be
              sent to the AI credit analysis engine immediately.
            </div>

            <NavRow>
              <Button
                $variant="secondary"
                onClick={handleBack}
              >
                ← Back
              </Button>
              <Button
                $variant="primary"
                $loading={loading}
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? 'Submitting to AI…' : 'Submit application'}
              </Button>
            </NavRow>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default LoanApplicationPage;
