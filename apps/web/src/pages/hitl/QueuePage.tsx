/**
 * HITL Queue — fetches live decisions from Nathan's API
 * GET https://finpals-prototype.vercel.app/api/v1/decisions
 */
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge, StageBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TableWrapper, Table, Thead, Th, Tbody, Tr, Td, TdMuted } from '../../components/ui/Table';
import { getDecisions, submitDecision, AIDecisionResult } from '../../services/AIApi';
import { useAuth } from '../../context/AuthContext';

const StatusDot = styled.span<{ $ok: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $ok }) => ($ok ? '#1D9E75' : '#E24B4A')};
  margin-right: 0.375rem;
`;

const DecisionModal = styled.div`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  margin-top: 0.75rem;
`;
const DecisionBtns = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 0.875rem;
`;
const DecisionBtn = styled.button<{ $sel: boolean; $v: 'approved' | 'referred' | 'declined' }>`
  padding: 0.625rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
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
  cursor: pointer;
  transition: all 0.15s;
`;
const RationaleArea = styled.textarea`
  width: 100%;
  min-height: 70px;
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

const ShapBar = styled.div<{ $w: number; $pos: boolean }>`
  height: 6px;
  border-radius: 3px;
  width: ${({ $w }) => $w * 3}%;
  background: ${({ $pos }) => ($pos ? '#1D9E75' : '#E24B4A')};
