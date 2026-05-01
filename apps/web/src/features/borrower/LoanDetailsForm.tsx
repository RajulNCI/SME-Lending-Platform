import React from 'react';
import styles from '../../styles/borrower.module.css';

interface LoanDetailsFormProps {
  amount: string;
  setAmount: (val: string) => void;
  purpose: string;
  setPurpose: (val: string) => void;
  onNext: () => void;
}

const PURPOSES = [
  { id: 'Working Capital', icon: '💸', sub: 'Cash flow support' },
  { id: 'Equipment', icon: '🚜', sub: 'Plant & machinery' },
  { id: 'Expansion', icon: '🚀', sub: 'New markets/stores' },
  { id: 'Real Estate', icon: '🏢', sub: 'Property purchase' },
  { id: 'Refinance', icon: '🔄', sub: 'Consolidate debt' },
  { id: 'Other', icon: '✨', sub: 'Custom purpose' },
];

const LoanDetailsForm: React.FC<LoanDetailsFormProps> = ({ amount, setAmount, purpose, setPurpose, onNext }) => {
  return (
    <>
      <div className={styles.formHero}>
        <h1 className={styles.formH1}>What do you need funding for?</h1>
        <p className={styles.formLead}>
          Answer two quick questions to help us structure the best facility for your business.
        </p>
      </div>

      <div className={styles.formCard}>
        <div className={styles.fieldWrap}>
          <label className={styles.fieldLabel}>How much do you need?</label>
          <div className={styles.fieldHint}>Facilities available from €10,000 to €5,000,000</div>
          <div className={styles.amountWrap}>
            <span className={styles.euroSign}>€</span>
            <input
              type="number"
              className={styles.amountInput}
              placeholder="e.g. 150000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className={styles.quickAmounts}>
            {['50000', '100000', '250000', '500000'].map((val) => (
              <button
                key={val}
                className={`${styles.quickBtn} ${amount === val ? styles.quickBtnSelected : ''}`}
                onClick={() => setAmount(val)}
              >
                €{parseInt(val).toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.fieldWrap}>
          <label className={styles.fieldLabel}>What is the primary purpose?</label>
          <div className={styles.fieldHint}>Select the category that best fits</div>
          <div className={styles.purposeGrid}>
            {PURPOSES.map((p) => (
              <div
                key={p.id}
                className={`${styles.purposeCard} ${purpose === p.id ? styles.purposeCardSelected : ''}`}
                onClick={() => setPurpose(p.id)}
              >
                <div className={styles.purposeIcon}>{p.icon}</div>
                <div className={`${styles.purposeName} ${purpose === p.id ? styles.purposeNameSelected : ''}`}>
                  {p.id}
                </div>
                <div className={styles.purposeSub}>{p.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        className={`${styles.continueBtn} ${amount && purpose ? styles.continueBtnReady : styles.continueBtnDisabled}`}
        disabled={!amount || !purpose}
        onClick={onNext}
      >
        Continue to Documents →
      </button>

      <div className={styles.trustPills}>
        <span className={styles.trustPill}>🔒 Secure 256-bit encryption</span>
        <span className={styles.trustPill}>⚡ No impact on credit score</span>
      </div>
    </>
  );
};

export default LoanDetailsForm;
