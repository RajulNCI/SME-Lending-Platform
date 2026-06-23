import React from 'react';
import styles from '../../../styles/queue.module.css';
import { AppDetail } from '../types';

interface Props {
  app: AppDetail;
}

const EvidencePackTab: React.FC<Props> = ({ app }) => (
  <>
    <div className={styles.evidenceHeader}>
      <div style={{ fontSize: 11, color: 'var(--teal)', fontFamily: 'var(--font-mono)', marginBottom: 6, letterSpacing: '.5px' }}>
        CREDIT EVIDENCE PACK · EU AI ACT COMPLIANT · IMMUTABLE
      </div>
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

    {app.narrative && (
      <div className={styles.narrativeBox}>
        {/* narrative is HTML from AI — rendered as-is */}
        <div className={styles.narrativeText} dangerouslySetInnerHTML={{ __html: app.narrative }} />
      </div>
    )}
  </>
);

export default EvidencePackTab;
