/**
 * BorrowerApplyPage — SIMPLE
 *
 * Borrower ONLY uploads documents. No form.
 * Nathan's AI extracts all data from the docs.
 * Credit Officer sees the parsed form.
 */
import React, { useRef, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { generateApplicationId } from '../../services/AIApi';

const spin = keyframes`to{transform:rotate(360deg)}`;
const fadeUp = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

const PageWrap = styled.div`
  max-width: 640px;
  margin: 0 auto;
`;
const DropZone = styled.div<{ $drag: boolean; $has: boolean }>`
  border: 2px dashed ${({ $drag, $has }) => ($drag ? '#378ADD' : $has ? '#1D9E75' : '#CBD5E0')};
  border-radius: 14px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  background: ${({ $drag, $has }) => ($drag ? '#EBF4FF' : $has ? '#F0FDF9' : '#FAFBFC')};
  transition: all 0.2s;
  &:hover {
    border-color: #378add;
    background: #ebf4ff;
  }
`;
const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #0c2b5e;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: 0 auto 0.75rem;
`;
const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;
const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  background: #f7fafc;
  border: 0.5px solid #e2e8f0;
  border-radius: 8px;
`;
const FileName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #2d3748;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const FileSize = styled.span`
  font-size: 0.75rem;
  color: #a0aec0;
  flex-shrink: 0;
`;
const RemoveBtn = styled.button`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  &:hover {
    background: #fecaca;
  }
`;

const MAX = 20;
const ACCEPTED = ['.pdf', '.xlsx', '.xls', '.jpg', '.jpeg', '.png'];
const fmtSize = (b: number) =>
  b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;
const fileIcon = (name: string) =>
  name.endsWith('.pdf') ? '📄' : name.match(/\.(xlsx|xls)$/) ? '📊' : '🖼';

interface UFile {
  file: File;
  id: string;
}

const BorrowerApplyPage: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [appId] = useState(generateApplicationId);
  const [files, setFiles] = useState<UFile[]>([]);
  const [drag, setDrag] = useState(false);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [done, setDone] = useState(false);
  const [uploadRef, setUploadRef] = useState('');

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const errs: string[] = [];
    const valid = arr.filter((f) => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (!ACCEPTED.includes(ext)) {
        errs.push(`${f.name}: invalid format`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        errs.push(`${f.name}: exceeds 10MB`);
        return false;
      }
      return true;
    });
    setFiles((prev) => {
      const next = [
        ...prev,
        ...valid.map((f) => ({ file: f, id: Math.random().toString(36).slice(2) })),
      ];
      if (next.length > MAX) {
        errs.push(`Max ${MAX} documents`);
        return next.slice(0, MAX);
      }
      return next;
    });
    setFileError(errs[0] || '');
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setFileError('Please upload at least one document');
      return;
    }
    setSubmitting(true);
    setApiError('');
    try {
      const formData = new FormData();
      formData.append('applicationId', appId);
      files.forEach(({ file }) => formData.append('documents', file, file.name));

      const BASE = import.meta.env.DEV ? '/ai-api' : 'https://finpals-prototype.vercel.app';
      const res = await fetch(`${BASE}/api/v1/uploads`, { method: 'POST', body: formData });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Upload failed (${res.status}): ${t}`);
      }
      const data = await res.json();
      setUploadRef(data.id || data.applicationId || appId);
      setDone(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success ────────────────────────────────────────────────────────────
  if (done)
    return (
      <PageLayout title="Application submitted">
        <PageWrap>
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              background: '#fff',
              borderRadius: '16px',
              border: '.5px solid #E2E8F0',
              animation: `${fadeUp} .4s ease`,
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 1.5rem',
              }}
            >
              ✓
            </div>
            <h2
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '1.5rem',
                color: '#0C2B5E',
                margin: '0 0 .75rem',
              }}
            >
              Documents submitted!
            </h2>
            <p
              style={{
                fontSize: '.9375rem',
                color: '#718096',
                margin: '0 0 1.5rem',
                lineHeight: 1.6,
                maxWidth: '400px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Your documents have been sent for AI analysis. A Credit Officer will review and you'll
              be notified of the decision.
            </p>
            <div
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                gap: '.5rem',
                background: '#F7FAFC',
                border: '.5px solid #E2E8F0',
                borderRadius: '10px',
                padding: '1rem 1.5rem',
                marginBottom: '1.5rem',
                textAlign: 'left',
                minWidth: '280px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '2rem',
                  fontSize: '.875rem',
                }}
              >
                <span style={{ color: '#718096' }}>Application ID</span>
                <span
                  style={{
                    fontWeight: 600,
                    color: '#0C2B5E',
                    fontFamily: "'IBM Plex Mono',monospace",
                  }}
                >
                  {appId}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '2rem',
                  fontSize: '.875rem',
                }}
              >
                <span style={{ color: '#718096' }}>Documents</span>
                <span style={{ fontWeight: 600, color: '#0C2B5E' }}>{files.length} uploaded</span>
              </div>
              {uploadRef && uploadRef !== appId && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '2rem',
                    fontSize: '.875rem',
                  }}
                >
                  <span style={{ color: '#718096' }}>Reference</span>
                  <span
                    style={{
                      fontWeight: 500,
                      color: '#4A5568',
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: '.8125rem',
                    }}
                  >
                    {uploadRef}
                  </span>
                </div>
              )}
            </div>
            <p style={{ fontSize: '.8125rem', color: '#718096', margin: '0 0 1.5rem' }}>
              Expected decision: <strong>within 2 minutes</strong> (automated) or up to 3 business
              days
            </p>
            <Button
              $variant="primary"
              onClick={() => {
                setDone(false);
                setFiles([]);
                setUploadRef('');
              }}
            >
              Submit another application
            </Button>
          </div>
        </PageWrap>
      </PageLayout>
    );

  return (
    <PageLayout title="New loan application">
      <PageWrap>
        <Card $padding="lg">
          <CardHeader>
            <div>
              <CardTitle>Upload financial documents</CardTitle>
              <p style={{ fontSize: '.875rem', color: '#718096', margin: '.25rem 0 0' }}>
                Upload your documents and we'll handle the rest. Our AI extracts all financial data
                automatically.
              </p>
            </div>
            <Badge
              $variant="neutral"
              style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '.75rem', flexShrink: 0 }}
            >
              {appId}
            </Badge>
          </CardHeader>
          <CardDivider />

          {/* Accepted document types */}
          <p
            style={{
              fontSize: '.8125rem',
              fontWeight: 600,
              color: '#718096',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
              margin: '0 0 .625rem',
            }}
          >
            Accepted documents
          </p>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {[
              'Financial Statement',
              'Balance Sheet',
              'Income Statement',
              'Bank Statements',
              'Tax Clearance',
              'Annual Report',
            ].map((t) => (
              <span
                key={t}
                style={{
                  fontSize: '.8125rem',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  background: '#F0F7FF',
                  border: '.5px solid #B5D4F4',
                  color: '#0C447C',
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Drop zone */}
          <DropZone
            $drag={drag}
            $has={files.length > 0}
            onClick={() => files.length < MAX && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED.join(',')}
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = '';
              }}
            />

            {submitting ? (
              <>
                <Spinner />
                <p
                  style={{
                    fontSize: '.9375rem',
                    fontWeight: 500,
                    color: '#0C2B5E',
                    margin: '0 0 .25rem',
                  }}
                >
                  Uploading {files.length} document{files.length > 1 ? 's' : ''}…
                </p>
                <p style={{ fontSize: '.8125rem', color: '#718096', margin: 0 }}>
                  Sending to AI engine for analysis
                </p>
              </>
            ) : files.length >= MAX ? (
              <>
                <p style={{ fontSize: '1.5rem', margin: '0 0 .5rem' }}>✓</p>
                <p
                  style={{
                    fontSize: '.9375rem',
                    fontWeight: 500,
                    color: '#0F6E56',
                    margin: '0 0 .25rem',
                  }}
                >
                  Maximum reached ({MAX} documents)
                </p>
                <p style={{ fontSize: '.8125rem', color: '#718096', margin: 0 }}>
                  Remove a file to add another
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                <p
                  style={{
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#2D3748',
                    margin: '0 0 .5rem',
                  }}
                >
                  Drop files here or <span style={{ color: '#1A56A0' }}>browse</span>
                </p>
                <p style={{ fontSize: '.875rem', color: '#718096', margin: '0 0 1rem' }}>
                  Select one or multiple files at once · Up to {MAX} documents
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '.375rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  {[...ACCEPTED, 'max 10MB each'].map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: '.6875rem',
                        padding: '2px 8px',
                        background: '#EDF2F7',
                        color: '#4A5568',
                        borderRadius: '4px',
                        fontFamily: "'IBM Plex Mono',monospace",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </>
            )}
          </DropZone>

          {fileError && (
            <p style={{ fontSize: '.8125rem', color: '#E24B4A', margin: '.5rem 0 0' }}>
              {fileError}
            </p>
          )}

          {/* File list */}
          {files.length > 0 && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '1rem 0 .5rem',
                }}
              >
                <p
                  style={{
                    fontSize: '.8125rem',
                    fontWeight: 600,
                    color: '#718096',
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                    margin: 0,
                  }}
                >
                  Queued for upload
                </p>
                <Badge $variant={files.length >= MAX ? 'warning' : 'info'}>
                  {files.length}/{MAX}
                </Badge>
              </div>
              <FileList>
                {files.map(({ file, id }) => (
                  <FileRow key={id}>
                    <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>
                      {fileIcon(file.name)}
                    </span>
                    <FileName>{file.name}</FileName>
                    <FileSize>{fmtSize(file.size)}</FileSize>
                    <RemoveBtn
                      onClick={() => setFiles((p) => p.filter((f) => f.id !== id))}
                      aria-label="Remove"
                    >
                      ✕
                    </RemoveBtn>
                  </FileRow>
                ))}
              </FileList>
            </>
          )}

          {apiError && (
            <div
              style={{
                background: '#FFF5F5',
                border: '1px solid #FED7D7',
                borderRadius: '8px',
                padding: '.75rem 1rem',
                fontSize: '.875rem',
                color: '#C53030',
                margin: '1rem 0 0',
              }}
            >
              ⚠️ {apiError}
            </div>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              $variant="primary"
              $loading={submitting}
              disabled={submitting || files.length === 0}
              onClick={handleSubmit}
            >
              {submitting
                ? 'Uploading…'
                : `Submit ${files.length > 0 ? `${files.length} document${files.length > 1 ? 's' : ''}` : 'documents'} →`}
            </Button>
          </div>
        </Card>

        {/* Info box */}
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem 1.25rem',
            background: '#F0F7FF',
            border: '1px solid #B5D4F4',
            borderRadius: '10px',
            fontSize: '.875rem',
            color: '#1A56A0',
          }}
        >
          <p style={{ fontWeight: 600, margin: '0 0 .375rem', color: '#0C2B5E' }}>
            What happens next?
          </p>
          <ol
            style={{
              margin: 0,
              paddingLeft: '1.25rem',
              lineHeight: 2,
              color: '#4A5568',
              fontSize: '.8125rem',
            }}
          >
            <li>Our AI engine reads your documents and extracts financial data</li>
            <li>A Credit Officer reviews the extracted information</li>
            <li>You receive a decision — typically within 2 minutes</li>
          </ol>
        </div>
      </PageWrap>
    </PageLayout>
  );
};

export default BorrowerApplyPage;
