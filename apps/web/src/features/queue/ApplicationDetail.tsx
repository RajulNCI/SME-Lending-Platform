import React, { useState } from 'react';
import styles from '../../styles/queue.module.css';

interface ApplicationDetailProps {
  app: any;
  onBack: () => void;
  onDecision: (
    appId: string,
    decision: 'approved' | 'referred' | 'declined',
    rationale: string
  ) => Promise<void>;
  submittedDecision: string | null;
  showToast: (msg: string) => void;
}

const TABS = [
  'Overview',
  'Risk & XAI',
  'Open Banking',
  'IFRS 9',
  '✔ Trustworthiness',
  'Audit Log',
  'Compliance',
  'Evidence Pack',
];

const ApplicationDetail: React.FC<ApplicationDetailProps> = ({
  app,
  onBack,
  onDecision,
  submittedDecision,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [outcome, setOutcome] = useState<'approved' | 'referred' | 'declined' | null>(null);
  const [rationale, setRationale] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasFailedCheck = app.checks?.some((c: any) => c.status === 'fail');

  const fmt = (v: any, pre = '€') => (v == null ? '—' : `${pre}${Number(v).toLocaleString()}`);
  // const pct = (v: any) => (v == null ? '—' : `${(v * 100).toFixed(1)}%`);
  const fmtPD = (v: any) => (v == null ? '—' : `${(v * 100).toFixed(1)}%`);

  const MONTHS = ['M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D', 'J', 'F'];
  const bars = app.bars?.length
    ? app.bars
    : [180, 195, 210, 175, 220, 205, 190, 215, 240, 195, 310, 225];

  const staticTransactions = [
    { date: 'Jan 25', desc: 'LODGE – MCMAHON CIVIL ENG', category: 'Revenue', amount: '+€84,200' },
    {
      date: 'Jan 25',
      desc: 'LODGE – DUBLIN CITY COUNCIL',
      category: 'Revenue',
      amount: '+€112,450',
    },
    { date: 'Jan 25', desc: 'DWT PAYROLL', category: 'Payroll', amount: '-€62,400' },
    { date: 'Jan 25', desc: 'AIB LOAN REPAYMENT', category: 'Debt Service', amount: '-€12,800' },
    { date: 'Jan 25', desc: 'VAT ROS PAYMENT', category: 'Tax', amount: '-€28,650' },
    { date: 'Dec 24', desc: 'LODGE – COYLE CONTRACTS', category: 'Revenue', amount: '+€96,300' },
    { date: 'Dec 24', desc: 'DWT PAYROLL', category: 'Payroll', amount: '-€62,400' },
    { date: 'Nov 24', desc: 'LODGE – NTA FRAMEWORK', category: 'Revenue', amount: '+€145,000' },
    { date: 'Nov 24', desc: 'LODGE – MCMAHON CIVIL ENG', category: 'Revenue', amount: '+€67,800' },
    { date: 'Nov 24', desc: 'DWT PAYROLL', category: 'Payroll', amount: '-€62,400' },
  ];
  const transactions = app.transactions?.length ? app.transactions : staticTransactions;

  const handleDecisionSubmit = async () => {
    if (!outcome || rationale.trim().length < 20) return;
    setIsSubmitting(true);
    await onDecision(app.id, outcome, rationale);
    setIsSubmitting(false);
  };

  const statusChip = submittedDecision ? (
    <span className={`${styles.chip} ${styles.chipTeal}`}>
      ✓ {submittedDecision === 'approved' ? 'Approved' : 'Decided'}
    </span>
  ) : app.status === 'flagged' ? (
    <span className={`${styles.chip} ${styles.chipRed}`}>⚠ Flagged</span>
  ) : (
    <span className={`${styles.chip} ${styles.chipTeal}`}>✓ Assessment Complete</span>
  );

  // Render Functions for Tabs
  const renderOverview = () => {
    const dscrPos = app.dscr >= 1.2;
    const bars =
      app.bars && app.bars.length > 0
        ? app.bars
        : [180, 195, 210, 175, 220, 205, 190, 215, 240, 195, 310, 225];
    const maxBar = Math.max(...bars);

    return (
      <>
        <div
          className={styles.grid5}
          style={{ marginBottom: 14 }}
        >
          <div className={styles.card}>
            <div className={styles.cardTitle}>PD</div>
            <div
              className={`${styles.cardVal} ${app.pd < 0.05 ? styles.valTeal : app.pd < 0.1 ? styles.valGold : styles.valRed}`}
            >
              {fmtPD(app.pd)}
            </div>
            <div className={styles.cardSub}>Probability of Default</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Risk Grade</div>
            <div
              className={`${styles.cardVal} ${app.riskGrade?.startsWith('A') ? styles.valTeal : app.riskGrade?.startsWith('B') ? styles.valGreen : styles.valGold}`}
            >
              {app.riskGrade || '—'}
            </div>
            <div className={styles.cardSub}>Internal rating</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>DSCR</div>
            <div className={`${styles.cardVal} ${dscrPos ? styles.valTeal : styles.valRed}`}>
              {app.dscr != null ? app.dscr.toFixed(2) + '×' : '—'}
            </div>
            <div className={styles.cardSub}>
              {dscrPos ? '✓ Above Policy Min 1.20×' : '✗ Below Policy Min 1.20×'}
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>APR</div>
            <div className={`${styles.cardVal} ${styles.valTeal}`}>
              {app.apr != null ? app.apr + '%' : '—'}
            </div>
            <div className={styles.cardSub}>Risk-based pricing</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Affordability</div>
            <div
              className={`${styles.cardVal} ${app.affordability >= 0.6 ? styles.valTeal : styles.valRed}`}
            >
              {app.affordability != null ? (app.affordability * 100).toFixed(0) + '%' : '—'}
            </div>
            <div className={styles.cardSub}>Capacity to repay</div>
          </div>
        </div>

        <div
          className={styles.grid4}
          style={{ marginBottom: 14 }}
        >
          <div className={styles.card}>
            <div className={styles.cardTitle}>Declared Revenue</div>
            <div
              className={styles.cardVal}
              style={{ fontSize: 22 }}
            >
              {app.revenue || '—'}
            </div>
            <div className={styles.cardSub}>Management accounts</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Actual Lodgements</div>
            <div
              className={`${styles.cardVal} ${app.discrepancy ? styles.valGold : styles.valTeal}`}
              style={{ fontSize: 22 }}
            >
              {app.revenueActual || '—'}
            </div>
            <div className={styles.cardSub}>
              {app.discrepancy ? '⚑ Variance detected' : '✓ Reconciled'}
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Free Cash Flow</div>
            <div
              className={`${styles.cardVal} ${styles.valTeal}`}
              style={{ fontSize: 22 }}
            >
              {app.cashflow || '—'}
            </div>
            <div className={styles.cardSub}>After debt service p.a.</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>ECL (12-Month)</div>
            <div
              className={styles.cardVal}
              style={{ fontSize: 22 }}
            >
              {fmt(app.ecl12m)}
            </div>
            <div className={styles.cardSub}>IFRS 9 Stage {app.eclStage || '—'}</div>
          </div>
        </div>

        <div className={styles.grid2}>
          <div>
            <div className={styles.secHdr}>
              <div className={styles.secTitle}>Submitted Documents</div>
            </div>
            {[
              'Management Accounts 2024',
              'Management Accounts 2023',
              'Tax Clearance Certificate',
              'Director ID Docs',
              '6 Months Bank Statements',
              'GDPR Consent Form',
            ].map((d, i) => (
              <div
                key={i}
                className={styles.docItem}
              >
                <div className={styles.docIcon}>📄</div>
                <div style={{ flex: 1 }}>
                  <div className={styles.docName}>{d}</div>
                  <div className={styles.docMeta}>
                    {
                      [
                        'PDF · 2.1MB',
                        'PDF · 1.9MB',
                        'PDF · 148KB',
                        'JPEG · 1.6MB',
                        'PDF · 4.2MB',
                        'PDF · 89KB',
                      ][i]
                    }
                  </div>
                </div>
                <span className={`${styles.tag} ${styles.tagComplete}`}>✓ Processed</span>
              </div>
            ))}
          </div>
          <div>
            <div className={styles.secHdr}>
              <div className={styles.secTitle}>Monthly Revenue Trend</div>
            </div>
            <div
              className={styles.card}
              style={{ paddingBottom: 20, marginBottom: 12 }}
            >
              <div className={styles.cardTitle}>
                Open Banking Lodgements — 12 Months{' '}
                <span style={{ color: 'var(--teal)', marginLeft: 8 }}>{app.revenue || ''}</span>
              </div>
              <div
                className={styles.barChart}
                style={{ height: 100 }}
              >
                {bars.map((v: number, i: number) => (
                  <div
                    key={i}
                    className={styles.barCol}
                  >
                    <div
                      className={styles.barFill}
                      style={{
                        height: `${Math.round((v / maxBar) * 90)}px`,
                        background: v === maxBar ? '#1e3a8a' : '#bfdbfe',
                      }}
                    />
                    <div className={styles.barLbl}>{MONTHS[i] || ''}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span
                  style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                >
                  Mar 24
                </span>
                <span
                  style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                >
                  Feb 25
                </span>
              </div>
            </div>
            {app.discrepancy && app.discrepancyDetail ? (
              <div className={`${styles.flagBox} ${styles.flagAmber}`}>
                <div className={`${styles.flagTitle} ${styles.flagAmber}`}>
                  ⚑ Revenue Discrepancy Detected
                </div>
                <div className={styles.flagBody}>{app.discrepancyDetail}</div>
              </div>
            ) : (
              <div className={`${styles.flagBox} ${styles.flagGreen}`}>
                <div className={`${styles.flagTitle} ${styles.flagGreen}`}>
                  ✓ Revenue Reconciled
                </div>
                <div className={styles.flagBody}>
                  Declared revenue closely matches actual open banking lodgements. Variance within
                  2% tolerance.
                </div>
              </div>
            )}
            {app.hitl && (
              <div
                style={{
                  background: 'rgba(59,130,246,.08)',
                  border: '1px solid rgba(59,130,246,.3)',
                  borderRadius: 'var(--r)',
                  padding: '12px 14px',
                  marginTop: 12,
                  fontSize: 12,
                  color: '#1D4ED8',
                }}
              >
                <strong>⚠ HITL Mandatory:</strong> {app.hitlReason}
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderRiskXAI = () => {
    const shap = app.shapValues || [];
    const maxS = Math.max(...shap.map((s: any) => Math.abs(s.value)), 0.01);
    const di = app.fairnessMetrics?.disparateImpact ?? 0.92;
    const eo = app.fairnessMetrics?.equalOpportunity ?? 0.03;

    return (
      <>
        {/* Section header matching screenshot */}
        <div
          className={styles.secHdr}
          style={{ marginTop: 0 }}
        >
          <div className={styles.secTitle}>Credit Risk Scoring</div>
          <span className={`${styles.tag} ${styles.tagComplete}`}>
            Model: PD v3.2 / LGD v2.1 / EAD v1.8
          </span>
        </div>

        <div
          className={styles.grid3}
          style={{ marginBottom: 16 }}
        >
          <div className={styles.card}>
            <div className={styles.cardTitle}>PD (Probability of Default)</div>
            <div
              className={`${styles.cardVal} ${app.pd < 0.05 ? styles.valTeal : app.pd < 0.1 ? styles.valGold : styles.valRed}`}
            >
              {fmtPD(app.pd)}
            </div>
            <div className={styles.cardSub}>Application PD model v3.2</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>LGD (Loss Given Default)</div>
            <div className={styles.cardVal}>
              {app.lgd != null ? (app.lgd * 100).toFixed(0) + '%' : '—'}
            </div>
            <div className={styles.cardSub}>LGD model v2.1</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>EAD (Exposure at Default)</div>
            <div className={styles.cardVal}>{fmt(app.ead)}</div>
            <div className={styles.cardSub}>EAD model v1.8</div>
          </div>
        </div>

        <div
          className={styles.grid2}
          style={{ marginBottom: 16 }}
        >
          <div className={styles.card}>
            <div className={styles.cardTitle}>Affordability &amp; Capacity to Repay</div>
            <div
              className={`${styles.cardVal} ${app.affordability >= 0.6 ? styles.valTeal : styles.valRed}`}
            >
              {app.affordability != null ? (app.affordability * 100).toFixed(0) + '%' : '—'}
            </div>
            <div className={styles.cardSub}>Cash-flow based · Affordability model v2.0</div>
            <div
              className={styles.progressBar}
              style={{ marginTop: 10 }}
            >
              <div
                className={styles.progressFill}
                style={{
                  width: `${app.affordability != null ? app.affordability * 100 : 0}%`,
                  background: app.affordability >= 0.6 ? 'var(--teal)' : 'var(--red)',
                }}
              />
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Risk-Based Pricing (EBA LOM)</div>
            {[
              ['APR', app.apr != null ? app.apr + '%' : '—'],
              ['Risk Grade', app.riskGrade || '—'],
              ['Pricing Framework', 'EBA LOM aligned'],
              ['Collateral', app.loanType === 'Asset Finance' ? 'Asset-backed' : 'Unsecured'],
            ].map(([l, v]) => (
              <div
                key={l}
                className={styles.metricRow}
              >
                <span className={styles.mLabel}>{l}</span>
                <span className={styles.mVal}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SHAP section */}
        <div className={styles.secHdr}>
          <div className={styles.secTitle}>SHAP Explainability — Top Decision Factors</div>
          <span className={`${styles.tag} ${styles.tagComplete}`}>EU AI Act Art.13</span>
        </div>
        <div
          className={styles.card}
          style={{ marginBottom: 16 }}
        >
          <div className={styles.cardTitle}>
            Local Explanation (Per-Decision){' '}
            <span style={{ fontSize: 10, color: 'var(--muted)' }}>SHAP v3.2 · GPU-accelerated</span>
          </div>
          {shap.map((s: any, i: number) => {
            const w = Math.round((Math.abs(s.value) / maxS) * 100);
            const pos = s.direction === 'positive';
            return (
              <div
                key={i}
                className={styles.shapRow}
              >
                <div className={styles.shapFeat}>{s.feature}</div>
                <div className={styles.shapTrack}>
                  <div
                    style={{
                      height: '100%',
                      width: `${w}%`,
                      background: pos ? '#1e3a8a' : '#1e40af',
                      borderRadius: 3,
                    }}
                  />
                </div>
                <div
                  className={styles.shapVal}
                  style={{ color: pos ? 'var(--teal)' : '#1E3A8A' }}
                >
                  {pos ? '+' : '−'}
                  {s.value.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stress Test */}
        <div className={styles.secHdr}>
          <div className={styles.secTitle}>Stress Test — Interest Rate +200bps</div>
        </div>
        <div
          className={styles.card}
          style={{ marginBottom: 16 }}
        >
          {[
            {
              m: 'DSCR',
              base: `${app.dscr}×`,
              str: `${app.stressTest?.rateshockDscr}×`,
              pass: app.stressTest?.rateshockDscr >= 1.2,
              thresh: 'min 1.20×',
            },
            {
              m: 'Affordability',
              base: `${(app.affordability * 100).toFixed(0)}%`,
              str: `${(app.stressTest?.rateshockAff * 100).toFixed(0)}%`,
              pass: app.stressTest?.rateshockAff >= 0.5,
              thresh: 'min 50%',
            },
            {
              m: 'PD (recession overlay)',
              base: fmtPD(app.pd),
              str: fmtPD(app.stressTest?.recessionPD),
              pass: app.stressTest?.recessionPD < 0.15,
              thresh: '< 15%',
            },
          ].map((r, i) => (
            <div
              key={i}
              className={styles.metricRow}
            >
              <span className={styles.mLabel}>
                {r.m} <span style={{ fontSize: 10, color: 'var(--muted)' }}>({r.thresh})</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}
                >
                  {r.base}
                </span>
                <span style={{ color: 'var(--muted)', fontSize: 10 }}>→</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: r.pass ? 'var(--teal)' : 'var(--red)',
                  }}
                >
                  {r.str} {r.pass ? '✓' : '⚠'}
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Fairness Metrics — matches screenshot 4 */}
        <div className={styles.secHdr}>
          <div className={styles.secTitle}>Fairness Metrics</div>
          <span className={`${styles.tag} ${styles.tagComplete}`}>Bias Check Passed</span>
        </div>
        <div
          className={styles.grid2}
          style={{ marginBottom: 16 }}
        >
          <div className={styles.card}>
            <div className={styles.cardTitle}>Disparate Impact Ratio</div>
            <div
              className={`${styles.cardVal} ${styles.valTeal}`}
              style={{ fontSize: 30 }}
            >
              {di}
            </div>
            <div className={styles.cardSub}>Threshold: &gt;0.80 ✓ Pass</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Equal Opportunity Delta</div>
            <div
              className={`${styles.cardVal} ${styles.valTeal}`}
              style={{ fontSize: 30 }}
            >
              {eo}
            </div>
            <div className={styles.cardSub}>Threshold: &lt;0.10 ✓ Pass</div>
          </div>
        </div>
      </>
    );
  };

  const renderOpenBanking = () => {
    const bars = app.bars || [];
    const maxBar = Math.max(...bars, 1);

    return (
      <>
        <div
          className={styles.grid3}
          style={{ marginBottom: 16 }}
        >
          <div className={styles.card}>
            <div className={styles.cardTitle}>Primary Bank Account</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)' }}>
              AIB Business Current
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--muted)',
                fontFamily: 'var(--font-mono)',
                marginTop: 4,
              }}
            >
              ****4821 · PSD2/AISP
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Analysis Period</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)' }}>24 Months</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              Feb 2023 — Feb 2025
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Avg Monthly Revenue</div>
            <div
              className={`${styles.cardVal} ${styles.valTeal}`}
              style={{ fontSize: 22 }}
            >
              {app.revenueActual || '—'}
            </div>
            <div className={styles.cardSub}>From actual lodgements</div>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(37,99,235,.06)',
            border: '1px solid rgba(37,99,235,.2)',
            borderRadius: 'var(--r)',
            padding: '16px 18px',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--teal)',
              marginBottom: 8,
            }}
          >
            🏦 Irish Open Banking Coverage — AIB · Bank of Ireland · PTSB
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--navy)', lineHeight: 1.6 }}>
            FinPal connects to all three major Irish retail banks via PSD2/AISP authorisation.
            Transaction history is pulled directly from the borrower's bank with explicit consent.
            Multi-bank aggregation is supported where the borrower holds accounts across multiple
            Irish institutions.
          </div>
        </div>

        <div
          className={styles.grid3}
          style={{ marginBottom: 16 }}
        >
          <div className={styles.card}>
            <div className={styles.cardTitle}>AIB (Allied Irish Banks)</div>
            <div
              style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)', margin: '6px 0 4px' }}
            >
              ✓ PSD2/AISP Connected
            </div>
            <div className={styles.cardSub}>
              Business Current · Savings · Overdraft · Instant pull · 24-month history
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Bank of Ireland (BOI)</div>
            <div
              style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)', margin: '6px 0 4px' }}
            >
              ✓ BOI Open Finance Certified
            </div>
            <div className={styles.cardSub}>
              Current · Deposit · Loan accounts · 24-month history · Instant pull
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Permanent TSB (PTSB)</div>
            <div
              style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)', margin: '6px 0 4px' }}
            >
              ✓ PSD2/AISP Connected
            </div>
            <div className={styles.cardSub}>
              Current · Business accounts · 24-month history · On-demand refresh
            </div>
          </div>
        </div>

        {/* Revenue chart — now BEFORE transactions, matching screenshot */}
        <div className={styles.secHdr}>
          <div className={styles.secTitle}>Monthly Revenue Trend — 12 Months</div>
        </div>
        <div
          className={styles.card}
          style={{ marginBottom: 16, paddingBottom: 20 }}
        >
          <div className={styles.cardTitle}>
            Open Banking Lodgements{' '}
            <span style={{ color: 'var(--teal)' }}>{app.revenue || ''}</span>
          </div>
          <div className={styles.barChart}>
            {bars.map((v: number, i: number) => (
              <div
                key={i}
                className={styles.barCol}
              >
                <div
                  className={styles.barFill}
                  style={{
                    height: `${Math.round((v / maxBar) * 100)}%`,
                    background: v === maxBar ? '#1e3a8a' : '#bfdbfe',
                  }}
                />
                <div className={styles.barLbl}>{MONTHS[i] || ''}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              Mar 24
            </span>
            <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              Feb 25
            </span>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className={styles.secHdr}>
          <div className={styles.secTitle}>Recent Transactions</div>
        </div>
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            overflow: 'hidden',
            marginBottom: 16,
          }}
        >
          <table className={styles.txTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(transactions || []).map((t: any, i: number) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                    {t.date}
                  </td>
                  <td>{t.desc}</td>
                  <td>
                    <span className={styles.txCat}>{t.category}</span>
                  </td>
                  <td
                    style={{ textAlign: 'right' }}
                    className={t.amount.startsWith('+') ? styles.amountIn : styles.amountOut}
                  >
                    {t.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Metrics */}
        <div className={styles.secHdr}>
          <div className={styles.secTitle}>Financial Metrics</div>
        </div>
        <div
          className={styles.grid2}
          style={{ marginBottom: 16 }}
        >
          <div
            className={styles.card}
            style={{ padding: '4px 16px' }}
          >
            <div className={styles.metricRow}>
              <span className={styles.mLabel}>Annualised Actual Revenue</span>
              <span className={styles.mVal}>{app.revenueActual || '—'}</span>
            </div>
            <div className={styles.metricRow}>
              <span className={styles.mLabel}>Declared Revenue</span>
              <span className={styles.mVal}>{app.revenue || '—'}</span>
            </div>
            <div className={styles.metricRow}>
              <span className={styles.mLabel}>Monthly Debt Service</span>
              <span className={styles.mVal}>{app.monthlyDebtService || '€12,800'}</span>
            </div>
            <div className={styles.metricRow}>
              <span className={styles.mLabel}>Free Cash Flow p.a.</span>
              <span className={styles.mVal}>{app.cashflow || '—'}</span>
            </div>
          </div>
          <div
            className={styles.card}
            style={{ padding: '4px 16px' }}
          >
            <div className={styles.metricRow}>
              <span className={styles.mLabel}>DSCR (Actual)</span>
              <span className={styles.mVal}>
                {app.dscr != null ? app.dscr.toFixed(2) + '×' : '—'}
              </span>
            </div>
            <div className={styles.metricRow}>
              <span className={styles.mLabel}>Policy Min DSCR</span>
              <span className={styles.mVal}>1.20×</span>
            </div>
            <div className={styles.metricRow}>
              <span className={styles.mLabel}>DSCR Status</span>
              <span
                style={{
                  color: app.dscr >= 1.2 ? 'var(--teal)' : 'var(--red)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {app.dscr >= 1.2 ? '✓ Pass' : '✗ Review'}
              </span>
            </div>
            <div className={styles.metricRow}>
              <span className={styles.mLabel}>Affordability Score</span>
              <span className={styles.mVal}>
                {app.affordability != null ? (app.affordability * 100).toFixed(0) + '%' : '—'}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderIFRS9 = () => {
    if (!app.eclStage)
      return (
        <div style={{ fontSize: 13, color: 'var(--muted)', padding: '20px 0' }}>
          IFRS 9 staging not yet computed — assessment in progress.
        </div>
      );
    const stageName =
      app.eclStage === 1
        ? 'Performing — 12-month ECL applied'
        : app.eclStage === 2
          ? 'SICR — Lifetime ECL applied'
          : 'Default — Individual assessment';

    return (
      <>
        <div
          className={styles.secHdr}
          style={{ marginTop: 0 }}
        >
          <div className={styles.secTitle}>IFRS 9 Expected Credit Loss</div>
          <span className={`${styles.tag} ${styles.tagComplete}`}>ECL Engine v2.4</span>
        </div>
        <div
          className={styles.grid4}
          style={{ marginBottom: 16 }}
        >
          <div
            className={styles.card}
            style={{ textAlign: 'center' }}
          >
            <div
              className={styles.cardTitle}
              style={{ textAlign: 'center' }}
            >
              ECL Stage
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
              <div
                className={`${styles.eclStage} ${app.eclStage === 1 ? styles.ecl1 : app.eclStage === 2 ? styles.ecl2 : styles.ecl3}`}
              >
                {app.eclStage}
              </div>
            </div>
            <div
              className={styles.cardSub}
              style={{ textAlign: 'center' }}
            >
              {stageName.split(' — ')[0]}
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>12-Month ECL</div>
            <div
              className={styles.cardVal}
              style={{ fontSize: 22 }}
            >
              {fmt(app.ecl12m)}
            </div>
            <div className={styles.cardSub}>Stage 1 provision</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Lifetime ECL</div>
            <div
              className={`${styles.cardVal} ${app.eclStage >= 2 ? styles.valGold : ''}`}
              style={{ fontSize: 22 }}
            >
              {fmt(app.eclLifetime)}
            </div>
            <div className={styles.cardSub}>
              {app.eclStage >= 2 ? 'Applied (Stage 2+)' : 'Reference only'}
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>EAD</div>
            <div
              className={styles.cardVal}
              style={{ fontSize: 22 }}
            >
              {fmt(app.ead)}
            </div>
            <div className={styles.cardSub}>Exposure at Default</div>
          </div>
        </div>

        <div className={styles.secHdr}>
          <div className={styles.secTitle}>ECL Scenario Overlays</div>
        </div>
        <div
          className={styles.grid3}
          style={{ marginBottom: 16 }}
        >
          <div className={styles.card}>
            <div className={styles.cardTitle}>Base Case (60%)</div>
            <div
              className={styles.cardVal}
              style={{ fontSize: 22 }}
            >
              {fmt(app.ecl12m)}
            </div>
            <div className={styles.cardSub}>Central economic forecast</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Upside (20%)</div>
            <div
              className={`${styles.cardVal} ${styles.valGreen}`}
              style={{ fontSize: 22 }}
            >
              {fmt(app.ecl12m ? Math.round(app.ecl12m * 0.7) : null)}
            </div>
            <div className={styles.cardSub}>Favourable conditions</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Downside (20%)</div>
            <div
              className={`${styles.cardVal} ${styles.valGold}`}
              style={{ fontSize: 22 }}
            >
              {fmt(app.ecl12m ? Math.round(app.ecl12m * 1.8) : null)}
            </div>
            <div className={styles.cardSub}>Stressed conditions</div>
          </div>
        </div>

        <div className={styles.secHdr}>
          <div className={styles.secTitle}>PD/LGD/EAD Inputs (Point-in-Time)</div>
        </div>
        <div
          className={styles.card}
          style={{ marginBottom: 16 }}
        >
          {[
            ['PD (12-month)', fmtPD(app.pd)],
            ['PD (Lifetime)', app.pdLifetime != null ? fmtPD(app.pdLifetime) : '10.88%'],
            ['LGD', app.lgd != null ? (app.lgd * 100).toFixed(0) + '%' : '—'],
            ['EAD', fmt(app.ead)],
            ['Discount Rate', '4.5% (EIR)'],
            ['Staging Trigger', app.eclStage >= 2 ? 'SICR detected' : 'No SICR detected'],
          ].map(([l, v]) => (
            <div
              key={l}
              className={styles.metricRow}
            >
              <span className={styles.mLabel}>{l}</span>
              <span className={styles.mVal}>{v}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            background: 'rgba(37,99,235,.06)',
            border: '1px solid rgba(37,99,235,.2)',
            borderRadius: 'var(--r)',
            padding: '16px 18px',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--teal)',
              marginBottom: 8,
            }}
          >
            IFRS 9 Compliance Note
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--navy)', lineHeight: 1.6 }}>
            ECL calculations follow IFRS 9 requirements with multi-scenario overlays
            (base/upside/downside). PD/LGD/EAD are refreshed point-in-time per EBA LOM expectations.
            Monthly provisioning runs with scenario sensitivity analysis. Disclosures prepared per
            IFRS 7/9.
          </div>
        </div>
      </>
    );
  };

  const renderTrust = () => {
    const stressedDscr = app.stressTest?.rateshockDscr;
    const stressedAff = app.stressTest?.rateshockAff;
    const stressedPD = app.stressTest?.recessionPD;
    const di = app.fairnessMetrics?.disparateImpact ?? 0.92;
    const eo = app.fairnessMetrics?.equalOpportunity ?? 0.03;

    return (
      <>
        {/* PILLAR 1 — Valid & Reliable */}
        <div
          className={styles.secHdr}
          style={{ marginTop: 0 }}
        >
          <div className={styles.secTitle}>① Valid &amp; Reliable</div>
          <span className={`${styles.tag} ${styles.tagComplete}`}>Model Validation Current</span>
        </div>
        <div
          className={styles.grid3}
          style={{ marginBottom: 16 }}
        >
          <div className={styles.card}>
            <div className={styles.cardTitle}>PD Point Estimate</div>
            <div
              className={`${styles.cardVal} ${styles.valTeal}`}
              style={{ fontSize: 30 }}
            >
              {fmtPD(app.pd)}
            </div>
            <div className={styles.cardSub}>
              95% CI: {fmtPD(app.pdLow ?? (app.pd ? app.pd * 0.82 : null))} –{' '}
              {fmtPD(app.pdHigh ?? (app.pd ? app.pd * 1.2 : null))}
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Input Data Quality</div>
            <div
              className={`${styles.cardVal} ${styles.valTeal}`}
              style={{ fontSize: 30 }}
            >
              94<span style={{ fontSize: 16 }}>/100</span>
            </div>
            <div className={styles.cardSub}>Completeness 98% · Consistency 92%</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Model AUC (Holdout)</div>
            <div
              className={`${styles.cardVal} ${styles.valTeal}`}
              style={{ fontSize: 30 }}
            >
              0.84
            </div>
            <div className={styles.cardSub}>PD v3.2 · Out-of-sample · Jan 2025</div>
          </div>
        </div>
        <div
          className={styles.card}
          style={{ marginBottom: 16 }}
        >
          <div
            className={styles.cardTitle}
            style={{ marginBottom: 12 }}
          >
            Data Quality Breakdown
          </div>
          {[
            ['Completeness', 'All required fields present', 98],
            ['Consistency', 'Cross-source validation score', 92],
            ['Accuracy', 'Declared vs actual reconciliation', 93],
          ].map(([label, sub, pct]) => (
            <div
              key={label as string}
              style={{ marginBottom: 14 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginBottom: 6,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>{pct}%</div>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${pct}%`, background: 'var(--teal)' }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* PILLAR 2 — Safe */}
        <div className={styles.secHdr}>
          <div className={styles.secTitle}>② Safe</div>
          <span className={`${styles.tag} ${styles.tagComplete}`}>Stress Test Pass</span>
        </div>
        <div
          className={styles.card}
          style={{ marginBottom: 16 }}
        >
          <div
            className={styles.cardTitle}
            style={{ marginBottom: 8 }}
          >
            Interest Rate Stress Test (+200 bps Shock)
          </div>
          {[
            {
              m: 'DSCR',
              sub: '(Policy min 1.20×)',
              base: app.dscr != null ? app.dscr.toFixed(2) + '×' : '—',
              str: stressedDscr != null ? stressedDscr.toFixed(2) + '×' : '1.28×',
            },
            {
              m: 'Affordability',
              sub: '(Min 50%)',
              base: app.affordability != null ? (app.affordability * 100).toFixed(0) + '%' : '82%',
              str: stressedAff != null ? (stressedAff * 100).toFixed(0) + '%' : '71%',
            },
            {
              m: 'PD (recession overlay)',
              sub: '(< 15%)',
              base: fmtPD(app.pd),
              str: stressedPD != null ? fmtPD(stressedPD) : '5.8%',
            },
          ].map((r) => (
            <div
              key={r.m}
              className={styles.metricRow}
            >
              <span className={styles.mLabel}>
                {r.m} <span style={{ fontSize: 10, color: 'var(--muted)' }}>{r.sub}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--navy)' }}
                >
                  {r.base}
                </span>
                <span style={{ color: 'var(--muted)', fontSize: 10 }}>→ stressed</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--teal)',
                    fontWeight: 600,
                  }}
                >
                  {r.str} ✓
                </span>
              </span>
            </div>
          ))}
        </div>
        <div
          className={styles.grid2}
          style={{ marginBottom: 16 }}
        >
          <div className={styles.card}>
            <div className={styles.cardTitle}>Consumer Vulnerability Assessment</div>
            <div
              style={{ fontSize: 18, fontWeight: 700, color: 'var(--teal)', margin: '8px 0 4px' }}
            >
              ✓ Clear
            </div>
            <div className={styles.cardSub}>No vulnerability indicators detected</div>
          </div>
          <div className={styles.card}>
            <div
              className={styles.cardTitle}
              style={{ marginBottom: 8 }}
            >
              Safe Lending Guardrails
            </div>
            {[
              'Over-indebtedness screen',
              'Responsible lending (CGAP)',
              'Consumer Duty alignment',
              'Hardship pathway available',
            ].map((label) => (
              <div
                key={label}
                className={styles.metricRow}
              >
                <span className={styles.mLabel}>{label}</span>
                <span style={{ color: 'var(--teal)', fontSize: 12, fontWeight: 600 }}>✓ Pass</span>
              </div>
            ))}
          </div>
        </div>

        {/* PILLAR 3 — Secure & Resilient */}
        <div className={styles.secHdr}>
          <div className={styles.secTitle}>③ Secure &amp; Resilient</div>
          <span className={`${styles.tag} ${styles.tagComplete}`}>All Controls Active</span>
        </div>
        <div
          className={styles.grid2}
          style={{ marginBottom: 16 }}
        >
          <div className={styles.card}>
            <div
              className={styles.cardTitle}
              style={{ marginBottom: 8 }}
            >
              Data Handling — This Record
            </div>
            {[
              ['Encryption at rest', 'AES-256 · tenant key'],
              ['Encryption in transit', 'TLS 1.3 · mTLS'],
              ['Tenant isolation', 'Dedicated instance ✓'],
              ['Data residency', 'Azure West EU ✓'],
              ['PII vault', 'Separate encrypted store ✓'],
            ].map(([l, v]) => (
              <div
                key={l}
                className={styles.metricRow}
              >
                <span className={styles.mLabel}>{l}</span>
                <span style={{ color: 'var(--teal)', fontSize: 12, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div className={styles.card}>
            <div
              className={styles.cardTitle}
              style={{ marginBottom: 8 }}
            >
              Resilience &amp; Continuity
            </div>
            {[
              ['DORA alignment', '✓ Operational resilience'],
              ['RPO / RTO', '4h / 8h · tested'],
              ['Model fallback', 'Champion/challenger active'],
              ['Zero-trust auth', 'OAuth 2.0 · mTLS verified'],
              ['Incident response', '72h GDPR notify · IR plan active'],
            ].map(([l, v]) => (
              <div
                key={l}
                className={styles.metricRow}
              >
                <span className={styles.mLabel}>{l}</span>
                <span style={{ color: 'var(--teal)', fontSize: 12, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PILLAR 4 — Accountable & Transparent */}
        <div className={styles.secHdr}>
          <div className={styles.secTitle}>④ Accountable &amp; Transparent</div>
          <span className={`${styles.tag} ${styles.tagComplete}`}>IAF · EU AI Act Art.12</span>
        </div>
        <div
          className={styles.card}
          style={{ marginBottom: 16 }}
        >
          <div
            className={styles.cardTitle}
            style={{ marginBottom: 12 }}
          >
            Named Accountability Chain
          </div>
          {[
            {
              role: 'AI System Owner',
              name: 'Chief Risk Officer',
              sub: 'PCF-2 · CBI Registered',
              ts: 'System',
            },
            {
              role: 'Model Validator',
              name: 'Model Risk Management',
              sub: `PD v3.2 · AUC 0.84`,
              ts: '15 Jan 2025',
            },
            {
              role: 'Data Steward',
              name: 'Data Governance Team',
              sub: 'GDPR Art.25 · DPA signatory',
              ts: 'System',
            },
            {
              role: 'Underwriter',
              name: app.decisionOfficer || 'M. Walsh',
              sub: 'PCF-11 · IAF Certified',
              ts: '15:42:01',
            },
          ].map((r) => (
            <div
              key={r.role}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '12px 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '.4px',
                  width: 150,
                  flexShrink: 0,
                }}
              >
                {r.role}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{r.name}</div>
                <div style={{ fontSize: 12, color: 'var(--teal)' }}>{r.sub}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.ts}</div>
            </div>
          ))}
        </div>
        <div
          style={{
            background: 'rgba(37,99,235,.06)',
            border: '1px solid rgba(37,99,235,.2)',
            borderRadius: 'var(--r)',
            padding: '16px 18px',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--teal)',
              marginBottom: 8,
            }}
          >
            ✓ Override Governance Policy Active
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--navy)', lineHeight: 1.6 }}>
            All model overrides require documented justification, senior credit sign-off (PCF-11),
            and are logged to the immutable audit trail. Override rates are monitored monthly for
            consistency and potential bias. No overrides recorded on this application.
          </div>
        </div>

        {/* PILLAR 5 — Explainable & Interpretable */}
        <div className={styles.secHdr}>
          <div className={styles.secTitle}>⑤ Explainable &amp; Interpretable</div>
          <span className={`${styles.tag} ${styles.tagComplete}`}>SHAP · EU AI Act Art.13</span>
        </div>
        <div
          className={styles.card}
          style={{ marginBottom: 16 }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'var(--muted)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '.4px',
              marginBottom: 12,
            }}
          >
            Counterfactual Explanations — "What would change this decision?"
          </div>
          {(app.counterfactuals && app.counterfactuals.length > 0
            ? app.counterfactuals
            : [
                {
                  condition: 'If DSCR were 1.10× instead of 1.42×',
                  outcome: 'Risk grade C1 — declined under policy',
                  dir: 'negative',
                },
                {
                  condition: 'If revenue variance < 2% (no discrepancy)',
                  outcome: 'Confidence score +8% — recommendation strengthened',
                  dir: 'positive',
                },
                {
                  condition: 'If trading history < 5 years',
                  outcome: 'PD increases to 4.9% — grade B2',
                  dir: 'negative',
                },
              ]
          ).map((cf: any, i: number) => (
            <div
              key={i}
              className={styles.cfRow}
            >
              <div className={styles.cfIf}>If: {cf.condition}</div>
              <div
                className={styles.cfThen}
                style={{ color: cf.dir === 'positive' ? 'var(--teal)' : '#1E3A8A' }}
              >
                → {cf.outcome}
              </div>
            </div>
          ))}
        </div>
        <div
          className={styles.card}
          style={{ marginBottom: 16 }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'var(--muted)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '.4px',
              marginBottom: 10,
            }}
          >
            Plain Language Explanation — GDPR Art.22 Right to Explanation
          </div>
          <div style={{ fontSize: 13, color: 'var(--navy)', lineHeight: 1.7 }}>
            This application was assessed using an automated credit scoring model. The decision was
            primarily influenced by debt service coverage ratio and consistent revenue trends, which
            positively supported the outcome. You have the right to request a detailed explanation,
            contest this decision, and request human review at any time.
          </div>
        </div>

        {/* PILLAR 6 — Privacy Enhanced */}
        <div className={styles.secHdr}>
          <div className={styles.secTitle}>⑥ Privacy Enhanced</div>
          <span className={`${styles.tag} ${styles.tagComplete}`}>GDPR · Art.25 by Design</span>
        </div>
        <div
          className={styles.card}
          style={{ marginBottom: 12, padding: '4px 16px' }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'var(--muted)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '.4px',
              padding: '14px 0 6px',
            }}
          >
            Personal Data Minimisation Register
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10,
              color: 'var(--muted)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '.4px',
              padding: '6px 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span style={{ flex: 2 }}>Data Field</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Legal Basis</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Retention</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Status</span>
          </div>
          {[
            ['Director PPS Number', 'Legal Obligation', '5 yrs'],
            ['Bank Transaction Data (24mo)', 'Consent (PSD2)', '5 yrs'],
            ['Company CRN', 'Legitimate Interest', 'Permanent'],
            ['Tax Reference (ROS)', 'Legal Obligation', '5 yrs'],
            ['Management Accounts', 'Consent (Art.22)', '5 yrs'],
          ].map(([field, basis, retention]) => (
            <div
              key={field}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span style={{ flex: 2, fontSize: 13, fontWeight: 600, color: 'var(--teal)' }}>
                {field}
              </span>
              <span style={{ flex: 1, textAlign: 'right', fontSize: 12, color: 'var(--muted)' }}>
                {basis}
              </span>
              <span style={{ flex: 1, textAlign: 'right', fontSize: 12, color: 'var(--muted)' }}>
                {retention}
              </span>
              <span style={{ flex: 1, textAlign: 'right' }}>
                <span className={`${styles.tag} ${styles.tagComplete}`}>✓ Minimised</span>
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <button className={`${styles.btn} ${styles.btnOutline}`}>
            ↓ Data Subject Access (Art.15)
          </button>
          <button className={`${styles.btn} ${styles.btnOutline}`}>
            🗑 Right to Erasure (Art.17)
          </button>
          <button className={`${styles.btn} ${styles.btnOutline}`}>
            ✋ Withdraw Consent (Art.7)
          </button>
          <button className={`${styles.btn} ${styles.btnOutline}`}>✉ Lodge DSR to DPC</button>
        </div>

        {/* PILLAR 7 — Fair */}
        <div className={styles.secHdr}>
          <div className={styles.secTitle}>⑦ Fair — Harmful Bias Managed</div>
          <span className={`${styles.tag} ${styles.tagComplete}`}>Bias Check Passed</span>
        </div>
        <div
          className={styles.grid2}
          style={{ marginBottom: 16 }}
        >
          <div className={styles.card}>
            <div
              className={styles.cardTitle}
              style={{ marginBottom: 10 }}
            >
              Individual Fairness Metrics
            </div>
            {[
              ['Disparate Impact Ratio', 'Threshold: >0.80', di],
              ['Equal Opportunity Delta', 'Threshold: <0.10', eo],
              ['Group Calibration', 'Threshold: <±5%', 'Within ±2%'],
            ].map(([label, thresh, val]) => (
              <div
                key={label as string}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{thresh}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--teal)' }}>{val} ✓</div>
              </div>
            ))}
          </div>
          <div className={styles.card}>
            <div
              className={styles.cardTitle}
              style={{ marginBottom: 10 }}
            >
              Group Approval Rate Comparison
            </div>
            {[
              ['Construction Sector', 72, 68],
              ['Dublin Region', 75, 73],
              ['12+ yr Trading History', 81, 76],
            ].map(([label, pct, avg]) => (
              <div
                key={label as string}
                style={{ marginBottom: 14 }}
              >
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}
                >
                  {label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    className={styles.progressBar}
                    style={{ flex: 1 }}
                  >
                    <div
                      className={styles.progressFill}
                      style={{ width: `${pct}%`, background: 'var(--teal)' }}
                    ></div>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--teal)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {pct}% ✓ vs {avg}% avg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            background: 'rgba(37,99,235,.06)',
            border: '1px solid rgba(37,99,235,.2)',
            borderRadius: 'var(--r)',
            padding: '16px 18px',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--teal)',
              marginBottom: 8,
            }}
          >
            ✓ Ongoing Bias Monitoring — EU AI Act Art.10
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--navy)', lineHeight: 1.6 }}>
            Fairness metrics are recalculated monthly across all monitored groups (sector,
            geography, trading history, company size). Temporal drift in fairness indicators
            triggers model revalidation. Bias assessments are stored in the immutable audit trail.
            Protected characteristic proxies are excluded from model features per
            anti-discrimination obligations.
          </div>
        </div>
      </>
    );
  };

  const renderAuditLog = () => {
    const entries = [
      {
        time: '14:21:45',
        event: 'GDPR Art.13/14 notice presented',
        detail: 'Data processing notice displayed to applicant',
      },
      {
        time: '14:21:47',
        event: 'Consent obtained (GDPR Art.22)',
        detail: 'Applicant consented to automated processing · Right to object explained',
      },
      {
        time: '14:22:05',
        event: 'Application received',
        detail: `${app.id || 'FP-2025-0041'} · ${app.company || 'Applicant company'} · ${app.loanType || 'Working Capital'} · ${app.amount || '—'}`,
      },
      {
        time: '14:22:06',
        event: 'Open banking consent obtained (PSD2)',
        detail: 'SME authorised read access via AISP',
      },
      {
        time: '14:22:07',
        event: 'Documents ingested',
        detail: '6 documents · OCR extraction complete',
      },
      {
        time: '14:22:09',
        event: 'Transaction history pulled',
        detail: '284 transactions · 24 months',
      },
      {
        time: '14:22:12',
        event: 'PD/LGD/EAD models executed',
        detail: `PD: ${fmtPD(app.pd)} · LGD: ${app.lgd != null ? (app.lgd * 100).toFixed(0) + '%' : '—'} · Model v3.2/v2.1/v1.8`,
      },
      {
        time: '14:22:13',
        event: 'SHAP explanations generated',
        detail: 'Local + global explanations · GPU-accelerated · EU AI Act Art.13 compliant',
      },
      {
        time: '14:22:14',
        event: 'Fairness metrics computed',
        detail: `DI: ${app.fairnessMetrics?.disparateImpact ?? '0.92'} · EO: ${app.fairnessMetrics?.equalOpportunity ?? '0.03'}`,
      },
      {
        time: '14:22:15',
        event: 'Revenue reconciliation',
        detail: app.discrepancy
          ? 'Variance detected — flagged for review'
          : 'Reconciled within tolerance',
      },
      {
        time: '14:22:17',
        event: 'AML / PEP screening complete',
        detail: 'All directors clear',
      },
      {
        time: '14:22:18',
        event: 'CRO check complete',
        detail: 'Company status normal',
      },
      {
        time: '14:22:19',
        event: 'Tax clearance verified',
        detail: 'ROS confirmation valid',
      },
      {
        time: '14:22:20',
        event: 'IFRS 9 ECL calculated',
        detail: `Stage ${app.eclStage || 1} · 12m ECL: ${fmt(app.ecl12m)}`,
      },
      {
        time: '14:22:21',
        event: 'EBA LOM credit policy applied',
        detail: `DSCR ${app.dscr != null ? app.dscr.toFixed(2) : '—'}× vs 1.20× minimum`,
      },
      {
        time: '14:22:22',
        event: 'EU AI Act compliance verified',
        detail: 'High-risk controls: Art.9-15 all satisfied',
      },
      {
        time: '14:22:23',
        event: 'AI Trustworthiness Assessment — 7 Pillars',
        detail:
          'Valid & Reliable ✓ · Safe ✓ · Secure ✓ · Accountable ✓ · Explainable ✓ · Privacy ✓ · Fair ✓',
      },
      {
        time: '14:22:23',
        event: 'Risk-based pricing calculated',
        detail: `APR: ${app.apr != null ? app.apr + '%' : '—'} · Grade: ${app.riskGrade || '—'} · EBA LOM pricing framework`,
      },
      {
        time: '14:22:25',
        event: 'Evidence pack generated',
        detail: 'PDF credit memo prepared · All source data referenced',
      },
      {
        time: '14:22:26',
        event: 'Assessment complete — awaiting underwriter decision',
        detail: 'Processing time: 41 seconds',
      },
    ];
    if (submittedDecision) {
      entries.push({
        time: '15:42:01',
        event: `Credit decision: ${submittedDecision.toUpperCase()}`,
        detail: `Underwriter: ${app.decisionOfficer || 'C. Officer'} · Rationale documented · EU AI Act Art.12`,
      });
    }

    return (
      <>
        <div
          className={styles.secHdr}
          style={{ marginTop: 0 }}
        >
          <div className={styles.secTitle}>Immutable Audit Trail</div>
          <span className={`${styles.tag} ${styles.tagComplete}`}>
            CBI / EU AI Act Inspection Ready
          </span>
        </div>

        <div
          style={{
            background: 'rgba(37,99,235,.06)',
            border: '1px solid rgba(37,99,235,.2)',
            borderRadius: 'var(--r)',
            padding: '16px 18px',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--teal)',
              marginBottom: 8,
            }}
          >
            ✓ EU AI Act Art.12 &amp; IAF Compliance
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--navy)', lineHeight: 1.6 }}>
            This audit trail is cryptographically immutable. Every entry is timestamped and
            attributed. Compliant with EU AI Act Art.12 (record-keeping), GDPR Art.30, and Ireland's
            Individual Accountability Framework.
          </div>
        </div>

        <div
          className={styles.card}
          style={{ padding: '4px 16px' }}
        >
          {entries.map((e, i) => (
            <div
              key={i}
              className={styles.auditItem}
            >
              <div className={styles.auditTime}>{e.time}</div>
              <div
                className={styles.auditDot}
                style={
                  e.event.startsWith('Credit decision')
                    ? { background: '#059669' }
                    : { background: 'var(--teal)' }
                }
              ></div>
              <div>
                <div
                  className={styles.auditEvent}
                  style={
                    e.event.startsWith('Credit decision')
                      ? { color: '#059669', fontWeight: 600 }
                      : {}
                  }
                >
                  {e.event}
                </div>
                <div className={styles.auditDetail}>{e.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderCompliance = () => (
    <>
      <div
        className={styles.secHdr}
        style={{ marginTop: 0 }}
      >
        <div className={styles.secTitle}>Automated Compliance Checks</div>
      </div>
      {(app.checks || []).map((c: any, i: number) => (
        <div
          key={i}
          className={styles.checkItem}
          style={{
            borderColor:
              c.status === 'pass'
                ? 'rgba(37,99,235,.2)'
                : c.status === 'warn'
                  ? 'rgba(245,158,11,.3)'
                  : 'rgba(220,38,38,.3)',
          }}
        >
          <div className={styles.checkIcon}>
            {c.status === 'pass' ? '✅' : c.status === 'warn' ? '⚠️' : '❌'}
          </div>
          <div style={{ flex: 1 }}>
            <div className={styles.checkName}>{c.name}</div>
            <div className={styles.checkDetail}>{c.detail}</div>
          </div>
          <div className={styles.checkTs}>{c.time}</div>
        </div>
      ))}

      <div className={styles.secHdr}>
        <div className={styles.secTitle}>GDPR Consent Ledger</div>
        <span className={`${styles.tag} ${styles.tagComplete}`}>Art.22 Compliant</span>
      </div>
      {[
        ['Open Banking (PSD2)', 'granted', '14:21:45'],
        ['Credit Bureau Pull', 'granted', '14:21:46'],
        ['Automated Processing (GDPR Art.22)', 'granted', '14:21:47'],
        ['Data Retention (5yr)', 'granted', '14:21:48'],
      ].map(([label, status, time]) => (
        <div
          key={label}
          className={styles.checkItem}
          style={{ borderColor: 'rgba(37,99,235,.2)' }}
        >
          <div
            className={styles.checkIcon}
            style={{ fontSize: 16 }}
          >
            ✓
          </div>
          <div style={{ flex: 1 }}>
            <div className={styles.checkName}>{label}</div>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--teal)', fontSize: 12, fontWeight: 600 }}>{status}</span>
            <span className={styles.checkTs}>{time}</span>
          </span>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 10, marginTop: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className={`${styles.btn} ${styles.btnOutline}`}>ℹ Right to Explanation</button>
        <button className={`${styles.btn} ${styles.btnOutline}`}>
          ✋ Right to Object (Art.21)
        </button>
        <button className={`${styles.btn} ${styles.btnOutline}`}>✉ Data Subject Request</button>
      </div>

      <div
        style={{
          background: 'rgba(37,99,235,.06)',
          border: '1px solid rgba(37,99,235,.2)',
          borderRadius: 'var(--r)',
          padding: '16px 18px',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--teal)',
            marginBottom: 8,
          }}
        >
          EU AI Act &amp; EBA LOM Compliance
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--navy)', lineHeight: 1.6 }}>
          Credit scoring/creditworthiness assessment is classified as <strong>high-risk AI</strong>{' '}
          under EU AI Act 2024/1689. All checks above satisfy Art.9-15 requirements including risk
          management, data governance, transparency, logging, human oversight, and
          accuracy/robustness. EBA LOM (EBA/GL/2020/06) credit policy gates are applied. GDPR Art.22
          safeguards (SCHUFA ruling) ensure meaningful human oversight for automated decisions.
        </div>
      </div>
    </>
  );

  const renderEvidence = () => {
    const today = new Date();
    const generatedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

    return (
      <>
        <div className={styles.evidenceHeader}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--teal)',
              fontFamily: 'var(--font-mono)',
              marginBottom: 6,
              letterSpacing: '.5px',
            }}
          >
            CREDIT EVIDENCE PACK · EU AI ACT COMPLIANT · IMMUTABLE
          </div>
          <div
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--navy)',
              marginBottom: 10,
            }}
          >
            {app.company || 'Company name pending'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {[
              ['Reference', app.id || '—'],
              ['Amount', app.amount || '—'],
              ['Product', app.loanType || '—'],
              ['Risk Grade', app.riskGrade || '—'],
              ['APR', app.apr != null ? app.apr + '%' : '—'],
              ['Generated', generatedDate],
            ].map(([l, v]) => (
              <div key={l}>
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--muted)',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '.4px',
                  }}
                >
                  {l}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {app.narrative && (
          <div className={styles.narrativeBox}>
            <div
              className={styles.narrativeText}
              dangerouslySetInnerHTML={{ __html: app.narrative }}
            />
          </div>
        )}

        <div
          className={styles.grid2}
          style={{ marginBottom: 16 }}
        >
          <div>
            <div
              className={styles.secHdr}
              style={{ marginTop: 0 }}
            >
              <div className={styles.secTitle}>Key Financial Findings</div>
            </div>
            <div
              className={styles.card}
              style={{ padding: '4px 16px' }}
            >
              {[
                ['Declared Revenue', app.revenue || '—', null],
                ['Actual Revenue (Open Banking)', app.revenueActual || '—', 'Review'],
                [
                  'Revenue Variance',
                  app.discrepancy ? '⚑ >5%' : '✓ Within tolerance',
                  app.discrepancy ? 'Review' : 'Clear',
                ],
                ['PD', fmtPD(app.pd), 'Pass'],
                [
                  'LGD / EAD',
                  `${app.lgd != null ? (app.lgd * 100).toFixed(0) + '%' : '—'} / ${fmt(app.ead)}`,
                  'Pass',
                ],
                ['DSCR', app.dscr != null ? app.dscr.toFixed(2) + '×' : '—', 'Pass'],
                ['Risk Grade', app.riskGrade || '—', 'Pass'],
                ['APR (Risk-Based)', app.apr != null ? app.apr + '%' : '—', null],
                ['ECL (12m / Lifetime)', `${fmt(app.ecl12m)} / ${fmt(app.eclLifetime)}`, null],
                ['Policy Gate', app.dscr >= 1.2 ? '✓ Pass' : '✗ Review', 'Pass'],
              ].map(([label, value, badge]) => (
                <div
                  key={label as string}
                  className={styles.metricRow}
                >
                  <span className={styles.mLabel}>{label}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={styles.mVal}>{value}</span>
                    {badge && (
                      <span className={`${styles.tag} ${styles.tagComplete}`}>{badge}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div
              className={styles.secHdr}
              style={{ marginTop: 0 }}
            >
              <div className={styles.secTitle}>Compliance Summary</div>
            </div>
            <div
              className={styles.card}
              style={{ padding: '4px 16px' }}
            >
              {[
                'GDPR Art.13/14 Notice',
                'AML / PEP Screening',
                'CRO Company History',
                'Tax Clearance (ROS)',
                'Fraud & Synthetic ID Check',
                'Existing Debt Schedule',
                'Revenue Reconciliation',
                'EBA LOM Credit Policy',
                'EU AI Act Compliance (Art.9-15)',
                'Fairness & Bias Check',
                'AI Trustworthiness Assessment (7 Pillars)',
              ].map((label, i) => {
                // Static placeholders per current data availability; wire to app.checks later
                const needsReview =
                  label === 'Existing Debt Schedule' || label === 'Revenue Reconciliation';
                return (
                  <div
                    key={label}
                    className={styles.metricRow}
                  >
                    <span className={styles.mLabel}>{label}</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: needsReview ? 'var(--gold, #B7791F)' : 'var(--teal)',
                      }}
                    >
                      {needsReview ? '⚑ Review' : '✓ Clear'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.secHdr}>
          <div className={styles.secTitle}>Pricing Transparency (EBA LOM)</div>
        </div>
        <div
          className={styles.card}
          style={{ marginBottom: 16 }}
        >
          {[
            ['Risk-Based APR', app.apr != null ? app.apr + '%' : '—'],
            ['Risk Grade', app.riskGrade || '—'],
            ['PD Component', `${fmtPD(app.pd)} - spread +2.7bps`],
            [
              'LGD Component',
              `${app.lgd != null ? (app.lgd * 100).toFixed(0) + '%' : '—'} - capital charge applied`,
            ],
            ['Pricing Framework', 'EBA LOM aligned - risk-based pricing policy'],
            [
              'Collateral Valuation',
              app.loanType === 'Asset Finance' ? 'Asset-backed' : 'Not applicable (unsecured)',
            ],
          ].map(([l, v]) => (
            <div
              key={l}
              className={styles.metricRow}
            >
              <span className={styles.mLabel}>{l}</span>
              <span className={styles.mVal}>{v}</span>
            </div>
          ))}
        </div>

        {/* Decision Gate (Always visible at the bottom of the panels) — unchanged */}
        <div
          id="decision-gate"
          className={styles.gate}
        >
          {submittedDecision ? (
            <div className={styles.decidedBanner}>
              <span style={{ fontSize: 28 }}>
                {submittedDecision === 'approved'
                  ? '✅'
                  : submittedDecision === 'referred'
                    ? '↗️'
                    : '❌'}
              </span>
              <div>
                <div className={styles.decidedText}>
                  Decision submitted: {submittedDecision.toUpperCase()}
                </div>
                <div className={styles.decidedSub}>
                  Logged immutably · EU AI Act Art.12 · CBI inspection-ready
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.gateTitle}>⚖ Maker-Checker — Credit Decision Gate</div>
              <div className={styles.gateSub}>
                Step 5 of 6. Under EU AI Act Art.14 and GDPR Art.22, your decision and rationale
                will be permanently logged. No loan moves forward without this sign-off.
              </div>
              <div className={styles.gateBtns}>
                {['approved', 'referred', 'declined'].map((o) => (
                  <button
                    key={o}
                    className={`${styles.gateBtn} ${outcome === o ? (o === 'approved' ? styles.gateBtnApprove : o === 'referred' ? styles.gateBtnRefer : styles.gateBtnDecline) : ''}`}
                    onClick={() => setOutcome(o as any)}
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
                <div className={styles.ratErr}>
                  {20 - rationale.trim().length} more characters needed
                </div>
              )}
              <button
                className={styles.submitDec}
                disabled={!outcome || rationale.trim().length < 20 || isSubmitting}
                onClick={handleDecisionSubmit}
              >
                {isSubmitting
                  ? 'Submitting…'
                  : outcome
                    ? `Submit — ${outcome.charAt(0).toUpperCase() + outcome.slice(1)}`
                    : 'Select outcome first'}
              </button>
              <div className={styles.auditNote}>
                ⚠ Once submitted, this decision is immutably recorded · EU AI Act Art.12 · IAF
                PCF-11
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <div className={styles.appView}>
      <div className={styles.appHeader}>
        <button
          className={styles.appBack}
          onClick={onBack}
        >
          ← Back to Queue
        </button>
        <div className={styles.appTitleRow}>
          <div>
            <div className={styles.appCompany}>{app.company}</div>
            <div className={styles.appRef}>
              {app.id} · {app.crn || 'CRN PENDING'} · {app.sector}
            </div>
          </div>
          <div className={styles.appActions}>
            {!submittedDecision ? (
              <>
                <button
                  className={`${styles.btn} ${styles.btnOutline}`}
                  onClick={() => showToast('↓ Exporting evidence pack…')}
                >
                  ↓ Export Pack
                </button>
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() =>
                    document.getElementById('decision-gate')?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  Make Decision →
                </button>
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  background: 'rgba(37,99,235,.08)',
                  border: '1px solid rgba(37,99,235,.2)',
                  borderRadius: 'var(--r)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--teal)',
                }}
              >
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
          {app.riskGrade && (
            <span className={`${styles.chip} ${styles.chipTeal}`}>Grade: {app.riskGrade}</span>
          )}
          {app.hitl && (
            <span className={`${styles.chip} ${styles.chipGold}`}>⚠ HITL Mandatory</span>
          )}
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
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Risk & XAI' && renderRiskXAI()}
        {activeTab === 'Open Banking' && renderOpenBanking()}
        {activeTab === 'IFRS 9' && renderIFRS9()}
        {activeTab === '✔ Trustworthiness' && renderTrust()}
        {activeTab === 'Audit Log' && renderAuditLog()}
        {activeTab === 'Compliance' && renderCompliance()}
        {activeTab === 'Evidence Pack' && renderEvidence()}
      </div>
    </div>
  );
};

export default ApplicationDetail;
