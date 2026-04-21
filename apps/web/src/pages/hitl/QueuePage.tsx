/**
 * QueuePage — Credit Officer view
 *
 * Shows applications submitted by borrowers.
 * Nathan's AI has already parsed their documents.
 * Credit Officer sees the auto-populated data and makes a decision.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import PageLayout from '../../components/layout/PageLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { getDecisions, submitDecision, getReport, AIDecisionResult } from '../../services/AIApi';

const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.5}`;
const slideDown = keyframes`from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}`;

// ── Application card ─────────────────────────────────────────────────────
const AppCard = styled.div<{ $expanded: boolean }>`
  background: #fff;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  border: 0.5px solid ${({ $expanded }) => ($expanded ? '#378ADD' : '#E2E8F0')};
  transition:
    box-shadow 0.15s,
    border-color 0.15s;
  ${({ $expanded }) => ($expanded ? 'box-shadow:0 4px 20px rgba(12,43,94,.1);' : '')}
  &:hover {
    border-color: #b5d4f4;
  }
`;
const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
`;
const AppTitle = styled.h3`
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #0c2b5e;
  margin: 0 0 0.25rem;
`;
const AppMeta = styled.p`
  font-size: 0.8125rem;
  color: #718096;
  margin: 0;
  font-family: 'IBM Plex Mono', monospace;
`;
const MetricRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
`;
const MetricTag = styled.span<{ $color?: string }>`
  font-size: 0.8125rem;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 6px;
  background: #f7fafc;
  border: 0.5px solid #e2e8f0;
  color: ${({ $color }) => $color || '#2D3748'};
  font-family: 'IBM Plex Mono', monospace;
`;
const StatusPill = styled.span<{ $color: string; $bg: string }>`
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 20px;
  color: ${({ $color }) => $color};
  background: ${({ $bg }) => $bg};
  white-space: nowrap;
  flex-shrink: 0;
`;
const LiveDot = styled.span<{ $ok: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.375rem;
  background: ${({ $ok }) => ($ok ? '#1D9E75' : '#E24B4A')};
  animation: ${pulse} 2s ease infinite;
`;

// ── Expanded panel ───────────────────────────────────────────────────────
const ExpandedPanel = styled.div`
  border-top: 0.5px solid #f0f0f0;
  padding: 1.25rem 1.5rem;
  animation: ${slideDown} 0.2s ease;
`;
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.875rem;
  margin-bottom: 1.25rem;
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;
const FormField = styled.div``;
const FormLabel = styled.p`
  font-size: 0.6875rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.375rem;
`;
const FormValue = styled.p<{ $prefilled?: boolean }>`
  font-size: 0.9375rem;
  font-weight: 500;
  color: #2d3748;
  margin: 0;
  padding: 0.625rem 0.875rem;
  border-radius: 8px;
  border: 0.5px solid ${({ $prefilled }) => ($prefilled ? '#1D9E75' : '#E2E8F0')};
  background: ${({ $prefilled }) => ($prefilled ? '#F0FDF9' : '#F7FAFC')};
  font-family: 'IBM Plex Mono', monospace;
`;
const SectionLabel = styled.p`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #0c2b5e;
  margin: 0 0 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 0.5px solid #f0f0f0;
`;
const AIBox = styled.div`
  background: #f0f7ff;
  border: 1px solid #b5d4f4;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
`;
const DecisionBtns = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 0.875rem;
`;
const DecisionBtn = styled.button<{ $sel: boolean; $v: 'approved' | 'referred' | 'declined' }>`
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border: 2px solid
    ${({ $sel, $v }) =>
      !$sel
        ? '#E2E8F0'
        : $v === 'approved'
          ? '#1D9E75'
          : $v === 'referred'
            ? '#BA7517'
            : '#E24B4A'};
  background: ${({ $sel, $v }) =>
    !$sel ? '#fff' : $v === 'approved' ? '#E1F5EE' : $v === 'referred' ? '#FAEEDA' : '#FCEBEB'};
  color: ${({ $sel, $v }) =>
    !$sel ? '#718096' : $v === 'approved' ? '#0F6E56' : $v === 'referred' ? '#854F0B' : '#A32D2D'};
  &:hover {
    border-color: ${({ $v }) =>
      $v === 'approved' ? '#1D9E75' : $v === 'referred' ? '#BA7517' : '#E24B4A'};
  }
`;
const RationaleArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'IBM Plex Sans', sans-serif;
  resize: vertical;
  margin-bottom: 0.75rem;
  &:focus {
    outline: none;
    border-color: #378add;
    box-shadow: 0 0 0 3px rgba(55, 138, 221, 0.15);
  }
  &::placeholder {
    color: #a0aec0;
  }
`;

const getStatus = (rec?: string): { label: string; color: string; bg: string } => {
  const r = (rec || '').toLowerCase();
  if (r.includes('high confidence'))
    return { label: 'High confidence', color: '#0F6E56', bg: '#E1F5EE' };
  if (r.includes('approv')) return { label: 'Approve candidate', color: '#0F6E56', bg: '#E1F5EE' };
  if (r.includes('declin') || r.includes('reject'))
    return { label: 'Decline', color: '#A32D2D', bg: '#FCEBEB' };
  if (r.includes('borderline')) return { label: 'Borderline', color: '#854F0B', bg: '#FAEEDA' };
  if (r.includes('review') || r.includes('refer'))
    return { label: 'Needs review', color: '#854F0B', bg: '#FAEEDA' };
  return { label: 'Pending analysis', color: '#4A5568', bg: '#EDF2F7' };
};

const fmt = (v: unknown, prefix = '€') => {
  const n = Number(v);
  if (!v || isNaN(n)) return '—';
  return `${prefix}${n.toLocaleString()}`;
};

const QueuePage: React.FC = () => {
  const [decisions, setDecisions] = useState<AIDecisionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiOk, setApiOk] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reports, setReports] = useState<Record<string, AIDecisionResult>>({});
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<'approved' | 'referred' | 'declined' | null>(null);
  const [rationale, setRationale] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      const d = await getDecisions();
      setDecisions(Array.isArray(d) ? d : []);
      setApiOk(true);
    } catch {
      setApiOk(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const expand = async (appId: string) => {
    if (expanded === appId) {
      setExpanded(null);
      return;
    }
    setExpanded(appId);
    setOutcome(null);
    setRationale('');
    // Load full report if not already loaded
    if (!reports[appId]) {
      setLoadingReport(appId);
      try {
        const r = await getReport(appId);
        setReports((p) => ({ ...p, [appId]: r }));
      } catch {
      } finally {
        setLoadingReport(null);
      }
    }
  };

  const handleDecision = async (appId: string) => {
    if (!outcome || rationale.trim().length < 20) return;
    setSubmitting(true);
    try {
      await submitDecision({ applicationId: appId, outcome, rationale, officerName: 'Jane Smith' });
      setSubmitted((p) => [...p, appId]);
      setExpanded(null);
      setOutcome(null);
      setRationale('');
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = decisions.filter((d) => {
    if (filter === 'all') return true;
    const r = (d.recommendation || '').toLowerCase();
    if (filter === 'approve') return r.includes('approv');
    if (filter === 'decline') return r.includes('declin') || r.includes('reject');
    if (filter === 'review') return !r.includes('approv') && !r.includes('declin');
    return true;
  });

  return (
    <PageLayout
      title="HITL Queue"
      notifCount={decisions.length}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '.75rem',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: '1.375rem',
              fontWeight: 700,
              color: '#0C2B5E',
              margin: '0 0 .25rem',
            }}
          >
            HITL Queue
          </h2>
          <span style={{ fontSize: '.8125rem', color: '#718096' }}>
            <LiveDot $ok={apiOk} />
            {loading
              ? 'Loading…'
              : apiOk
                ? `${decisions.length} applications · AI-parsed · live`
                : 'Cannot reach agent'}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { k: 'all', l: `All (${decisions.length})` },
          { k: 'review', l: 'Needs review' },
          { k: 'approve', l: 'Approved' },
          { k: 'decline', l: 'Declined' },
        ].map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            style={{
              padding: '.375rem .875rem',
              borderRadius: '20px',
              fontSize: '.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all .15s',
              border: `.5px solid ${filter === f.k ? '#0C2B5E' : '#E2E8F0'}`,
              background: filter === f.k ? '#0C2B5E' : '#fff',
              color: filter === f.k ? '#fff' : '#718096',
            }}
          >
            {f.l}
          </button>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: '#FAFBFC',
            borderRadius: '12px',
            border: '.5px solid #E2E8F0',
          }}
        >
          <p style={{ fontSize: '2rem', margin: '0 0 .75rem' }}>📭</p>
          <p style={{ fontWeight: 600, color: '#0C2B5E', margin: '0 0 .5rem' }}>Queue is empty</p>
          <p style={{ fontSize: '.875rem', color: '#718096', margin: 0 }}>
            Waiting for borrowers to submit applications
          </p>
        </div>
      )}

      {filtered.map((d) => {
        const appId = String(d.applicationId || d['id'] || '');
        const status = getStatus(d.recommendation as string);
        const isExpanded = expanded === appId;
        const isDone = submitted.includes(appId);
        const report = reports[appId];
        const isLoadingReport = loadingReport === appId;

        return (
          <AppCard
            key={appId}
            $expanded={isExpanded}
          >
            {/* Card header — always visible */}
            <CardTop onClick={() => !isDone && expand(appId)}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <AppTitle>
                  {appId} · {String(d.borrower || d['company'] || 'Pending extraction')}
                </AppTitle>
                <AppMeta>
                  {String(d['sector'] || '—')}
                  {d['requestedAmount']
                    ? ` · Requested €${Number(d['requestedAmount']).toLocaleString()}`
                    : ''}
                </AppMeta>
                <MetricRow>
                  {d.dscr != null && (
                    <MetricTag $color={Number(d.dscr) >= 1.2 ? '#0F6E56' : '#A32D2D'}>
                      DSCR {Number(d.dscr).toFixed(1)}×
                    </MetricTag>
                  )}
                  {d.pd != null && (
                    <MetricTag
                      $color={
                        Number(d.pd) < 5 ? '#0F6E56' : Number(d.pd) < 12 ? '#854F0B' : '#A32D2D'
                      }
                    >
                      PD {Number(d.pd).toFixed(1)}%
                    </MetricTag>
                  )}
                  {d.riskGrade && (
                    <MetricTag
                      $color={
                        String(d.riskGrade).startsWith('A')
                          ? '#0F6E56'
                          : String(d.riskGrade).startsWith('B')
                            ? '#185FA5'
                            : '#854F0B'
                      }
                    >
                      Grade {d.riskGrade}
                    </MetricTag>
                  )}
                  {d.score != null && <MetricTag>Score {d.score}</MetricTag>}
                </MetricRow>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '.5rem',
                }}
              >
                {isDone ? (
                  <StatusPill
                    $color="#0F6E56"
                    $bg="#E1F5EE"
                  >
                    ✓ Decision submitted
                  </StatusPill>
                ) : (
                  <StatusPill
                    $color={status.color}
                    $bg={status.bg}
                  >
                    {status.label}
                  </StatusPill>
                )}
                {!isDone && (
                  <span style={{ fontSize: '.75rem', color: '#1A56A0', fontWeight: 500 }}>
                    {isExpanded ? '▲ Close' : '▼ Review'}
                  </span>
                )}
              </div>
            </CardTop>

            {/* Expanded — AI-parsed form + decision */}
            {isExpanded && !isDone && (
              <ExpandedPanel>
                {isLoadingReport ? (
                  <p
                    style={{
                      fontSize: '.875rem',
                      color: '#718096',
                      textAlign: 'center',
                      padding: '1rem 0',
                    }}
                  >
                    Loading AI analysis…
                  </p>
                ) : (
                  <>
                    {/* AI parsed financial data */}
                    <SectionLabel>
                      AI-extracted financial data
                      <span
                        style={{
                          fontSize: '.75rem',
                          fontWeight: 400,
                          color: '#1D9E75',
                          marginLeft: '.5rem',
                        }}
                      >
                        ✓ parsed from borrower documents
                      </span>
                    </SectionLabel>
                    <FormGrid>
                      {[
                        {
                          label: 'Borrower',
                          value: d.borrower || report?.borrower || d['company'] || '—',
                        },
                        { label: 'Sector', value: d['sector'] || report?.['sector'] || '—' },
                        {
                          label: 'Requested',
                          value: fmt(d['requestedAmount'] || report?.['requestedAmount']),
                        },
                        { label: 'Revenue', value: fmt(d['revenue'] || report?.['revenue']) },
                        { label: 'EBITDA', value: fmt(d['ebitda'] || report?.['ebitda']) },
                        {
                          label: 'DSCR',
                          value:
                            d.dscr != null
                              ? `${Number(d.dscr).toFixed(2)}×`
                              : report?.dscr != null
                                ? `${Number(report.dscr).toFixed(2)}×`
                                : '—',
                        },
                        {
                          label: 'Period',
                          value: String(
                            d['accountingPeriod'] || report?.['accountingPeriod'] || '—'
                          ),
                        },
                        {
                          label: 'Doc type',
                          value: String(d['documentType'] || report?.['documentType'] || '—'),
                        },
                      ].map((f) => (
                        <FormField key={f.label}>
                          <FormLabel>{f.label}</FormLabel>
                          <FormValue $prefilled={f.value !== '—'}>{String(f.value)}</FormValue>
                        </FormField>
                      ))}
                    </FormGrid>

                    {/* AI recommendation */}
                    {(d.reasoning || report?.reasoning) && (
                      <AIBox>
                        <p
                          style={{
                            fontSize: '.8125rem',
                            fontWeight: 600,
                            color: '#0C2B5E',
                            margin: '0 0 .375rem',
                          }}
                        >
                          AI reasoning ·{' '}
                          {String(d['modelVersion'] || report?.modelVersion || 'finpal-agent')}
                        </p>
                        <p
                          style={{
                            fontSize: '.8125rem',
                            color: '#1A56A0',
                            margin: 0,
                            lineHeight: 1.6,
                          }}
                        >
                          {String(d.reasoning || report?.reasoning)}
                        </p>
                      </AIBox>
                    )}

                    {/* SHAP codes */}
                    {(Array.isArray(d.shapCodes) && d.shapCodes.length > 0) ||
                    (Array.isArray(report?.shapCodes) && (report?.shapCodes?.length || 0) > 0) ? (
                      <div style={{ marginBottom: '1rem' }}>
                        <SectionLabel>Reason codes — EU AI Act Art.13</SectionLabel>
                        {(d.shapCodes || report?.shapCodes || [])
                          .slice(0, 5)
                          .map((s: any, i: number) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '.75rem',
                                padding: '.375rem 0',
                                borderBottom: '.5px solid #F5F5F5',
                              }}
                            >
                              <span
                                style={{
                                  color: s.direction === 'positive' ? '#0F6E56' : '#A32D2D',
                                  minWidth: '16px',
                                }}
                              >
                                {s.direction === 'positive' ? '▲' : '▼'}
                              </span>
                              <span style={{ fontSize: '.8125rem', color: '#2D3748', flex: 1 }}>
                                {s.factor}
                              </span>
                              <div
                                style={{
                                  width: '60px',
                                  height: '6px',
                                  borderRadius: '3px',
                                  background: '#F0F0F0',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${Math.min((s.weight || 10) * 3, 100)}%`,
                                    borderRadius: '3px',
                                    background: s.direction === 'positive' ? '#1D9E75' : '#E24B4A',
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontSize: '.75rem',
                                  color: '#718096',
                                  minWidth: '28px',
                                  textAlign: 'right',
                                }}
                              >
                                {s.weight}%
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : null}

                    {/* Make decision */}
                    <SectionLabel>Make decision</SectionLabel>
                    <DecisionBtns>
                      {(['approved', 'referred', 'declined'] as const).map((o) => (
                        <DecisionBtn
                          key={o}
                          $sel={outcome === o}
                          $v={o}
                          onClick={() => setOutcome(o)}
                        >
                          {o === 'approved'
                            ? '✓ Approve'
                            : o === 'referred'
                              ? '→ Refer'
                              : '✗ Decline'}
                        </DecisionBtn>
                      ))}
                    </DecisionBtns>
                    <RationaleArea
                      placeholder="Enter rationale (min 20 characters) — stored immutably per EU AI Act Art.12"
                      value={rationale}
                      onChange={(e) => setRationale(e.target.value)}
                    />
                    {rationale.length > 0 && rationale.trim().length < 20 && (
                      <p
                        style={{ fontSize: '.75rem', color: '#E24B4A', margin: '-.5rem 0 .75rem' }}
                      >
                        {20 - rationale.trim().length} more characters needed
                      </p>
                    )}
                    <Button
                      $variant="primary"
                      $fullWidth
                      $loading={submitting}
                      disabled={!outcome || rationale.trim().length < 20 || submitting}
                      onClick={() => handleDecision(appId)}
                    >
                      {submitting ? 'Submitting…' : `Submit — ${outcome || 'select outcome first'}`}
                    </Button>
                    <p
                      style={{
                        fontSize: '.6875rem',
                        color: '#A0AEC0',
                        margin: '.5rem 0 0',
                        textAlign: 'center',
                      }}
                    >
                      Decision written immutably to audit log · EU AI Act Art.12
                    </p>
                  </>
                )}
              </ExpandedPanel>
            )}
          </AppCard>
        );
      })}
    </PageLayout>
  );
};

export default QueuePage;
