import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { keyframes } from 'styled-components';
import PageLayout from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { uploadApplication, analyzeApplication, generateApplicationId, UploadResponse } from '../../services/AIApi';
import UploadStep from '../../features/loan/UploadStep';
import ReviewStep from '../../features/loan/ReviewStep';
import ConsentStep from '../../features/loan/ConsentStep';
import { BLANK_FORM, type Form, type Prefilled, type Errors } from '../../features/loan/types';
import { PageWrap, StepRow, StepPill, SuccessIcon, SuccessTitle, SuccessText } from '../../styles/pages/LoanApplicationPage.styles';

const fadeUp = keyframes`from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; }`;

const STEPS = ['Upload document', 'Review & edit', 'Confirm & submit'];
const ALLOWED_EXT = ['.pdf', '.xlsx', '.xls', '.jpg', '.jpeg', '.png'];
const MAX_SIZE_MB = 15;

const num = (s: string) => parseFloat(s.replace(/,/g, '')) || 0;

const LoanApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [appId] = useState(generateApplicationId);
  const [form, setForm] = useState<Form>(BLANK_FORM);
  const [prefilled, setPrefilled] = useState<Prefilled>({});
  const [errors, setErrors] = useState<Errors>({});
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadId, setUploadId] = useState('');
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [done, setDone] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const v = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm((p) => ({ ...p, [name]: v }));
    if (errors[name as keyof Form]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleFile = async (f: File) => {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      setUploadError(`Accepted: ${ALLOWED_EXT.join(', ')}`);
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`Max file size is ${MAX_SIZE_MB}MB`);
      return;
    }
    setFile(f);
    setUploadError('');
    setUploading(true);
    try {
      const resp: UploadResponse = await uploadApplication(appId, f);
      const updates: Partial<Form> = {};
      const pf: Prefilled = {};
      const mapField = (key: keyof Form, value: unknown) => {
        if (value !== undefined && value !== null && value !== '' && value !== 0) {
          (updates as Record<string, unknown>)[key] = String(value);
          pf[key] = true;
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
    } catch {
      setUploadError('Could not extract data from document. You can fill the form manually.');
      setStep(1);
    } finally {
      setUploading(false);
    }
  };

  const validateReview = (): boolean => {
    const e: Errors = {};
    if (!form.borrower.trim()) e.borrower = 'Required';
    if (!form.sector) e.sector = 'Required';
    if (!form.requestedAmount || num(form.requestedAmount) < 10000) e.requestedAmount = 'Minimum €10,000';
    if (!form.loanPurpose) e.loanPurpose = 'Required';
    if (!form.accountingPeriod) e.accountingPeriod = 'Required';
    if (!form.revenue || num(form.revenue) <= 0) e.revenue = 'Required';
    if (!form.ebitda) e.ebitda = 'Required';
    if (!form.dscr || num(form.dscr) <= 0) e.dscr = 'Required';
    if (!form.documentType) e.documentType = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

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

  const reset = () => {
    setDone(false);
    setStep(0);
    setForm(BLANK_FORM);
    setPrefilled({});
    setFile(null);
    setUploadId('');
  };

  if (done) {
    return (
      <PageLayout title="Application submitted">
        <PageWrap>
          <Card $padding="lg" style={{ textAlign: 'center', animation: `${fadeUp} .4s ease` }}>
            <SuccessIcon>✓</SuccessIcon>
            <SuccessTitle>Submitted to AI analysis</SuccessTitle>
            <SuccessText>
              <strong>{appId}</strong> has been sent to the Credit Officer AI agent. Results will
              appear in the HITL Queue shortly.
            </SuccessText>
            {uploadId && (
              <p style={{ fontSize: '.75rem', color: '#A0AEC0', margin: '0 0 1rem', fontFamily: "'IBM Plex Mono',monospace" }}>
                Upload ref: {uploadId}
              </p>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button $variant="primary" onClick={() => navigate('/queue')}>View HITL Queue →</Button>
              <Button $variant="secondary" onClick={reset}>Submit another</Button>
            </div>
          </Card>
        </PageWrap>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="New loan application" notifCount={0}>
      <PageWrap>
        <StepRow>
          {STEPS.map((s, i) => (
            <StepPill key={s} $s={i < step ? 'done' : i === step ? 'active' : 'todo'}>
              {i < step ? '✓ ' : ''}{s}
            </StepPill>
          ))}
          <Badge $variant="neutral" style={{ marginLeft: 'auto', fontFamily: "'IBM Plex Mono',monospace", fontSize: '.75rem' }}>
            {appId}
          </Badge>
        </StepRow>

        {step === 0 && (
          <UploadStep
            file={file}
            uploading={uploading}
            uploadError={uploadError}
            dragging={dragging}
            onFile={handleFile}
            onDragging={setDragging}
            onSkip={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <ReviewStep
            form={form}
            prefilled={prefilled}
            errors={errors}
            onChange={handleChange}
            onBack={() => setStep(0)}
            onNext={() => { if (validateReview()) setStep(2); }}
          />
        )}
        {step === 2 && (
          <ConsentStep
            form={form}
            appId={appId}
            file={file}
            errors={errors}
            apiError={apiError}
            submitting={submitting}
            onChange={handleChange}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
          />
        )}
      </PageWrap>
    </PageLayout>
  );
};

export default LoanApplicationPage;
