import React from 'react';
import styles from '../../styles/queue.module.css';

const fmt = (v: unknown, pre = '€') => {
  const n = Number(v);
  if (!v || isNaN(n)) return '—';
  return `${pre}${n.toLocaleString()}`;
};

const FinancialFields: React.FC<{ app: any }> = ({ app }) => {
  return (
    <>
      <div className={styles.fieldGrid}>
        {[
          { l: 'Borrower', v: app.company, pf: true },
          { l: 'Sector', v: app.sector || '—', pf: !!app.sector },
          { l: 'Requested', v: app.amount || '—', pf: !!app.amount },
          { l: 'Revenue', v: app.revenue || '—', pf: !!app.revenue },
          { l: 'Cash Flow', v: app.cashflow || '—', pf: !!app.cashflow },
          { l: 'DSCR', v: app.dscr != null ? `${app.dscr.toFixed(2)}×` : '—', pf: app.dscr != null },
          { l: 'Loan Type', v: app.loanType || '—', pf: !!app.loanType },
        ].map((f) => (
          <div key={f.l} className={`${styles.fieldCard} ${f.pf ? styles.fieldCardPf : ''}`}>
            <div className={styles.fLabel}>{f.l}</div>
            <div className={styles.fValue}>{f.v}</div>
            {f.l === 'DSCR' && app.dscr != null && (
              <div className={styles.fSub} style={{ color: app.dscr >= 1.2 ? '#059669' : '#DC2626' }}>
                {app.dscr >= 1.2 ? '✓ Above 1.20× min' : '✗ Below 1.20× min'}
              </div>
            )}
          </div>
        ))}
      </div>

      {app.hitl && (
        <div style={{ background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#1D4ED8' }}>
          <strong>⚠ HITL Mandatory:</strong> {app.hitlReason}
        </div>
      )}

      {app.discrepancy && app.discrepancyDetail && (
        <div style={{ background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#92400E' }}>
          <strong>⚠ Revenue Discrepancy:</strong> {app.discrepancyDetail}
        </div>
      )}
    </>
  );
};

export default FinancialFields;
