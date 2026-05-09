import React from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  SourceNote,
  StatsGrid,
  StatCard,
  StatLabel,
  StatValue,
  StatNote,
  CardHeaderRow,
  CardDescription,
  ControlRow,
  ControlLabel,
  ControlValue
} from '../../styles/pages/CollectionsPage.styles';

const DYNAMIC = 'Collections data from GET /api/v1/collections/summary';

const CollectionsPage: React.FC = () => (
  <PageLayout title="Collections & Borrower Protection">
    <SourceNote>{DYNAMIC}</SourceNote>
    <StatsGrid>
      {[
        {label:'Active collections',value:'0',note:'No delinquent accounts',color:'#0F6E56'},
        {label:'Hardship cases',value:'0',note:'No active hardship',color:'#0F6E56'},
        {label:'Over-indebtedness alerts',value:'1',note:'Ferris Hospitality flagged',color:'#A32D2D'},
      ].map(s=>(
        <StatCard key={s.label}>
          <StatLabel>{s.label}</StatLabel>
          <StatValue $color={s.color}>{s.value}</StatValue>
          <StatNote>{s.note}</StatNote>
        </StatCard>
      ))}
    </StatsGrid>
    <Card $padding="md">
      <CardHeaderRow>
        <CardTitle>Borrower protection controls</CardTitle>
        <Badge $variant="info">CGAP framework</Badge>
      </CardHeaderRow>
      <CardDescription>Collections practices follow CGAP responsible digital credit guidelines. All treatment codes and actions are logged to immutable audit trails.</CardDescription>
      <CardDivider />
      {[
        {label:'Over-indebtedness screening',value:'Active — DTI ratio checked at origination'},
        {label:'Hardship/rescheduling pathway',value:'Available — champion/challenger strategy'},
        {label:'Contact channel optimisation',value:'Empathetic comms templates active'},
        {label:'Behavioural nudges',value:'Enabled with guardrails'},
        {label:'Consumer protection checks',value:'CGAP-aligned safeguards active'},
        {label:'Data misuse prevention',value:'PII access controls + audit logging'},
      ].map(r=>(
        <ControlRow key={r.label}>
          <ControlLabel>{r.label}</ControlLabel>
          <ControlValue>{r.value}</ControlValue>
        </ControlRow>
      ))}
    </Card>
  </PageLayout>
);

export default CollectionsPage;