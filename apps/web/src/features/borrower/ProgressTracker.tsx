import React from 'react';
import styles from '../../styles/borrower.module.css';

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
  const isAwaitingOfficer = !decision && !isComplete && currentStep === 4;

  return (
    <div className={styles.processCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2
          className={styles.sectionTitle}
          style={{ fontSize: 18 }}
        >
          Processing Application
        </h2>
        <span className={styles.loanBadge}>{appId}</span>
      </div>

      {/* ✅ FIX 2: stop spinner while waiting for officer */}
      {!isComplete && !isAwaitingOfficer && <div className={styles.bigSpinner} />}

      <div style={{ marginTop: 32 }}>
        {STEPS.map((s, i) => {
          const stepIsAwaiting = isAwaitingOfficer && i === 4;
          const done = i < currentStep || (decision === 'approved' && i <= 5);
          const active = i === currentStep && !isComplete && !isAwaitingOfficer;

          return (
            <div
              key={i}
              style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}
            >
              <div
                className={`${styles.stepDotBase} ${done ? styles.stepDotDone : stepIsAwaiting ? styles.stepDotPending : active ? styles.stepDotActive : styles.stepDotPending}`}
              >
                {done ? '✓' : i + 1}
              </div>
              <div style={{ marginLeft: 16 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: active || stepIsAwaiting ? 700 : 500,
                    color: active || done || stepIsAwaiting ? '#0F2D6B' : '#64748B',
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: '#64748B',
                    fontFamily: "'DM Mono', monospace",
                    marginTop: 2,
                  }}
                >
                  {s.sub}
                </div>
              </div>
              {active && (
                <div
                  style={{
                    marginLeft: 'auto',
                    fontSize: 10,
                    color: '#2563EB',
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  Running...
                </div>
              )}
              {stepIsAwaiting && (
                <div
                  style={{
                    marginLeft: 'auto',
                    fontSize: 10,
                    color: '#D97706',
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  Awaiting Officer...
                </div>
              )}
              {decision && i === 4 && (
                <div
                  style={{
                    marginLeft: 'auto',
                    fontSize: 10,
                    color:
                      decision === 'approved'
                        ? '#059669'
                        : decision === 'referred'
                          ? '#D97706'
                          : '#DC2626',
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 700,
                  }}
                >
                  {decision.toUpperCase()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isComplete && decision === 'approved' && (
        <div
          style={{
            textAlign: 'center',
            marginTop: 32,
            padding: 20,
            background: '#F0FDF9',
            borderRadius: 8,
            border: '1px solid rgba(5,150,105,.2)',
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 700, color: '#065F46', marginBottom: 4 }}>
            Application Approved!
          </div>
          <div style={{ fontSize: 12, color: '#047857' }}>
            Your application has been approved by the Credit Officer. Funds are now being released
            to your ledger.
          </div>
        </div>
      )}

      {isComplete && decision === 'declined' && (
        <div
          style={{
            textAlign: 'center',
            marginTop: 32,
            padding: 20,
            background: '#FEF2F2',
            borderRadius: 8,
            border: '1px solid rgba(220,38,38,.2)',
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>❌</div>
          <div style={{ fontWeight: 700, color: '#991B1B', marginBottom: 4 }}>
            Application Declined
          </div>
          <div style={{ fontSize: 12, color: '#B91C1C' }}>
            Unfortunately, we cannot proceed with your application at this time. Please see your
            rights under GDPR Article 22 for an explanation.
          </div>
        </div>
      )}

      {isComplete && decision === 'referred' && (
        <div
          style={{
            textAlign: 'center',
            marginTop: 32,
            padding: 20,
            background: '#FFFBEB',
            borderRadius: 8,
            border: '1px solid rgba(217,119,6,.2)',
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>↗️</div>
          <div style={{ fontWeight: 700, color: '#92400E', marginBottom: 4 }}>
            Manual Approval Needed
          </div>
          <div style={{ fontSize: 12, color: '#B45309' }}>
            Your application has been referred for further manual review by the Credit Committee. We
            will contact you shortly.
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
