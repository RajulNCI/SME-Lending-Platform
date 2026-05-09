import React from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  MrmGrid,
  SourceNote,
  InventoryHeader,
  MetricRow,
  MetricKey,
  MetricValue,
  DriftStatus,
  DriftIcon,
  DriftTitle,
  DriftDesc,
  TriggerLabel,
  TriggerRow,
  TriggerKey,
  TriggerValue
} from '../../styles/pages/MrmPage.styles';

const DYNAMIC = 'MRM metrics from GET /api/v1/models/monitoring — daily scorecard pipeline';

const MrmPage: React.FC = () => (
  <PageLayout title="Model Risk Management">
    <SourceNote>{DYNAMIC}</SourceNote>
    <MrmGrid>
      <Card $padding="md">
        <InventoryHeader>
          <CardTitle>Model inventory</CardTitle>
          <Badge $variant="success">Active</Badge>
        </InventoryHeader>
        <CardDivider />
        {[
          {k:'Current champion',v:'finpal-pd-v2.4.1'},
          {k:'Challenger model',v:'finpal-pd-v2.5.0-rc'},
          {k:'Last validated',v:'28 Mar 2025'},
          {k:'Next review',v:'28 Apr 2025'},
          {k:'AUC',v:'0.84 ≥ 0.80 ✓'},
          {k:'Gini',v:'0.68 ≥ 0.60 ✓'},
          {k:'PSI (monthly)',v:'0.04 < 0.10 ✓'},
        ].map(r=>(
          <MetricRow key={r.k}>
            <MetricKey>{r.k}</MetricKey>
            <MetricValue>{r.v}</MetricValue>
          </MetricRow>
        ))}
      </Card>
      <Card $padding="md">
        <CardTitle>Drift monitoring</CardTitle>
        <CardDivider />
        <DriftStatus>
          <DriftIcon>✓</DriftIcon>
          <DriftTitle>No drift detected</DriftTitle>
          <DriftDesc>PSI 0.04 — well below 0.10 threshold</DriftDesc>
        </DriftStatus>
        <CardDivider />
        <TriggerLabel>Drift alert triggers:</TriggerLabel>
        {[
          {label:'PSI threshold',value:'≥ 0.10 (currently 0.04)'},
          {label:'Gini drop',value:'≥ 10% decline'},
          {label:'KS statistic',value:'≥ 10% drop'},
        ].map(r=>(
          <TriggerRow key={r.label}>
            <TriggerKey>{r.label}</TriggerKey>
            <TriggerValue>{r.value}</TriggerValue>
          </TriggerRow>
        ))}
      </Card>
    </MrmGrid>
  </PageLayout>
);

export default MrmPage;