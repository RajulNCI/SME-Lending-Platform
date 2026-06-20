import React, { useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import LoanDetailsForm from '../../features/borrower/LoanDetailsForm';
import DocumentChecklist from '../../features/borrower/DocumentChecklist';
import ProgressTracker, { STEPS } from '../../features/borrower/ProgressTracker';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';
import { useApplicationPolling } from '../../hooks/useApplicationPolling';
import { createApplication } from '../../services/AIApi';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/borrower.module.css';

const BorrowerApplyPage: React.FC = () => {
  const { user } = useAuth();

  // State
  const [wizardStep, setWizardStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [appId, setAppId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Hooks
  const uploadHook = useDocumentUpload();
  const pollingHook = useApplicationPolling(appId, STEPS.length);

  // Map purpose selection → backend loanType enum
  const PURPOSE_TO_LOAN_TYPE: Record<string, string> = {
    'Working Capital': 'WORKING_CAPITAL',
    Equipment: 'EQUIPMENT_FINANCE',
    Expansion: 'EXPANSION',
    'Real Estate': 'COMMERCIAL_MORTGAGE',
    Refinance: 'REFINANCE',
    Other: 'OTHER',
  };

  const handleSubmit = async () => {
    setWizardStep(3); // Move to progress tracker UI immediately
    setSubmitError(null);

    try {
      // Collect the actual files from the upload hook
      const files = uploadHook.files.map((uf) => uf.file);

      const appData = await createApplication({
        companyName: user?.displayName || 'Borrower SME Ltd',
        sector: 'Technology', // Default sector — could add a form field
        loanAmount: parseFloat(amount) || 50000,
        loanType: PURPOSE_TO_LOAN_TYPE[purpose] || 'WORKING_CAPITAL',
        requestedBy: user?.email || '',
        files: files.length > 0 ? files : undefined,
      });

      const id = appData.id || appData.applicationId || '';
      setAppId(id);

      // Start polling passing the ID explicitly
      pollingHook.startPolling(id);
    } catch (err) {
      console.error('API Error', err);
      setSubmitError((err as Error).message || 'Failed to submit application');
    }
  };

  return (
    <PageLayout title="Borrower Application">
      <div className={styles.shell}>
        <header className={styles.topBar}>
          <img
            src="/finpal-logo.png"
            alt="FinPal"
            style={{
              height: '36px',
              width: 'auto',
              background: '#0C2965',
              borderRadius: '9px',
              padding: '4px 9px',
            }}
          />
          <div className={styles.brandTag}>v5.0 — Intake Portal</div>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>{user?.badge || 'SME'}</div>
            <div>
              <div className={styles.userName}>{user?.displayName || 'Borrower'}</div>
              <div className={styles.userRole}>{user?.roleLabel || 'SME Borrower'}</div>
            </div>
          </div>
        </header>

        <div className={styles.page}>
          {/* Step indicator */}
          <div className={styles.stepRow}>
            <div
              className={`${styles.stepDotBase} ${wizardStep > 1 ? styles.stepDotDone : styles.stepDotActive}`}
            >
              1
            </div>
            <div
              className={`${styles.stepLabel} ${wizardStep >= 1 ? styles.stepLabelActive : styles.stepLabelPending}`}
            >
              Loan Details
            </div>
            <div
              className={`${styles.stepLine} ${wizardStep > 1 ? styles.stepLineDone : styles.stepLinePending}`}
            />

            <div
              className={`${styles.stepDotBase} ${wizardStep > 2 ? styles.stepDotDone : wizardStep === 2 ? styles.stepDotActive : styles.stepDotPending}`}
            >
              {wizardStep > 2 ? '✓' : '2'}
            </div>
            <div
              className={`${styles.stepLabel} ${wizardStep >= 2 ? styles.stepLabelActive : styles.stepLabelPending}`}
            >
              Documents
            </div>
            <div
              className={`${styles.stepLine} ${wizardStep > 2 ? styles.stepLineDone : styles.stepLinePending}`}
            />

            <div
              className={`${styles.stepDotBase} ${wizardStep === 3 ? styles.stepDotActive : styles.stepDotPending}`}
            >
              3
            </div>
            <div
              className={`${styles.stepLabel} ${wizardStep === 3 ? styles.stepLabelActive : styles.stepLabelPending}`}
            >
              Processing
            </div>
          </div>

          {wizardStep === 1 && (
            <LoanDetailsForm
              amount={amount}
              setAmount={setAmount}
              purpose={purpose}
              setPurpose={setPurpose}
              onNext={() => setWizardStep(2)}
            />
          )}

          {wizardStep === 2 && (
            <DocumentChecklist
              uploadHook={uploadHook}
              onBack={() => setWizardStep(1)}
              onSubmit={handleSubmit}
            />
          )}

          {wizardStep === 3 && (
            <>
              {submitError && (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    color: '#DC2626',
                    fontSize: '.875rem',
                  }}
                >
                  ⚠ {submitError}
                </div>
              )}
              <ProgressTracker
                currentStep={pollingHook.currentStep}
                isComplete={pollingHook.isComplete}
                appId={appId || 'Submitting...'}
                decision={pollingHook.decision}
              />
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default BorrowerApplyPage;
