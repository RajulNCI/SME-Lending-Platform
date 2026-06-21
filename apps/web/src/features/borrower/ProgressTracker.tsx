import React from 'react';
import styles from '../../styles/borrower.module.css';
import {
  HeaderContainer,
  Title,
  StepsContainer,
  StepRow,
  StepTextContainer,
  StepLabel,
  StepSubLabel,
  StepStatus,
  ResultCard,
  ResultIcon,
  ResultTitle,
  ResultDescription,
} from '../../styles/features/borrower/ProgressTracker.styles';
interface ProgressTrackerProps {
  currentStep: number;
  isComplete: boolean;
  appId: string;
  decision?: string | null;
}

export const STEPS = [
  { label: 'Application Intake', sub: 'Received via Borrower Portal API' },
  { label: 'IDP / OCR Doc Read', sub: 'Intelligent Document Processing' },
  { label: 'Rules Engine Assessment', sub: 'Lender credit policy evaluation' },
  { label: 'OECB API Check', sub: 'Central Credit Register query' },
  { label: 'Maker-Checker Approval Gate', sub: 'Human review checkpoint' },
  { label: 'Fund Release to Ledger', sub: 'Core banking API post' },
];

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentStep,
  isComplete,
  appId,
  decision,
}) => {
  // ✅ FIX 1: hoisted out of map so it can control the bigSpinner below
  const isAwaitingOfficer = isComplete && !decision;

  return (
    <div className={styles.processCard}>
      <HeaderContainer>
        <Title className={styles.sectionTitle}>
          Processing Application
        </Title>
        <span className={styles.loanBadge}>{appId}</span>
      </HeaderContainer>

      {/* ✅ FIX 2: stop spinner while waiting for officer */}
      {!isComplete && !isAwaitingOfficer && <div className={styles.bigSpinner} />}

      <StepsContainer>
        {STEPS.map((s, i) => {
          const stepIsAwaiting = isAwaitingOfficer && i === 4;
          const done = i < currentStep || (decision === 'approved' && i <= 5);
          const active = i === currentStep && !isComplete && !isAwaitingOfficer;

          return (
            <StepRow key={i}>
              <div
                className={`${styles.stepDotBase} ${done ? styles.stepDotDone : stepIsAwaiting ? styles.stepDotPending : active ? styles.stepDotActive : styles.stepDotPending}`}
              >
                {done ? '✓' : i + 1}
              </div>
              <StepTextContainer>
                <StepLabel $active={active} $awaiting={stepIsAwaiting} $done={done}>
                  {s.label}
                </StepLabel>
                <StepSubLabel>
                  {s.sub}
                </StepSubLabel>
              </StepTextContainer>
              {active && (
                <StepStatus $color="#2563EB">
                  Running...
                </StepStatus>
              )}
              {stepIsAwaiting && (
                <StepStatus $color="#D97706">
                  Awaiting Officer...
                </StepStatus>
              )}
              {decision && i === 4 && (
                <StepStatus
                  $color={
                    decision === 'approved'
                      ? '#059669'
                      : decision === 'referred'
                        ? '#D97706'
                        : '#DC2626'
                  }
                  $weight={700}
                >
                  {decision.toUpperCase()}
                </StepStatus>
              )}
            </StepRow>
          );
        })}
      </StepsContainer>

      {isComplete && decision === 'approved' && (
        <ResultCard $variant="approved">
          <ResultIcon>✅</ResultIcon>
          <ResultTitle $color="#065F46">
            Application Approved!
          </ResultTitle>
          <ResultDescription $color="#047857">
            Your application has been approved by the Credit Officer. Funds are now being released
            to your ledger.
          </ResultDescription>
        </ResultCard>
      )}

      {isComplete && decision === 'declined' && (
        <ResultCard $variant="declined">
          <ResultIcon>❌</ResultIcon>
          <ResultTitle $color="#991B1B">
            Application Declined
          </ResultTitle>
          <ResultDescription $color="#B91C1C">
            Unfortunately, we cannot proceed with your application at this time. Please see your
            rights under GDPR Article 22 for an explanation.
          </ResultDescription>
        </ResultCard>
      )}

      {isComplete && decision === 'referred' && (
        <ResultCard $variant="referred">
          <ResultIcon>↗️</ResultIcon>
          <ResultTitle $color="#92400E">
            Manual Approval Needed
          </ResultTitle>
          <ResultDescription $color="#B45309">
            Your application has been referred for further manual review by the Credit Committee. We
            will contact you shortly.
          </ResultDescription>
        </ResultCard>
      )}
    </div>
  );
};

export default ProgressTracker;
