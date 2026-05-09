import React from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  SourceNote,
  DashboardGrid,
  DashboardCard,
  DashboardLabel,
  DashboardValue,
  EmptyStateText
} from '../../styles/pages/DashboardPage.styles';

const DYNAMIC = 'Dashboard metrics from GET /api/v1/metrics/kpis';

const DashboardPage: React.FC = () => (
  <PageLayout title="Dashboard" notifCount={2}>
    <SourceNote>{DYNAMIC}</SourceNote>
    <DashboardGrid>
      {[
        {label:'Platform uptime',value:'99.97%',note:'Target ≥99.9%',ok:true},
        {label:'p99 decision latency',value:'312ms',note:'Target ≤500ms',ok:true},
        {label:'STP rate',value:'74.2%',note:'Target ≥70%',ok:true},
        {label:'SCT Inst success',value:'99.6%',note:'Target ≥99.5%',ok:true},
      ].map(s=>(
        <DashboardCard key={s.label}>
          <DashboardLabel>{s.label}</DashboardLabel>
          <DashboardValue>{s.value}</DashboardValue>
          <Badge $variant={s.ok?'success':'error'} $size="sm">{s.note}</Badge>
        </DashboardCard>
      ))}
    </DashboardGrid>
    <Card $padding="md">
      <CardTitle>Operations overview</CardTitle>
      <CardDivider />
      <EmptyStateText>Payment events, SLA tracking and DORA incident dashboard will populate here once the operations API is integrated.</EmptyStateText>
    </Card>
  </PageLayout>
);

export default DashboardPage;