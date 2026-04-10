import React from 'react';
import styled from 'styled-components';
import PageLayout from '../../components/layout/PageLayout';
import KpiSection from './KpiSection';
import DecisionFeed from './DecisionFeed';
import CompliancePanel from './CompliancePanel';
import PortfolioSummary from './PortfolioSummary';

// ── Layout primitives (layout-only, no style duplication) ────────────────────
const SectionTitle = styled.h2`
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.875rem;
`;

const Section = styled.section`
  margin-bottom: 1.75rem;
`;

// Two-column layout: main content + right rail
const BodyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 320px;
  }
`;

const MainCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
`;

const RailCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// ── Dashboard page ─────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => (
  <PageLayout
    title="Dashboard"
    breadcrumb="SME Lending Platform"
    notifCount={2}
    userName="Jane Smith"
    userRole="Credit Officer"
  >
    {/* KPIs */}
    <Section>
      <SectionTitle>Platform KPIs — April 2026</SectionTitle>
      <KpiSection />
    </Section>

    {/* Main body */}
    <BodyGrid>
      <MainCol>
        <Section style={{ marginBottom: 0 }}>
          <SectionTitle>Recent credit decisions</SectionTitle>
          <DecisionFeed />
        </Section>

        <Section style={{ marginBottom: 0 }}>
          <SectionTitle>Loan portfolio — IFRS 9</SectionTitle>
          <PortfolioSummary />
        </Section>
      </MainCol>

      <RailCol>
        <Section style={{ marginBottom: 0 }}>
          <SectionTitle>Compliance & model</SectionTitle>
          <CompliancePanel />
        </Section>
      </RailCol>
    </BodyGrid>
  </PageLayout>
);

export default Dashboard;
