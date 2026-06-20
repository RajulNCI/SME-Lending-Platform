import React from 'react';
import styles from '../../../styles/queue.module.css';
import { AppDetail, fmt, fmtPD } from '../types';

interface Props {
  app: AppDetail;
}

const RiskXAITab: React.FC<Props> = ({ app }) => {
  const shap = app.shapValues || [];
  const maxS = Math.max(...shap.map((s) => Math.abs(s.value)), 0.01);

  return (
    <>
      <div className={styles.grid3} style={{ marginBottom: 16 }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>PD (Probability of Default)</div>
          <div className={`${styles.cardVal} ${(app.pd ?? 1) < 0.05 ? styles.valTeal : (app.pd ?? 1) < 0.10 ? styles.valGold : styles.valRed}`}>{fmtPD(app.pd)}</div>
          <div className={styles.cardSub}>Application PD model v3.2</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>LGD (Loss Given Default)</div>
          <div className={styles.cardVal}>{app.lgd != null ? (app.lgd * 100).toFixed(0) + '%' : '—'}</div>
          <div className={styles.cardSub}>LGD model v2.1</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>EAD (Exposure at Default)</div>
          <div className={styles.cardVal}>{fmt(app.ead)}</div>
          <div className={styles.cardSub}>EAD model v1.8</div>
        </div>
      </div>

      <div className={styles.grid2} style={{ marginBottom: 16 }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Affordability &amp; Capacity to Repay</div>
          <div className={`${styles.cardVal} ${(app.affordability ?? 0) >= 0.6 ? styles.valTeal : styles.valRed}`}>{app.affordability != null ? (app.affordability * 100).toFixed(0) + '%' : '—'}</div>
          <div className={styles.cardSub}>Cash-flow based · Affordability model v2.0</div>
          <div className={styles.progressBar} style={{ marginTop: 10 }}>
            <div className={styles.progressFill} style={{ width: `${(app.affordability ?? 0) * 100}%`, background: (app.affordability ?? 0) >= 0.6 ? 'var(--teal)' : 'var(--red)' }} />
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
            <div key={l} className={styles.metricRow}>
              <span className={styles.mLabel}>{l}</span>
              <span className={styles.mVal}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.secHdr}>
        <div className={styles.secTitle}>SHAP Explainability — Top Decision Factors</div>
        <span className={`${styles.tag} ${styles.tagComplete}`}>EU AI Act Art.13</span>
      </div>
      <div className={styles.card} style={{ marginBottom: 16 }}>
        <div className={styles.cardTitle}>Local Explanation (Per-Decision) <span style={{ fontSize: 10, color: 'var(--muted)' }}>SHAP v3.2</span></div>
        {shap.map((s, i) => {
          const w = Math.round((Math.abs(s.value) / maxS) * 100);
          const pos = s.direction === 'positive';
          return (
            <div key={i} className={styles.shapRow}>
              <div className={styles.shapFeat}>{s.feature}</div>
              <div className={styles.shapTrack}>
                <div className={pos ? styles.shapPos : styles.shapNeg} style={{ width: `${w}%` }} />
              </div>
              <div className={styles.shapVal} style={{ color: pos ? 'var(--teal)' : '#1E3A8A' }}>
                {pos ? '+' : '−'}{s.value.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.secHdr}><div className={styles.secTitle}>Stress Test — Interest Rate +200bps</div></div>
      <div className={styles.card} style={{ marginBottom: 16 }}>
        {[
          { m: 'DSCR', base: `${app.dscr}×`, str: `${app.stressTest?.rateshockDscr}×`, pass: (app.stressTest?.rateshockDscr ?? 0) >= 1.2, thresh: 'min 1.20×' },
          { m: 'Affordability', base: `${((app.affordability ?? 0) * 100).toFixed(0)}%`, str: `${((app.stressTest?.rateshockAff ?? 0) * 100).toFixed(0)}%`, pass: (app.stressTest?.rateshockAff ?? 0) >= 0.5, thresh: 'min 50%' },
          { m: 'PD (recession overlay)', base: fmtPD(app.pd), str: fmtPD(app.stressTest?.recessionPD), pass: (app.stressTest?.recessionPD ?? 1) < 0.15, thresh: '< 15%' },
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
        {(app.counterfactuals || []).map((cf, i) => (
          <div key={i} className={styles.cfRow}>
            <div className={styles.cfIf}>If: {cf.condition}</div>
            <div className={styles.cfThen} style={{ color: cf.dir === 'positive' ? 'var(--teal)' : 'var(--red)' }}>→ {cf.outcome}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default RiskXAITab;
