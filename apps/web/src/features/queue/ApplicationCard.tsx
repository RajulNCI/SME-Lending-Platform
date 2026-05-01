import React from 'react';
import styles from '../../styles/queue.module.css';

interface ApplicationCardProps {
  app: any;
  expanded: boolean;
  onExpand: () => void;
  hasFlag: boolean;
}

const getPriorityBadge = (app: any) => {
  if (app.status === 'decided') return { v: 'done', label: 'Done' };
  if (app.status === 'processing') return { v: 'processing', label: 'Processing' };
  if (app.status === 'flagged') return { v: 'high', label: 'High Priority' };
  if (app.hitl) return { v: 'hitl', label: 'HITL Review' };
  return { v: 'med', label: 'Standard' };
};

const ApplicationCard: React.FC<ApplicationCardProps> = ({ app, expanded, onExpand, hasFlag }) => {
  const badge = getPriorityBadge(app);
  
  return (
    <div className={`${styles.tRow} ${expanded ? styles.tRowExp : ''} ${hasFlag ? styles.tRowFlag : ''}`} onClick={onExpand}>
      <div className={styles.tdMono}>{app.id.split('-').pop()}</div>
      <div className={styles.td}>
        <div>
          <div className={styles.companyName}>{app.company}</div>
          <div className={styles.companyMeta}>{app.crn} · {app.sector}</div>
        </div>
      </div>
      <div className={styles.tdMono}>{app.amount}</div>
      <div className={styles.td}>
        <span className={`${styles.pBadge} ${styles['pBadge' + badge.v.charAt(0).toUpperCase() + badge.v.slice(1)]}`}>
          {badge.label}
        </span>
      </div>
      <div className={styles.td}>
        {app.riskGrade ? (
          <span className={`${styles.gradeBadge} ${styles['gradeBadge' + app.riskGrade.charAt(0)]}`}>{app.riskGrade}</span>
        ) : '—'}
      </div>
      <div className={styles.tdMono}>{app.requested}</div>
      <div className={styles.td}>
        {expanded ? '▲' : '▼'}
      </div>
    </div>
  );
};

export default ApplicationCard;
