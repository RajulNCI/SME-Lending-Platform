import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
    'Working Capital': 'Working Capital',
    'Equipment': 'Equipment Purchase',
    'Expansion': 'Expansion',
    'Real Estate': 'Commercial Mortgage',
    'Refinance': 'Refinance',
    'Other': 'Other',
  };

  const handleSubmit = async () => {
    setWizardStep(3); // Move to progress tracker UI immediately
    setSubmitError(null);
    
    try {
      const appData = await createApplication({
        company_name: user?.displayName || 'Borrower SME Ltd',
        sector: 'Technology', // Default sector — could add a form field
        loan_amount: parseFloat(amount) || 50000,
        loan_purpose: PURPOSE_TO_LOAN_TYPE[purpose] || 'Working Capital',
      });
      
      const id = appData.id || appData.applicationId || appData.reference || '';
      setAppId(id);
      
      // Start polling passing the ID explicitly
      pollingHook.startPolling(id);
      
    } catch (err: any) {
      console.error("API Error", err);
      setSubmitError(err.message || 'Failed to submit application');
    }
  };

  return (
    <PageLayout title="Borrower Application">
      <div className={styles.shell}>
        <header className={styles.topBar}>
          <div className={styles.logoMark}>FP</div>
          <div className={styles.brandName}>FinPal</div>
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
            <div className={`${styles.stepDotBase} ${wizardStep > 1 ? styles.stepDotDone : styles.stepDotActive}`}>1</div>
            <div className={`${styles.stepLabel} ${wizardStep >= 1 ? styles.stepLabelActive : styles.stepLabelPending}`}>Loan Details</div>
            <div className={`${styles.stepLine} ${wizardStep > 1 ? styles.stepLineDone : styles.stepLinePending}`} />
            
            <div className={`${styles.stepDotBase} ${wizardStep > 2 ? styles.stepDotDone : wizardStep === 2 ? styles.stepDotActive : styles.stepDotPending}`}>{wizardStep > 2 ? '✓' : '2'}</div>
            <div className={`${styles.stepLabel} ${wizardStep >= 2 ? styles.stepLabelActive : styles.stepLabelPending}`}>Documents</div>
            <div className={`${styles.stepLine} ${wizardStep > 2 ? styles.stepLineDone : styles.stepLinePending}`} />
            
            <div className={`${styles.stepDotBase} ${wizardStep === 3 ? styles.stepDotActive : styles.stepDotPending}`}>3</div>
            <div className={`${styles.stepLabel} ${wizardStep === 3 ? styles.stepLabelActive : styles.stepLabelPending}`}>Processing</div>
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
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  color: '#DC2626',
                  fontSize: '.875rem',
                }}>
                  ⚠ {submitError}
                </div>
              )}
              <ProgressTracker
                currentStep={pollingHook.currentStep}
                isComplete={pollingHook.isComplete}
                appId={appId || "Submitting..."}
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
