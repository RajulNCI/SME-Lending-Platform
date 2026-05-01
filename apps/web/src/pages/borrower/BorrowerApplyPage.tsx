import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import LoanDetailsForm from '../../features/borrower/LoanDetailsForm';
import DocumentChecklist from '../../features/borrower/DocumentChecklist';
import ProgressTracker, { STEPS } from '../../features/borrower/ProgressTracker';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';
import { useApplicationPolling } from '../../hooks/useApplicationPolling';
import { createApplication } from '../../services/AIApi';
import styles from '../../styles/borrower.module.css';

const BorrowerApplyPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [wizardStep, setWizardStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [appId, setAppId] = useState<string | null>(null);

  // Hooks
  const uploadHook = useDocumentUpload();
  const pollingHook = useApplicationPolling(appId, STEPS.length);

  const handleSubmit = async () => {
    setWizardStep(3); // Move to progress tracker UI immediately
    
    try {
      const appData = await createApplication({
        company_name: "Borrower SME Ltd",
        crn: "123456",
        sector: "Retail",
        director_name: "Jane Doe",
        director_email: "jane@example.com",
        director_phone: "0800123456",
        address: "123 Main St",
        years_trading: "5",
        loan_amount: parseFloat(amount) || 50000,
        loan_purpose: purpose || "Working Capital",
        loan_term_months: 12,
        purpose_detail: purpose || "Working Capital",
        consent_data_processing: true,
        consent_ccr: true,
        consent_ai_decision: true
      });
      
      setAppId(appData.id);
      
      // Start polling passing the ID explicitly
      pollingHook.startPolling(appData.id);
      
    } catch (err) {
      console.error("API Error", err);
      // Fallback for mock mode if error
      setAppId("FP-2026-FALLBACK");
      pollingHook.startPolling("FP-2026-FALLBACK");
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
            <div className={styles.userAvatar}>SJ</div>
            <div>
              <div className={styles.userName}>Sarah Jenkins</div>
              <div className={styles.userRole}>Borrower SME Ltd</div>
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
            <ProgressTracker
              currentStep={pollingHook.currentStep}
              isComplete={pollingHook.isComplete}
              appId={appId || "Generating..."}
              decision={pollingHook.decision}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default BorrowerApplyPage;
