import React from 'react';
import styles from '../../../styles/queue.module.css';
import { AppDetail, fmt, fmtPD } from '../types';

interface Props {
  app: AppDetail;
  submittedDecision: string | null;
}

const AuditLogTab: React.FC<Props> = ({ app, submittedDecision }) => {
  const entries = [
    { time: '14:21:45', dot: '', event: 'GDPR Art.13/14 notice presented', detail: 'Data processing notice displayed · consent obtained' },
    { time: '14:21:47', dot: '', event: 'Consent obtained (GDPR Art.22)', detail: 'Applicant consented to automated processing · right to object explained' },
    { time: '14:22:05', dot: '', event: 'Application received', detail: `${app.id} · ${app.company} · ${app.loanType} · ${app.amount}` },
    { time: '14:22:12', dot: '', event: 'PD/LGD/EAD models executed', detail: `PD: ${fmtPD(app.pd)} · LGD: ${app.lgd ? (app.lgd * 100).toFixed(0) + '%' : '—'} · Model v3.2` },
    { time: '14:22:15', dot: app.discrepancy ? styles.auditDotGold : '', event: 'Revenue reconciliation', detail: app.discrepancy ? 'Variance detected — flagged for review' : 'Reconciled within tolerance' },
    { time: '14:22:20', dot: '', event: 'IFRS 9 ECL calculated', detail: `Stage ${app.eclStage} · 12m ECL: ${fmt(app.ecl12m)}` },
    { time: '14:22:25', dot: '', event: 'Assessment complete', detail: 'Processing time: 41 seconds' },
  ];

  if (submittedDecision) {
    entries.push({
      time: '15:42:01',
      dot: styles.auditDotGreen,
      event: `Credit decision: ${submittedDecision.toUpperCase()}`,
      detail: `Underwriter: ${app.decisionOfficer || 'C. Officer'} · Rationale documented · EU AI Act Art.12`,
    });
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Immutable audit trail · EU AI Act Art.12 · CBI Inspection Ready</div>
        <span className={`${styles.tag} ${styles.tagComplete}`}>Cryptographically Signed</span>
      </div>
      <div className={styles.card} style={{ padding: '4px 16px' }}>
        {entries.map((e, i) => (
          <div key={i} className={styles.auditItem}>
            <div className={styles.auditTime}>{e.time}</div>
            <div className={`${styles.auditDot} ${e.dot}`} />
            <div>
              <div className={styles.auditEvent} style={e.dot === styles.auditDotGreen ? { color: '#059669', fontWeight: 600 } : {}}>{e.event}</div>
              <div className={styles.auditDetail}>{e.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AuditLogTab;
