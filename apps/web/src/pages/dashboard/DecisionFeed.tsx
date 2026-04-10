import React from 'react';
import styled from 'styled-components';
import { Card, CardHeader, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge, StageBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TableWrapper, Table, Thead, Th, Tbody, Tr, Td, TdMuted } from '../../components/ui/Table';
import { bodySm } from '../../styles/mixins';
import dashboardData from '../../data/dashboard.json';

// ── Dynamic placeholder ───────────────────────────────────────────────────────
const DYNAMIC_DECISIONS = 'Decisions will stream in real time via GET /api/v1/decisions?limit=10&sort=desc once the decisioning API is integrated';

const ScoreBar = styled.div<{ $score: number }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ScoreFill = styled.div<{ $score: number }>`
  height: 4px;
  width: 60px;
  background: ${({ theme }) => theme.colors.gray[200]};
  border-radius: 2px;
  overflow: hidden;
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $score }) => $score}%;
    background: ${({ $score }) =>
      $score >= 70 ? '#1D9E75' :
      $score >= 50 ? '#BA7517' : '#E24B4A'};
    border-radius: 2px;
  }
`;

const ScoreText = styled.span`
  ${bodySm}
  font-weight: 500;
`;

const CompanyCell = styled.div``;
const CompanyName = styled.p`
  ${bodySm}
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;
const DecisionId = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0;
`;

const ModelVersion = styled.span`
  font-size: 0.75rem;
  font-family: 'IBM Plex Mono', monospace;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const DecisionFeed: React.FC = () => {
  const decisions = dashboardData.recentDecisions;

  return (
    <Card $padding="md">
      <CardHeader>
        <div>
          <CardTitle>Recent decisions</CardTitle>
          <p style={{ fontSize: '0.8125rem', color: '#718096', margin: '0.25rem 0 0' }}>
            {DYNAMIC_DECISIONS}
          </p>
        </div>
        <Button $variant="secondary" $size="sm">View all</Button>
      </CardHeader>
      <CardDivider />
      <TableWrapper>
        <Table>
          <Thead>
            <tr>
              <Th>Company</Th>
              <Th>Amount</Th>
              <Th>Score</Th>
              <Th>Decision</Th>
              <Th>IFRS Stage</Th>
              <Th>Latency</Th>
              <Th>Model</Th>
            </tr>
          </Thead>
          <Tbody>
            {decisions.map(d => (
              <Tr key={d.id}>
                <Td>
                  <CompanyCell>
                    <CompanyName>{d.company}</CompanyName>
                    <DecisionId>{d.id}</DecisionId>
                  </CompanyCell>
                </Td>
                <Td style={{ fontWeight: 500 }}>{d.amount}</Td>
                <Td>
                  <ScoreBar $score={d.score}>
                    <ScoreFill $score={d.score} />
                    <ScoreText>{d.score}</ScoreText>
                  </ScoreBar>
                </Td>
                <Td>
                  <Badge $variant={d.decisionVariant as any} $dot>
                    {d.decision}
                  </Badge>
                </Td>
                <Td>
                  <StageBadge $variant="neutral" $stage={d.stage as 1|2|3}>
                    Stage {d.stage}
                  </StageBadge>
                </Td>
                <TdMuted>{d.latency}</TdMuted>
                <Td><ModelVersion>{d.modelVersion}</ModelVersion></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableWrapper>
    </Card>
  );
};

export default DecisionFeed;
