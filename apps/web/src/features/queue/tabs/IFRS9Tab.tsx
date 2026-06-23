import React from 'react';
import styles from '../../../styles/queue.module.css';
import { AppDetail, fmt } from '../types';

interface Props {
  app: AppDetail;
}

const IFRS9Tab: React.FC<Props> = ({ app }) => {
  if (!app.eclStage) {
    return <div style={{ fontSize: 13, color: 'var(--muted)', padding: '20px 0' }}>IFRS 9 staging not yet computed — assessment in progress.</div>;
  }

  const stageName = app.eclStage === 1
    ? 'Performing — 12-month ECL applied'
    : app.eclStage === 2
      ? 'SICR — Lifetime ECL applied'
      : 'Default — Individual assessment';

  return (
    <>
      <div className={styles.secHdr} style={{ marginTop: 0 }}>
        <div className={styles.secTitle}>IFRS 9 Expected Credit Loss</div>
        <span className={`${styles.tag} ${styles.tagComplete}`}>ECL Engine v2.4</span>
      </div>

      <div className={styles.grid4} style={{ marginBottom: 16 }}>
        <div className={styles.card} style={{ textAlign: 'center' }}>
          <div className={styles.cardTitle} style={{ textAlign: 'center' }}>ECL Stage</div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
            <div className={`${styles.eclStage} ${app.eclStage === 1 ? styles.ecl1 : app.eclStage === 2 ? styles.ecl2 : styles.ecl3}`}>{app.eclStage}</div>
          </div>
          <div className={styles.cardSub} style={{ textAlign: 'center' }}>{stageName.split(' — ')[0]}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>12-Month ECL</div>
          <div className={styles.cardVal} style={{ fontSize: 22 }}>{fmt(app.ecl12m)}</div>
          <div className={styles.cardSub}>Stage 1 provision</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Lifetime ECL</div>
          <div className={`${styles.cardVal} ${app.eclStage >= 2 ? styles.valGold : ''}`} style={{ fontSize: 22 }}>{fmt(app.eclLifetime)}</div>
          <div className={styles.cardSub}>{app.eclStage >= 2 ? 'Applied (Stage 2+)' : 'Reference only'}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>EAD</div>
          <div className={styles.cardVal} style={{ fontSize: 22 }}>{fmt(app.ead)}</div>
          <div className={styles.cardSub}>Exposure at Default</div>
        </div>
      </div>

      <div className={styles.secHdr}><div className={styles.secTitle}>ECL Scenario Overlays</div></div>
      <div className={styles.grid3} style={{ marginBottom: 16 }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Base Case (60%)</div>
          <div className={styles.cardVal} style={{ fontSize: 22 }}>{fmt(app.ecl12m)}</div>
          <div className={styles.cardSub}>Central economic forecast</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Upside (20%)</div>
          <div className={`${styles.cardVal} ${styles.valGreen}`} style={{ fontSize: 22 }}>{fmt(app.ecl12m ? Math.round(app.ecl12m * 0.7) : null)}</div>
          <div className={styles.cardSub}>Favourable conditions</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Downside (20%)</div>
          <div className={`${styles.cardVal} ${styles.valGold}`} style={{ fontSize: 22 }}>{fmt(app.ecl12m ? Math.round(app.ecl12m * 1.8) : null)}</div>
          <div className={styles.cardSub}>Stressed conditions</div>
        </div>
      </div>
    </>
  );
};

export default IFRS9Tab;