`;

const QueuePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [decisions, setDecisions] = useState<AIDecisionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [decisionOutcome, setDecisionOutcome] = useState<
    'approved' | 'referred' | 'declined' | null
  >(null);
  const [rationale, setRationale] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDecisions();
        setDecisions(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load decisions');
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleDecisionSubmit = async (appId: string) => {
    if (!decisionOutcome || rationale.trim().length < 20) return;
    setSubmitting(true);
    try {
      await submitDecision({
        applicationId: appId,
        outcome: decisionOutcome,
        rationale,
        officerName: user?.displayName || 'Credit Officer',
      });
      setSubmitted((p) => [...p, appId]);
      setSelected(null);
      setDecisionOutcome(null);
      setRationale('');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Decision submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getVariant = (rec?: string) => {
    if (!rec) return 'neutral';
    const r = rec.toLowerCase();
    if (r.includes('approve')) return 'success';
    if (r.includes('decline') || r.includes('reject')) return 'error';
    if (r.includes('refer') || r.includes('review')) return 'warning';
    return 'info';
  };

  return (
    <PageLayout
      title="HITL Queue"
      notifCount={decisions.length}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <StatusDot $ok={!error} />
          <span style={{ fontSize: '.8125rem', color: '#718096' }}>
            {loading
              ? "Loading from Nathan's API…"
              : error
                ? `Error: ${error}`
                : `${decisions.length} decisions from finpals-prototype.vercel.app`}
          </span>
        </div>
        <Button
          $variant="primary"
          $size="sm"
          onClick={() => navigate('/applications/new')}
        >
          + New application
        </Button>
      </div>

      {error && (
        <div
          style={{
            background: '#FFF5F5',
            border: '1px solid #FED7D7',
            borderRadius: '8px',
            padding: '.75rem 1rem',
            fontSize: '.875rem',
            color: '#C53030',
            marginBottom: '1rem',
          }}
        >
          ⚠️ Could not reach Nathan's API: {error}
        </div>
      )}

      <Card $padding="sm">
        <CardHeader>
          <CardTitle>AI credit decisions</CardTitle>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <Badge $variant="info">{decisions.length} total</Badge>
            {loading && <Badge $variant="neutral">Loading…</Badge>}
          </div>
        </CardHeader>
        <CardDivider />

        {decisions.length === 0 && !loading && (
          <div
            style={{ textAlign: 'center', padding: '2rem', color: '#718096', fontSize: '.9375rem' }}
          >
            <p style={{ marginBottom: '.75rem' }}>No decisions yet.</p>
            <Button
              $variant="primary"
              onClick={() => navigate('/applications/new')}
            >
              Submit first application →
            </Button>
          </div>
        )}

        {decisions.length > 0 && (
          <TableWrapper>
            <Table>
              <Thead>
                <tr>
                  <Th>Application ID</Th>
                  <Th>Company</Th>
                  <Th>AI recommendation</Th>
                  <Th>Score</Th>
                  <Th>Grade</Th>
                  <Th>Action</Th>
                </tr>
              </Thead>
              <Tbody>
                {decisions.map((d, i) => {
                  const appId = d.applicationId || `APP-${i}`;
                  const isDone = submitted.includes(appId);
                  return (
                    <React.Fragment key={appId}>
                      <Tr>
                        <Td
                          style={{
                            fontFamily: "'IBM Plex Mono',monospace",
                            fontSize: '.8125rem',
                            color: '#1A56A0',
                          }}
                        >
                          {appId}
                        </Td>
                        <Td style={{ fontWeight: 500 }}>
                          {String(d.borrower || d['company'] || '—')}
                        </Td>
                        <Td>
                          <Badge
                            $variant={getVariant(d.recommendation) as any}
                            $dot
                          >
                            {d.recommendation || 'Pending'}
                          </Badge>
                        </Td>
                        <Td style={{ fontWeight: 500 }}>{d.score != null ? `${d.score}` : '—'}</Td>
                        <Td style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>
                          {d.riskGrade || '—'}
                        </Td>
                        <Td>
                          {isDone ? (
                            <Badge
                              $variant="success"
                              $size="sm"
                            >
                              Decision submitted
                            </Badge>
                          ) : (
                            <Button
                              $variant={selected === appId ? 'primary' : 'secondary'}
                              $size="sm"
                              onClick={() => setSelected(selected === appId ? null : appId)}
                            >
                              {selected === appId ? 'Close' : 'Review →'}
                            </Button>
                          )}
                        </Td>
                      </Tr>

                      {/* Expanded review panel */}
                      {selected === appId && (
                        <Tr>
                          <Td
                            colSpan={6}
                            style={{ padding: 0, background: '#FAFBFC' }}
                          >
                            <div style={{ padding: '1rem' }}>
                              {/* AI reasoning */}
                              {d.reasoning && (
                                <div
                                  style={{
                                    background: '#F0F7FF',
                                    border: '1px solid #B5D4F4',
                                    borderRadius: '8px',
                                    padding: '.875rem',
                                    marginBottom: '.875rem',
                                    fontSize: '.8125rem',
                                    color: '#1A56A0',
                                  }}
                                >
                                  <p
                                    style={{
                                      fontWeight: 600,
                                      margin: '0 0 .375rem',
                                      color: '#0C2B5E',
                                    }}
                                  >
                                    AI reasoning
                                  </p>
                                  <p style={{ margin: 0, lineHeight: 1.6 }}>
                                    {String(d.reasoning)}
                                  </p>
                                </div>
                              )}

                              {/* SHAP codes */}
                              {Array.isArray(d.shapCodes) && d.shapCodes.length > 0 && (
                                <div style={{ marginBottom: '.875rem' }}>
                                  <p
                                    style={{
                                      fontSize: '.75rem',
                                      fontWeight: 600,
                                      color: '#718096',
                                      textTransform: 'uppercase',
                                      letterSpacing: '.06em',
                                      margin: '0 0 .5rem',
                                    }}
                                  >
                                    SHAP reason codes — EU AI Act Art.13
                                  </p>
                                  {d.shapCodes.map((s: any, idx: number) => (
                                    <div
                                      key={idx}
                                      style={{
                                        padding: '.5rem 0',
                                        borderBottom: '.5px solid #F0F0F0',
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '.75rem',
                                          marginBottom: '.25rem',
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: '.875rem',
                                            fontWeight: 500,
                                            color:
                                              s.direction === 'positive' ? '#0F6E56' : '#A32D2D',
                                          }}
                                        >
                                          {s.direction === 'positive' ? '▲' : '▼'} {s.factor}
                                        </span>
                                        <ShapBar
                                          $w={s.weight || 10}
                                          $pos={s.direction === 'positive'}
                                        />
                                        <span style={{ fontSize: '.75rem', color: '#718096' }}>
                                          {s.weight}%
                                        </span>
                                      </div>
                                      {s.note && (
                                        <p
                                          style={{
                                            fontSize: '.75rem',
                                            color: '#718096',
                                            margin: '0 0 0 1.25rem',
                                          }}
                                        >
                                          {s.note}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Make decision */}
                              <DecisionModal>
                                <p
                                  style={{
                                    fontSize: '.875rem',
                                    fontWeight: 600,
                                    color: '#0C2B5E',
                                    margin: '0 0 .75rem',
                                  }}
                                >
                                  Make decision — {appId}
                                </p>
                                <DecisionBtns>
                                  {(['approved', 'referred', 'declined'] as const).map((o) => (
                                    <DecisionBtn
                                      key={o}
                                      $sel={decisionOutcome === o}
                                      $v={o}
                                      onClick={() => setDecisionOutcome(o)}
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
                                  placeholder="Enter mandatory rationale (min 20 characters). Stored immutably per EU AI Act Art.12."
                                  value={rationale}
                                  onChange={(e) => setRationale(e.target.value)}
                                />
                                <Button
                                  $variant="primary"
                                  $fullWidth
                                  $loading={submitting}
                                  disabled={
                                    !decisionOutcome || rationale.trim().length < 20 || submitting
                                  }
                                  onClick={() => handleDecisionSubmit(appId)}
                                >
                                  {submitting
                                    ? 'Submitting…'
                                    : `Submit: ${decisionOutcome || 'select outcome first'}`}
                                </Button>
                                <p
                                  style={{
                                    fontSize: '.6875rem',
                                    color: '#A0AEC0',
                                    margin: '.5rem 0 0',
                                    textAlign: 'center',
                                  }}
                                >
                                  ⚠ Decision written immutably to Nathan's audit log
                                </p>
                              </DecisionModal>
                            </div>
                          </Td>
                        </Tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </Tbody>
            </Table>
          </TableWrapper>
        )}
      </Card>
    </PageLayout>
  );
};

export default QueuePage;
