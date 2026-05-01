import React from 'react';
import styles from '../../styles/queue.module.css';

const ShapChart: React.FC<{ app: any }> = ({ app }) => {
  const shap = app.shapValues || [];
  const maxShap = Math.max(...shap.map((s: any) => Math.abs(s.value || 0)), 1);

  return (
    <>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-navy)', marginBottom: 12 }}>
        SHAP reason codes
      </div>
      {shap.length > 0 ? (
        shap.slice(0, 6).map((s: any, i: number) => {
          const w = Math.round((Math.abs(s.value || 0) / maxShap) * 100);
          const pos = (s.direction || 'positive') === 'positive';
          return (
            <div key={i} className={styles.shapRow}>
              <div className={styles.shapFeat}>
                <span style={{ color: pos ? 'var(--color-teal)' : '#DC2626', marginRight: 4 }}>{pos ? '▲' : '▼'}</span>
                {s.feature}
              </div>
              <div className={styles.shapTrack}>
                <div className={`${styles.shapFill} ${pos ? styles.shapFillPos : styles.shapFillNeg}`} style={{ width: `${w}%` }} />
              </div>
              <div className={styles.shapVal} style={{ color: pos ? 'var(--color-teal)' : '#DC2626' }}>
                {pos ? '+' : '-'}{s.value || 0}
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ fontSize: 13, color: 'var(--color-muted)', padding: '12px 0' }}>
          SHAP codes not yet available.
        </div>
      )}
    </>
  );
};

export default ShapChart;
