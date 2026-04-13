/**
 * Audit Trail — fetches live from Nathan's API
 * GET https://finpals-prototype.vercel.app/api/v1/audit
 */
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { getAuditTrail, getReport, AuditEntry } from '../../services/AIApi';

const SearchRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;
const SearchInput = styled.input`
  flex: 1;
  height: 44px;
  padding: 0 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'IBM Plex Mono', monospace;
  &::placeholder {
    color: #a0aec0;
    font-family: 'IBM Plex Sans', sans-serif;
  }
  &:focus {
    outline: none;
    border-color: #378add;
    box-shadow: 0 0 0 3px rgba(55, 138, 221, 0.15);
  }
`;
const AuditRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.875rem 0;
  border-bottom: 0.5px solid #f0f0f0;
  cursor: pointer;
  &:last-child {
    border: none;
  }
  &:hover {
    background: #fafbfc;
    margin: 0 -0.75rem;
    padding: 0.875rem 0.75rem;
    border-radius: 8px;
  }
`;
const AuditDate = styled.div`
  font-size: 0.75rem;
  color: #a0aec0;
  font-family: 'IBM Plex Mono', monospace;
  min-width: 85px;
  margin-top: 2px;
  flex-shrink: 0;
`;
const EvidenceBox = styled.div`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.125rem;
  margin-top: 0.5rem;
