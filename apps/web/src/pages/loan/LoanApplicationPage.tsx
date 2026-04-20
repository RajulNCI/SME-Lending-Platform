/**
 * LoanApplicationPage — upload-first flow using Nathan's confirmed field names
 *
 * Flow:
 *   Step 0: Upload file → POST /api/v1/uploads (multipart) → auto-fill form
 *   Step 1: Review & edit auto-filled fields (green = from Nathan's response)
 *   Step 2: Confirm consent → POST /api/v1/decisions/analyze → success
 */
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  uploadApplication,
  analyzeApplication,
  generateApplicationId,
  UploadResponse,
} from '../../services/AIApi';

// ── Animations ───────────────────────────────────────────────────────────────
const spin = keyframes`to{transform:rotate(360deg)}`;
const fadeUp = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

// ── Primitives ────────────────────────────────────────────────────────────────
const PageWrap = styled.div`
  max-width: 680px;
  margin: 0 auto;
`;
const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  @media (min-width: 560px) {
    grid-template-columns: 1fr 1fr;
  }
`;
const Field = styled.div`
  margin-bottom: 1rem;
`;
const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 0.375rem;
`;
const Req = styled.span`
  color: #e24b4a;
  margin-left: 2px;
`;
const Input = styled.input<{ $error?: boolean; $prefilled?: boolean }>`
  width: 100%;
  height: 46px;
  padding: 0 1rem;
  -webkit-appearance: none;
  border: 1.5px solid
    ${({ $error, $prefilled }) => ($error ? '#E24B4A' : $prefilled ? '#1D9E75' : '#E2E8F0')};
  border-radius: 8px;
  font-size: 16px;
  color: #2d3748;
  background: ${({ $prefilled }) => ($prefilled ? '#F0FDF9' : '#fff')};
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
  -webkit-appearance: none;
  appearance: none;
  border: 1.5px solid ${({ $error }) => ($error ? '#E24B4A' : '#E2E8F0')};
  border-radius: 8px;
  font-size: 16px;
  color: #2d3748;
  background: #fff;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23718096' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  font-family: 'IBM Plex Sans', sans-serif;
  &:focus {
    outline: none;
    border-color: #378add;
    box-shadow: 0 0 0 3px rgba(55, 138, 221, 0.18);
  }
`;
const Textarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem 1rem;
  border: 1.5px solid #e2e8f0;
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
const ErrMsg = styled.span`
  display: block;
  font-size: 0.75rem;
  color: #e24b4a;
  margin-top: 0.25rem;
`;
const Hint = styled.span`
  display: block;
  font-size: 0.75rem;
  color: #718096;
  margin-top: 0.25rem;
`;
const CurrWrap = styled.div`
  position: relative;
`;
const CurrSym = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9375rem;
  color: #4a5568;
  font-weight: 500;
  pointer-events: none;
`;
const NavRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  gap: 1rem;
`;
const SectionLabel = styled.p`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.875rem;
`;
const StepRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  align-items: center;
`;
const StepPill = styled.span<{ $s: 'done' | 'active' | 'todo' }>`
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 20px;
  background: ${({ $s }) => ($s === 'done' ? '#E1F5EE' : $s === 'active' ? '#0C2B5E' : '#F7FAFC')};
  color: ${({ $s }) => ($s === 'done' ? '#0F6E56' : $s === 'active' ? '#fff' : '#718096')};
  border: 0.5px solid
    ${({ $s }) => ($s === 'done' ? '#6EE7B7' : $s === 'active' ? '#0C2B5E' : '#E2E8F0')};
`;

// ── Upload zone ───────────────────────────────────────────────────────────────
const UploadZone = styled.div<{ $drag: boolean; $done: boolean; $err: boolean }>`
  border: 2px dashed
    ${({ $done, $err, $drag }) =>
      $err ? '#E24B4A' : $done ? '#1D9E75' : $drag ? '#378ADD' : '#CBD5E0'};
  border-radius: 12px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  background: ${({ $done, $drag }) => ($done ? '#F0FDF9' : $drag ? '#EBF4FF' : '#FAFBFC')};
  transition: all 0.2s;
  &:hover {
    border-color: #378add;
    background: #ebf4ff;
  }
