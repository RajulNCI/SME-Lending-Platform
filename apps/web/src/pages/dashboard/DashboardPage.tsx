import React from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { Card, CardTitle, CardDivider } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
const DYNAMIC = 'Dashboard metrics from GET /api/v1/metrics/kpis';
const DashboardPage: React.FC = () => (
  <PageLayout title="Dashboard" notifCount={2}>
    <p style={{fontSize:'.75rem',color:'#A0AEC0',marginBottom:'1rem',fontStyle:'italic'}}>{DYNAMIC}</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'.75rem',marginBottom:'1.25rem'}}>
      {[
        {label:'Platform uptime',value:'99.97%',note:'Target ≥99.9%',ok:true},
        {label:'p99 decision latency',value:'312ms',note:'Target ≤500ms',ok:true},
        {label:'STP rate',value:'74.2%',note:'Target ≥70%',ok:true},
        {label:'SCT Inst success',value:'99.6%',note:'Target ≥99.5%',ok:true},
      ].map(s=>(
        <div key={s.label} style={{background:'#F7FAFC',borderRadius:'10px',padding:'1rem',border:'.5px solid #E2E8F0'}}>
          <p style={{fontSize:'.6875rem',fontWeight:600,color:'#718096',textTransform:'uppercase',letterSpacing:'.05em',margin:'0 0 .375rem'}}>{s.label}</p>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:'1.75rem',fontWeight:700,color:'#0C2B5E',margin:'0 0 .25rem'}}>{s.value}</p>
          <Badge $variant={s.ok?'success':'error'} $size="sm">{s.note}</Badge>
        </div>
      ))}
    </div>
    <Card $padding="md">
      <CardTitle>Operations overview</CardTitle>
      <CardDivider />
      <p style={{fontSize:'.875rem',color:'#718096'}}>Payment events, SLA tracking and DORA incident dashboard will populate here once the operations API is integrated.</p>
    </Card>
  </PageLayout>
);
export default DashboardPage;