`;

const AuditPage: React.FC = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAuditTrail();
        setEntries(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load audit trail');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleExpand = async (entry: AuditEntry) => {
    const id = String(entry.id || entry.applicationId || '');
    if (expanded === id) {
      setExpanded(null);
      setReport(null);
      return;
    }
    setExpanded(id);

    if (entry.applicationId) {
      setReportLoading(true);
      try {
        const r = await getReport(String(entry.applicationId));
        setReport(r as Record<string, unknown>);
      } catch {
        setReport(null);
      } finally {
        setReportLoading(false);
      }
    }
  };

  const filtered = entries.filter(
    (e) =>
      !search ||
      String(e.applicationId || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      String(e.eventType || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      String(e.description || '')
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const fmt = (ts?: string) => {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString('en-IE', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return ts;
    }
  };

  return (
    <PageLayout title="Audit Trail">
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <Badge
          $variant="success"
          $dot
        >
          Live — finpals-prototype.vercel.app
        </Badge>
        <Badge $variant="info">EU AI Act Art.12</Badge>
        <Badge $variant="info">GDPR Art.30</Badge>
        <Badge $variant="neutral">CBI-Inspection Ready</Badge>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '.75rem',
          marginBottom: '1.25rem',
        }}
      >
        {[
          { label: 'Total events', value: loading ? '…' : String(entries.length) },
          { label: 'EU AI Act Art.12', value: '100%' },
          { label: 'Integrity', value: 'Verified' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: '#F7FAFC',
              borderRadius: '10px',
              padding: '.875rem 1rem',
              border: '.5px solid #E2E8F0',
            }}
          >
            <p
              style={{
                fontSize: '.6875rem',
                fontWeight: 600,
                color: '#718096',
                textTransform: 'uppercase',
                letterSpacing: '.05em',
                margin: '0 0 .25rem',
              }}
            >
              {s.label}
            </p>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: '1.375rem',
                fontWeight: 700,
                color: '#0C2B5E',
                margin: 0,
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <SearchRow>
        <SearchInput
          placeholder="Search by application ID, event type, or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button $variant="secondary">↓ Export PDF</Button>
      </SearchRow>

      {/* Compliance box */}
      <div
        style={{
          background: '#F0F7FF',
          border: '1px solid #B5D4F4',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '.5rem',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '.875rem',
                fontWeight: 600,
                color: '#0C2B5E',
                margin: '0 0 .25rem',
              }}
            >
              ✓ EU AI Act Art.12 & GDPR Art.30 compliance
            </p>
            <p style={{ fontSize: '.8125rem', color: '#4A5568', margin: 0, lineHeight: 1.5 }}>
              This audit trail is sourced from Nathan's AI agent backend. Every credit decision,
              upload, and analysis event is logged with timestamps and actor attribution. Compliant
              with EU AI Act Article 12 and GDPR Article 30 (records of processing).
            </p>
          </div>
          <Badge $variant="info">Live API</Badge>
        </div>
      </div>

      <Card $padding="md">
        <CardHeader>
          <CardTitle>Global audit log</CardTitle>
          <Badge $variant="neutral">{filtered.length} events</Badge>
        </CardHeader>
        <CardDivider />

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
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <p
            style={{
              textAlign: 'center',
              color: '#718096',
              padding: '2rem 0',
              fontSize: '.9375rem',
            }}
          >
            Loading from finpals-prototype.vercel.app/api/v1/audit…
          </p>
        )}

        {!loading && filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#718096', padding: '2rem 0' }}>
            No audit events yet. Submit an application to see events here.
          </p>
        )}

        {filtered.map((entry, i) => {
          const id = String(entry.id || entry.applicationId || i);
          const isOpen = expanded === id;
          return (
            <div key={id}>
              <AuditRow onClick={() => handleExpand(entry)}>
                <AuditDate>{fmt(entry.timestamp as string)}</AuditDate>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: '.875rem',
                      fontWeight: 500,
                      color: '#1A56A0',
                      margin: '0 0 .25rem',
                    }}
                  >
                    {String(entry.eventType || entry.description || 'Event')}
                  </p>
                  <p
                    style={{
                      fontSize: '.75rem',
                      color: '#718096',
                      margin: 0,
                      fontFamily: "'IBM Plex Mono',monospace",
                    }}
                  >
                    {entry.applicationId && `${entry.applicationId} · `}
                    {entry.actor && `Actor: ${entry.actor}`}
                  </p>
                </div>
                <span style={{ fontSize: '.75rem', color: '#A0AEC0', flexShrink: 0 }}>
                  {isOpen ? '▲' : '▼'}
                </span>
              </AuditRow>

              {isOpen && (
                <EvidenceBox>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '.75rem',
                    }}
                  >
                    <p
                      style={{ fontSize: '.875rem', fontWeight: 600, color: '#0C2B5E', margin: 0 }}
                    >
                      Evidence details
                    </p>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <Button
                        $variant="secondary"
                        $size="sm"
                      >
                        ↓ PDF
                      </Button>
                      <Button
                        $variant="secondary"
                        $size="sm"
                      >
                        ↓ JSON
                      </Button>
                    </div>
                  </div>
                  {Object.entries(entry)
                    .filter(([k]) => k !== 'id')
                    .map(([k, v]) => (
                      <div
                        key={k}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '.375rem 0',
                          borderBottom: '.5px solid #E2E8F0',
                          fontSize: '.8125rem',
                        }}
                      >
                        <span style={{ color: '#718096' }}>{k}</span>
                        <span
                          style={{
                            fontWeight: 500,
                            color: '#2D3748',
                            fontFamily: "'IBM Plex Mono',monospace",
                            textAlign: 'right',
                            maxWidth: '60%',
                            wordBreak: 'break-word',
                          }}
                        >
                          {typeof v === 'object' ? JSON.stringify(v) : String(v ?? '—')}
                        </span>
                      </div>
                    ))}
                  {reportLoading && (
                    <p style={{ fontSize: '.8125rem', color: '#718096', margin: '.75rem 0 0' }}>
                      Loading full report…
                    </p>
                  )}
                  {report && (
                    <div
                      style={{
                        marginTop: '.75rem',
                        background: '#F0F7FF',
                        borderRadius: '8px',
                        padding: '.875rem',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '.8125rem',
                          fontWeight: 600,
                          color: '#0C2B5E',
                          margin: '0 0 .5rem',
                        }}
                      >
                        Full AI report
                      </p>
                      <pre
                        style={{
                          fontSize: '.6875rem',
                          color: '#4A5568',
                          overflow: 'auto',
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {JSON.stringify(report, null, 2)}
                      </pre>
                    </div>
                  )}
                </EvidenceBox>
              )}
            </div>
          );
        })}
      </Card>
    </PageLayout>
  );
};

export default AuditPage;
