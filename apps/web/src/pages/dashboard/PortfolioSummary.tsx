import React from 'react';
import styled from 'styled-components';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { StageBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { flexBetween, flexRow } from '../../styles/mixins';
import dashboardData from '../../data/dashboard.json';

// ── Dynamic placeholder ───────────────────────────────────────────────────────
const DYNAMIC_PORTFOLIO = 'Portfolio totals from GET /api/v1/portfolio/summary — refreshed nightly via IFRS 9 impairment run';

const StageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin: 0.75rem 0;
`;

const StageCell = styled.div<{ $stage: 1|2|3 }>`
  background: ${({ $stage }) =>
    $stage === 1 ? '#E1F5EE' :
    $stage === 2 ? '#FAEEDA' : '#FCEBEB'};
  border-radius: 10px;
  padding: 0.875rem;
  text-align: center;
`;

const StageCount = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary[800]};
`;

const StageLabel = styled.div`
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 0.25rem;
`;

const TotalRow = styled.div`
  ${flexBetween}
  padding: 0.5rem 0;
`;

const TotalLabel = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const TotalValue = styled.p`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary[800]};
  margin: 0;
`;

const SectionNote = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0 0 0.75rem;
  font-style: italic;
`;

const PortfolioSummary: React.FC = () => {
  const p = dashboardData.portfolioSummary;

  return (
    <Card $padding="md">
      <CardHeader>
        <div>
          <CardTitle>Loan portfolio</CardTitle>
          <p style={{ fontSize: '0.8125rem', color: '#718096', margin: '0.25rem 0 0' }}>
            IFRS 9 staging overview
          </p>
        </div>
        <Button $variant="secondary" $size="sm">View portfolio</Button>
      </CardHeader>

      <SectionNote>{DYNAMIC_PORTFOLIO}</SectionNote>
      <CardDivider />

      <StageGrid>
        <StageCell $stage={1}>
          <StageCount>{p.stage1Count}</StageCount>
          <StageLabel>Stage 1</StageLabel>
          <StageBadge $variant="neutral" $stage={1} $size="sm" style={{ marginTop: '0.375rem' }}>
            Performing
          </StageBadge>
        </StageCell>
        <StageCell $stage={2}>
          <StageCount>{p.stage2Count}</StageCount>
          <StageLabel>Stage 2</StageLabel>
          <StageBadge $variant="neutral" $stage={2} $size="sm" style={{ marginTop: '0.375rem' }}>
            Watch
          </StageBadge>
        </StageCell>
        <StageCell $stage={3}>
          <StageCount>{p.stage3Count}</StageCount>
          <StageLabel>Stage 3</StageLabel>
          <StageBadge $variant="neutral" $stage={3} $size="sm" style={{ marginTop: '0.375rem' }}>
            Impaired
          </StageBadge>
        </StageCell>
      </StageGrid>

      <CardDivider />

      <TotalRow>
        <TotalLabel>Total active loans</TotalLabel>
        <TotalValue>{p.activeLoans}</TotalValue>
      </TotalRow>
      <TotalRow>
        <TotalLabel>Total exposure</TotalLabel>
        <TotalValue>{p.totalExposure}</TotalValue>
      </TotalRow>
      <TotalRow>
        <TotalLabel>ECL provision</TotalLabel>
        <TotalValue style={{ color: '#A32D2D' }}>{p.eclTotal}</TotalValue>
      </TotalRow>
    </Card>
  );
};

export default PortfolioSummary;
