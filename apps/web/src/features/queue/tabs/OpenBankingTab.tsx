import React from 'react';
import styles from '../../../styles/queue.module.css';
import { AppDetail, MONTHS } from '../types';

interface Props {
  app: AppDetail;
}

const OpenBankingTab: React.FC<Props> = ({ app }) => {
  const bars = app.bars || [];
  const maxBar = Math.max(...bars, 1);

  return (
    <>
      <div className={styles.grid3} style={{ marginBottom: 16 }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Primary Bank Account</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)' }}>AIB Business Current</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>****4821 · PSD2/AISP</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Analysis Period</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)' }}>24 Months</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Feb 2023 — Feb 2025</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Avg Monthly Revenue</div>
          <div className={`${styles.cardVal} ${styles.valTeal}`} style={{ fontSize: 22 }}>{app.revenueActual || '—'}</div>
          <div className={styles.cardSub}>From actual lodgements</div>
        </div>
      </div>

      <div className={styles.secHdr}><div className={styles.secTitle}>Monthly Revenue Trend — 12 Months</div></div>
      <div className={styles.card} style={{ marginBottom: 16, paddingBottom: 20 }}>
        <div className={styles.cardTitle}>Open Banking Lodgements <span style={{ color: 'var(--teal)' }}>{app.revenue || ''}</span></div>
        <div className={styles.barChart}>
          {bars.map((v, i) => (
            <div key={i} className={styles.barCol}>
              <div className={styles.barFill} style={{ height: `${Math.round((v / maxBar) * 100)}%`, background: v === maxBar ? 'var(--teal)' : '#DBEAFE' }} />
              <div className={styles.barLbl}>{MONTHS[i] || ''}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.secHdr}><div className={styles.secTitle}>Recent Transactions</div></div>
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 16 }}>
        <table className={styles.txTable}>
          <thead>
            <tr><th>Date</th><th>Description</th><th>Category</th><th style={{ textAlign: 'right' }}>Amount</th></tr>
          </thead>
          <tbody>
            {(app.transactions || []).map((t, i) => (
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

export default OpenBankingTab;
