import React, { useState } from 'react';
import styles from '../../styles/queue.module.css';

const DecisionGate: React.FC<{ onDecision: (dec: 'approved' | 'referred' | 'declined', rat: string) => Promise<void> }> = ({ onDecision }) => {
  const [outcome, setOutcome] = useState<'approved' | 'referred' | 'declined' | null>(null);
  const [rationale, setRationale] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!outcome || rationale.length < 20) return;
    setSubmitting(true);
    await onDecision(outcome, rationale);
    setSubmitting(false);
  };

  return (
    <div className={styles.gate}>
      <div className={styles.gateTitle}>Final Assessment Decision</div>
      <div className={styles.gateSub}>Select outcome and provide rationale (min 20 chars)</div>
      
      <div className={styles.outBtns}>
        {(['approved', 'referred', 'declined'] as const).map(dec => (
          <button
            key={dec}
            className={`${styles.outBtn} ${outcome === dec ? styles['outBtn' + dec.charAt(0).toUpperCase() + dec.slice(1)] : ''}`}
            onClick={() => setOutcome(dec)}
          >
            {dec.charAt(0).toUpperCase() + dec.slice(1)}
          </button>
        ))}
      </div>
      
      <textarea
        className={styles.rationale}
        placeholder="Enter rationale..."
        value={rationale}
        onChange={e => setRationale(e.target.value)}
      />
      
      <button
        className={`${styles.submitDecBtn} ${outcome && rationale.length >= 20 ? styles.submitDecBtnOk : ''}`}
        disabled={!outcome || rationale.length < 20 || submitting}
        onClick={handleSubmit}
      >
        {submitting ? 'Submitting...' : 'Submit Decision'}
      </button>
    </div>
  );
};

export default DecisionGate;
