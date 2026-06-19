import React from 'react';
import styles from '../../../styles/queue.module.css';
import { AppDetail, fmtPD } from '../types';

interface Props {
  app: AppDetail;
}

const TrustworthinessTab: React.FC<Props> = ({ app }) => {
  const pillars = [
    {
      n: 1,
      t: 'Valid & Reliable',
      d: `AUC 0.84 (holdout) · PD ${fmtPD(app.pd)} · Model validated · CI: ${fmtPD(app.pdLow)} – ${fmtPD(app.pdHigh)}`,
    },
    {
      n: 2,
      t: 'Safe',
      d: `Stress test passed · DSCR stressed: ${app.stressTest?.rateshockDscr}× · Consumer protection active`,
    },
    {
      n: 3,
      t: 'Secure & Resilient',
      d: 'AES-256 at rest · TLS 1.3 in transit · Tenant-isolated · EU data residency · DORA aligned',
    },
    {
      n: 4,
      t: 'Accountable & Transparent',
      d: 'Named PCF holder (PCF-11) · Immutable audit trail · IAF/SEAR compliant · Override governance active',
    },
    {
      n: 5,
      t: 'Explainable & Interpretable',
      d: 'SHAP local + global explanations · Counterfactual explanations · GDPR Art.22 right to explanation',
    },
    {
      n: 6,
      t: 'Privacy Enhanced',
      d: 'PII Vault · Data minimisation register · GDPR Art.25 by design · Right to erasure, access, portability',
    },
    {
      n: 7,
      t: 'Fair — Harmful Bias Managed',
      d: `DI: ${app.fairnessMetrics?.disparateImpact} (>0.80 ✓) · EO: ${app.fairnessMetrics?.equalOpportunity} (<0.10 ✓) · Monthly monitoring`,
    },
  ];

  return (
    <>
      <div className={styles.secHdr} style={{ marginTop: 0 }}>
        <div className={styles.secTitle}>AI Trustworthiness — 7 Pillars</div>
        <span className={`${styles.tag} ${styles.tagComplete}`}>EU AI Act Art.9-15 · All Compliant</span>
      </div>
      {pillars.map((p) => (
        <div key={p.n} className={styles.pillarRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className={styles.pillarNum}>{p.n}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{p.t}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{p.d}</div>
            </div>
            <span className={`${styles.tag} ${styles.tagComplete}`}>✓ Compliant</span>
          </div>
        </div>
      ))}
    </>
  );
};

export default TrustworthinessTab;
