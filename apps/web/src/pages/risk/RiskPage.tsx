import React from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { 
  RiskGrid, 
  SourceNote, 
  MetricRow, 
  MetricLabel, 
  MetricValueGroup, 
  MetricValue 
} from '../../styles/pages/RiskPage.styles';

const DYNAMIC_MODEL = 'Model metrics from GET /api/v1/models/health — PSI/Gini calculated nightly';
const DYNAMIC_STRESS = 'Stress test results from GET /api/v1/stress-tests/latest';

const RiskPage: React.FC = () => (
  <PageLayout title="Risk Management" notifCount={1}>
    <RiskGrid>
      <Card $padding="md">
        <CardTitle>Model health</CardTitle>
        <CardDivider />
        <SourceNote>{DYNAMIC_MODEL}</SourceNote>
        {[
          {label:'PSI score',value:'0.04',ok:true,note:'Stable — threshold 0.10'},
          {label:'Gini coefficient',value:'0.68',ok:true,note:'Above threshold 0.60'},
          {label:'AUC score',value:'0.84',ok:true,note:'Above threshold 0.80'},
          {label:'Model version',value:'v2.4.1',ok:true,note:'Validated 28 Mar 2025'},
        ].map(r=>(
          <MetricRow key={r.label}>
            <MetricLabel>{r.label}</MetricLabel>
            <MetricValueGroup>
              <MetricValue>{r.value}</MetricValue>
              <Badge $variant={r.ok?'success':'error'} $size="sm">{r.note}</Badge>
            </MetricValueGroup>
          </MetricRow>
        ))}
      </Card>
      <Card $padding="md">
        <CardTitle>Stress testing</CardTitle>
        <CardDivider />
        <SourceNote>{DYNAMIC_STRESS}</SourceNote>
        {[
          {label:'EBA Base scenario',value:'ECL +€124K',ok:true},
          {label:'EBA Adverse scenario',value:'ECL +€412K',ok:true},
          {label:'EBA Severely adverse',value:'ECL +€891K',ok:false},
          {label:'Last run',value:'Q1 2025',ok:true},
        ].map(r=>(
          <MetricRow key={r.label}>
            <MetricLabel>{r.label}</MetricLabel>
            <MetricValue $error={!r.ok}>{r.value}</MetricValue>
          </MetricRow>
        ))}
      </Card>
    </RiskGrid>
  </PageLayout>
);
export default RiskPage;