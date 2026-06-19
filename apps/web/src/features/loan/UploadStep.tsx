import React, { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  UploadZone,
  Spinner,
  InfoBox,
} from '../../styles/pages/LoanApplicationPage.styles';

interface Props {
  file: File | null;
  uploading: boolean;
  uploadError: string;
  dragging: boolean;
  onFile: (f: File) => void;
  onDragging: (v: boolean) => void;
  onSkip: () => void;
}

const ALLOWED_EXT = ['.pdf', '.xlsx', '.xls', '.jpg', '.jpeg', '.png'];

const UploadStep: React.FC<Props> = ({
  file,
  uploading,
  uploadError,
  dragging,
  onFile,
  onDragging,
  onSkip,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <Card $padding="lg">
      <CardHeader>
        <CardTitle>Upload financial document</CardTitle>
        <Badge $variant="info">Step 1 of 3</Badge>
      </CardHeader>
      <CardDivider />
      <p style={{ fontSize: '.9375rem', color: '#4A5568', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Upload the company's financial document first. The AI will extract key figures —
        revenue, EBITDA, DSCR — and auto-fill the form for you.
      </p>

      <UploadZone
        $drag={dragging}
        $done={!!file && !uploading}
        $err={!!uploadError}
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); onDragging(true); }}
        onDragLeave={() => onDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED_EXT.join(',')}
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
        />
        {uploading ? (
          <>
            <Spinner />
            <p style={{ fontSize: '.9375rem', fontWeight: 500, color: '#0C2B5E', margin: '0 0 .25rem' }}>
              Extracting financial data…
            </p>
            <p style={{ fontSize: '.8125rem', color: '#718096', margin: 0 }}>
              AI is reading the document
            </p>
          </>
        ) : file ? (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>✓</div>
            <p style={{ fontSize: '.9375rem', fontWeight: 500, color: '#0F6E56', margin: '0 0 .25rem' }}>
              {file.name}
            </p>
            <p style={{ fontSize: '.8125rem', color: '#718096', margin: 0 }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB · click to change
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>📄</div>
            <p style={{ fontSize: '.9375rem', fontWeight: 500, color: '#2D3748', margin: '0 0 .375rem' }}>
              Drop document here or <span style={{ color: '#1A56A0' }}>browse</span>
            </p>
            <p style={{ fontSize: '.8125rem', color: '#718096', margin: '0 0 .75rem' }}>
              P&amp;L statement, balance sheet, management accounts, bank statements
            </p>
            <div style={{ display: 'flex', gap: '.375rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[...ALLOWED_EXT, 'max 15MB'].map((t) => (
                <span key={t} style={{ fontSize: '.6875rem', padding: '2px 8px', background: '#EDF2F7', color: '#4A5568', borderRadius: '4px', fontFamily: "'IBM Plex Mono',monospace" }}>
                  {t}
                </span>
              ))}
            </div>
          </>
        )}
      </UploadZone>

      {uploadError && (
        <p style={{ fontSize: '.8125rem', color: '#E24B4A', margin: '.5rem 0 0' }}>{uploadError}</p>
      )}

      <InfoBox>
        ℹ️ No document?{' '}
        <button
          style={{ color: '#0C2B5E', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          onClick={onSkip}
        >
          Fill the form manually →
        </button>
      </InfoBox>
    </Card>
  );
};

export default UploadStep;
