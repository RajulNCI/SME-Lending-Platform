import React from 'react';
import styled from 'styled-components';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { flexBetween, bodySm } from '../../styles/mixins';
import dashboardData from '../../data/dashboard.json';

// ── Dynamic placeholder ───────────────────────────────────────────────────────
const DYNAMIC_COMPLIANCE = 'Compliance metrics pulled from GET /api/v1/compliance/summary once reporting API is integrated';
const DYNAMIC_MODEL = 'Model health from GET /api/v1/models/health — PSI and Gini calculated nightly';

const Row = styled.div`
  ${flexBetween}
  padding: 0.625rem 0;
  border-bottom: 0.5px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }
`;

const RowLabel = styled.p`
  ${bodySm}
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const MetricRow = styled.div`
  ${flexBetween}
  padding: 0.5rem 0;
`;

const MetricLabel = styled.p`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0;
`;

const MetricValue = styled.p<{ $ok?: boolean }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $ok, theme }) => $ok ? '#0F6E56' : '#A32D2D'};
  margin: 0;
`;

const PsiBar = styled.div<{ $value: number }>`
  height: 6px;
  background: ${({ theme }) => theme.colors.gray[200]};
  border-radius: 3px;
  margin: 0.375rem 0;
  overflow: hidden;
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $value }) => Math.min($value * 10, 100)}%;
    background: ${({ $value }) => $value < 0.1 ? '#1D9E75' : $value < 0.25 ? '#BA7517' : '#E24B4A'};
    border-radius: 3px;
  }
`;

const SectionNote = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0 0 0.75rem;
  font-style: italic;
`;

const CompliancePanel: React.FC = () => {
  const { complianceStatus, modelHealth } = dashboardData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Compliance status */}
      <Card $padding="md">
        <CardHeader>
          <CardTitle>Regulatory status</CardTitle>
          <Badge $variant="success" $dot>All green</Badge>
        </CardHeader>
        <SectionNote>{DYNAMIC_COMPLIANCE}</SectionNote>
        <CardDivider />
        {complianceStatus.map(item => (
          <Row key={item.id}>
            <RowLabel>{item.label}</RowLabel>
            <Badge $variant={item.status as any}>{item.value}</Badge>
          </Row>
        ))}
      </Card>

      {/* Model health */}
      <Card $padding="md">
        <CardHeader>
          <CardTitle>Model health</CardTitle>
          <Badge $variant="info">{modelHealth.currentVersion}</Badge>
        </CardHeader>
        <SectionNote>{DYNAMIC_MODEL}</SectionNote>
        <CardDivider />

        <MetricRow>
          <MetricLabel>PSI score</MetricLabel>
          <MetricValue $ok={modelHealth.psi < 0.1}>{modelHealth.psi.toFixed(2)}</MetricValue>
        </MetricRow>
        <PsiBar $value={modelHealth.psi} />
        <p style={{ fontSize: '0.6875rem', color: '#718096', margin: '0 0 0.75rem' }}>
          {modelHealth.psiStatus} — threshold 0.10
        </p>

        <MetricRow>
          <MetricLabel>Gini coefficient</MetricLabel>
          <MetricValue $ok={modelHealth.gini > 0.5}>{modelHealth.gini.toFixed(2)}</MetricValue>
        </MetricRow>
        <p style={{ fontSize: '0.6875rem', color: '#718096', margin: '0.25rem 0 0.75rem' }}>
          {modelHealth.giniStatus}
        </p>

        <CardDivider />
        <MetricRow>
          <MetricLabel>Last validated</MetricLabel>
          <span style={{ fontSize: '0.8125rem', color: '#4A5568' }}>{modelHealth.lastValidated}</span>
        </MetricRow>
        <MetricRow>
          <MetricLabel>Next review</MetricLabel>
          <span style={{ fontSize: '0.8125rem', color: '#4A5568' }}>{modelHealth.nextReview}</span>
        </MetricRow>
      </Card>
    </div>
  );
};

export default CompliancePanel;
