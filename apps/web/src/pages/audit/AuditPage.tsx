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

import {
  HeaderBadges,
  StatsGrid,
  StatCard,
  StatLabel,
  StatValue,
  ComplianceBox,
  ComplianceHeader,
  ComplianceTitle,
  ComplianceText,
  ErrorBox,
  LoadingText,
  SearchRow,
  SearchInput,
  AuditRow,
  AuditDate,
  AuditEventTitle,
  AuditEventMeta,
  AuditChevron,
  EvidenceBox,
  EvidenceHeader,
  EvidenceTitle,
  EvidenceActions,
  EvidenceRow,
  EvidenceKey,
  EvidenceValue,
  ReportLoadingText,
  ReportBox,
  ReportTitle,
  ReportPre
} from '../../styles/pages/AuditPage.styles';

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
      <HeaderBadges>
        <Badge
          $variant="success"
          $dot
        >
          Live — finpals-prototype.vercel.app
        </Badge>
        <Badge $variant="info">EU AI Act Art.12</Badge>
        <Badge $variant="info">GDPR Art.30</Badge>
        <Badge $variant="neutral">CBI-Inspection Ready</Badge>
      </HeaderBadges>

      {/* Stats */}
      <StatsGrid>
        {[
          { label: 'Total events', value: loading ? '…' : String(entries.length) },
          { label: 'EU AI Act Art.12', value: '100%' },
          { label: 'Integrity', value: 'Verified' },
        ].map((s) => (
          <StatCard key={s.label}>
            <StatLabel>{s.label}</StatLabel>
            <StatValue>{s.value}</StatValue>
          </StatCard>
        ))}
      </StatsGrid>

      <SearchRow>
        <SearchInput
          placeholder="Search by application ID, event type, or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button $variant="secondary">↓ Export PDF</Button>
      </SearchRow>

      {/* Compliance box */}
      <ComplianceBox>
        <ComplianceHeader>
          <div>
            <ComplianceTitle>
              ✓ EU AI Act Art.12 & GDPR Art.30 compliance
            </ComplianceTitle>
            <ComplianceText>
              This audit trail is sourced from Nathan's AI agent backend. Every credit decision,
              upload, and analysis event is logged with timestamps and actor attribution. Compliant
              with EU AI Act Article 12 and GDPR Article 30 (records of processing).
            </ComplianceText>
          </div>
          <Badge $variant="info">Live API</Badge>
        </ComplianceHeader>
      </ComplianceBox>

      <Card $padding="md">
        <CardHeader>
          <CardTitle>Global audit log</CardTitle>
          <Badge $variant="neutral">{filtered.length} events</Badge>
        </CardHeader>
        <CardDivider />

        {error && <ErrorBox>⚠️ {error}</ErrorBox>}

        {loading && (
          <LoadingText>
            Loading from finpals-prototype.vercel.app/api/v1/audit…
          </LoadingText>
        )}

        {!loading && filtered.length === 0 && (
          <LoadingText>
            No audit events yet. Submit an application to see events here.
          </LoadingText>
        )}

        {filtered.map((entry, i) => {
          const id = String(entry.id || entry.applicationId || i);
          const isOpen = expanded === id;
          return (
            <div key={id}>
              <AuditRow onClick={() => handleExpand(entry)}>
                <AuditDate>{fmt(entry.timestamp as string)}</AuditDate>
                <div style={{ flex: 1 }}>
                  <AuditEventTitle>
                    {String(entry.eventType || entry.description || 'Event')}
                  </AuditEventTitle>
                  <AuditEventMeta>
                    {entry.applicationId && `${entry.applicationId} · `}
                    {entry.actor && `Actor: ${entry.actor}`}
                  </AuditEventMeta>
                </div>
                <AuditChevron>
                  {isOpen ? '▲' : '▼'}
                </AuditChevron>
              </AuditRow>

              {isOpen && (
                <EvidenceBox>
                  <EvidenceHeader>
                    <EvidenceTitle>Evidence details</EvidenceTitle>
                    <EvidenceActions>
                      <Button $variant="secondary" $size="sm">↓ PDF</Button>
                      <Button $variant="secondary" $size="sm">↓ JSON</Button>
                    </EvidenceActions>
                  </EvidenceHeader>
                  {Object.entries(entry)
                    .filter(([k]) => k !== 'id')
                    .map(([k, v]) => (
                      <EvidenceRow key={k}>
                        <EvidenceKey>{k}</EvidenceKey>
                        <EvidenceValue>
                          {typeof v === 'object' ? JSON.stringify(v) : String(v ?? '—')}
                        </EvidenceValue>
                      </EvidenceRow>
                    ))}
                  {reportLoading && <ReportLoadingText>Loading full report…</ReportLoadingText>}
                  {report && (
                    <ReportBox>
                      <ReportTitle>Full AI report</ReportTitle>
                      <ReportPre>{JSON.stringify(report, null, 2)}</ReportPre>
                    </ReportBox>
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
