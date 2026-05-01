import React, { useState } from 'react';
import styles from '../../styles/queue.module.css';

interface ApplicationDetailProps {
  app: any;
  onBack: () => void;
  onDecision: (appId: string, decision: 'approved' | 'referred' | 'declined', rationale: string) => Promise<void>;
  submittedDecision: string | null;
  showToast: (msg: string) => void;
}

const TABS = ['Overview', 'Risk & XAI', 'Open Banking', 'IFRS 9', '✔ Trustworthiness', 'Audit Log', 'Compliance', 'Evidence Pack'];

const ApplicationDetail: React.FC<ApplicationDetailProps> = ({ app, onBack, onDecision, submittedDecision, showToast }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [outcome, setOutcome] = useState<'approved' | 'referred' | 'declined' | null>(null);
  const [rationale, setRationale] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasFailedCheck = app.checks?.some((c: any) => c.status === 'fail');

  const fmt = (v: any, pre = '€') => v == null ? '—' : `${pre}${Number(v).toLocaleString()}`;
  const pct = (v: any) => v == null ? '—' : `${(v * 100).toFixed(1)}%`;
  const fmtPD = (v: any) => v == null ? '—' : `${(v * 100).toFixed(1)}%`;
  
  const MONTHS = ['M','A','M','J','J','A','S','O','N','D','J','F'];

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

  // Render Functions for Tabs
  const renderOverview = () => {
    const dscrPos = app.dscr >= 1.2;
    const bars = app.bars || [];
    const maxBar = Math.max(...bars, 1);
    
    return (
      <>
        <div className={styles.grid5} style={{ marginBottom: 14 }}>
          <div className={styles.card}><div className={styles.cardTitle}>PD</div><div className={`${styles.cardVal} ${app.pd < 0.05 ? styles.valTeal : app.pd < 0.10 ? styles.valGold : styles.valRed}`}>{fmtPD(app.pd)}</div><div className={styles.cardSub}>Probability of Default</div></div>
          <div className={styles.card}><div className={styles.cardTitle}>Risk Grade</div><div className={`${styles.cardVal} ${app.riskGrade?.startsWith('A') ? styles.valTeal : app.riskGrade?.startsWith('B') ? styles.valGreen : styles.valGold}`}>{app.riskGrade || '—'}</div><div className={styles.cardSub}>Internal rating</div></div>
          <div className={styles.card}><div className={styles.cardTitle}>DSCR</div><div className={`${styles.cardVal} ${dscrPos ? styles.valTeal : styles.valRed}`}>{app.dscr != null ? app.dscr.toFixed(2) + '×' : '—'}</div><div className={styles.cardSub}>{dscrPos ? '✓ Above Policy Min 1.20×' : '✗ Below Policy Min 1.20×'}</div></div>
          <div className={styles.card}><div className={styles.cardTitle}>APR</div><div className={`${styles.cardVal} ${styles.valTeal}`}>{app.apr != null ? app.apr + '%' : '—'}</div><div className={styles.cardSub}>Risk-based pricing</div></div>
          <div className={styles.card}><div className={styles.cardTitle}>Affordability</div><div className={`${styles.cardVal} ${app.affordability >= 0.6 ? styles.valTeal : styles.valRed}`}>{app.affordability != null ? (app.affordability * 100).toFixed(0) + '%' : '—'}</div><div className={styles.cardSub}>Capacity to repay</div></div>
        </div>

        <div className={styles.grid4} style={{ marginBottom: 14 }}>
          <div className={styles.card}><div className={styles.cardTitle}>Declared Revenue</div><div className={styles.cardVal} style={{ fontSize: 22 }}>{app.revenue || '—'}</div><div className={styles.cardSub}>Management accounts</div></div>
          <div className={styles.card}><div className={styles.cardTitle}>Actual Lodgements</div><div className={`${styles.cardVal} ${app.discrepancy ? styles.valGold : styles.valTeal}`} style={{ fontSize: 22 }}>{app.revenueActual || '—'}</div><div className={styles.cardSub}>{app.discrepancy ? '⚑ Variance detected' : '✓ Reconciled'}</div></div>
          <div className={styles.card}><div className={styles.cardTitle}>Free Cash Flow</div><div className={`${styles.cardVal} ${styles.valTeal}`} style={{ fontSize: 22 }}>{app.cashflow || '—'}</div><div className={styles.cardSub}>After debt service p.a.</div></div>
          <div className={styles.card}><div className={styles.cardTitle}>ECL (12-Month)</div><div className={styles.cardVal} style={{ fontSize: 22 }}>{fmt(app.ecl12m)}</div><div className={styles.cardSub}>IFRS 9 Stage {app.eclStage || '—'}</div></div>
        </div>

        <div className={styles.grid2}>
          <div>
            <div className={styles.secHdr}><div className={styles.secTitle}>Submitted Documents</div></div>
            {['Management Accounts 2024', 'Management Accounts 2023', 'Tax Clearance Certificate', 'Director ID Docs', '6 Months Bank Statements', 'GDPR Consent Form'].map((d, i) => (
              <div key={i} className={styles.docItem}>
                <div className={styles.docIcon}>📄</div>
                <div style={{ flex: 1 }}><div className={styles.docName}>{d}</div><div className={styles.docMeta}>{['PDF · 2.1MB', 'PDF · 1.9MB', 'PDF · 148KB', 'JPEG · 1.6MB', 'PDF · 4.2MB', 'PDF · 89KB'][i]}</div></div>
                <span className={`${styles.tag} ${styles.tagComplete}`}>✓ Processed</span>
              </div>
            ))}
          </div>
          <div>
            <div className={styles.secHdr}><div className={styles.secTitle}>Monthly Revenue Trend</div></div>
            <div className={styles.card} style={{ paddingBottom: 20, marginBottom: 12 }}>
              <div className={styles.cardTitle}>Open Banking Lodgements — 12 Months <span style={{ color: 'var(--teal)', marginLeft: 8 }}>{app.revenue || ''}</span></div>
              <div className={styles.barChart}>
                {bars.map((v: number, i: number) => (
                  <div key={i} className={styles.barCol}>
                    <div className={styles.barFill} style={{ height: `${Math.round((v / maxBar) * 100)}%`, background: v === maxBar ? 'var(--teal)' : '#DBEAFE' }}></div>
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
            {app.hitl && <div style={{ background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.3)', borderRadius: 'var(--r)', padding: '12px 14px', marginTop: 12, fontSize: 12, color: '#1D4ED8' }}><strong>⚠ HITL Mandatory:</strong> {app.hitlReason}</div>}
          </div>
        </div>
      </>
    );
  };

  const renderRiskXAI = () => {
    const shap = app.shapValues || [];
    const maxS = Math.max(...shap.map((s: any) => Math.abs(s.value)), 0.01);
    
    return (
      <>
        <div className={styles.grid3} style={{ marginBottom: 16 }}>
          <div className={styles.card}><div className={styles.cardTitle}>PD (Probability of Default)</div><div className={`${styles.cardVal} ${app.pd < 0.05 ? styles.valTeal : app.pd < 0.10 ? styles.valGold : styles.valRed}`}>{fmtPD(app.pd)}</div><div className={styles.cardSub}>Application PD model v3.2</div></div>
          <div className={styles.card}><div className={styles.cardTitle}>LGD (Loss Given Default)</div><div className={styles.cardVal}>{app.lgd != null ? (app.lgd * 100).toFixed(0) + '%' : '—'}</div><div className={styles.cardSub}>LGD model v2.1</div></div>
          <div className={styles.card}><div className={styles.cardTitle}>EAD (Exposure at Default)</div><div className={styles.cardVal}>{fmt(app.ead)}</div><div className={styles.cardSub}>EAD model v1.8</div></div>
        </div>
        <div className={styles.grid2} style={{ marginBottom: 16 }}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Affordability &amp; Capacity to Repay</div>
            <div className={`${styles.cardVal} ${app.affordability >= 0.6 ? styles.valTeal : styles.valRed}`}>{app.affordability != null ? (app.affordability * 100).toFixed(0) + '%' : '—'}</div>
            <div className={styles.cardSub}>Cash-flow based · Affordability model v2.0</div>
            <div className={styles.progressBar} style={{ marginTop: 10 }}><div className={styles.progressFill} style={{ width: `${app.affordability != null ? app.affordability * 100 : 0}%`, background: app.affordability >= 0.6 ? 'var(--teal)' : 'var(--red)' }}></div></div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Risk-Based Pricing (EBA LOM)</div>
            {[
              ['APR', app.apr != null ? app.apr + '%' : '—'],
              ['Risk Grade', app.riskGrade || '—'],
              ['Pricing Framework', 'EBA LOM aligned'],
              ['Collateral', app.loanType === 'Asset Finance' ? 'Asset-backed' : 'Unsecured']
            ].map(([l, v]) => <div key={l} className={styles.metricRow}><span className={styles.mLabel}>{l}</span><span className={styles.mVal}>{v}</span></div>)}
          </div>
        </div>

        <div className={styles.secHdr}><div className={styles.secTitle}>SHAP Explainability — Top Decision Factors</div><span className={`${styles.tag} ${styles.tagComplete}`}>EU AI Act Art.13</span></div>
        <div className={styles.card} style={{ marginBottom: 16 }}>
          <div className={styles.cardTitle}>Local Explanation (Per-Decision) <span style={{ fontSize: 10, color: 'var(--muted)' }}>SHAP v3.2 · GPU-accelerated</span></div>
          {shap.map((s: any, i: number) => {
            const w = Math.round((Math.abs(s.value) / maxS) * 100);
            const pos = s.direction === 'positive';
            return (
              <div key={i} className={styles.shapRow}>
                <div className={styles.shapFeat}>{s.feature}</div>
                <div className={styles.shapTrack}><div className={pos ? styles.shapPos : styles.shapNeg} style={{ width: `${w}%` }}></div></div>
                <div className={styles.shapVal} style={{ color: pos ? 'var(--teal)' : '#1E3A8A' }}>{pos ? '+' : '−'}{s.value.toFixed(2)}</div>
              </div>
            );
          })}
        </div>

        <div className={styles.secHdr}><div className={styles.secTitle}>Stress Test — Interest Rate +200bps</div></div>
        <div className={styles.card} style={{ marginBottom: 16 }}>
          {[
            { m: 'DSCR', base: `${app.dscr}×`, str: `${app.stressTest?.rateshockDscr}×`, pass: app.stressTest?.rateshockDscr >= 1.2, thresh: 'min 1.20×' },
            { m: 'Affordability', base: `${(app.affordability * 100).toFixed(0)}%`, str: `${(app.stressTest?.rateshockAff * 100).toFixed(0)}%`, pass: app.stressTest?.rateshockAff >= 0.5, thresh: 'min 50%' },
            { m: 'PD (recession overlay)', base: fmtPD(app.pd), str: fmtPD(app.stressTest?.recessionPD), pass: app.stressTest?.recessionPD < 0.15, thresh: '< 15%' },
          ].map((r, i) => (
            <div key={i} className={styles.metricRow}>
              <span className={styles.mLabel}>{r.m} <span style={{ fontSize: 10, color: 'var(--muted)' }}>({r.thresh})</span></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>{r.base}</span>
                <span style={{ color: 'var(--muted)', fontSize: 10 }}>→</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: r.pass ? 'var(--teal)' : 'var(--red)' }}>{r.str} {r.pass ? '✓' : '⚠'}</span>
              </span>
            </div>
          ))}
        </div>

        <div className={styles.secHdr}><div className={styles.secTitle}>Counterfactual Explanations</div></div>
        <div className={styles.cfBox} style={{ marginBottom: 16 }}>
          {(app.counterfactuals || []).map((cf: any, i: number) => (
            <div key={i} className={styles.cfRow}>
              <div className={styles.cfIf}>If: {cf.condition}</div>
              <div className={styles.cfThen} style={{ color: cf.dir === 'positive' ? 'var(--teal)' : 'var(--red)' }}>→ {cf.outcome}</div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderOpenBanking = () => {
    const bars = app.bars || [];
    const maxBar = Math.max(...bars, 1);

    return (
      <>
        <div className={styles.grid3} style={{ marginBottom: 16 }}>
          <div className={styles.card}><div className={styles.cardTitle}>Primary Bank Account</div><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)' }}>AIB Business Current</div><div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>****4821 · PSD2/AISP</div></div>
          <div className={styles.card}><div className={styles.cardTitle}>Analysis Period</div><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)' }}>24 Months</div><div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Feb 2023 — Feb 2025</div></div>
          <div className={styles.card}><div className={styles.cardTitle}>Avg Monthly Revenue</div><div className={`${styles.cardVal} ${styles.valTeal}`} style={{ fontSize: 22 }}>{app.revenueActual || '—'}</div><div className={styles.cardSub}>From actual lodgements</div></div>
        </div>
        
        <div className={styles.secHdr}><div className={styles.secTitle}>Monthly Revenue Trend — 12 Months</div></div>
        <div className={styles.card} style={{ marginBottom: 16, paddingBottom: 20 }}>
          <div className={styles.cardTitle}>Open Banking Lodgements <span style={{ color: 'var(--teal)' }}>{app.revenue || ''}</span></div>
          <div className={styles.barChart}>
            {bars.map((v: number, i: number) => (
              <div key={i} className={styles.barCol}>
                <div className={styles.barFill} style={{ height: `${Math.round((v / maxBar) * 100)}%`, background: v === maxBar ? 'var(--teal)' : '#DBEAFE' }}></div>
                <div className={styles.barLbl}>{MONTHS[i] || ''}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.secHdr}><div className={styles.secTitle}>Recent Transactions</div></div>
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 16 }}>
          <table className={styles.txTable}>
            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
            <tbody>
              {(app.transactions || []).map((t: any, i: number) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{t.date}</td>
                  <td>{t.desc}</td>
                  <td><span className={styles.txCat}>{t.category}</span></td>
                  <td style={{ textAlign: 'right' }} className={t.amount.startsWith('+') ? styles.amountIn : styles.amountOut}>{t.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderIFRS9 = () => {
    if (!app.eclStage) return <div style={{ fontSize: 13, color: 'var(--muted)', padding: '20px 0' }}>IFRS 9 staging not yet computed — assessment in progress.</div>;
    const stageName = app.eclStage === 1 ? 'Performing — 12-month ECL applied' : app.eclStage === 2 ? 'SICR — Lifetime ECL applied' : 'Default — Individual assessment';
    
    return (
      <>
        <div className={styles.secHdr} style={{ marginTop: 0 }}><div className={styles.secTitle}>IFRS 9 Expected Credit Loss</div><span className={`${styles.tag} ${styles.tagComplete}`}>ECL Engine v2.4</span></div>
        <div className={styles.grid4} style={{ marginBottom: 16 }}>
          <div className={styles.card} style={{ textAlign: 'center' }}>
            <div className={styles.cardTitle} style={{ textAlign: 'center' }}>ECL Stage</div>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
              <div className={`${styles.eclStage} ${app.eclStage === 1 ? styles.ecl1 : app.eclStage === 2 ? styles.ecl2 : styles.ecl3}`}>{app.eclStage}</div>
            </div>
            <div className={styles.cardSub} style={{ textAlign: 'center' }}>{stageName.split(' — ')[0]}</div>
          </div>
          <div className={styles.card}><div className={styles.cardTitle}>12-Month ECL</div><div className={styles.cardVal} style={{ fontSize: 22 }}>{fmt(app.ecl12m)}</div><div className={styles.cardSub}>Stage 1 provision</div></div>
          <div className={styles.card}><div className={styles.cardTitle}>Lifetime ECL</div><div className={`${styles.cardVal} ${app.eclStage >= 2 ? styles.valGold : ''}`} style={{ fontSize: 22 }}>{fmt(app.eclLifetime)}</div><div className={styles.cardSub}>{app.eclStage >= 2 ? 'Applied (Stage 2+)' : 'Reference only'}</div></div>
          <div className={styles.card}><div className={styles.cardTitle}>EAD</div><div className={styles.cardVal} style={{ fontSize: 22 }}>{fmt(app.ead)}</div><div className={styles.cardSub}>Exposure at Default</div></div>
        </div>

        <div className={styles.secHdr}><div className={styles.secTitle}>ECL Scenario Overlays</div></div>
        <div className={styles.grid3} style={{ marginBottom: 16 }}>
          <div className={styles.card}><div className={styles.cardTitle}>Base Case (60%)</div><div className={styles.cardVal} style={{ fontSize: 22 }}>{fmt(app.ecl12m)}</div><div className={styles.cardSub}>Central economic forecast</div></div>
          <div className={styles.card}><div className={styles.cardTitle}>Upside (20%)</div><div className={`${styles.cardVal} ${styles.valGreen}`} style={{ fontSize: 22 }}>{fmt(app.ecl12m ? Math.round(app.ecl12m * 0.7) : null)}</div><div className={styles.cardSub}>Favourable conditions</div></div>
          <div className={styles.card}><div className={styles.cardTitle}>Downside (20%)</div><div className={`${styles.cardVal} ${styles.valGold}`} style={{ fontSize: 22 }}>{fmt(app.ecl12m ? Math.round(app.ecl12m * 1.8) : null)}</div><div className={styles.cardSub}>Stressed conditions</div></div>
        </div>
      </>
    );
  };

  const renderTrust = () => {
    const pillars = [
      { n: 1, t: 'Valid & Reliable', d: `AUC 0.84 (holdout) · PD ${fmtPD(app.pd)} · Model validated · CI: ${fmtPD(app.pdLow)} – ${fmtPD(app.pdHigh)}` },
      { n: 2, t: 'Safe', d: `Stress test passed · DSCR stressed: ${app.stressTest?.rateshockDscr}× · Consumer protection active` },
      { n: 3, t: 'Secure & Resilient', d: 'AES-256 at rest · TLS 1.3 in transit · Tenant-isolated · EU data residency · DORA aligned' },
      { n: 4, t: 'Accountable & Transparent', d: 'Named PCF holder (PCF-11) · Immutable audit trail · IAF/SEAR compliant · Override governance active' },
      { n: 5, t: 'Explainable & Interpretable', d: 'SHAP local + global explanations · Counterfactual explanations · GDPR Art.22 right to explanation' },
      { n: 6, t: 'Privacy Enhanced', d: 'PII Vault · Data minimisation register · GDPR Art.25 by design · Right to erasure, access, portability' },
      { n: 7, t: 'Fair — Harmful Bias Managed', d: `DI: ${app.fairnessMetrics?.disparateImpact} (>0.80 ✓) · EO: ${app.fairnessMetrics?.equalOpportunity} (<0.10 ✓) · Monthly monitoring` },
    ];
    
    return (
      <>
        <div className={styles.secHdr} style={{ marginTop: 0 }}><div className={styles.secTitle}>AI Trustworthiness — 7 Pillars</div><span className={`${styles.tag} ${styles.tagComplete}`}>EU AI Act Art.9-15 · All Compliant</span></div>
        {pillars.map(p => (
          <div key={p.n} className={styles.pillarRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className={styles.pillarNum}>{p.n}</div>
              <div style={{ flex: 1 }}><div style={{ fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{p.t}</div><div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{p.d}</div></div>
              <span className={`${styles.tag} ${styles.tagComplete}`}>✓ Compliant</span>
            </div>
          </div>
        ))}
      </>
    );
  };

  const renderAuditLog = () => {
    const entries = [
      { time: '14:21:45', dot: '', event: 'GDPR Art.13/14 notice presented', detail: 'Data processing notice displayed · consent obtained' },
      { time: '14:21:47', dot: '', event: 'Consent obtained (GDPR Art.22)', detail: 'Applicant consented to automated processing · right to object explained' },
      { time: '14:22:05', dot: '', event: 'Application received', detail: `${app.id} · ${app.company} · ${app.loanType} · ${app.amount}` },
      { time: '14:22:12', dot: '', event: 'PD/LGD/EAD models executed', detail: `PD: ${fmtPD(app.pd)} · LGD: ${app.lgd ? (app.lgd * 100).toFixed(0) + '%' : '—'} · Model v3.2` },
      { time: '14:22:15', dot: app.discrepancy ? styles.auditDotGold : '', event: 'Revenue reconciliation', detail: app.discrepancy ? `Variance detected — flagged for review` : 'Reconciled within tolerance' },
      { time: '14:22:20', dot: '', event: 'IFRS 9 ECL calculated', detail: `Stage ${app.eclStage} · 12m ECL: ${fmt(app.ecl12m)}` },
      { time: '14:22:25', dot: '', event: 'Assessment complete', detail: 'Processing time: 41 seconds' },
    ];
    if (submittedDecision) {
      entries.push({ time: '15:42:01', dot: styles.auditDotGreen, event: `Credit decision: ${submittedDecision.toUpperCase()}`, detail: `Underwriter: ${app.decisionOfficer || 'C. Officer'} · Rationale documented · EU AI Act Art.12` });
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
              <div className={`${styles.auditDot} ${e.dot}`}></div>
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

  const renderCompliance = () => (
    <>
      <div className={styles.secHdr} style={{ marginTop: 0 }}><div className={styles.secTitle}>Automated Compliance Checks</div></div>
      {(app.checks || []).map((c: any, i: number) => (
        <div key={i} className={styles.checkItem} style={{ borderColor: c.status === 'pass' ? 'rgba(37,99,235,.2)' : c.status === 'warn' ? 'rgba(245,158,11,.3)' : 'rgba(220,38,38,.3)' }}>
          <div className={styles.checkIcon}>{c.status === 'pass' ? '✅' : c.status === 'warn' ? '⚠️' : '❌'}</div>
          <div style={{ flex: 1 }}><div className={styles.checkName}>{c.name}</div><div className={styles.checkDetail}>{c.detail}</div></div>
          <div className={styles.checkTs}>{c.time}</div>
        </div>
      ))}
    </>
  );

  const renderEvidence = () => (
    <>
      <div className={styles.evidenceHeader}>
        <div style={{ fontSize: 11, color: 'var(--teal)', fontFamily: 'var(--font-mono)', marginBottom: 6, letterSpacing: '.5px' }}>CREDIT EVIDENCE PACK · EU AI ACT COMPLIANT · IMMUTABLE</div>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>{app.company}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
          {[
            ['Application ID', app.id],
            ['Amount', app.amount],
            ['Product', app.loanType],
            ['Risk Grade', app.riskGrade || '—'],
            ['APR', app.apr ? app.apr + '%' : '—'],
            ['Model', 'SME PD v3.2 · LGD v2.1 · EAD v1.8'],
          ].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      
      {app.narrative && <div className={styles.narrativeBox}><div className={styles.narrativeText} dangerouslySetInnerHTML={{ __html: app.narrative }} /></div>}
    </>
  );

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
          {TABS.map(t => {
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

        {/* Decision Gate (Always visible at the bottom of the panels) */}
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
              <div className={styles.gateSub}>Step 5 of 6. Under EU AI Act Art.14 and GDPR Art.22, your decision and rationale will be permanently logged. No loan moves forward without this sign-off.</div>
              <div className={styles.gateBtns}>
                {['approved', 'referred', 'declined'].map(o => (
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
