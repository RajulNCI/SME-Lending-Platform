import React, { useRef } from 'react';
import styles from '../../styles/borrower.module.css';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';

interface DocumentChecklistProps {
  uploadHook: ReturnType<typeof useDocumentUpload>;
  onSubmit: () => void;
  onBack: () => void;
}

const fmtSz = (b: number) =>
  b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;
const fIcon = (n: string) => (n.match(/\.pdf$/i) ? '📄' : n.match(/\.(xlsx|xls)$/i) ? '📊' : '🖼');

const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ uploadHook, onSubmit, onBack }) => {
  const { files, fErr, drag, setDrag, addFiles, onDrop, removeFile, MAX, ACCEPTED } = uploadHook;
  const inp = useRef<HTMLInputElement>(null);

  return (
    <>
      <button className={styles.backBtn} onClick={onBack}>
        ← Back to Loan Details
      </button>

      <div className={styles.sectionHead}>
        <div>
          <h2 className={styles.sectionTitle}>Document Upload</h2>
          <p className={styles.sectionSub}>Please provide the following for underwriting</p>
        </div>
      </div>

      {fErr && <div className={styles.errorBox}>{fErr}</div>}

      <div
        className={drag ? 'drop-active' : ''}
        style={{
          border: '2px dashed ' + (drag ? '#2563EB' : 'rgba(37,99,235,.18)'),
          borderRadius: '10px',
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: drag ? 'rgba(37,99,235,.04)' : '#fff',
          transition: 'all 0.2s ease',
          marginBottom: '20px'
        }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        <p style={{ fontSize: 32, margin: '0 0 12px' }}>📂</p>
        <div style={{ fontWeight: 600, color: '#0F2D6B', marginBottom: 6 }}>
          Drag & drop files here
        </div>
        <div style={{ fontSize: 11, color: '#64748B', fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
          Up to {MAX} files • Max 10MB each<br />
          Accepted: {ACCEPTED.join(', ')}
        </div>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid rgba(37,99,235,.3)',
            background: '#fff',
            color: '#2563EB',
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            cursor: 'pointer'
          }}
          onClick={() => inp.current?.click()}
        >
          Browse Files
        </button>
        <input
          type="file"
          multiple
          hidden
          ref={inp}
          accept={ACCEPTED.join(',')}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {files.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid rgba(37,99,235,.18)', overflow: 'hidden', marginBottom: '20px' }}>
          {files.map((f, i) => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderTop: i > 0 ? '1px solid rgba(37,99,235,.1)' : 'none' }}>
              <div style={{ fontSize: 18, marginRight: 12 }}>{fIcon(f.file.name)}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0F2D6B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {f.file.name}
                </div>
                <div style={{ fontSize: 10, color: '#64748B', fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
                  {fmtSz(f.file.size)}
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px 8px' }}
                onClick={() => removeFile(f.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        className={`${styles.continueBtn} ${files.length >= 2 ? styles.continueBtnReady : styles.continueBtnDisabled}`}
        disabled={files.length < 2}
        onClick={onSubmit}
      >
        Submit Application
      </button>
      <div style={{ textAlign: 'center', fontSize: 11, color: '#64748B', marginTop: 12 }}>
        At least 2 documents required (e.g. Bank Statements, Accounts)
      </div>
    </>
  );
};

export default DocumentChecklist;
