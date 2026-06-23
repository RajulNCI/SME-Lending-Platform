import React from 'react';
import styles from '../../../styles/queue.module.css';
import { AppDetail } from '../types';

interface Props {
  app: AppDetail;
}

const ComplianceTab: React.FC<Props> = ({ app }) => (
  <>
    <div className={styles.secHdr} style={{ marginTop: 0 }}>
      <div className={styles.secTitle}>Automated Compliance Checks</div>
    </div>
    {(app.checks || []).map((c, i) => (
      <div
        key={i}
        className={styles.checkItem}
        style={{
          borderColor: c.status === 'pass'
            ? 'rgba(37,99,235,.2)'
            : c.status === 'warn'
              ? 'rgba(245,158,11,.3)'
              : 'rgba(220,38,38,.3)',
        }}
      >
        <div className={styles.checkIcon}>{c.status === 'pass' ? '✅' : c.status === 'warn' ? '⚠️' : '❌'}</div>
        <div style={{ flex: 1 }}>
          <div className={styles.checkName}>{c.name}</div>
          <div className={styles.checkDetail}>{c.detail}</div>
        </div>
        <div className={styles.checkTs}>{c.time}</div>
      </div>
    ))}
  </>
);

export default ComplianceTab;
