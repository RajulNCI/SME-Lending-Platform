import React from 'react';
import styles from '../../styles/queue.module.css';

const ChecksList: React.FC<{ app: any }> = ({ app }) => {
  return (
    <>
      {app.checks && app.checks.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-navy)', marginBottom: 10 }}>Automated checks</div>
          {app.checks.map((chk: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 16, marginTop: 1 }}>{chk.status === 'pass' ? '✅' : chk.status === 'warn' ? '⚠️' : '❌'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{chk.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>{chk.detail}</div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-muted)' }}>{chk.time}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ChecksList;
