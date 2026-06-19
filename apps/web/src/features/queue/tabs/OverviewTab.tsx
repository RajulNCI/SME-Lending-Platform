import React from 'react';
import styles from '../../../styles/queue.module.css';
import { AppDetail, fmt, fmtPD, MONTHS } from '../types';

interface Props {
  app: AppDetail;
}

const OverviewTab: React.FC<Props> = ({ app }) => {
  const dscrPos = app.dscr >= 1.2;
  const bars = app.bars || [];
  const maxBar = Math.max(...bars, 1);

  return (
    <>
      <div className={styles.grid5} style={{ marginBottom: 14 }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>PD</div>
          <div className={`${styles.cardVal} ${app.pd < 0.05 ? styles.valTeal : app.pd < 0.10 ? styles.valGold : styles.valRed}`}>{fmtPD(app.pd)}</div>
          <div className={styles.cardSub}>Probability of Default</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Risk Grade</div>
          <div className={`${styles.cardVal} ${app.riskGrade?.startsWith('A') ? styles.valTeal : app.riskGrade?.startsWith('B') ? styles.valGreen : styles.valGold}`}>{app.riskGrade || '—'}</div>
          <div className={styles.cardSub}>Internal rating</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>DSCR</div>
          <div className={`${styles.cardVal} ${dscrPos ? styles.valTeal : styles.valRed}`}>{app.dscr != null ? app.dscr.toFixed(2) + '×' : '—'}</div>
          <div className={styles.cardSub}>{dscrPos ? '✓ Above Policy Min 1.20×' : '✗ Below Policy Min 1.20×'}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>APR</div>
          <div className={`${styles.cardVal} ${styles.valTeal}`}>{app.apr != null ? app.apr + '%' : '—'}</div>
          <div className={styles.cardSub}>Risk-based pricing</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Affordability</div>
          <div className={`${styles.cardVal} ${app.affordability >= 0.6 ? styles.valTeal : styles.valRed}`}>{app.affordability != null ? (app.affordability * 100).toFixed(0) + '%' : '—'}</div>
          <div className={styles.cardSub}>Capacity to repay</div>
        </div>
      </div>

      <div className={styles.grid4} style={{ marginBottom: 14 }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Declared Revenue</div>
          <div className={styles.cardVal} style={{ fontSize: 22 }}>{app.revenue || '—'}</div>
          <div className={styles.cardSub}>Management accounts</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Actual Lodgements</div>
          <div className={`${styles.cardVal} ${app.discrepancy ? styles.valGold : styles.valTeal}`} style={{ fontSize: 22 }}>{app.revenueActual || '—'}</div>
          <div className={styles.cardSub}>{app.discrepancy ? '⚑ Variance detected' : '✓ Reconciled'}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Free Cash Flow</div>
          <div className={`${styles.cardVal} ${styles.valTeal}`} style={{ fontSize: 22 }}>{app.cashflow || '—'}</div>
          <div className={styles.cardSub}>After debt service p.a.</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>ECL (12-Month)</div>
          <div className={styles.cardVal} style={{ fontSize: 22 }}>{fmt(app.ecl12m)}</div>
          <div className={styles.cardSub}>IFRS 9 Stage {app.eclStage || '—'}</div>
        </div>
      </div>

      <div className={styles.grid2}>
        <div>
          <div className={styles.secHdr}><div className={styles.secTitle}>Submitted Documents</div></div>
          {['Management Accounts 2024', 'Management Accounts 2023', 'Tax Clearance Certificate', 'Director ID Docs', '6 Months Bank Statements', 'GDPR Consent Form'].map((d, i) => (
            <div key={i} className={styles.docItem}>
              <div className={styles.docIcon}>📄</div>
              <div style={{ flex: 1 }}>
                <div className={styles.docName}>{d}</div>
                <div className={styles.docMeta}>{['PDF · 2.1MB', 'PDF · 1.9MB', 'PDF · 148KB', 'JPEG · 1.6MB', 'PDF · 4.2MB', 'PDF · 89KB'][i]}</div>
              </div>
              <span className={`${styles.tag} ${styles.tagComplete}`}>✓ Processed</span>
            </div>
          ))}
        </div>
        <div>
          <div className={styles.secHdr}><div className={styles.secTitle}>Monthly Revenue Trend</div></div>
          <div className={styles.card} style={{ paddingBottom: 20, marginBottom: 12 }}>
            <div className={styles.cardTitle}>Open Banking Lodgements — 12 Months <span style={{ color: 'var(--teal)', marginLeft: 8 }}>{app.revenue || ''}</span></div>
            <div className={styles.barChart}>
              {bars.map((v, i) => (
                <div key={i} className={styles.barCol}>
                  <div className={styles.barFill} style={{ height: `${Math.round((v / maxBar) * 100)}%`, background: v === maxBar ? 'var(--teal)' : '#DBEAFE' }} />
                  <div className={styles.barLbl}>{MONTHS[i] || ''}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Mar 24</span>
              <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Feb 25</span>
            </div>
          </div>

          {app.discrepancy && app.discrepancyDetail ? (
            <div className={`${styles.flagBox} ${styles.flagAmber}`}>
              <div className={`${styles.flagTitle} ${styles.flagAmber}`}>⚑ Revenue Discrepancy Detected</div>
              <div className={styles.flagBody}>{app.discrepancyDetail}</div>
            </div>
          ) : (
            <div className={`${styles.flagBox} ${styles.flagGreen}`}>
              <div className={`${styles.flagTitle} ${styles.flagGreen}`}>✓ Revenue Reconciled</div>
              <div className={styles.flagBody}>Declared revenue closely matches actual open banking lodgements. Variance within 2% tolerance.</div>
            </div>
          )}

          {app.hitl && (
            <div style={{ background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.3)', borderRadius: 'var(--r)', padding: '12px 14px', marginTop: 12, fontSize: 12, color: '#1D4ED8' }}>
              <strong>⚠ HITL Mandatory:</strong> {app.hitlReason}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OverviewTab;
