import React from 'react';
import styled from 'styled-components';
import { KpiCard, KpiLabel, KpiValue, KpiValueNavy, KpiSub, KpiTrend, KpiIcon } from '../../components/ui/KpiCard';
import { Badge } from '../../components/ui';
import dashboardData from '../../data/dashboard.json';

// ── Dynamic placeholder — replace with API call once backend is ready ─────────
const DYNAMIC_KPIS = '🔄 KPI values will update in real time once the observability API is integrated (GET /api/v1/metrics/kpis)';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (min-width: 640px)  { grid-template-columns: repeat(3, 1fr); }
  @media (min-width: 1024px) { grid-template-columns: repeat(6, 1fr); }
`;

const TrendRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
`;

const KpiSection: React.FC = () => {
  // Placeholder: swap this for useSWR/useQuery once API exists
  const kpis = dashboardData.kpis;

  return (
    <>
      {/* Dynamic integration note — visible in dev, remove in prod */}
      {process.env.NODE_ENV === 'development' && (
        <p style={{ fontSize: '0.75rem', color: '#5F5E5A', marginBottom: '0.75rem' }}>
          {DYNAMIC_KPIS}
        </p>
      )}
      <Grid>
        {kpis.map(kpi => (
          <KpiCard key={kpi.id} $variant={kpi.variant as any} $padding="md">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <KpiLabel style={{ color: kpi.variant === 'navy' ? '#85B7EB' : undefined }}>
                {kpi.label}
              </KpiLabel>
              <KpiIcon style={{
                background: kpi.variant === 'navy' ? '#1A56A0' : undefined,
              }}>
                {kpi.icon}
              </KpiIcon>
            </div>
            {kpi.variant === 'navy'
              ? <KpiValueNavy>{kpi.value}</KpiValueNavy>
              : <KpiValue>{kpi.value}</KpiValue>
            }
            <TrendRow>
              <KpiSub style={{ color: kpi.variant === 'navy' ? '#85B7EB' : undefined }}>
                Target: {kpi.target}
              </KpiSub>
              <KpiTrend $dir={kpi.trend as any}>
                {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'} {kpi.trendLabel}
              </KpiTrend>
            </TrendRow>
          </KpiCard>
        ))}
      </Grid>
    </>
  );
};

export default KpiSection;