`;
const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #0c2b5e;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: 0 auto 0.75rem;
`;
const PrefilledNote = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: #e1f5ee;
  color: #0f6e56;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

// ── Consent checkbox ──────────────────────────────────────────────────────────
const ConsentCard = styled.label<{ $checked: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  padding: 12px 14px;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  transition: all 0.15s;
  background: ${({ $checked }) => ($checked ? '#F0FDF9' : '#FAFBFC')};
  border: 1.5px solid ${({ $checked }) => ($checked ? '#1D9E75' : '#E2E8F0')};
`;
const CheckBox = styled.div<{ $checked: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 5px;
  flex-shrink: 0;
  margin-top: 1px;
  transition: all 0.15s;
  border: 2px solid ${({ $checked }) => ($checked ? '#1D9E75' : '#CBD5E0')};
  background: ${({ $checked }) => ($checked ? '#1D9E75' : '#fff')};
  display: flex;
  align-items: center;
  justify-content: center;
`;

// ── Static options ────────────────────────────────────────────────────────────
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
  'Financial statement',
  'Management accounts',
  'Audited financial statements',
  'Bank statements',
  'Tax clearance',
  'Company registration',
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

// ── Form state ────────────────────────────────────────────────────────────────
interface Form {
  // Nathan's confirmed fields — these are what get sent to /analyze
  borrower: string; // → borrower
  sector: string; // → sector
  requestedAmount: string; // → requestedAmount
  revenue: string; // → revenue
  ebitda: string; // → ebitda
  dscr: string; // → dscr
  accountingPeriod: string; // → accountingPeriod
  documentType: string; // → documentType
  // Extra fields for the form (not sent to Nathan's API)
  loanPurpose: string;
  notes: string;
  consentData: boolean;
  consentCCR: boolean;
  consentAI: boolean;
}

type Prefilled = Partial<Record<keyof Form, boolean>>;
type Errors = Partial<Record<keyof Form, string>>;

const BLANK: Form = {
  borrower: '',
  sector: '',
  requestedAmount: '',
  revenue: '',
  ebitda: '',
  dscr: '',
  accountingPeriod: '',
  documentType: '',
  loanPurpose: '',
  notes: '',
  consentData: false,
  consentCCR: false,
  consentAI: false,
};

const num = (s: string) => parseFloat(s.replace(/,/g, '')) || 0;

const LoanApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [appId] = useState(generateApplicationId);
  const [form, setForm] = useState<Form>(BLANK);
  const [prefilled, setPrefilled] = useState<Prefilled>({});
  const [errors, setErrors] = useState<Errors>({});
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadId, setUploadId] = useState(''); // Nathan's "id" field from upload response
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [done, setDone] = useState(false);

  const set = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const v = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm((p) => ({ ...p, [name]: v }));
    if (errors[name as keyof Form]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  // ── Step 0: file selected → upload → auto-populate ───────────────────────
  const handleFile = async (f: File) => {
    const allowed = ['.pdf', '.xlsx', '.xls', '.jpg', '.jpeg', '.png'];
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      setUploadError(`Accepted: ${allowed.join(', ')}`);
      return;
    }
    if (f.size > 15 * 1024 * 1024) {
      setUploadError('Max file size is 15MB');
      return;
    }

    setFile(f);
    setUploadError('');
    setUploading(true);

    try {
      // POST multipart/form-data to Nathan's /api/v1/uploads
      const resp: UploadResponse = await uploadApplication(appId, f);

      // Map Nathan's CONFIRMED field names directly — no guessing
      const updates: Partial<Form> = {};
      const pf: Prefilled = {};

      const mapField = (formKey: keyof Form, value: unknown) => {
        if (value !== undefined && value !== null && value !== '' && value !== 0) {
          (updates as Record<string, unknown>)[formKey] = String(value);
          pf[formKey] = true;
        }
      };

      mapField('borrower', resp.borrower);
      mapField('sector', resp.sector);
      mapField('requestedAmount', resp.requestedAmount);
      mapField('revenue', resp.revenue);
      mapField('ebitda', resp.ebitda);
      mapField('dscr', resp.dscr);
      mapField('accountingPeriod', resp.accountingPeriod);
      mapField('documentType', resp.documentType);

      setUploadId(resp.id || '');
      setForm((p) => ({ ...p, ...updates }));
      setPrefilled(pf);
      setStep(1);
    } catch (err) {
      // If upload extraction fails, still let user proceed manually
      console.warn('Upload failed:', err);
      setUploadError('Could not extract data from document. You can fill the form manually.');
      setStep(1);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  // ── Step 1 validation ────────────────────────────────────────────────────
  const validateReview = () => {
    const e: Errors = {};
    if (!form.borrower.trim()) e.borrower = 'Required';
    if (!form.sector) e.sector = 'Required';
    if (!form.requestedAmount || num(form.requestedAmount) < 10000)
      e.requestedAmount = 'Minimum €10,000';
    if (!form.loanPurpose) e.loanPurpose = 'Required';
    if (!form.accountingPeriod) e.accountingPeriod = 'Required';
    if (!form.revenue || num(form.revenue) <= 0) e.revenue = 'Required';
    if (!form.ebitda) e.ebitda = 'Required';
    if (!form.dscr || num(form.dscr) <= 0) e.dscr = 'Required';
    if (!form.documentType) e.documentType = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 2: submit to analyze ────────────────────────────────────────────
  const handleSubmit = async () => {
    const missingConsent = !form.consentData || !form.consentCCR || !form.consentAI;
    if (missingConsent) {
      setErrors({
        consentData: !form.consentData ? 'Required' : undefined,
        consentCCR: !form.consentCCR ? 'Required' : undefined,
        consentAI: !form.consentAI ? 'Required' : undefined,
      });
      return;
    }
    setSubmitting(true);
    setApiError('');
    try {
      await analyzeApplication({
        applicationId: appId,
        borrower: form.borrower,
        requestedAmount: num(form.requestedAmount),
        revenue: num(form.revenue),
        ebitda: num(form.ebitda),
        dscr: num(form.dscr),
      });
      setDone(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ['Upload document', 'Review & edit', 'Confirm & submit'];

  // ── Success ──────────────────────────────────────────────────────────────
  if (done)
    return (
      <PageLayout title="Application submitted">
        <PageWrap>
          <Card
            $padding="lg"
            style={{ textAlign: 'center', animation: `${fadeUp} .4s ease` }}
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
              Submitted to AI analysis
            </h2>
            <p
              style={{
                fontSize: '.9375rem',
                color: '#718096',
                margin: '0 0 1.25rem',
                maxWidth: '420px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              <strong>{appId}</strong> has been sent to the Credit Officer AI agent. Results will
              appear in the HITL Queue shortly.
            </p>
            {uploadId && (
              <p
                style={{
                  fontSize: '.75rem',
                  color: '#A0AEC0',
                  margin: '0 0 1rem',
                  fontFamily: "'IBM Plex Mono',monospace",
                }}
              >
                Upload ref: {uploadId}
              </p>
            )}
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
                  setDone(false);
                  setStep(0);
                  setForm(BLANK);
                  setPrefilled({});
                  setFile(null);
                  setUploadId('');
                }}
              >
                Submit another
              </Button>
            </div>
          </Card>
        </PageWrap>
      </PageLayout>
    );

  return (
    <PageLayout
      title="New loan application"
      notifCount={0}
    >
      <PageWrap>
        {/* Step pills + App ID */}
        <StepRow>
          {steps.map((s, i) => (
            <StepPill
              key={s}
              $s={i < step ? 'done' : i === step ? 'active' : 'todo'}
            >
              {i < step ? '✓ ' : ''}
              {s}
            </StepPill>
          ))}
          <Badge
            $variant="neutral"
            style={{
              marginLeft: 'auto',
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: '.75rem',
            }}
          >
            {appId}
          </Badge>
        </StepRow>

        {/* ── STEP 0: Upload ── */}
        {step === 0 && (
          <Card $padding="lg">
            <CardHeader>
              <CardTitle>Upload financial document</CardTitle>
              <Badge $variant="info">Step 1 of 3</Badge>
            </CardHeader>
            <CardDivider />
            <p
              style={{
                fontSize: '.9375rem',
                color: '#4A5568',
                marginBottom: '1.5rem',
                lineHeight: 1.6,
              }}
            >
              Upload the company's financial document first. The AI will extract key figures —
              revenue, EBITDA, DSCR — and auto-fill the form for you.
            </p>

            <UploadZone
              $drag={dragging}
              $done={!!file && !uploading}
              $err={!!uploadError}
              onClick={() => !uploading && fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              {uploading ? (
                <>
                  <Spinner />
                  <p
                    style={{
                      fontSize: '.9375rem',
                      fontWeight: 500,
                      color: '#0C2B5E',
                      margin: '0 0 .25rem',
                    }}
                  >
                    Extracting financial data…
                  </p>
                  <p style={{ fontSize: '.8125rem', color: '#718096', margin: 0 }}>
                    Nathan's AI is reading the document
                  </p>
                </>
              ) : file ? (
                <>
                  <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>✓</div>
                  <p
                    style={{
                      fontSize: '.9375rem',
                      fontWeight: 500,
                      color: '#0F6E56',
                      margin: '0 0 .25rem',
                    }}
                  >
                    {file.name}
                  </p>
                  <p style={{ fontSize: '.8125rem', color: '#718096', margin: 0 }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB · click to change
                  </p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>📄</div>
                  <p
                    style={{
                      fontSize: '.9375rem',
                      fontWeight: 500,
                      color: '#2D3748',
                      margin: '0 0 .375rem',
                    }}
                  >
                    Drop document here or <span style={{ color: '#1A56A0' }}>browse</span>
                  </p>
                  <p style={{ fontSize: '.8125rem', color: '#718096', margin: '0 0 .75rem' }}>
                    P&L statement, balance sheet, management accounts, bank statements
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      gap: '.375rem',
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    {['.pdf', '.xlsx', '.xls', '.jpg', 'max 15MB'].map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: '.6875rem',
                          padding: '2px 8px',
                          background: '#EDF2F7',
                          color: '#4A5568',
                          borderRadius: '4px',
                          fontFamily: "'IBM Plex Mono',monospace",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </UploadZone>

            {uploadError && (
              <p style={{ fontSize: '.8125rem', color: '#E24B4A', margin: '.5rem 0 0' }}>
                {uploadError}
              </p>
            )}

            <div
              style={{
                marginTop: '1.25rem',
                padding: '.875rem 1rem',
                background: '#F0F7FF',
                borderRadius: '8px',
                fontSize: '.8125rem',
                color: '#1A56A0',
              }}
            >
              ℹ️ No document?{' '}
              <button
                style={{ color: '#0C2B5E', fontWeight: 600, textDecoration: 'underline' }}
                onClick={() => setStep(1)}
              >
                Fill the form manually →
              </button>
            </div>
          </Card>
        )}

        {/* ── STEP 1: Review ── */}
        {step === 1 && (
          <Card $padding="lg">
            <CardHeader>
              <CardTitle>Review & complete details</CardTitle>
              <Badge $variant="info">Step 2 of 3</Badge>
            </CardHeader>
            <CardDivider />

            {Object.keys(prefilled).length > 0 && (
              <PrefilledNote>
                ✓ {Object.keys(prefilled).length} fields auto-filled from document
              </PrefilledNote>
            )}
            {Object.keys(prefilled).length > 0 && (
              <p style={{ fontSize: '.8125rem', color: '#718096', marginBottom: '1.25rem' }}>
                Fields with a green border were extracted from your document. Review and correct if
                needed.
              </p>
            )}

            <SectionLabel>Company & loan</SectionLabel>
            <Grid2>
              <Field>
                <Label>
                  Company / borrower name <Req>*</Req>
                </Label>
                <Input
                  name="borrower"
                  placeholder="Acme Manufacturing Ltd"
                  value={form.borrower}
                  onChange={set}
                  $error={!!errors.borrower}
                  $prefilled={prefilled.borrower}
                />
                {errors.borrower && <ErrMsg>{errors.borrower}</ErrMsg>}
              </Field>
              <Field>
                <Label>
                  Sector <Req>*</Req>
                </Label>
                <Select
                  name="sector"
                  value={form.sector}
                  onChange={set}
                  $error={!!errors.sector}
                >
                  <option value="">Select sector</option>
                  {SECTORS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
                {errors.sector && <ErrMsg>{errors.sector}</ErrMsg>}
              </Field>
            </Grid2>
            <Grid2>
              <Field>
                <Label>
                  Requested amount <Req>*</Req>
                </Label>
                <CurrWrap>
                  <CurrSym>€</CurrSym>
                  <Input
                    name="requestedAmount"
                    placeholder="50,000"
                    value={form.requestedAmount}
                    onChange={set}
                    $error={!!errors.requestedAmount}
                    $prefilled={prefilled.requestedAmount}
                    style={{ paddingLeft: '2rem' }}
                  />
                </CurrWrap>
                {errors.requestedAmount && <ErrMsg>{errors.requestedAmount}</ErrMsg>}
                <Hint>Min €10,000</Hint>
              </Field>
              <Field>
                <Label>
                  Loan purpose <Req>*</Req>
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
                {errors.loanPurpose && <ErrMsg>{errors.loanPurpose}</ErrMsg>}
              </Field>
            </Grid2>

            <CardDivider />
            <SectionLabel>Document details</SectionLabel>
            <Grid2>
              <Field>
                <Label>
                  Document type <Req>*</Req>
                </Label>
                <Select
                  name="documentType"
                  value={form.documentType}
                  onChange={set}
                  $error={!!errors.documentType}
                >
                  <option value="">Select type</option>
                  {DOC_TYPES.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </Select>
                {errors.documentType && <ErrMsg>{errors.documentType}</ErrMsg>}
              </Field>
              <Field>
                <Label>
                  Accounting period <Req>*</Req>
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
                {errors.accountingPeriod && <ErrMsg>{errors.accountingPeriod}</ErrMsg>}
              </Field>
            </Grid2>

            <CardDivider />
            <SectionLabel>
              Financial figures — sent to AI agent <Req>*</Req>
            </SectionLabel>
            <div
              style={{
                background: '#F0F7FF',
                border: '1px solid #B5D4F4',
                borderRadius: '8px',
                padding: '.75rem 1rem',
                marginBottom: '1rem',
                fontSize: '.8125rem',
                color: '#1A56A0',
              }}
            >
              ℹ️ These values are sent directly to Nathan's AI credit analysis engine.
            </div>
            <Grid2>
              <Field>
                <Label>
                  Annual revenue <Req>*</Req>
                </Label>
                <CurrWrap>
                  <CurrSym>€</CurrSym>
                  <Input
                    name="revenue"
                    placeholder="1,250,000"
                    value={form.revenue}
                    onChange={set}
                    $error={!!errors.revenue}
                    $prefilled={prefilled.revenue}
                    style={{ paddingLeft: '2rem' }}
                  />
                </CurrWrap>
                {errors.revenue && <ErrMsg>{errors.revenue}</ErrMsg>}
              </Field>
              <Field>
                <Label>
                  EBITDA <Req>*</Req>
                </Label>
                <CurrWrap>
                  <CurrSym>€</CurrSym>
                  <Input
                    name="ebitda"
                    placeholder="240,000"
                    value={form.ebitda}
                    onChange={set}
                    $error={!!errors.ebitda}
                    $prefilled={prefilled.ebitda}
                    style={{ paddingLeft: '2rem' }}
                  />
                </CurrWrap>
                {errors.ebitda && <ErrMsg>{errors.ebitda}</ErrMsg>}
                <Hint>Earnings before interest, tax, depreciation & amortisation</Hint>
              </Field>
            </Grid2>
            <Grid2>
              <Field>
                <Label>
                  DSCR <Req>*</Req>
                </Label>
                <Input
                  name="dscr"
                  type="number"
                  step="0.01"
                  placeholder="1.8"
                  value={form.dscr}
                  onChange={set}
                  $error={!!errors.dscr}
                  $prefilled={prefilled.dscr}
                />
                {errors.dscr && <ErrMsg>{errors.dscr}</ErrMsg>}
                <Hint>Debt Service Coverage Ratio — policy min 1.20×</Hint>
              </Field>
              <Field>
                <Label>Notes</Label>
                <Textarea
                  name="notes"
                  rows={3}
                  placeholder="Additional context for the credit officer…"
                  value={form.notes}
                  onChange={set}
                />
              </Field>
            </Grid2>

            <NavRow>
              <Button
                $variant="secondary"
                onClick={() => setStep(0)}
              >
                ← Back
              </Button>
              <Button
                $variant="primary"
                onClick={() => {
                  if (validateReview()) setStep(2);
                }}
              >
                Next: Confirm →
              </Button>
            </NavRow>
          </Card>
        )}

        {/* ── STEP 2: Confirm & consent ── */}
        {step === 2 && (
          <Card $padding="lg">
            <CardHeader>
              <CardTitle>Confirm & submit</CardTitle>
              <Badge $variant="info">Step 3 of 3</Badge>
            </CardHeader>
            <CardDivider />

            <SectionLabel>Application summary</SectionLabel>
            {[
              ['Application ID', appId, true],
              ['Company', form.borrower, false],
              ['Sector', form.sector, false],
              ['Requested amount', `€${num(form.requestedAmount).toLocaleString()}`, false],
              ['Loan purpose', form.loanPurpose, false],
              ['Document type', form.documentType, false],
              ['Accounting period', form.accountingPeriod, false],
              ['Revenue', `€${num(form.revenue).toLocaleString()}`, false],
              ['EBITDA', `€${num(form.ebitda).toLocaleString()}`, false],
              ['DSCR', `${form.dscr}×`, false],
              ['Document', file?.name || 'Not uploaded', false],
            ].map(([k, v, mono]) => (
              <div
                key={String(k)}
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
                    fontFamily: mono ? "'IBM Plex Mono',monospace" : 'inherit',
                  }}
                >
                  {v}
                </span>
              </div>
            ))}

            <CardDivider />
            <SectionLabel>Consent & declarations — GDPR Art.22</SectionLabel>

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
              <div key={c.name}>
                <ConsentCard $checked={form[c.name] as boolean}>
                  <CheckBox $checked={form[c.name] as boolean}>
                    {form[c.name] && (
                      <svg
                        width="11"
                        height="9"
                        viewBox="0 0 11 9"
                        fill="none"
                      >
                        <path
                          d="M1 4L4 7.5L10 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </CheckBox>
                  <input
                    type="checkbox"
                    name={c.name}
                    checked={form[c.name] as boolean}
                    onChange={set}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{ fontSize: '.875rem', color: '#2D3748', lineHeight: 1.5 }}>
                    {c.label}
                  </span>
                </ConsentCard>
                {errors[c.name] && (
                  <p style={{ fontSize: '.75rem', color: '#E24B4A', margin: '-8px 0 8px 14px' }}>
                    {errors[c.name]}
                  </p>
                )}
              </div>
            ))}

            {apiError && (
              <div
                style={{
                  background: '#FFF5F5',
                  border: '1px solid #FED7D7',
                  borderRadius: '8px',
                  padding: '.75rem 1rem',
                  fontSize: '.875rem',
                  color: '#C53030',
                  margin: '.75rem 0',
                }}
              >
                ⚠️ {apiError}
              </div>
            )}

            <div
              style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '8px',
                padding: '.75rem 1rem',
                fontSize: '.8125rem',
                color: '#92400E',
                margin: '.75rem 0 1.25rem',
              }}
            >
              ⚠️ By submitting you confirm all information is accurate and will be sent to the AI
              credit engine immediately.
            </div>

            <NavRow>
              <Button
                $variant="secondary"
                onClick={() => setStep(1)}
              >
                ← Back
              </Button>
              <Button
                $variant="primary"
                $loading={submitting}
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Submitting to AI…' : 'Submit application →'}
              </Button>
            </NavRow>
          </Card>
        )}
      </PageWrap>
    </PageLayout>
  );
};

export default LoanApplicationPage;
