import React, { useState } from 'react';
import styles from '../../styles/queue.module.css';
import { AppDetail } from './types';
import OverviewTab from './tabs/OverviewTab';
import RiskXAITab from './tabs/RiskXAITab';
import OpenBankingTab from './tabs/OpenBankingTab';
import IFRS9Tab from './tabs/IFRS9Tab';
import TrustworthinessTab from './tabs/TrustworthinessTab';
import AuditLogTab from './tabs/AuditLogTab';
import ComplianceTab from './tabs/ComplianceTab';
import EvidencePackTab from './tabs/EvidencePackTab';

const TABS = ['Overview', 'Risk & XAI', 'Open Banking', 'IFRS 9', '✔ Trustworthiness', 'Audit Log', 'Compliance', 'Evidence Pack'] as const;
type Tab = typeof TABS[number];

interface Props {
  app: AppDetail;
  onBack: () => void;
  onDecision: (appId: string, decision: 'approved' | 'referred' | 'declined', rationale: string) => Promise<void>;
  submittedDecision: string | null;
  showToast: (msg: string) => void;
}

const ApplicationDetail: React.FC<Props> = ({ app, onBack, onDecision, submittedDecision, showToast }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [outcome, setOutcome] = useState<'approved' | 'referred' | 'declined' | null>(null);
  const [rationale, setRationale] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasFailedCheck = app.checks?.some((c) => c.status === 'fail');

  const handleDecisionSubmit = async () => {
    if (!outcome || rationale.trim().length < 20) return;
    setIsSubmitting(true);
    await onDecision(app.id, outcome, rationale);
    setIsSubmitting(false);
  };

  const statusChip = submittedDecision
    ? <span className={`${styles.chip} ${styles.chipTeal}`}>✓ {submittedDecision === 'approved' ? 'Approved' : 'Decided'}</span>
    : app.status === 'flagged'
      ? <span className={`${styles.chip} ${styles.chipRed}`}>⚠ Flagged</span>
      : <span className={`${styles.chip} ${styles.chipTeal}`}>✓ Assessment Complete</span>;

  return (
    <div className={styles.appView}>
      <div className={styles.appHeader}>
        <button className={styles.appBack} onClick={onBack}>← Back to Queue</button>

        <div className={styles.appTitleRow}>
          <div>
            <div className={styles.appCompany}>{app.company}</div>
            <div className={styles.appRef}>{app.id} · {app.crn || 'CRN PENDING'} · {app.sector}</div>
          </div>
          <div className={styles.appActions}>
            {!submittedDecision ? (
              <>
                <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => showToast('↓ Exporting evidence pack…')}>↓ Export Pack</button>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => document.getElementById('decision-gate')?.scrollIntoView({ behavior: 'smooth' })}>Make Decision →</button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(37,99,235,.08)', border: '1px solid rgba(37,99,235,.2)', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 600, color: 'var(--teal)' }}>
                ✅ Decision: {submittedDecision.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className={styles.appChips}>
          {statusChip}
          <span className={`${styles.chip} ${styles.chipRed}`}>EU AI Act: High-Risk</span>
          <span className={`${styles.chip} ${styles.chipTeal}`}>{app.loanType}</span>
          <span className={styles.chip}>{app.amount} requested</span>
          {app.riskGrade && <span className={`${styles.chip} ${styles.chipTeal}`}>Grade: {app.riskGrade}</span>}
          {app.hitl && <span className={`${styles.chip} ${styles.chipGold}`}>⚠ HITL Mandatory</span>}
        </div>

        <div className={styles.tabsRow}>
          {TABS.map((t) => {
            const isAlert = t === 'Compliance' && hasFailedCheck;
            return (
              <button
                key={t}
                className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''} ${isAlert ? styles.tabAlert : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.panels}>
        {activeTab === 'Overview' && <OverviewTab app={app} />}
        {activeTab === 'Risk & XAI' && <RiskXAITab app={app} />}
        {activeTab === 'Open Banking' && <OpenBankingTab app={app} />}
        {activeTab === 'IFRS 9' && <IFRS9Tab app={app} />}
        {activeTab === '✔ Trustworthiness' && <TrustworthinessTab app={app} />}
        {activeTab === 'Audit Log' && <AuditLogTab app={app} submittedDecision={submittedDecision} />}
        {activeTab === 'Compliance' && <ComplianceTab app={app} />}
        {activeTab === 'Evidence Pack' && <EvidencePackTab app={app} />}

        {/* Decision Gate — always rendered below tabs */}
        <div id="decision-gate" className={styles.gate}>
          {submittedDecision ? (
            <div className={styles.decidedBanner}>
              <span style={{ fontSize: 28 }}>{submittedDecision === 'approved' ? '✅' : submittedDecision === 'referred' ? '↗️' : '❌'}</span>
              <div>
                <div className={styles.decidedText}>Decision submitted: {submittedDecision.toUpperCase()}</div>
                <div className={styles.decidedSub}>Logged immutably · EU AI Act Art.12 · CBI inspection-ready</div>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.gateTitle}>⚖ Maker-Checker — Credit Decision Gate</div>
              <div className={styles.gateSub}>
                Step 5 of 6. Under EU AI Act Art.14 and GDPR Art.22, your decision and rationale will be permanently logged.
              </div>
              <div className={styles.gateBtns}>
                {(['approved', 'referred', 'declined'] as const).map((o) => (
                  <button
                    key={o}
                    className={`${styles.gateBtn} ${outcome === o ? (o === 'approved' ? styles.gateBtnApprove : o === 'referred' ? styles.gateBtnRefer : styles.gateBtnDecline) : ''}`}
                    onClick={() => setOutcome(o)}
                  >
                    {o === 'approved' ? '✓ Approve' : o === 'referred' ? '→ Refer' : '✗ Decline'}
                  </button>
                ))}
              </div>
              <textarea
                className={styles.rationaleTa}
                placeholder="Enter mandatory rationale (min 20 characters) — stored immutably per EU AI Act Art.12 and Ireland's IAF…"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
              />
              {rationale.length > 0 && rationale.trim().length < 20 && (
                <div className={styles.ratErr}>{20 - rationale.trim().length} more characters needed</div>
              )}
              <button
                className={styles.submitDec}
                disabled={!outcome || rationale.trim().length < 20 || isSubmitting}
                onClick={handleDecisionSubmit}
              >
                {isSubmitting ? 'Submitting…' : outcome ? `Submit — ${outcome.charAt(0).toUpperCase() + outcome.slice(1)}` : 'Select outcome first'}
              </button>
              <div className={styles.auditNote}>⚠ Once submitted, this decision is immutably recorded · EU AI Act Art.12 · IAF PCF-11</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
